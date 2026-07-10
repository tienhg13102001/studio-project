// Left-panel form for DNTT (Đề nghị thanh toán) mode: pick a contract, edit
// payment request fields, and export the request.
// Markup ported verbatim from back-end/scripts/google/hop-dong/index.html
// (lines 1125-1226) to keep the same DOM/class names as the original Vue app.

import { formatDateOnly, formatMoney } from "#lib/contract/format";
import type { ContractBuilder } from "./useContractBuilder";
import {
  ArrowsClockwiseIcon,
  FolderOpenIcon,
  SpinnerIcon,
  InvoiceIcon,
  CalendarBlankIcon,
  MoneyIcon,
} from "@phosphor-icons/react";

type Props = {
  c: ContractBuilder;
  openDatePicker: (
    target: "form" | "bbnt" | "dntt",
    field: string,
    e: React.MouseEvent<HTMLDivElement>,
  ) => void;
};

function parseHDName(name: string): { code: string; name: string; date: string } {
  const m = name.match(/^\[HĐ(\d{8})\]\s*(.*)$/);
  if (m) {
    const d = m[1];
    return {
      code: `HĐ${d.slice(6, 8)}${d.slice(4, 6)}`,
      name: (m[2] || "").trim(),
      date: `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`,
    };
  }
  return { code: name.slice(0, 12), name, date: "" };
}

const DNTTPanel = ({ c, openDatePicker }: Props) => {
  const { dntt } = c;

  return (
    <div>
      {/* Picker chọn hợp đồng */}
      <div className="file-pick">
        <div className="fsrow">
          <label style={{ color: "var(--gold)", margin: 0, fontSize: 9 }}>
            Chọn hợp đồng để lập đề nghị thanh toán
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="text"
              className="fsinp"
              value={c.dnttSearchQuery}
              onChange={(e) => c.setDnttSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
            />
            <button
              className="bp-ok bp"
              style={{ flexShrink: 0, padding: "6px 10px", borderRadius: 7, fontSize: 12 }}
              onClick={c.refreshContractList}
            >
              <ArrowsClockwiseIcon size={14} />
            </button>
          </div>
        </div>
        <div className="fgrid">
          {c.contractList.length === 0 && (
            <div className="fg-empty">
              <FolderOpenIcon
                size={20}
                style={{ display: "block", marginBottom: 5, opacity: 0.4 }}
              />
              Nhấn 🔄 để tải
            </div>
          )}
          {c.filteredDNTTContracts.map((f) => (
            <div
              key={f.id}
              className={`fcard${dntt.contractId === f.id ? " sel" : ""}`}
              onClick={() => c.selectDNTTContract(f)}
            >
              <div className="fc-c">{parseHDName(f.name).code}</div>
              <div className="fc-n">{parseHDName(f.name).name || f.name}</div>
              {parseHDName(f.name).date && <div className="fc-d">{parseHDName(f.name).date}</div>}
            </div>
          ))}
        </div>
      </div>

      {dntt.loading && (
        <div style={{ textAlign: "center", padding: 22, color: "var(--gold)" }}>
          <SpinnerIcon size={22} className="animate-spin" />
          <div style={{ fontSize: 12, marginTop: 8, color: "var(--dim)" }}>
            Đang đọc dữ liệu hợp đồng...
          </div>
        </div>
      )}

      {!dntt.contractId && !dntt.loading && (
        <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--dim)", fontSize: 12 }}>
          Chọn 1 hợp đồng ở trên để lập đề nghị thanh toán.
        </div>
      )}

      {dntt.contractId && !dntt.loading && (
        <>
          {/* Thông tin đề nghị */}
          <div className="sbox">
            <div className="stitle">
              <InvoiceIcon size={14} style={{ color: "var(--gold)" }} />
              Đề nghị thanh toán
            </div>
            <div className="fg" style={{ marginBottom: 10 }}>
              <label>Số ĐNTT</label>
              <input
                type="text"
                value={c.dnttSoDntt}
                readOnly
                style={{ color: "var(--gold)", fontWeight: 700 }}
              />
            </div>
            <div className="fg" style={{ marginBottom: 10 }}>
              <label>Kính gửi (Bên A)</label>
              <input
                type="text"
                value={dntt.tencty}
                onChange={(e) => c.setDNTTField("tencty", e.target.value)}
              />
            </div>
            <div className="row">
              <div className="fg">
                <label>Số hợp đồng</label>
                <input
                  type="text"
                  value={dntt.sohd}
                  onChange={(e) => c.setDNTTField("sohd", e.target.value)}
                />
              </div>
              <div className="fg">
                <label>Số biên bản nghiệm thu</label>
                <input
                  type="text"
                  value={dntt.soBBNT}
                  onChange={(e) => c.setDNTTField("soBBNT", e.target.value)}
                />
              </div>
            </div>
            <div className="fg" style={{ marginTop: 10 }}>
              <label>Dự án / Dịch vụ</label>
              <input
                type="text"
                value={dntt.duann}
                onChange={(e) => c.setDNTTField("duann", e.target.value)}
              />
            </div>
          </div>

          {/* Nội dung thanh toán */}
          <div className="sbox" style={{ marginTop: 12 }}>
            <div className="stitle">
              <MoneyIcon size={14} style={{ color: "var(--gold)" }} />
              Nội dung thanh toán
            </div>
            <div className="fg" style={{ marginBottom: 8 }}>
              <label>Số tiền thanh toán (mặc định = tổng HĐ)</label>
              <input
                type="text"
                value={dntt.soTien ? Number(dntt.soTien).toLocaleString("vi-VN") : ""}
                onChange={(e) =>
                  c.setDNTTField(
                    "soTien",
                    Math.max(0, parseInt(e.target.value.replace(/[^\d]/g, "")) || 0),
                  )
                }
                style={{ textAlign: "right", color: "var(--gold)", fontWeight: 800 }}
              />
            </div>
            <div className="chu-l" style={{ marginBottom: 10 }}>
              Bằng chữ: <b>{c.dnttSoTienChu}</b>
            </div>
            <div className="fg" style={{ marginBottom: 10 }}>
              <label>Ghi chú số tiền</label>
              <input
                type="text"
                value={dntt.soTienNote}
                onChange={(e) => c.setDNTTField("soTienNote", e.target.value)}
                placeholder="VD: 100% giá trị hợp đồng đã bao gồm VAT"
              />
            </div>
            <div className="row">
              <div className="fg">
                <label>Số ngày giải ngân</label>
                <input
                  type="text"
                  value={dntt.soNgayText}
                  onChange={(e) => c.setDNTTField("soNgayText", e.target.value)}
                  placeholder="VD: 15 (mười lăm)"
                />
              </div>
              <div className="fg">
                <label>Ngày đề nghị</label>
                <div className="dw" onClick={(e) => openDatePicker("dntt", "ngay", e)}>
                  <input
                    type="text"
                    readOnly
                    value={formatDateOnly(dntt.ngay)}
                    placeholder="Chọn ngày..."
                    className="dd-inp"
                  />
                  <button type="button" className="dd-btn">
                    <CalendarBlankIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Xuất DNTT */}
          <div className="submit-bar">
            <button type="button" className="btn-sub" onClick={c.exportDNTT}>
              <div className="sub-lbl">
                <InvoiceIcon size={14} style={{ marginRight: 7 }} />
                XUẤT ĐỀ NGHỊ THANH TOÁN
              </div>
              {dntt.soTien > 0 && <div className="sub-tot">{formatMoney(dntt.soTien)}</div>}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DNTTPanel;
