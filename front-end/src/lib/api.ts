import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const API_BASE = import.meta.env.VITE_API_URL ?? "";

/** Relative paths (/images/..., /videos/...) → /api/... URL; http(s) URLs stay unchanged */
export function resolveAssetUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Normalize: /images/x.jpg → /api/images/x.jpg
  const normalized = path.startsWith("/api") ? path : `/api/public${path}`;
  return `${API_BASE}${normalized}`;
}

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await apiClient.get<{ success: boolean; data?: T; error?: string }>(path);
  if (!res.data.success) throw new Error(res.data.error ?? "Unknown API error");
  return res.data.data as T;
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
  path: string; // e.g. "/videos/1716000000000-uuid.mp4"
  size: number;
  mimetype: string;
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
