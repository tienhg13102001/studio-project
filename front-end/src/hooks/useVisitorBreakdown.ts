import { useEffect, useState } from "react";
import { apiFetch } from "#lib/api";

export type BreakdownRow = { key: string; count: number };

/**
 * Đọc phân rã lượt truy cập trong `days` ngày gần nhất, đã gộp + sắp xếp giảm
 * dần ở backend (lấy 20 mục nhiều nhất).
 *
 * Ba chiều:
 *   source / device — đếm KHÁCH DUY NHẤT, mỗi người một lần trong ngày
 *   path            — đếm LƯỢT XEM TRANG, một người xem mười trang là mười lượt
 *
 * Hai loại số này KHÔNG cộng so sánh được với nhau. Chỗ hiển thị phải nói rõ
 * đâu là "khách", đâu là "lượt xem".
 */
export function useVisitorBreakdown(dim: "source" | "device" | "path", days = 30) {
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
