// Builds the live A4 preview HTML from the form. Mirrors the Vue app's
// `previewHTML` computed (back-end/scripts/google/index.html) exactly.

import { formatDateDisplay } from "#lib/quote/format";
import type { CatKey, QuoteForm } from "#lib/quote/types";

const PREVIEW_TABS: { key: CatKey; label: string }[] = [
  { key: "SX", label: "NHÂN SỰ" },
  { key: "TB", label: "THIẾT BỊ" },
  { key: "HK", label: "HẬU KỲ" },
  { key: "HC", label: "HẬU CẦN" },
];

const fmt = (n: number) => (n || 0).toLocaleString("vi-VN");

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildPreviewHTML(
  form: QuoteForm,
  subTotal: number,
  finalTotal: number,
  tongTienChu: string,
): string {
  const f = form;
  let stt = 0;
  let rows = "";
  PREVIEW_TABS.forEach(({ key, label }) => {
    const items = (f.items || ({} as QuoteForm["items"]))[key] || [];
    if (!items.length) return;
    stt++;
    const secSum = items.reduce(
      (s, it) => s + (it.dongia || 0) * (it.sl || 1) * (it.sn || 1),
      0,
    );
    rows += `<tr class="pr-sec"><td colspan="6">${stt}. ${label}</td><td colspan="2" class="r">${fmt(
      secSum,
    )}</td></tr>`;
    items.forEach((item, i) => {
      const amt = (item.dongia || 0) * (item.sl || 1) * (item.sn || 1);
      const ghi = esc(item.ghichu || item.chitiet).replace(/\n/g, "<br>");
      rows += `<tr>
        <td class="c">${stt}.${i + 1}</td>
        <td class="l">${esc(item.ten)}</td>
        <td class="c">${Number(item.sl) || 1}</td>
        <td class="c">${esc(item.dvt)}</td>
        <td class="r">${fmt(item.dongia)}</td>
        <td class="c">${Number(item.sn) || 1}</td>
        <td class="r">${fmt(amt)}</td>
        <td class="l">${ghi}</td>
      </tr>`;
    });
  });
  const ck = f.ckValue || 0;
  const timeStr = [
    f.tu ? formatDateDisplay(f.tu) : "",
    f.den ? formatDateDisplay(f.den) : "",
  ]
    .filter(Boolean)
    .join(" → ");
  return `<div class="pr-head">
    <div>
      <div class="pr-title">BÁO GIÁ DỊCH VỤ</div>
      <div style="font-size:9.5px;color:#aaa;margin-top:2px;">Số: ${esc(f.sobg) || "—"}</div>
    </div>
    <div class="pr-co">BEE Z PRODUCTION<small>beez.vn</small></div>
  </div>
  <div class="pr-info">
    <div><b>Khách hàng:</b> ${esc(f.khachhang) || "—"}</div>
    <div><b>MST:</b> ${esc(f.mst) || "—"}</div>
    <div><b>Dự án:</b> ${esc(f.duann) || "—"}</div>
    <div><b>Yêu cầu:</b> ${esc(f.yeucau) || "—"}</div>
    <div style="grid-column:1/-1"><b>Thời gian:</b> ${timeStr || "—"} &nbsp;|&nbsp; <b>Phụ trách:</b> ${
      esc(f.phutrach) || "—"
    }</div>
  </div>
  <table class="pr-tab">
    <tr><th>STT</th><th class="l">DỊCH VỤ</th><th>SL</th><th>ĐVT</th><th>ĐƠN GIÁ</th><th>NGÀY</th><th>THÀNH TIỀN</th><th class="l">GHI CHÚ</th></tr>
    ${
      rows ||
      '<tr><td colspan="8" style="text-align:center;color:#bbb;padding:14px;font-size:10px;">Chưa có hạng mục — thêm ở bên trái</td></tr>'
    }
    <tr class="pr-tot"><td colspan="6" style="text-align:right;">TỔNG CỘNG:</td><td class="r">${fmt(
      subTotal,
    )}</td><td></td></tr>
    ${
      ck > 0
        ? `<tr class="pr-tot"><td colspan="6" style="text-align:right;">Chiết khấu:</td><td class="r" style="color:#c0392b;">-${fmt(
            ck,
          )}</td><td></td></tr>`
        : ""
    }
    <tr class="pr-grand"><td colspan="6">THANH TOÁN:</td><td class="r">${fmt(
      finalTotal,
    )}</td><td></td></tr>
  </table>
  ${finalTotal > 0 ? `<div class="pr-footer">Bằng chữ: ${esc(tongTienChu)}</div>` : ""}
  <div class="pr-sign"><b>NGƯỜI BÁO GIÁ</b><br><span style="color:#555;">${
    esc(f.phutrach) || ""
  }</span></div>`;
}
