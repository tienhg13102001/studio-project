import { apiFetch, resolveAssetUrl } from "#lib/api";
import type { ApiPhotoGroup } from "#lib/apiTypes";
import { useEffect, useRef, useState } from "react";

/** A tag-grouped set of product photos with display-ready (resolved) URLs. */
export type PhotoGroup = ApiPhotoGroup;

/**
 * Fetches product photos grouped by service tag (GET /api/projects/photos) and
 * resolves each stored path into a displayable URL. Powers the tabbed bento
 * gallery on the landing page.
 */
export function useProjectPhotos() {
  const [groups, setGroups] = useState<PhotoGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    apiFetch<ApiPhotoGroup[]>("/api/projects/photos")
      .then((gs) =>
        setGroups(
          gs
            .map((g) => ({ ...g, photos: g.photos.map((p) => resolveAssetUrl(p)) }))
            .filter((g) => g.photos.length > 0),
        ),
      )
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading, error };
}
