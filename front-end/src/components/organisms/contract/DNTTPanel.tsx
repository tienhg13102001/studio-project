// Left-panel form for DNTT (Đề nghị thanh toán) mode: pick a contract, edit
// payment request fields, and export the request.

import {
  ArrowsClockwiseIcon,
  CalendarBlankIcon,
  FolderOpenIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { formatDateOnly, formatThousands } from "#lib/contract/format";
import type { ContractBuilder } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
  openDatePicker?: (
    target: "bbnt" | "dntt",
    field: string,
    e: React.MouseEvent<HTMLDivElement>,
  ) => void;
};

const DNTTPanel = ({ c, openDatePicker }: Props) => {
  const { dntt } = c;

  const onSoTien = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    c.setDNTTField("soTien", Number(digits) || 0);
  };

  return (
    <div>
      <div className="file-select-box">
        <div className="file-search-row">
          <label style={{ color: "var(--gold)", margin: 0, fontSize: 11 }}>Chọn Hợp Đồng</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              className="file-search-input"
              value={c.dnttSearchQuery}
              onChange={(e) => c.setDnttSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
            />
            <button
              className="btn-pop btn-pop-new"
              style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 8, fontSize: 13 }}
              onClick={c.refreshContractList}
              title="Tải lại"
            >
              <ArrowsClockwiseIcon size={14} />
            </button>
          </div>
        </div>
        <div className="file-grid">
          {c.filteredDNTTContracts.length === 0 ? (
            <div className="file-grid-empty">
              <FolderOpenIcon
                size={22}
                style={{ display: "block", margin: "0 auto 6px", opacity: 0.4 }}
              />
              Nhấn tải lại để lấy danh sách
            </div>
          ) : (
            c.filteredDNTTContracts.map((f) => (
              <div
                key={f.id}
                className={`file-card${dntt.contractId === f.id ? " fc-selected" : ""}`}
                onClick={() => c.selectDNTTContract(f)}
              >
                <div className="fc-name">{f.name}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {dntt.loading && (
        <div className="info-banner" style={{ alignItems: "center", color: "var(--gold)" }}>
          <SpinnerIcon size={15} className="animate-spin" />
          <span>Đang tải hợp đồng…</span>
        </div>
      )}

      {dntt.contractId && (
        <>
          <div className="flex-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Số ĐNTT</label>
              <input type="text" readOnly value={c.dnttSoDntt} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Kính gửi</label>
              <input
                type="text"
                value={dntt.tencty}
                onChange={(e) => c.setDNTTField("tencty", e.target.value)}
              />
            </div>
          </div>

          <div className="flex-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Số hợp đồng</label>
              <input
                type="text"
                value={dntt.sohd}
                onChange={(e) => c.setDNTTField("sohd", e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Số BBNT</label>
              <input
                type="text"
                value={dntt.soBBNT}
                onChange={(e) => c.setDNTTField("soBBNT", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dự án</label>
            <input
              type="text"
              value={dntt.duann}
              onChange={(e) => c.setDNTTField("duann", e.target.value)}
            />
          </div>

          <div className="flex-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Số tiền</label>
              <input
                type="text"
                inputMode="numeric"
                className="price-input"
                value={dntt.soTien ? formatThousands(String(dntt.soTien)) : ""}
                onChange={(e) => onSoTien(e.target.value)}
                style={{ textAlign: "right", fontWeight: 700 }}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Bằng chữ</label>
              <input type="text" readOnly value={c.dnttSoTienChu} />
            </div>
          </div>

          <div className="form-group">
            <label>Ghi chú số tiền</label>
            <input
              type="text"
              value={dntt.soTienNote}
              onChange={(e) => c.setDNTTField("soTienNote", e.target.value)}
            />
          </div>

          <div className="flex-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Số ngày giải ngân</label>
              <input
                type="text"
                value={dntt.soNgayText}
                onChange={(e) => c.setDNTTField("soNgayText", e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Ngày đề nghị</label>
              <div className="date-input-wrap" onClick={(e) => openDatePicker?.("dntt", "ngay", e)}>
                <input
                  type="text"
                  readOnly
                  value={formatDateOnly(dntt.ngay)}
                  placeholder="Chọn ngày..."
                  className="date-display-input"
                />
                <button type="button" className="date-icon-btn">
                  <CalendarBlankIcon size={15} />
                </button>
              </div>
            </div>
          </div>

          <button type="button" className="btn-submit" onClick={c.exportDNTT}>
            TẠO ĐỀ NGHỊ THANH TOÁN
          </button>
        </>
      )}
    </div>
  );
};

export default DNTTPanel;
