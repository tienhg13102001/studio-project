// Pure calculation helpers for the /bao-gia quote builder.
// Formulas ported verbatim from back-end/scripts/google/index.html (Vue app)
// to keep totals/discount/amount-in-words identical to the Apps Script backend.

import type { CatKey, QuoteItem } from "./types";

export function lineTotal(item: QuoteItem): number {
  return (item.dongia || 0) * (item.sl || 1) * (item.sn || 1);
}

export function categorySubtotal(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function grandSubtotal(items: Record<CatKey, QuoteItem[]>): number {
  return (Object.keys(items) as CatKey[]).reduce(
    (sum, key) => sum + categorySubtotal(items[key]),
    0,
  );
}

/**
 * Resolves a raw discount input string into an absolute VND value.
 * - Percent branch ("contains %"): pct clamped to [0,100], rounded against subTotal.
 * - Absolute branch: digits-only, capped at 1e12.
 */
export function resolveDiscount(rawCk: string, subTotal: number): number {
  if (rawCk.includes("%")) {
    const pct = Math.min(100, Math.max(0, parseFloat(rawCk.replace("%", "")) || 0));
    return Math.round((subTotal * pct) / 100);
  }
  return Math.min(1e12, Number(String(rawCk).replace(/[^\d]/g, "")) || 0);
}

export function finalTotal(subTotal: number, ckValue: number): number {
  return Math.max(0, subTotal - ckValue);
}

/**
 * Number of billed days between two datetime-local strings.
 * Returns 1 for missing/invalid/non-positive ranges.
 */
export function calculatedDays(tu: string, den: string): number {
  if (!tu || !den) return 1;
  const diff = new Date(den).getTime() - new Date(tu).getTime();
  return isNaN(diff) || diff <= 0 ? 1 : Math.ceil(diff / 86400000);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "BZ" + YY + MM + DD + "." + HH + mm (zero-padded). */
export function makeSobg(d: Date = new Date()): string {
  const yy = pad2(d.getFullYear() % 100);
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  return `BZ${yy}${mm}${dd}.${hh}${min}`;
}

function toDateTimeLocal(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function toDateOnly(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Default form dates: tu = tomorrow 07:00, den = tomorrow 18:00,
 * hanHieuLuc = today + 30 days.
 */
export function defaultDates(d: Date = new Date()): {
  tu: string;
  den: string;
  hanHieuLuc: string;
} {
  const tomorrow = new Date(d);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tuDate = new Date(tomorrow);
  tuDate.setHours(7, 0, 0, 0);

  const denDate = new Date(tomorrow);
  denDate.setHours(18, 0, 0, 0);

  const hanDate = new Date(d);
  hanDate.setDate(hanDate.getDate() + 30);

  return {
    tu: toDateTimeLocal(tuDate),
    den: toDateTimeLocal(denDate),
    hanHieuLuc: toDateOnly(hanDate),
  };
}

// ─── Amount-in-words (Vietnamese) ──────────────────────────────────────────
// Ported verbatim from back-end/scripts/google/index.html. Do not "clean up"
// the logic — the exact string manipulation matches the backend's output.

const mangso = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

function dochangchuc(so: number, daydu: boolean): string {
  let chuoi = "";
  const chuc = Math.floor(so / 10);
  const donvi = so % 10;
  if (chuc > 1) {
    chuoi = " " + mangso[chuc] + " mươi";
    if (donvi == 1) chuoi += " mốt";
  } else if (chuc == 1) {
    chuoi = " mười";
    if (donvi == 1) chuoi += " một";
  } else if (daydu && donvi > 0) chuoi = " lẻ";
  if (donvi == 5 && chuc >= 1) chuoi += " lăm";
  else if (donvi > 1 || (donvi == 1 && chuc == 0)) chuoi += " " + mangso[donvi];
  return chuoi;
}

function docblock(so: number, daydu: boolean): string {
  let chuoi = "";
  const tram = Math.floor(so / 100);
  so = so % 100;
  if (daydu || tram > 0) {
    chuoi = " " + mangso[tram] + " trăm";
    chuoi += dochangchuc(so, true);
  } else chuoi = dochangchuc(so, false);
  return chuoi;
}

function docHangTrieu(so: number, daydu: boolean): string {
  let chuoi = "";
  const trieu = Math.floor(so / 1000000);
  so = so % 1000000;
  if (trieu > 0) {
    chuoi = docblock(trieu, daydu) + " triệu";
    daydu = true;
  }
  const ngan = Math.floor(so / 1000);
  so = so % 1000;
  if (ngan > 0) {
    chuoi += docblock(ngan, daydu) + " nghìn";
    daydu = true;
  }
  if (so > 0) {
    chuoi += docblock(so, daydu);
  }
  return chuoi;
}

export function docTienChu(so: number): string {
  if (so == 0 || isNaN(so)) return "Không đồng";
  let chuoi = "",
    hauto = "";
  do {
    const ty = so % 1000000000;
    so = Math.floor(so / 1000000000);
    if (so > 0) {
      chuoi = docHangTrieu(ty, true) + hauto + chuoi;
    } else {
      chuoi = docHangTrieu(ty, false) + hauto + chuoi;
    }
    hauto = " tỷ";
  } while (so > 0);
  chuoi = chuoi
    .trim()
    .replace(/không trăm lẻ không/g, "")
    .replace(/lẻ không/g, "")
    .trim();
  if (chuoi.substring(0, 10) === "không trăm") {
    chuoi = chuoi.substring(10).trim();
    if (chuoi.substring(0, 2) === "lẻ") chuoi = chuoi.substring(2).trim();
  }
  chuoi = chuoi.charAt(0).toUpperCase() + chuoi.slice(1);
  return chuoi + " đồng chẵn.";
}

export function newItemId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
