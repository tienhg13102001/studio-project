import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiUser } from "#lib/apiTypes";

export function useTeam() {
  const [data, setData] = useState<ApiUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<ApiUser[]>("/api/users")
      .then(setData)
      // Không bắt lỗi thì mạng lỗi sẽ thành unhandled rejection và khối đội ngũ
      // biến mất không dấu vết — giữ lại thông điệp để nơi hiển thị dùng.
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Không tải được dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache("/api/users");
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch };
}
