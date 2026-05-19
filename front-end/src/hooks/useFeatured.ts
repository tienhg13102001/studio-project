import { useEffect, useRef, useState } from "react";
import { apiFetch, resolveAssetUrl } from "#lib/api";
import type { ApiFeature, ApiFeaturedContent } from "#lib/apiTypes";

export type FeatureDisplay = {
  id: string;
  tag: string;
  image: string;
  title: string;
  subtitle: string;
};

function mapFeature(f: ApiFeature): FeatureDisplay {
  return {
    id: f.id,
    tag: f.tag.tag, // populated service's short code
    image: resolveAssetUrl(f.image),
    title: f.title,
    subtitle: f.subtitle,
  };
}

export function useFeatured() {
  const [raw, setRaw] = useState<ApiFeaturedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    apiFetch<ApiFeaturedContent>("/api/featured")
      .then(setRaw)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const verticalCards = raw?.verticalCards.map(mapFeature) ?? null;
  const horizontalCards = raw?.horizontalCards.map(mapFeature) ?? null;

  return { verticalCards, horizontalCards, loading, error };
}
