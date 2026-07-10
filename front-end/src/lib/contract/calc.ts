// Pure calculation helpers for the /hop-dong contract builder.
// Pricing/VAT/amount-in-words ported verbatim from
// back-end/scripts/google/hop-dong/index.html (Vue app) + Mã.gs so totals stay
// identical to the Apps Script backend. Mirrors src/lib/quote/calc.ts.

import type { CatKey, ContractItem } from "./types";
import { CAT_KEYS } from "./types";

export function lineTotal(item: ContractItem): number {
  return (item.dongia || 0) * (item.sl || 1) * (item.sn || 1);
}

export function categorySubtotal(items: ContractItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function grandSubtotal(items: Record<CatKey, ContractItem[]>): number {
  return CAT_KEYS.reduce((sum, key) => sum + categorySubtotal(items[key] || []), 0);
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

/** subTotal - ck, floored at 0. */
export function afterDiscount(subTotal: number, ck: number): number {
  return Math.max(0, subTotal - ck);
}

/** VAT amount = round(afterCk * pct / 100), or 0 when VAT disabled. */
export function vatAmount(afterCk: number, vatPct: number, applyVat: boolean): number {
  if (!applyVat) return 0;
  return Math.round((afterCk * (vatPct || 0)) / 100);
}

/** Grand total = afterCk + VAT. */
export function grandTotal(afterCk: number, vat: number): number {
  return afterCk + vat;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "YYYYMMDD" date-code used in contract file names / {{ma_hdp}}. */
export function dateCode(d: Date = new Date()): string {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}

/** "HĐ" + YY + MM + DD + "." + HH + mm — default contract number suggestion. */
export function makeSohd(d: Date = new Date()): string {
  const yy = pad2(d.getFullYear() % 100);
  return `HĐ${yy}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}.${pad2(d.getHours())}${pad2(
    d.getMinutes(),
  )}`;
}

function toDateTimeLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`;
}

function toDateOnly(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Default form dates: ngayky = today, tu = tomorrow 07:00, den = tomorrow 18:00.
 */
export function defaultDates(d: Date = new Date()): {
  ngayky: string;
  tu: string;
  den: string;
} {
  const tomorrow = new Date(d);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tuDate = new Date(tomorrow);
  tuDate.setHours(7, 0, 0, 0);

  const denDate = new Date(tomorrow);
  denDate.setHours(18, 0, 0, 0);

  return {
    ngayky: toDateOnly(d),
    tu: toDateTimeLocal(tuDate),
    den: toDateTimeLocal(denDate),
  };
}

// ─── Amount-in-words (Vietnamese) ──────────────────────────────────────────
// Ported verbatim from the Apps Script app. Do not "clean up" the logic — the
// exact string manipulation matches the backend's output.

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
  let chuoi: string;
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
