// Display formatting helpers for the /hop-dong contract builder.
// Ported from back-end/scripts/google/hop-dong/index.html (Vue app) to keep the
// React UI's number/date rendering identical to the original. Mirrors
// src/lib/quote/format.ts.

/** Digits-only parse, min 0, capped at 1e12. */
export function parseMoney(v: string | number): number {
  const digits = String(v).replace(/[^\d]/g, "");
  const n = digits ? Number(digits) : 0;
  return Math.min(1e12, Math.max(0, n));
}

/** Live thousands-dot formatting on a digit string, e.g. "1000000" -> "1.000.000". */
export function formatThousands(s: string): string {
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** e.g. 1500000 -> "1.500.000 đ" */
export function formatMoney(n: number): string {
  return (n || 0).toLocaleString("vi-VN") + " đ";
}

/** Plain grouped number, e.g. 1500000 -> "1.500.000". */
export function formatNumber(n: number): string {
  return (n || 0).toLocaleString("vi-VN");
}

/**
 * Compact total for tab labels: ≥1e9 -> "X.X tỷ", ≥1e6 -> "X.X tr",
 * ≥1e3 -> floor(n/1000)+"k", else locale string. Strips a trailing ".0".
 */
export function formatTabTotal(n: number): string {
  const stripTrailingZero = (s: string) => s.replace(/\.0$/, "");
  if (n >= 1e9) return stripTrailingZero((n / 1e9).toFixed(1)) + " tỷ";
  if (n >= 1e6) return stripTrailingZero((n / 1e6).toFixed(1)) + " tr";
  if (n >= 1e3) return Math.floor(n / 1000) + "k";
  return n.toLocaleString("vi-VN");
}

/** "YYYY-MM-DDTHH:mm" -> "DD/MM/YYYY HH:mm" (invalid -> ""). */
export function formatDateDisplay(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/** "YYYY-MM-DD" (or datetime) -> "DD/MM/YYYY" via manual split (avoids UTC shift). */
export function formatDateOnly(v: string): string {
  if (!v) return "";
  const datePart = v.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return "";
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
}

/** "YYYY-MM-DD" (or datetime) -> "ngày D tháng M năm Y" (invalid -> ""). */
export function formatNgayVN(v: string): string {
  if (!v) return "";
  const datePart = v.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return "";
  const [yyyy, mm, dd] = parts;
  return `ngày ${Number(dd)} tháng ${Number(mm)} năm ${yyyy}`;
}
