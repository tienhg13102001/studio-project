import type { Lang } from "#i18n";
import type { LocalizedString } from "#lib/apiTypes";

/**
 * Resolves a localized field to a plain string for the given language.
 * Tolerates legacy plain-string values (pre-migration data) so the UI
 * never renders an object or crashes during the transition.
 */
export function localized(
  value: string | LocalizedString | null | undefined,
  lang: Lang,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.en ?? value.vi ?? "";
}

/**
 * Như `localized` nhưng coi CHUỖI RỖNG là chưa có bản dịch.
 *
 * VÌ SAO CẦN RIÊNG: `??` chỉ lùi khi giá trị là null/undefined, nên một ô để
 * trống ("") vẫn được trả về nguyên xi và khách thấy khoảng trắng. Với những
 * phần dài do người quản trị tự gõ — câu chuyện dự án chẳng hạn — bản tiếng Anh
 * thường bị bỏ trống, và lúc đó hiện bản tiếng Việt vẫn hơn hẳn hiện không gì.
 *
 * KHÔNG sửa thẳng `localized` vì nó đang dùng ở khắp nơi; đổi hành vi chung để
 * phục vụ một chỗ là cách tự tạo lỗi ở chín chỗ còn lại.
 */
export function localizedOrFallback(
  value: string | LocalizedString | null | undefined,
  lang: Lang,
): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  const thu = [value[lang], value.vi, value.en];
  return thu.find((s) => typeof s === "string" && s.trim() !== "")?.trim() ?? "";
}
