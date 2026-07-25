import { useEffect, useState } from "react";
import { apiFetch } from "#lib/api";

/**
 * Chỉ ĐỌC tổng số lượt truy cập (GET /api/visitors) — không ghi nhận/tăng đếm.
 * Dùng cho các nơi chỉ hiển thị con số (ví dụ dashboard portal), khác với
 * `useVisitorCount` (POST) vốn ghi nhận một lượt truy cập ở trang công khai.
 */
export function useVisitorTotal() {
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ total: number }>("/api/visitors")
      .then((res) => setTotal(res.total))
      .catch(() => setTotal(null))
      .finally(() => setLoading(false));
  }, []);

  return { total, loading };
}
