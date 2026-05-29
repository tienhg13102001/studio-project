import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "#i18n";
import { apiFetch, invalidateApiCache, resolveAssetUrl } from "#lib/api";
import type { ApiLanding } from "#lib/apiTypes";

export type LandingDisplay = {
  heroLine1: string;
  heroLine2: string;
  subheading: string;
  videoBackground: string;
  phone: string;
  email: string;
  address: string;
  socials: {
    zalo: string;
    facebook: string;
    instagram: string;
  };
};

export function useLanding(lang: Lang) {
  const [raw, setRaw] = useState<ApiLanding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiLanding>("/api/landing")
      .then(setRaw)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache("/api/landing");
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  const data: LandingDisplay | null = raw
    ? {
        heroLine1: raw.heroLine1[lang],
        heroLine2: raw.heroLine2[lang],
        subheading: raw.subheading[lang],
        videoBackground: resolveAssetUrl(raw.videoBackground),
        phone: raw.phone ?? "",
        email: raw.email ?? "",
        address: raw.address?.[lang] ?? "",
        socials: {
          zalo: raw.socials?.zalo ?? "",
          facebook: raw.socials?.facebook ?? "",
          instagram: raw.socials?.instagram ?? "",
        },
      }
    : null;

  return { data, raw, loading, error, refetch };
}
