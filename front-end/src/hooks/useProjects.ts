import { apiFetch, invalidateApiCache, resolveAssetUrl } from "#lib/api";
import type { ApiProject, ApiProjectsContent } from "#lib/apiTypes";
import type { Lang } from "#i18n";
import { localized } from "#lib/localized";
import { useCallback, useEffect, useRef, useState } from "react";

export type ProjectDisplay = {
  id: string;
  tag: string;
  thumbnailImage: string;
  title: string;
  subtitle: string;
  video?: string;
  photos?: string[];
  shootDate?: string;
  shootLocation?: string;
  members?: string[];
};

function mapProject(f: ApiProject, lang: Lang): ProjectDisplay {
  return {
    id: f.id,
    tag: f.service?.tag ?? "",
    thumbnailImage: resolveAssetUrl(f.thumbnailImage),
    title: f.title,
    subtitle: localized(f.subtitle, lang),
    video: f.video,
    photos: f.photos,
    shootDate: f.shootDate,
    shootLocation: f.shootLocation,
    members: f.members?.map((m) => m.name),
  };
}

export function useProjects(lang: Lang = "vi") {
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

  const verticalCards = raw?.verticalCards.map((f) => mapProject(f, lang)) ?? null;
  const horizontalCards = raw?.horizontalCards.map((f) => mapProject(f, lang)) ?? null;

  return { verticalCards, horizontalCards, raw, loading, error, refetch };
}
