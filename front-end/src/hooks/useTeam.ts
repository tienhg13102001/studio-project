import { useEffect, useRef, useState } from "react";
import { apiFetch } from "#lib/api";
import type { ApiUser } from "#lib/apiTypes";

export function useTeam() {
  const [data, setData] = useState<ApiUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    apiFetch<ApiUser[]>("/api/users")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
