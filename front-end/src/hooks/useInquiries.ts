import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch, invalidateApiCache } from "#lib/api";
import type { ApiInquiry } from "#lib/apiTypes";

const ENDPOINT = "/api/contact/inquiries";

/**
 * Bắn sau khi danh sách liên hệ bị thay đổi (ví dụ xoá một tin). Hook này có 2
 * bản đang chạy song song — một ở PortalLayout để đếm badge, một ở trang Liên hệ
 * — nên cần tín hiệu để bản còn lại tải lại, không thì badge lệch số.
 */
export const INQUIRIES_CHANGED_EVENT = "beez:inquiries-changed";

/** Loads contact-form submissions for the portal Inquiries page. */
export function useInquiries() {
  const [data, setData] = useState<ApiInquiry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiInquiry[]>(ENDPOINT)
      .then(setData)
      // Không bắt lỗi thì mạng lỗi thành unhandled rejection và bảng đứng im.
      .catch(() => setData(null))
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

  // Bên xoá đã gọi invalidateApiCache trước khi bắn event, nên chỉ cần fetch()
  // (dùng refetch() sẽ invalidate lần hai và tạo request trùng).
  useEffect(() => {
    const onChanged = () => fetch();
    window.addEventListener(INQUIRIES_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(INQUIRIES_CHANGED_EVENT, onChanged);
  }, [fetch]);

  return { data, loading, refetch };
}
