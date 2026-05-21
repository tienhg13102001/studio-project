import { useEffect, useRef, useState, useCallback } from "react";
import type { Lang } from "#i18n";
import { apiFetch, resolveAssetUrl } from "#lib/api";
import type { ApiPaginatedServices, ApiService } from "#lib/apiTypes";

export type ServiceDisplay = {
  id: string;
  thumbnailImage: string;
  title: string;
  description: string;
};

function mapService(s: ApiService, lang: Lang): ServiceDisplay {
  return {
    id: s.id,
    thumbnailImage: resolveAssetUrl(s.thumbnailImage),
    title: s.title[lang],
    description: s.description[lang],
  };
}

export function useServices(lang: Lang) {
  const [raw, setRaw] = useState<ApiService[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const refetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiPaginatedServices>("/api/services?limit=100")
      .then((res) => setRaw(res.items))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    refetch();
  }, [refetch]);

  const data = raw?.map((s) => mapService(s, lang)) ?? null;
  return { data, raw, loading, error, refetch };
}
