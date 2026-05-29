import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiBrand } from "#lib/apiTypes";

export function useBrands() {
  const [data, setData] = useState<ApiBrand[] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiBrand[]>("/api/brands")
      .then(setData)
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

  return { data, loading, refetch };
}
