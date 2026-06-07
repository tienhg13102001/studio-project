import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiTeamContent } from "#lib/apiTypes";

export function useTeamContent() {
  const [data, setData] = useState<ApiTeamContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiTeamContent>("/api/team-content")
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache("/api/team-content");
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch };
}
