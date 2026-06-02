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
  status?: "processing"; // video đang được transcode ở background, sẽ sẵn sàng sau ~2-3 phút
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

/**
 * Upload a video (≤ 500MB). Streams the file with progress callback.
 * Allowed: mp4, webm, mov, m4v. Returns the relative path under /videos.
 */
export async function uploadVideo(
  file: File,
  onProgress?: (p: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<VideoUploadResult> {
  const MAX = 500 * 1024 * 1024;
  if (file.size > MAX) {
    throw new Error(`Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 500MB.`);
  }

  const form = new FormData();
  form.append("video", file);

  const res = await apiClient.post<{
    success: boolean;
    data?: VideoUploadResult;
    error?: string;
  }>("/api/upload/video", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30 * 60 * 1000, // 30 min — matches nginx proxy_read_timeout
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    signal,
    onUploadProgress: (e) => {
      if (!onProgress || !e.total) return;
      onProgress({
        loaded: e.loaded,
        total: e.total,
        percent: Math.round((e.loaded / e.total) * 100),
      });
    },
  });

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error ?? "Video upload failed");
  }
  return res.data.data;
}

export default apiClient;
