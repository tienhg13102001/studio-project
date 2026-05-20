import { useEffect, useRef, useState } from "react";
import { apiFetch } from "#lib/api";
import type { ApiContact } from "#lib/apiTypes";

export function useContact() {
  const [data, setData] = useState<ApiContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    apiFetch<ApiContact>("/api/contact")
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
