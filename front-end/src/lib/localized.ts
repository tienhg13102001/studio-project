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
