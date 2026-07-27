import { useEffect, useState } from "react";
import { apiFetch } from "#lib/api";

export type BreakdownRow = { key: string; count: number };

/**
 * Đọc phân rã lượt truy cập theo chiều `dim` ("source" | "device") trong `days`
 * ngày gần nhất, đã gộp + sắp xếp giảm dần ở backend.
 */
export function useVisitorBreakdown(dim: "source" | "device", days = 30) {
  const [data, setData] = useState<BreakdownRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<BreakdownRow[]>(`/api/visitors/breakdown?dim=${dim}&days=${days}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [dim, days]);

  return { data, loading };
}
