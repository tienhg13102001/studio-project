import axios, { type AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Response interceptor ─────────────────────────────────────────────────────
// When the server returns a non-2xx status, Axios throws before we can read
// res.data. This interceptor extracts the actual error message from the
// response body (res.data.error / res.data.message) so callers get a
// meaningful message instead of "Request failed with status code 500".
apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ success?: boolean; error?: string; message?: string }>) => {
    const serverMsg =
      err.response?.data?.error ??
      err.response?.data?.message ??
      null;
    if (serverMsg) {
      // Replace the generic Axios message with the server's own message
      err.message = serverMsg;
    }
    return Promise.reject(err);
  },
);

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// Giới hạn dung lượng video upload. File được cắt thành mảnh <100MB (chunked)
// để vượt giới hạn body 100MB của Cloudflare → cho phép tới 5GB.
export const VIDEO_MAX_MB = 5120;
// Kích thước mỗi mảnh (< 100MB Cloudflare). 50MB cân bằng tốc độ/độ an toàn.
const VIDEO_CHUNK_SIZE = 50 * 1024 * 1024;

export const IMAGE_MAX_MB = 500;
const IMAGE_CHUNK_SIZE = 50 * 1024 * 1024;


/**
 * Turns a stored image/video value into a displayable URL.
 * - Full http(s) URLs (new format): returned as-is.
 * - Legacy relative paths (/uploads/…, /videos/…, /images/…): prefixed with API base.
 */
export function resolveAssetUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Legacy: /images/x.jpg → /api/public/images/x.jpg
  const normalized = path.startsWith("/api") ? path : `/api/public${path}`;
  return `${API_BASE}${normalized}`;
}

// In-memory cache of resolved/in-flight GET promises keyed by path.
// Lets multiple components call apiFetch(samePath) without triggering
// duplicate network requests. Failed requests are evicted so callers can retry.
const fetchCache = new Map<string, Promise<unknown>>();

export async function apiFetch<T>(path: string): Promise<T> {
  const cached = fetchCache.get(path);
  if (cached) return cached as Promise<T>;

  const promise = apiClient
    .get<{ success: boolean; data?: T; error?: string }>(path)
    .then((res) => {
      if (!res.data.success) throw new Error(res.data.error ?? "Unknown API error");
      return res.data.data as T;
    });

  promise.catch(() => fetchCache.delete(path)); // allow retry after error
  fetchCache.set(path, promise);
  return promise;
}

// Drop a cached entry so the next apiFetch(path) re-hits the server.
export function invalidateApiCache(path: string) {
  fetchCache.delete(path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiClient.post<{ success: boolean; data?: T; error?: string }>(path, body);
  if (!res.data.success) throw new Error(res.data.error ?? "Unknown API error");
  return res.data.data as T;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await apiClient.put<{ success: boolean; data?: T; error?: string }>(path, body);
  if (!res.data.success) throw new Error(res.data.error ?? "Unknown API error");
  return res.data.data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiClient.delete<{ success: boolean; data?: T; error?: string }>(path);
  if (!res.data.success) throw new Error(res.data.error ?? "Unknown API error");
  return res.data.data as T;
}

// ─── File upload helpers ─────────────────────────────────────────────────────

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface VideoUploadResult {
  url: string;  // full absolute URL e.g. https://beezvn.com/api/videos/file.mp4
  path: string; // legacy relative path e.g. /videos/file.mp4 (kept for backwards compat)
  size?: number;
  mimetype: string;
  status?: "processing"; // transcode đang chạy nền; poll url tới khi trả 200
}

/**
 * Upload an image (≤ 10MB). Returns the relative path under /uploads.
 * Use `resolveAssetUrl(path)` to turn it into a full URL.
 */
export async function uploadImage(
  file: File,
  onProgress?: (p: UploadProgress) => void,
): Promise<{ path: string }> {
  const form = new FormData();
  form.append("image", file);
  const res = await apiClient.post<{ success: boolean; data?: { path: string }; error?: string }>(
    "/api/upload",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60_000,
      onUploadProgress: (e) => {
        if (!onProgress || !e.total) return;
        onProgress({ loaded: e.loaded, total: e.total, percent: Math.round((e.loaded / e.total) * 100) });
      },
    },
  );
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error ?? "Image upload failed");
  }
  return res.data.data;
}

async function postChunkWithRetry(
  url: string,
  form: FormData,
  signal: AbortSignal | undefined,
  onUploadProgress: (e: { loaded?: number }) => void,
): Promise<void> {
  const delays = [500, 1000, 2000];
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const res = await apiClient.post<{ success: boolean; error?: string }>(url, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 15 * 60 * 1000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        signal,
        onUploadProgress,
      });
      if (!res.data.success) throw new Error(res.data.error ?? "Chunk upload failed");
      return;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
  }
}

/**
 * Upload a video (≤ 5GB). Cắt file thành mảnh < 100MB và upload từng mảnh qua
 * Cloudflare (lách giới hạn body 100MB), server ghép lại rồi transcode.
 * Allowed: mp4, webm, mov, m4v. Trả về { url, path, status: "processing" }.
 */
