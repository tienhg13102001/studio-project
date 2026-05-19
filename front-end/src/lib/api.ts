import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/** Relative paths (/images/..., /videos/...) → full backend URL; http(s) URLs stay unchanged */
export function resolveAssetUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await apiClient.get<{ success: boolean; data?: T; error?: string }>(path);
  if (!res.data.success) throw new Error(res.data.error ?? "Unknown API error");
  return res.data.data as T;
}

export default apiClient;
