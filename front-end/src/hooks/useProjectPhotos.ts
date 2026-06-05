import { apiFetch, resolveAssetUrl } from "#lib/api";
import { useEffect, useRef, useState } from "react";

/**
 * Fetches the flattened list of product photos across every project
 * (GET /api/projects/photos) and resolves each stored path into a
 * displayable URL. Powers the product-image gallery on the landing page.
 */
export function useProjectPhotos() {
  const [photos, setPhotos] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    apiFetch<string[]>("/api/projects/photos")
      .then((paths) => setPhotos(paths.map((p) => resolveAssetUrl(p))))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { photos, loading, error };
}