export async function uploadVideo(
  file: File,
  onProgress?: (p: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<VideoUploadResult> {
  const MAX = VIDEO_MAX_MB * 1024 * 1024;
  if (file.size > MAX) {
    throw new Error(
      `Video quá lớn (${(file.size / 1024 / 1024).toFixed(0)}MB). Tối đa ${VIDEO_MAX_MB}MB — vui lòng nén nhỏ hơn rồi thử lại.`,
    );
  }

  const uploadId = crypto.randomUUID();
  const totalChunks = Math.max(1, Math.ceil(file.size / VIDEO_CHUNK_SIZE));
  let uploadedBytes = 0;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * VIDEO_CHUNK_SIZE;
    const blob = file.slice(start, Math.min(start + VIDEO_CHUNK_SIZE, file.size));
    const form = new FormData();
    form.append("uploadId", uploadId);
    form.append("chunkIndex", String(i));
    form.append("totalChunks", String(totalChunks));
    form.append("chunk", blob);

    const bytesAtChunkStart = uploadedBytes;
    await postChunkWithRetry(
      "/api/upload/video/chunk",
      form,
      signal,
      (e) => {
        if (!onProgress) return;
        const loaded = bytesAtChunkStart + (e.loaded ?? 0);
        onProgress({ loaded, total: file.size, percent: Math.round((loaded / file.size) * 100) });
      },
    );
    uploadedBytes += blob.size;
    onProgress?.({
      loaded: uploadedBytes,
      total: file.size,
      percent: Math.round((uploadedBytes / file.size) * 100),
    });
  }

  // Báo server đã upload đủ → ghép + transcode nền.
  const res = await apiClient.post<{
    success: boolean;
    data?: VideoUploadResult;
    error?: string;
  }>(
    "/api/upload/video/complete",
    { uploadId, filename: file.name },
    { timeout: 60 * 1000, signal },
  );

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error ?? "Video upload failed");
  }
  return res.data.data;
}

/**
 * Upload an image (≤ 500MB) via chunked upload. Cắt file thành mảnh < 100MB và
 * upload từng mảnh, server ghép lại rồi resize + convert WebP.
 * Trả về { url, path }.
 */
export async function uploadImageChunked(
  file: File,
  onProgress?: (p: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<{ url: string; path: string }> {
  const MAX = IMAGE_MAX_MB * 1024 * 1024;
  if (file.size > MAX) {
    throw new Error(
      `Ảnh quá lớn (${(file.size / 1024 / 1024).toFixed(0)}MB). Tối đa ${IMAGE_MAX_MB}MB.`,
    );
  }

  const uploadId = crypto.randomUUID();
  const totalChunks = Math.max(1, Math.ceil(file.size / IMAGE_CHUNK_SIZE));
  let uploadedBytes = 0;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * IMAGE_CHUNK_SIZE;
    const blob = file.slice(start, Math.min(start + IMAGE_CHUNK_SIZE, file.size));
    const form = new FormData();
    form.append("uploadId", uploadId);
    form.append("chunkIndex", String(i));
    form.append("totalChunks", String(totalChunks));
    form.append("originalName", file.name);
    form.append("chunk", blob);

    const bytesAtChunkStart = uploadedBytes;
    await postChunkWithRetry(
      "/api/upload/image/chunk",
      form,
      signal,
      (e) => {
        if (!onProgress) return;
        const loaded = bytesAtChunkStart + (e.loaded ?? 0);
        onProgress({ loaded, total: file.size, percent: Math.round((loaded / file.size) * 100) });
      },
    );
    uploadedBytes += blob.size;
    onProgress?.({
      loaded: uploadedBytes,
      total: file.size,
      percent: Math.round((uploadedBytes / file.size) * 100),
    });
  }

  const res = await apiClient.post<{
    success: boolean;
    data?: { url: string; path: string };
    error?: string;
  }>(
    "/api/upload/image/complete",
    { uploadId, originalName: file.name },
    { timeout: 5 * 60 * 1000, signal },
  );

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error ?? "Image upload failed");
  }
  return res.data.data;
}

/**
 * Poll một URL video (HEAD) tới khi server trả 200 (transcode nền đã xong).
 * Trả về true nếu sẵn sàng trong thời hạn, false nếu quá lâu / bị huỷ.
 */
export async function waitForVideoReady(
  url: string,
  opts: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<boolean> {
  const intervalMs = opts.intervalMs ?? 3000;
  const timeoutMs = opts.timeoutMs ?? 5 * 60 * 1000; // 5 phút
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (opts.signal?.aborted) return false;
    try {
      const r = await fetch(url, { method: "HEAD", cache: "no-store", signal: opts.signal });
      if (r.ok) return true;
    } catch {
      // bỏ qua lỗi mạng tạm thời, thử lại ở vòng sau
    }
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  return false;
}

export default apiClient;
