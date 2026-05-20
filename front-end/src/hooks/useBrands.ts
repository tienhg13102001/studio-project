import { useEffect, useRef, useState } from "react";
import { apiFetch } from "#lib/api";
import type { ApiBrand } from "#lib/apiTypes";

export function useBrands() {
  const [data, setData] = useState<ApiBrand[] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    apiFetch<ApiBrand[]>("/api/brands")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
