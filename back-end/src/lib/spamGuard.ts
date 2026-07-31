/**
 * Lớp chặn spam cho form liên hệ công khai.
 *
 * VÌ SAO CẦN: mỗi lần gửi form nay kích hoạt 2 email (báo Bee Z + cảm ơn khách).
 * Bot quét form là chuyện thường ngày, và hậu quả không phải "vài mail rác" mà
 * là tên miền beezvn.com bị chấm điểm xấu — lúc đó thư báo giá gửi cho khách
 * THẬT sẽ rơi vào hộp thư rác, rất khó gỡ.
 *
 * NGUYÊN TẮC: thà lọt vài mail rác còn hơn chặn nhầm một khách thật. Mọi ngưỡng
 * dưới đây đều đặt rộng tay, và chỉ chặn khi có dấu hiệu rõ ràng của máy gửi.
 */

/** Tối đa ngần này lượt gửi từ cùng một địa chỉ mạng trong một cửa sổ thời gian. */
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 phút
/** Dọn bộ nhớ định kỳ để danh sách không phình theo thời gian. */
const CLEANUP_EVERY_MS = 30 * 60 * 1000;

type Hit = { count: number; firstAt: number };
const hits = new Map<string, Hit>();

// Bộ đếm nằm trong bộ nhớ tiến trình: đủ dùng vì backend chạy một tiến trình duy
// nhất. Nếu sau này chạy nhiều bản song song thì cần chuyển sang kho dùng chung.
const timer = setInterval(() => {
  const now = Date.now();
  for (const [key, hit] of hits) {
    if (now - hit.firstAt > WINDOW_MS) hits.delete(key);
  }
}, CLEANUP_EVERY_MS);
// Không giữ tiến trình sống chỉ vì bộ đếm này.
timer.unref?.();

export type SpamVerdict = { blocked: false } | { blocked: true; reason: string };

/** Đếm số lượt gửi theo địa chỉ mạng; chặn khi vượt ngưỡng trong cửa sổ. */
export function checkRate(ip: string): SpamVerdict {
  const now = Date.now();
  const hit = hits.get(ip);

  if (!hit || now - hit.firstAt > WINDOW_MS) {
    hits.set(ip, { count: 1, firstAt: now });
    return { blocked: false };
  }

  hit.count += 1;
  if (hit.count > MAX_PER_WINDOW) {
    return { blocked: true, reason: `quá ${MAX_PER_WINDOW} lượt gửi trong ${WINDOW_MS / 60000} phút` };
  }
  return { blocked: false };
}

/** Chỉ dùng trong kiểm thử để bắt đầu lại từ trạng thái sạch. */
export function resetRateLimiter(): void {
  hits.clear();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Đếm số đường dẫn web xuất hiện trong một đoạn chữ. */
function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\.|\[url|\[link/gi) ?? []).length;
}

type LeadInput = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  /**
   * Ô bẫy: ẩn với người dùng thật nhưng bot tự động điền mọi ô nó thấy. Có giá
   * trị ở đây gần như chắc chắn là máy gửi.
   */
  website?: string;
};

/**
 * Soi nội dung để tìm dấu hiệu máy gửi. Chỉ trả về "chặn" khi dấu hiệu rõ ràng —
 * người Việt viết tin nhắn bình thường không được dính vào bất kỳ luật nào.
 */
export function inspectContent(input: LeadInput): SpamVerdict {
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const message = (input.message ?? "").trim();

  if (input.website && input.website.trim()) {
    return { blocked: true, reason: "điền vào ô bẫy dành cho máy" };
  }

  if (!EMAIL_RE.test(email)) {
    return { blocked: true, reason: "email không đúng định dạng" };
  }

  // Bot hay nhồi cả bài quảng cáo; khách thật hiếm khi viết quá dài trong form.
  if (message.length > 5000 || name.length > 120) {
    return { blocked: true, reason: "nội dung dài bất thường" };
  }

  // Vài đường dẫn là bình thường (khách gửi link tham khảo), nhưng nhiều thì không.
  if (countLinks(message) >= 4) {
    return { blocked: true, reason: "chứa quá nhiều đường dẫn" };
  }

  // Mã HTML/BBCode trong ô tin nhắn là dấu hiệu của công cụ gửi tự động.
  if (/<\s*(a|script|iframe)\b/i.test(message)) {
    return { blocked: true, reason: "chứa mã HTML" };
  }

  return { blocked: false };
}

/** Gộp hai lớp kiểm tra. Kiểm nội dung trước vì rẻ và không đụng bộ đếm. */
export function checkSpam(ip: string, input: LeadInput): SpamVerdict {
  const content = inspectContent(input);
  if (content.blocked) return content;
  return checkRate(ip);
}
