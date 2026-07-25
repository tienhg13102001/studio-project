import { useEffect, useRef, useState } from "react";
import { apiPost } from "#lib/api";

/**
 * Ghi nhận một lượt truy cập (1 lần mỗi khi tải trang) và trả về tổng số lượt.
 * Backend tự chống trùng theo IP + ngày nên gọi nhiều lần cùng ngày không tăng.
 */
export function useVisitorCount() {
  const [total, setTotal] = useState<number | null>(null);
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;

    apiPost<{ total: number }>("/api/visitors", {})
      .then((res) => setTotal(res.total))
      .catch(() => {
        // Lỗi mạng: bỏ qua, không hiển thị bộ đếm.
      });
  }, []);

  return total;
}
