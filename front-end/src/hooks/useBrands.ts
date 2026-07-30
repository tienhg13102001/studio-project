import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiBrand } from "#lib/apiTypes";

export function useBrands() {
  const [data, setData] = useState<ApiBrand[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<ApiBrand[]>("/api/brands")
      .then(setData)
      // Không bắt lỗi thì mạng lỗi sẽ thành unhandled rejection và khối brands
      // biến mất không dấu vết — giữ lại thông điệp để nơi hiển thị dùng.
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Không tải được dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache("/api/brands");
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch };
}
