// Left-panel form for BBNT (Biên bản nghiệm thu) mode: pick a contract, edit
// acceptance items + amounts, and export the acceptance record.

import {
  ArrowsClockwiseIcon,
  CalendarBlankIcon,
  FolderOpenIcon,
  SpinnerIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { formatDateOnly, formatMoney, formatThousands } from "#lib/contract/format";
import type { ContractBuilder } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
  openDatePicker?: (
    target: "bbnt" | "dntt",
    field: string,
    e: React.MouseEvent<HTMLDivElement>,
  ) => void;
};

const BBNTPanel = ({ c, openDatePicker }: Props) => {
  const { bbnt } = c;

  const onDongia = (i: number, raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    c.updateBBNTItem(i, { dongia: Number(digits) || 0 });
  };
  const onTt = (i: number, raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    c.updateBBNTItem(i, { tt: Number(digits) || 0 });
  };
  const onTyle = (i: number, raw: string) => {
    if (raw === "") {
      c.updateBBNTItem(i, { tyle: "" });
      return;
    }
    const n = Math.max(0, Math.min(100, Number(raw) || 0));
    c.updateBBNTItem(i, { tyle: n });
  };
  const onDaTT = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    c.setBBNTField("daTT", Number(digits) || 0);
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
              value={c.bbntSearchQuery}
              onChange={(e) => c.setBbntSearchQuery(e.target.value)}
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
          {c.filteredBBNTContracts.length === 0 ? (
            <div className="file-grid-empty">
              <FolderOpenIcon
                size={22}
                style={{ display: "block", margin: "0 auto 6px", opacity: 0.4 }}
              />
              Nhấn tải lại để lấy danh sách
            </div>
          ) : (
            c.filteredBBNTContracts.map((f) => (
              <div
                key={f.id}
                className={`file-card${bbnt.contractId === f.id ? " fc-selected" : ""}`}
                onClick={() => c.selectBBNTContract(f)}
              >
                <div className="fc-name">{f.name}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {bbnt.loading && (
        <div className="info-banner" style={{ alignItems: "center", color: "var(--gold)" }}>
          <SpinnerIcon size={15} className="animate-spin" />
          <span>Đang tải hợp đồng…</span>
        </div>
      )}

      {bbnt.fromSnapshot && (
        <div className="info-banner" style={{ alignItems: "center", color: "var(--gold)" }}>
          <WarningIcon size={15} />
          <span>Đã nạp từ snapshot — kiểm tra lại số liệu</span>
        </div>
      )}

      {bbnt.contractId && (
        <>
          <div className="flex-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Số HĐ</label>
              <input type="text" readOnly value={bbnt.sohd} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Khách hàng</label>
              <input
                type="text"
                value={bbnt.tencty}
                onChange={(e) => c.setBBNTField("tencty", e.target.value)}
              />
            </div>
          </div>

          <div className="flex-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Ngày nghiệm thu</label>
              <div
                className="date-input-wrap"
                onClick={(e) => openDatePicker?.("bbnt", "ngayNthu", e)}
              >
                <input
                  type="text"
                  readOnly
                  value={formatDateOnly(bbnt.ngayNthu)}
                  placeholder="Chọn ngày..."
                  className="date-display-input"
                />
                <button type="button" className="date-icon-btn">
                  <CalendarBlankIcon size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Sản phẩm bàn giao</label>
            <textarea
              rows={3}
              value={bbnt.deliverables}
              onChange={(e) => c.setBBNTField("deliverables", e.target.value)}
              placeholder="Mỗi dòng một sản phẩm..."
            />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "24%", textAlign: "left", paddingLeft: 12 }}>Hạng mục</th>
                  <th style={{ width: "8%" }}>ĐVT</th>
                  <th style={{ width: "7%" }}>SL</th>
                  <th style={{ width: "14%" }}>Đơn giá</th>
                  <th style={{ width: "14%" }}>Thành tiền</th>
                  <th style={{ width: "9%" }}>Tỉ lệ %</th>
                  <th style={{ width: "16%" }}>TT nghiệm thu</th>
                  <th style={{ width: "8%" }} />
                </tr>
              </thead>
              <tbody>
                {bbnt.items.map((item, i) => (
                  <tr key={i}>
                    <td data-label="Hạng mục:" style={{ textAlign: "left" }}>
                      <input
                        type="text"
                        value={item.ten}
                        onChange={(e) => c.updateBBNTItem(i, { ten: e.target.value })}
                        style={{ textAlign: "left", width: "100%", paddingLeft: 10 }}
                      />
                    </td>
                    <td data-label="ĐVT:">
                      <input
                        type="text"
                        value={item.dvt}
                        onChange={(e) => c.updateBBNTItem(i, { dvt: e.target.value })}
                        style={{ textAlign: "center" }}
                      />
                    </td>
                    <td data-label="SL:">
                      <input
                        type="number"
                        min={1}
                        value={item.sl}
                        onChange={(e) => c.updateBBNTItem(i, { sl: Number(e.target.value) || 0 })}
                        style={{ textAlign: "center" }}
                      />
                    </td>
                    <td data-label="Đơn giá:">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="price-input"
                        value={item.dongia ? formatThousands(String(item.dongia)) : ""}
                        onChange={(e) => onDongia(i, e.target.value)}
                        style={{ textAlign: "right", fontWeight: 700, fontSize: 12 }}
                      />
                    </td>
                    <td data-label="Thành tiền:">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="price-input"
                        value={item.tt ? formatThousands(String(item.tt)) : ""}
                        onChange={(e) => onTt(i, e.target.value)}
                        style={{ textAlign: "right", fontWeight: 700, fontSize: 12 }}
                      />
                    </td>
                    <td data-label="Tỉ lệ %:">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.tyle}
                        onChange={(e) => onTyle(i, e.target.value)}
                        style={{ textAlign: "center" }}
                      />
                    </td>
                    <td data-label="TT nghiệm thu:">
                      <span style={{ fontWeight: 700 }}>{formatMoney(c.bbntItemNthu(item))}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => c.removeBBNTItem(i)}
                      >
                        <TrashIcon size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="action-row">
            <button type="button" className="btn-add-row" onClick={c.addBBNTItem}>
              + Thêm hạng mục
            </button>
          </div>

          <div className="summary-section">
            <div className="discount-box">
              <label>Tỉ lệ nghiệm thu nhanh</label>
              <div className="ck-presets">
                <button type="button" onClick={() => c.setBBNTTyleAll(50)}>
                  50%
                </button>
                <button type="button" onClick={() => c.setBBNTTyleAll(70)}>
                  70%
                </button>
                <button type="button" onClick={() => c.setBBNTTyleAll(100)}>
                  100%
                </button>
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label>Đã thanh toán</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bbnt.daTT ? formatThousands(String(bbnt.daTT)) : ""}
                  onChange={(e) => onDaTT(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={bbnt.applyVat}
                    onChange={(e) => c.setBBNTField("applyVat", e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  Áp dụng VAT
                </label>
                {bbnt.applyVat && (
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={bbnt.vatPct}
                    onChange={(e) => c.setBBNTField("vatPct", Number(e.target.value) || 0)}
                    style={{ marginTop: 6, width: 80 }}
                  />
                )}
              </div>
            </div>
            <div className="total-summary-box">
              <div className="subtotal-line">
                Tổng nghiệm thu (chưa VAT): <b>{formatMoney(c.bbntSumNthu)}</b>
              </div>
              {bbnt.applyVat && (
                <div className="subtotal-line">
                  VAT ({bbnt.vatPct}%): <b>{formatMoney(c.bbntVat)}</b>
                </div>
              )}
              <div className="subtotal-line">
                Tổng đã VAT: <b>{formatMoney(c.bbntTong)}</b>
              </div>
              <div className="chu-line">
                Còn phải thanh toán: <b>{formatMoney(c.bbntConPhai)}</b>
              </div>
              <div className="chu-line">
                Bằng chữ: <b>{c.bbntConPhaiChu}</b>
              </div>
            </div>
          </div>

          <button type="button" className="btn-submit" onClick={c.exportBBNT}>
            TẠO BIÊN BẢN NGHIỆM THU
          </button>
        </>
      )}
    </div>
  );
};

export default BBNTPanel;
