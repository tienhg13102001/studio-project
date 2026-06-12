import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiInquiry } from "#lib/apiTypes";

const ENDPOINT = "/api/contact/inquiries";

/** Loads contact-form submissions for the portal Inquiries page. */
export function useInquiries() {
  const [data, setData] = useState<ApiInquiry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiInquiry[]>(ENDPOINT)
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache(ENDPOINT);
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  return { data, loading, refetch };
}
