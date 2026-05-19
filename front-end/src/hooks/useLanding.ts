import { useEffect, useRef, useState } from "react";
import type { Lang } from "#i18n";
import { apiFetch, resolveAssetUrl } from "#lib/api";
import type { ApiLanding } from "#lib/apiTypes";

export type LandingDisplay = {
  heroLine1: string;
  heroLine2: string;
  subheading: string;
  videoBackground: string;
};

export function useLanding(lang: Lang) {
  const [raw, setRaw] = useState<ApiLanding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    apiFetch<ApiLanding>("/api/landing")
      .then(setRaw)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const data: LandingDisplay | null = raw
    ? {
        heroLine1: raw.heroLine1[lang],
        heroLine2: raw.heroLine2[lang],
        subheading: raw.subheading[lang],
        videoBackground: resolveAssetUrl(raw.videoBackground),
      }
    : null;

  return { data, loading, error };
}
