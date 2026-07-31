import { useCallback, useEffect, useState } from "react";
import type { ApiInquiry } from "#lib/apiTypes";

/**
 * Đếm số liên hệ CHƯA XEM để hiện badge trên menu.
 *
 * Backend không có cờ "đã đọc" (model Customer chỉ có createdAt, không có route
 * cập nhật trạng thái), nên mốc "đã xem" được giữ ở máy: mở trang Liên hệ là ghi
 * lại thời điểm, các liên hệ tạo sau mốc đó tính là mới. Cách này không cần đổi
 * schema hay thêm endpoint; đánh đổi là mốc riêng theo từng máy/trình duyệt.
 */

const SEEN_KEY = "portal_inquiries_seen_at";
/** Bắn trong cùng tab, vì event "storage" của trình duyệt chỉ bắn sang tab khác. */
const SEEN_EVENT = "beez:inquiries-seen";

function readSeenAt(): number {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư) → coi như chưa xem gì.
    return 0;
  }
}

export function useInquiriesSeenAt() {
  const [seenAt, setSeenAt] = useState<number>(readSeenAt);

  useEffect(() => {
    const sync = () => setSeenAt(readSeenAt());
    window.addEventListener(SEEN_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SEEN_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {
      // Không ghi được thì badge vẫn hiện — chấp nhận, không làm hỏng luồng.
    }
    window.dispatchEvent(new Event(SEEN_EVENT));
  }, []);

  return { seenAt, markSeen };
}

/** Số liên hệ tạo sau mốc đã xem. Bỏ qua bản ghi có createdAt không đọc được. */
export function countUnseenInquiries(data: ApiInquiry[] | null, seenAt: number): number {
  if (!data) return 0;
  return data.reduce((n, item) => {
    const at = Date.parse(item.createdAt);
    return Number.isFinite(at) && at > seenAt ? n + 1 : n;
  }, 0);
}

/** Một liên hệ có mới so với mốc đã xem — dùng để tô dấu "Mới" trên từng dòng. */
export function isUnseenInquiry(item: ApiInquiry, seenAt: number): boolean {
  const at = Date.parse(item.createdAt);
  return Number.isFinite(at) && at > seenAt;
}
