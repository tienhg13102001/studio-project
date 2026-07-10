// Live A4 preview HTML builders. Ported verbatim from the Vue app's
// contractPreviewHTML / bbntPreviewHTML / dnttPreviewHTML computeds
// (back-end/scripts/google/hop-dong/index.html) so the preview matches the doc.

import type { BBNTForm, CatKey, ContractForm, DNTTForm } from "#lib/contract/types";
import { CONTRACT_CLAUSES } from "./constants";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const fmtN = (n: number) => Number(n || 0).toLocaleString("vi-VN");

const p2 = (n: number) => String(n).padStart(2, "0");

export type ContractTotals = {
  subTotal: number;
  afterCk: number;
  vatAmount: number;
  tonggiatri: number;
  tongTienChu: string;
};

export function buildContractPreview(f: ContractForm, t: ContractTotals): string {
  const blank = (v: string, ph = "___") =>
    v ? `<b>${esc(v)}</b>` : `<span style="color:#999;font-style:italic">${ph}</span>`;
  const blankPlain = (v: string, ph = "___") =>
    v ? esc(v) : `<span style="color:#999;font-style:italic">${ph}</span>`;
  const fmtDate = (v: string) => {
    if (!v) return '<span style="color:#999;font-style:italic">___</span>';
    const d = new Date(v);
    if (isNaN(d.getTime())) return esc(v);
    return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const groups: { id: CatKey; label: string }[] = [
    { id: "SX", label: "NHÂN SỰ" },
    { id: "TB", label: "THIẾT BỊ" },
    { id: "HK", label: "HẬU KỲ" },
    { id: "HC", label: "HẬU CẦN" },
  ];
  let stt = 1;
  let trows = "";
  let hasAny = false;
  for (const g of groups) {
    const items = (f.items[g.id] || []).filter((i) => i.ten || i.dongia > 0);
    if (!items.length) continue;
    hasAny = true;
    trows += `<tr style="background:#f0f0f0"><td colspan="7" style="padding:6px 8px;font-weight:700;font-size:12.5px;text-align:left;border:1px solid #ccc">${g.label}</td></tr>`;
    for (const item of items) {
      const tt = (item.dongia || 0) * (item.sl || 1) * (item.sn || 1);
      trows += `<tr>
        <td style="border:1px solid #ddd;padding:5px 4px;text-align:center;font-size:12.5px">${stt++}</td>
        <td style="border:1px solid #ddd;padding:5px 7px;text-align:left;font-size:12.5px">${esc(item.ten) || "—"}</td>
        <td style="border:1px solid #ddd;padding:5px 4px;text-align:center;font-size:12.5px">${esc(item.dvt) || ""}</td>
        <td style="border:1px solid #ddd;padding:5px 4px;text-align:center;font-size:12.5px">${item.sl || 1}</td>
        <td style="border:1px solid #ddd;padding:5px 4px;text-align:center;font-size:12.5px">${item.sn || 1}</td>
        <td style="border:1px solid #ddd;padding:5px 6px;text-align:right;font-size:12.5px">${fmtN(item.dongia || 0)}</td>
        <td style="border:1px solid #ddd;padding:5px 6px;text-align:right;font-size:12.5px;font-weight:600">${fmtN(tt)}</td>
      </tr>`;
    }
  }
  if (!hasAny)
    trows = `<tr><td colspan="7" style="border:1px solid #ddd;padding:18px;text-align:center;color:#999;font-style:italic;font-size:12.5px">Chưa có dịch vụ nào được thêm</td></tr>`;

  const thanhtoan = (f.thanhtoantxt || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  const ghichu = (f.ghichu || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `<div style="font-family:'Times New Roman',Times,serif;font-size:14.5px;line-height:1.62;color:#000">

    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:13.5px;font-weight:700;letter-spacing:.3px">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div style="font-size:13.5px">Độc lập – Tự do – Hạnh phúc</div>
      <div style="font-size:12px;margin-top:2px">―――――――――――――――――――――</div>
    </div>

    <div style="text-align:center;margin:20px 0 14px">
      <div style="font-size:19px;font-weight:700;letter-spacing:1px">HỢP ĐỒNG CUNG CẤP DỊCH VỤ MEDIA</div>
      <div style="font-size:14px;margin-top:5px">Số: <b>${esc(f.sohd) || "___/HĐDV/BeeZ"}</b></div>
    </div>

    <div style="text-align:right;font-size:13.5px;font-style:italic;margin-bottom:14px">Hà Nội, ngày ${fmtDate(f.ngayky)}</div>

    <div style="font-size:13.5px;margin-bottom:14px;text-align:justify">
      – Căn cứ Bộ luật Dân sự 2015;<br>
      – Căn cứ Luật Doanh nghiệp 2020;<br>
      – Căn cứ Luật Thương mại 2005;<br>
      – Căn cứ Luật Sở hữu trí tuệ 2005;<br>
      – Căn cứ các quy định liên quan khác;<br>
      – Căn cứ khả năng và nhu cầu của hai bên.<br>
      Hôm nay, tại Hà Nội, hai bên cùng thỏa thuận ký kết hợp đồng với các điều khoản sau:
    </div>

    <div style="margin-bottom:14px;font-size:13.5px">
      <div style="font-weight:700;text-transform:uppercase;margin-bottom:6px">Bên A (Bên thuê dịch vụ):</div>
      <table style="width:100%;border-collapse:collapse;font-size:13.5px">
        <tr><td style="padding:3px 0;width:150px;vertical-align:top">Tên tổ chức:</td><td style="padding:3px 0">${blank(f.tencty, "Chưa nhập tên công ty")}</td></tr>
        <tr><td style="padding:3px 0;vertical-align:top">Địa chỉ:</td><td style="padding:3px 0">${blankPlain(f.diachi)}</td></tr>
        <tr><td style="padding:3px 0">Mã số thuế:</td><td style="padding:3px 0">${blankPlain(f.mst)}</td></tr>
        <tr><td style="padding:3px 0">Người đại diện:</td><td style="padding:3px 0">${blankPlain(f.nguoidaidien)} &nbsp;–&nbsp; Chức vụ: ${blankPlain(f.chucvu, "Giám đốc")}</td></tr>
        <tr><td style="padding:3px 0">Email:</td><td style="padding:3px 0">${blankPlain(f.email)}</td></tr>
        <tr><td style="padding:3px 0">Điện thoại:</td><td style="padding:3px 0">${blankPlain(f.sdt)}</td></tr>
      </table>
    </div>

    <div style="margin-bottom:18px;font-size:13.5px">
      <div style="font-weight:700;text-transform:uppercase;margin-bottom:6px">Bên B (Bên cung cấp dịch vụ):</div>
      <table style="width:100%;border-collapse:collapse;font-size:13.5px">
        <tr><td style="padding:3px 0;width:150px">Tên tổ chức:</td><td style="padding:3px 0"><b>CÔNG TY TNHH BEE Z PRODUCTION</b></td></tr>
        <tr><td style="padding:3px 0">Địa chỉ:</td><td style="padding:3px 0">Số 54, ngõ 250, đường Khương Trung, Thanh Xuân, Hà Nội</td></tr>
        <tr><td style="padding:3px 0">Mã số thuế:</td><td style="padding:3px 0">0110989139</td></tr>
        <tr><td style="padding:3px 0">Người đại diện:</td><td style="padding:3px 0">NGUYỄN THỌ TRẦN HOÀN &nbsp;–&nbsp; Chức vụ: Giám đốc</td></tr>
        <tr><td style="padding:3px 0">Điện thoại:</td><td style="padding:3px 0">0967335577</td></tr>
      </table>
    </div>

    <div style="border-top:2px solid #1a1a1a;margin:16px 0"></div>

    <div style="margin-bottom:14px;font-size:13.5px">
      <div style="font-weight:700;font-size:15px;text-transform:uppercase;margin-bottom:8px">Điều 1. Phạm vi cung cấp dịch vụ</div>
      <p style="margin:0 0 7px;text-align:justify">1.1. Bên B thực hiện cung cấp dịch vụ: ${blankPlain(f.motadv, "Chưa nhập mô tả dịch vụ")}</p>
      <p style="margin:0 0 5px">1.2. Thời gian thực hiện: ${blankPlain(f.thoigianText, "Chưa chọn thời gian")}</p>
      <p style="margin:0">1.3. Địa điểm thực hiện: ${blankPlain(f.diadiem, "Theo kế hoạch hai bên thỏa thuận")}</p>
    </div>

    <div style="margin-bottom:14px;font-size:13.5px">
      <div style="font-weight:700;font-size:15px;text-transform:uppercase;margin-bottom:8px">Điều 2. Bảng dịch vụ &amp; giá trị hợp đồng</div>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px">
        <thead>
          <tr style="background:#1a1a1a;color:#fff">
            <th style="padding:7px 4px;text-align:center;width:5%;border:1px solid #444">STT</th>
            <th style="padding:7px 8px;text-align:left;width:30%;border:1px solid #444">Hạng mục</th>
            <th style="padding:7px 4px;text-align:center;width:7%;border:1px solid #444">ĐVT</th>
            <th style="padding:7px 4px;text-align:center;width:6%;border:1px solid #444">SL</th>
            <th style="padding:7px 4px;text-align:center;width:7%;border:1px solid #444">Ngày</th>
            <th style="padding:7px 6px;text-align:right;width:19%;border:1px solid #444">Đơn giá (đ)</th>
            <th style="padding:7px 6px;text-align:right;width:19%;border:1px solid #444">Thành tiền (đ)</th>
          </tr>
        </thead>
        <tbody>
          ${trows}
          <tr style="background:#f5f5f5;font-weight:700">
            <td colspan="6" style="border:1px solid #ccc;padding:6px 8px;text-align:right;font-size:12.5px">Tạm tính:</td>
            <td style="border:1px solid #ccc;padding:6px 8px;text-align:right;font-size:12.5px">${fmtN(t.subTotal)}</td>
          </tr>
          ${
            f.ck > 0
              ? `<tr><td colspan="6" style="border:1px solid #ccc;padding:5px 8px;text-align:right;font-size:12.5px;color:#dc2626">Chiết khấu:</td><td style="border:1px solid #ccc;padding:5px 8px;text-align:right;font-size:12.5px;color:#dc2626">− ${fmtN(f.ck)}</td></tr><tr style="background:#f5f5f5;font-weight:700"><td colspan="6" style="border:1px solid #ccc;padding:6px 8px;text-align:right;font-size:12.5px">Chi phí sau chiết khấu (chưa VAT):</td><td style="border:1px solid #ccc;padding:6px 8px;text-align:right;font-size:12.5px">${fmtN(t.afterCk)}</td></tr>`
              : ""
          }
          ${
            f.applyVat
              ? `<tr><td colspan="6" style="border:1px solid #ccc;padding:5px 8px;text-align:right;font-size:12.5px">VAT (${f.vatPct}%):</td><td style="border:1px solid #ccc;padding:5px 8px;text-align:right;font-size:12.5px">${fmtN(t.vatAmount)}</td></tr>`
              : ""
          }
          <tr style="background:#1a1a1a;color:#fff;font-weight:700">
            <td colspan="6" style="border:1px solid #444;padding:7px 8px;text-align:right;font-size:14px;color:#fff">TỔNG GIÁ TRỊ HỢP ĐỒNG:</td>
            <td style="border:1px solid #444;padding:7px 8px;text-align:right;font-size:14px;color:#fff">${fmtN(t.tonggiatri)}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:7px;font-style:italic;font-size:12.5px">(Bằng chữ: ${esc(t.tongTienChu)})</div>
    </div>

    <div style="margin-bottom:14px;font-size:13.5px">
      <div style="font-weight:700;font-size:15px;text-transform:uppercase;margin-bottom:8px">Điều 3. Phương thức thanh toán</div>
      <div style="text-align:justify;white-space:pre-line">${thanhtoan || '<span style="color:#999;font-style:italic">Chưa chọn phương thức thanh toán</span>'}</div>
      <div style="margin-top:8px">Thanh toán bằng chuyển khoản vào tài khoản của Bên B:</div>
      <div style="margin-left:14px">Chủ tài khoản: <b>CÔNG TY TNHH TRUYỀN THÔNG BEE Z PRODUCTION</b><br>Số tài khoản: <b>68335577</b> — Ngân hàng Techcombank</div>
    </div>

    <div style="font-size:13.5px">
      ${CONTRACT_CLAUSES}
      ${ghichu ? `<div style="margin-top:12px;border-top:1px dashed #ccc;padding-top:10px"><b>Ghi chú bổ sung:</b><br>${ghichu}</div>` : ""}
    </div>

    <div style="display:flex;justify-content:space-between;margin-top:32px;font-size:13.5px;text-align:center">
      <div style="width:44%">
        <div style="font-weight:700;text-transform:uppercase;margin-bottom:4px">Bên A (Bên thuê)</div>
        <div style="color:#666;font-size:12px;margin-bottom:56px">(Ký, họ tên, đóng dấu)</div>
        <div style="font-weight:700">${blankPlain(f.nguoidaidien, "...")}</div>
        <div style="font-size:12px;color:#444">${esc(f.chucvu) || "Giám đốc"}</div>
        <div style="font-size:12px;color:#666">${esc(f.tencty) || ""}</div>
      </div>
      <div style="width:44%">
        <div style="font-weight:700;text-transform:uppercase;margin-bottom:4px">Bên B (Bên cung cấp)</div>
        <div style="color:#666;font-size:12px;margin-bottom:56px">(Ký, họ tên, đóng dấu)</div>
        <div style="font-weight:700">NGUYỄN THỌ TRẦN HOÀN</div>
        <div style="font-size:12px;color:#444">Giám đốc</div>
        <div style="font-size:12px;color:#666">CÔNG TY TNHH BEE Z PRODUCTION</div>
      </div>
    </div>

  </div>`;
}

export type BBNTTotals = {
  sumN: number;
  vat: number;
  tong: number;
  conPhai: number;
  conPhaiChu: string;
};

export function buildBBNTPreview(b: BBNTForm, t: BBNTTotals): string {
  const fmtNgay = (v: string) => {
    if (!v) return "___";
    const d = new Date(v);
    if (isNaN(d.getTime())) return esc(v);
    return `ngày ${p2(d.getDate())} tháng ${p2(d.getMonth() + 1)} năm ${d.getFullYear()}`;
  };
  let rows = "";
  b.items.forEach((it, i) => {
    const dg = Number(it.dongia) || 0;
    const sl = Number(it.sl) || 1;
    const tt = Number(it.tt) || dg * sl;
    const tyle = it.tyle === "" || it.tyle == null ? 100 : Number(it.tyle) || 0;
    const ttN = Math.round((tt * tyle) / 100);
    rows += `<tr>
      <td style="border:1px solid #ddd;padding:5px 4px;text-align:center;font-size:12px">${i + 1}</td>
      <td style="border:1px solid #ddd;padding:5px 7px;text-align:left;font-size:12px">${esc(it.ten) || "—"}</td>
      <td style="border:1px solid #ddd;padding:5px 4px;text-align:center;font-size:12px">${esc(it.dvt) || ""}</td>
      <td style="border:1px solid #ddd;padding:5px 4px;text-align:center;font-size:12px">${sl}</td>
      <td style="border:1px solid #ddd;padding:5px 6px;text-align:right;font-size:12px">${fmtN(dg)}</td>
      <td style="border:1px solid #ddd;padding:5px 6px;text-align:right;font-size:12px">${fmtN(tt)}</td>
      <td style="border:1px solid #ddd;padding:5px 4px;text-align:center;font-size:12px">${tyle}%</td>
      <td style="border:1px solid #ddd;padding:5px 6px;text-align:right;font-size:12px;font-weight:600">${fmtN(ttN)}</td>
    </tr>`;
  });
  if (!b.items.length)
    rows = `<tr><td colspan="8" style="border:1px solid #ddd;padding:16px;text-align:center;color:#999;font-style:italic;font-size:12px">Chưa có hạng mục nghiệm thu</td></tr>`;
  const totalRow = (label: string, val: string, strong: boolean) =>
    `<tr style="${strong ? "background:#1a1a1a;color:#fff;" : "background:#f5f5f5;"}font-weight:700"><td colspan="7" style="border:1px solid ${strong ? "#444" : "#ccc"};padding:6px 8px;text-align:right;font-size:${strong ? "13.5px" : "12px"}">${label}</td><td style="border:1px solid ${strong ? "#444" : "#ccc"};padding:6px 8px;text-align:right;font-size:${strong ? "13.5px" : "12px"}">${val}</td></tr>`;
  const dlvLines = String(b.deliverables || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const dlvHTML = (dlvLines.length ? dlvLines : ["Toàn bộ sản phẩm/dịch vụ theo Hợp đồng đã ký."])
    .map((l) => `<div style="margin:2px 0 2px 10px">- ${esc(l)}</div>`)
    .join("");
  return `<div style="font-family:'Times New Roman',Times,serif;font-size:13.5px;line-height:1.6;color:#000">
    <div style="text-align:center;margin-bottom:14px">
      <div style="font-size:13px;font-weight:700">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div style="font-size:13px">Độc lập – Tự do – Hạnh phúc</div>
      <div style="font-size:12px;margin-top:2px">――――――――――――</div>
    </div>
    <div style="text-align:center;margin:18px 0 12px">
      <div style="font-size:18px;font-weight:700;letter-spacing:.5px">BIÊN BẢN NGHIỆM THU</div>
      <div style="font-size:13px;margin-top:4px">Số HĐ: <b>${esc(b.sohd) || "___"}</b></div>
    </div>
    <div style="margin-bottom:12px;text-align:justify">
      – Căn cứ Hợp đồng số <b>${esc(b.sohd) || "___"}</b> ký ${fmtNgay(b.ngayky)} giữa Công ty TNHH Truyền thông Bee Z Production với ${esc(b.tencty) || "___"};<br>
      – Căn cứ các công việc hai bên đã hoàn thành.<br>
      Hôm nay, ${fmtNgay(b.ngayNthu)}, tại TP. Hà Nội, chúng tôi gồm:
    </div>
    <div style="margin-bottom:10px">
      <div style="font-weight:700">BÊN A: ${esc(b.tencty) || "___"}</div>
      <div style="margin-left:12px">Đại diện: ${esc(b.nguoidaidien) || "___"} &nbsp;–&nbsp; Chức vụ: ${esc(b.chucvu) || "Giám đốc"}</div>
      <div style="margin-left:12px">Trụ sở: ${esc(b.diachi) || "___"} &nbsp;–&nbsp; MST: ${esc(b.mst) || "___"}</div>
    </div>
    <div style="margin-bottom:12px">
      <div style="font-weight:700">BÊN B: CÔNG TY TNHH TRUYỀN THÔNG BEE Z PRODUCTION</div>
      <div style="margin-left:12px">Đại diện: NGUYỄN THỌ TRẦN HOÀN &nbsp;–&nbsp; Chức vụ: Giám đốc</div>
      <div style="margin-left:12px">Trụ sở: Số 54 ngõ 250 Khương Trung, Khương Đình, Hà Nội &nbsp;–&nbsp; MST: 0110989139</div>
    </div>
    <div style="font-weight:700;margin-bottom:6px">ĐIỀU 1: NỘI DUNG NGHIỆM THU</div>
    <div style="margin-bottom:2px">Bên B đã hoàn thành và bàn giao cho Bên A các sản phẩm/hạng mục sau:</div>
    ${dlvHTML}
    <div style="margin:4px 0 12px;text-align:justify">Chi tiết giá trị nghiệm thu được liệt kê tại bảng dưới đây.</div>
    <div style="font-weight:700;margin-bottom:6px">ĐIỀU 2: GIÁ TRỊ NGHIỆM THU</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px">
      <thead>
        <tr style="background:#1a1a1a;color:#fff">
          <th style="padding:6px 4px;border:1px solid #444;width:5%">STT</th>
          <th style="padding:6px 6px;border:1px solid #444;width:26%;text-align:left">Hạng mục</th>
          <th style="padding:6px 4px;border:1px solid #444;width:7%">ĐVT</th>
          <th style="padding:6px 4px;border:1px solid #444;width:6%">SL</th>
          <th style="padding:6px 4px;border:1px solid #444;width:15%">Đơn giá</th>
          <th style="padding:6px 4px;border:1px solid #444;width:15%">Thành tiền</th>
          <th style="padding:6px 4px;border:1px solid #444;width:9%">Tỉ lệ NT</th>
          <th style="padding:6px 4px;border:1px solid #444;width:17%">TT nghiệm thu</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        ${totalRow("Tổng tiền chưa bao gồm thuế GTGT", fmtN(t.sumN), false)}
        ${b.applyVat ? totalRow("Thuế GTGT (" + b.vatPct + "%)", fmtN(t.vat), false) : ""}
        ${totalRow("Tổng tiền đã bao gồm thuế GTGT", fmtN(t.tong), true)}
      </tbody>
    </table>
    <div style="margin-bottom:12px">
      <div>– Bên A đã thanh toán cho Bên B số tiền: <b>${fmtN(b.daTT)}</b> VNĐ</div>
      <div>– Bên A còn phải thanh toán cho Bên B số tiền: <b>${fmtN(t.conPhai)}</b> VNĐ <i>(Bằng chữ: ${esc(t.conPhaiChu)})</i></div>
    </div>
    <div style="font-weight:700;margin-bottom:6px">ĐIỀU 3: ĐIỀU KHOẢN CHUNG</div>
    <div style="margin-bottom:20px;text-align:justify">Sau khi Bên A thanh toán đủ, hợp đồng tự động được thanh lý. Biên bản lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản, có hiệu lực từ ngày ký.</div>
    <div style="display:flex;justify-content:space-between;margin-top:26px;text-align:center">
      <div style="width:44%">
        <div style="font-weight:700">ĐẠI DIỆN BÊN A</div>
        <div style="color:#666;font-size:12px;margin-bottom:52px">(Ký, họ tên, đóng dấu)</div>
        <div style="font-weight:700">${esc(b.nguoidaidien) || "..."}</div>
      </div>
      <div style="width:44%">
        <div style="font-weight:700">ĐẠI DIỆN BÊN B</div>
        <div style="color:#666;font-size:12px;margin-bottom:52px">(Ký, họ tên, đóng dấu)</div>
        <div style="font-weight:700">NGUYỄN THỌ TRẦN HOÀN</div>
      </div>
    </div>
  </div>`;
}

export type DNTTDerived = { soDntt: string; soTienChu: string };

export function buildDNTTPreview(d: DNTTForm, x: DNTTDerived): string {
  const fmtNgay = (v: string) => {
    if (!v) return "___";
    const dt = new Date(v);
    if (isNaN(dt.getTime())) return esc(v);
    return `ngày ${p2(dt.getDate())} tháng ${p2(dt.getMonth() + 1)} năm ${dt.getFullYear()}`;
  };
  const soBBNT = esc(d.soBBNT) || "(theo biên bản nghiệm thu)";
  return `<div style="font-family:'Times New Roman',Times,serif;font-size:13.5px;line-height:1.6;color:#000">
    <div style="font-weight:700">CÔNG TY TNHH TRUYỀN THÔNG BEE Z PRODUCTION</div>
    <div>Địa chỉ: Số 54 ngõ 250 Khương Trung, Phường Khương Đình, Hà Nội</div>
    <div style="margin-bottom:14px">Số: ${esc(x.soDntt) || "___"}</div>
    <div style="text-align:center;font-size:18px;font-weight:700;letter-spacing:.5px;margin:16px 0 14px">ĐỀ NGHỊ THANH TOÁN</div>
    <div style="font-weight:700;margin-bottom:8px">Kính gửi: ${esc(d.tencty) || "___"}</div>
    <div style="font-style:italic">- Căn cứ Hợp đồng dịch vụ số: ${esc(d.sohd) || "___"};</div>
    <div style="font-style:italic;margin-bottom:8px">- Căn cứ Biên bản nghiệm thu và bàn giao dịch vụ số: ${soBBNT}.</div>
    <div style="text-align:justify;margin-bottom:12px">Công ty TNHH Truyền thông Bee Z Production trân trọng đề nghị Quý công ty thanh toán chi phí thực hiện dịch vụ "<b>${esc(d.duann) || "___"}</b>" với thông tin chi tiết:</div>
    <div style="font-weight:700;margin-bottom:5px">1. NỘI DUNG THANH TOÁN:</div>
    <div style="margin-bottom:12px">- Số tiền thanh toán (${esc(d.soTienNote)}): <b>${fmtN(d.soTien)} VNĐ</b> <i>(Bằng chữ: ${esc(x.soTienChu)})</i>.</div>
    <div style="font-weight:700;margin-bottom:5px">2. THÔNG TIN TÀI KHOẢN NHẬN THANH TOÁN:</div>
    <div>Quý công ty vui lòng chuyển khoản vào tài khoản ngân hàng chính thức dưới đây:</div>
    <div>- Chủ tài khoản: CÔNG TY TNHH TRUYỀN THÔNG BEE Z PRODUCTION</div>
    <div style="margin-bottom:12px">- Số tài khoản: 68335577 – Techcombank – CN Hà Thành</div>
    <div style="font-weight:700;margin-bottom:5px">3. CHỨNG TỪ ĐÍNH KÈM:</div>
    <div>- Biên bản nghiệm thu và bàn giao dịch vụ số ${soBBNT}.</div>
    <div style="margin-bottom:12px">- Hóa đơn giá trị gia tăng (GTGT) hợp lệ theo quy định của pháp luật.</div>
    <div style="text-align:justify;margin-bottom:8px">Kính đề nghị Quý công ty xem xét và duyệt giải ngân trong vòng ${esc(d.soNgayText) || "15 (mười lăm)"} ngày làm việc kể từ ngày nhận được Đề nghị thanh toán này theo đúng quy định tại Hợp đồng.</div>
    <div style="margin-bottom:26px">Xin trân trọng cảm ơn sự hợp tác của Quý công ty!</div>
    <div style="text-align:right">
      <div style="font-style:italic">Hà Nội, ${fmtNgay(d.ngay)}</div>
      <div style="font-weight:700">NGƯỜI ĐẠI DIỆN</div>
      <div style="font-style:italic;font-size:12px;margin-bottom:50px">(Ký, ghi rõ họ tên và đóng dấu)</div>
      <div style="font-weight:700">NGUYỄN THỌ TRẦN HOÀN</div>
    </div>
  </div>`;
}
