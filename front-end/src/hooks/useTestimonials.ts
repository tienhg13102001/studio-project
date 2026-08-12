import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiTestimonial } from "#lib/apiTypes";

/**
 * Nhận xét khách hàng.
 *
 * `toanBo` = true thì đọc cả bản đã tắt — CHỈ dùng trong Portal, và đường đó
 * yêu cầu quyền quản trị ở máy chủ. Trang công khai luôn để mặc định để không
 * bao giờ kéo về bản mà Hoàn đã cố ý tắt đi.
 */
export function useTestimonials(toanBo = false) {
  const duongDan = toanBo ? "/api/testimonials/all" : "/api/testimonials";
  const [data, setData] = useState<ApiTestimonial[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<ApiTestimonial[]>(duongDan)
      .then(setData)
      // Không bắt lỗi thì mạng lỗi thành unhandled rejection và khối nhận xét
      // biến mất không dấu vết — giữ lại thông điệp cho nơi hiển thị dùng.
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Không tải được nhận xét"))
      .finally(() => setLoading(false));
  }, [duongDan]);

  const refetch = useCallback(() => {
    invalidateApiCache(duongDan);
    fetch();
  }, [fetch, duongDan]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch };
}
