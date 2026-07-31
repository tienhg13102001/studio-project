import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiTrash } from "#lib/apiTypes";

const ENDPOINT = "/api/trash";

export function useTrash() {
  const [data, setData] = useState<ApiTrash | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<ApiTrash>(ENDPOINT)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Không tải được thùng rác"))
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache(ENDPOINT);
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch };
}
