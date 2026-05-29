import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiUser } from "#lib/apiTypes";

export function useTeam() {
  const [data, setData] = useState<ApiUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiUser[]>("/api/users")
      .then(setData)
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

  return { data, loading, refetch };
}
