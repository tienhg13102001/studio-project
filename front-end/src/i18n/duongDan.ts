/**
 * Ngôn ngữ nằm TRONG ĐƯỜNG DẪN (đợt J, 25/11/2026).
 *
 * VÌ SAO: trước đây tiếng Anh chỉ là một lựa chọn lưu trong trình duyệt
 * (`localStorage`), cùng một địa chỉ. Google không bấm nút EN, nên nó không bao
 * giờ thấy bản tiếng Anh và không thể xếp hạng câu tìm kiếm tiếng Anh nào. Giờ
 * mỗi trang có hai địa chỉ: `/service/san-xuat-tvc` (Việt) và
 * `/en/service/san-xuat-tvc` (Anh), khai cặp với nhau bằng hreflang.
 *
 * Bài viết và hai trang bảng giá tĩnh CHỈ có tiếng Việt: link tới chúng giữ
 * nguyên, không gắn /en (nginx cũng chuyển /en/bai-viet… về bản Việt).
 * Danh sách này PHẢI KHỚP `scripts/prerender-meta.mjs` (TIEN_TO_EN) và map
 * `$duong_cu` trong nginx.conf.
 */
import type { Lang } from "./LanguageContext";

const CHI_TIENG_VIET = /^\/(bai-viet|bang-gia|bang-gia-psc|portal)(\/|$|\?|#)/;

/** `/en`, `/en/…` → "en"; mọi đường khác → "vi". */
export const ngonNguTuDuongDan = (pathname: string): Lang =>
  /^\/en(\/|$)/.test(pathname) ? "en" : "vi";

/** Bỏ tiền tố `/en`: `/en/team` → `/team`, `/en` → `/`. */
export const boTienToEn = (pathname: string): string =>
  pathname.replace(/^\/en(?=\/|$)/, "") || "/";

/** Đường này có bản tiếng Anh không (trang của React, không phải tệp tĩnh). */
export const coBanTiengAnh = (p: string): boolean =>
  p.startsWith("/") && !p.startsWith("/en/") && p !== "/en" && !CHI_TIENG_VIET.test(p) && !/\.[a-z0-9]+$/i.test(p);

/** Đường dẫn Việt → đường dẫn đúng ngôn ngữ đang xem. */
export const theoNgonNgu = (p: string, lang: Lang): string => {
  if (lang !== "en" || !coBanTiengAnh(p)) return p;
  return p === "/" ? "/en" : `/en${p}`;
};
