import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiBaiViet } from "#lib/apiTypes";

/**
 * Danh sách bài viết.
 *
 * `toanBo` = true thì đọc cả bản NHÁP kèm thân bài — CHỈ Portal dùng, máy chủ
 * chặn đường này với người chưa đăng nhập quản trị (ADMIN_ONLY_READS).
 */
export function useBaiViet(toanBo = false) {
  const duongDan = toanBo ? "/api/bai-viet/all" : "/api/bai-viet";
  const [data, setData] = useState<ApiBaiViet[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<ApiBaiViet[]>(duongDan)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Không tải được bài viết"))
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
