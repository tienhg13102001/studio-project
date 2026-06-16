import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiPortfolioItem } from "#lib/apiTypes";

export function usePortfolio() {
  const [data, setData] = useState<ApiPortfolioItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiPortfolioItem[]>("/api/portfolio")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache("/api/portfolio");
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  return { data, loading, refetch };
}
