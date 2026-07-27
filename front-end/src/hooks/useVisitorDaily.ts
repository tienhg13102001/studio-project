import { useEffect, useState } from "react";
import { apiFetch } from "#lib/api";

export type DailyPoint = { day: string; count: number };

/**
 * Đọc lượt truy cập unique theo từng ngày trong `days` ngày gần nhất (GET, không
 * ghi nhận). Backend chỉ trả về các ngày CÓ lượt — nơi hiển thị tự lấp ngày trống.
 */
export function useVisitorDaily(days = 30) {
  const [data, setData] = useState<DailyPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<DailyPoint[]>(`/api/visitors/daily?days=${days}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [days]);

  return { data, loading };
}
