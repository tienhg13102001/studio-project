import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const API_BASE = import.meta.env.VITE_API_URL ?? "";

/** Relative paths (/images/..., /videos/...) → /api/... URL; http(s) URLs stay unchanged */
export function resolveAssetUrl(path: string): string {
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

export default apiClient;
