import { apiFetch, invalidateApiCache, resolveAssetUrl } from "#lib/api";
import type { ApiProject, ApiProjectsContent } from "#lib/apiTypes";
import { useCallback, useEffect, useRef, useState } from "react";

export type ProjectDisplay = {
  id: string;
  tag: string;
  thumbnailImage: string;
  title: string;
  subtitle: string;
  video?: string;
  photos?: string[];
};

function mapProject(f: ApiProject): ProjectDisplay {
  return {
    id: f.id,
    tag: f.service?.tag ?? "",
    thumbnailImage: resolveAssetUrl(f.thumbnailImage),
    title: f.title,
    subtitle: f.subtitle,
    video: f.video,
    photos: f.photos,
  };
}

export function useProjects() {
  const [raw, setRaw] = useState<ApiProjectsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiProjectsContent>("/api/projects")
      .then(setRaw)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache("/api/projects");
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  const verticalCards = raw?.verticalCards.map(mapProject) ?? null;
  const horizontalCards = raw?.horizontalCards.map(mapProject) ?? null;

  return { verticalCards, horizontalCards, raw, loading, error, refetch };
}
