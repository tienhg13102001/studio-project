import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, invalidateApiCache, resolveAssetUrl } from "#lib/api";
import type { ApiSettings } from "#lib/apiTypes";

export function useSettings() {
  const [raw, setRaw] = useState<ApiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiSettings>("/api/settings")
      .then(setRaw)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache("/api/settings");
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  const backgroundImage = raw?.backgroundImage ? resolveAssetUrl(raw.backgroundImage) : "";

  return { raw, loading, error, refetch, backgroundImage };
}
