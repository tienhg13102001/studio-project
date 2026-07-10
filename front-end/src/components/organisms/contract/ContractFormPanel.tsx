// Left-panel contract form for NEW / EDIT / IMPORT modes: file/import pickers,
// số HĐ, Bên A, nội dung, service tabs, summary, payment. Mirrors the layout of
// organisms/quote (QuoteHeaderFields + CategoryTabs + SummarySection).

import {
  ArrowsClockwiseIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  FolderOpenIcon,
  RocketLaunchIcon,
  SpinnerIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { formatDateOnly, formatMoney, formatThousands } from "#lib/contract/format";
import ContractCategoryTabs from "./ContractCategoryTabs";
import { DV_PRESETS, PAYMENT_PRESETS } from "./constants";
import type { ContractBuilder, DateTarget } from "./useContractBuilder";

type OpenPicker = (
  target: DateTarget,
  field: string,
  e: React.MouseEvent<HTMLDivElement>,
) => void;

type Props = { c: ContractBuilder; openDatePicker: OpenPicker };

function parseHDName(name: string): { code: string; project: string; date: string } {
  const m = name.match(/^\[HĐ(\d{8})\]\s*(.*)$/);
  if (m) {
    const d = m[1];
    return {
      code: `HĐ${d.slice(6, 8)}${d.slice(4, 6)}`,
      project: m[2].trim() || name,
      date: `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`,
    };
  }
  return { code: name.slice(0, 12), project: name, date: "" };
}

function parseBZName(name: string): { code: string; project: string } {
  const m = name.match(/^(BZ[\d.]+)\s*-?\s*(.*)$/);
  if (m) return { code: m[1], project: m[2].trim() || name };
  return { code: name.slice(0, 12), project: name };
}

const DateField = ({
  label,
  value,
  target,
  field,
  openDatePicker,
  flex,
}: {
  label: string;
  value: string;
  target: DateTarget;
  field: string;
  openDatePicker: OpenPicker;
  flex?: number;
}) => (
  <div className="form-group" style={flex ? { flex } : undefined}>
    <label>{label}</label>
    <div className="date-input-wrap" onClick={(e) => openDatePicker(target, field, e)}>
      <input
        type="text"
        readOnly
        value={formatDateOnly(value)}
        placeholder="Chọn ngày..."
        className="date-display-input"
      />
      <button type="button" className="date-icon-btn">
        <CalendarBlankIcon size={15} />
      </button>
    </div>
  </div>
);

const ContractFormPanel = ({ c, openDatePicker }: Props) => {
  const f = c.form;
  const setField = c.setField;
  const [bzDropdownOpen, setBzDropdownOpen] = useState(false);

  const submitLabel =
    c.appMode === "EDIT" ? "CẬP NHẬT HỢP ĐỒNG" : "TẠO HỢP ĐỒNG";

  return (
    <>
      {/* Progress */}
      <div className="prog" title={`${c.progDone}/4 mục cần điền`}>
        <div className="prog-track">
          <div className="prog-fill" style={{ width: `${c.progPct}%` }} />
        </div>
        <span className="prog-lbl">
          {c.progDone}/4 · {c.progPct}%
        </span>
      </div>

      {/* EDIT: contract picker */}
      {c.appMode === "EDIT" && (
        <div className="file-select-box">
          <div className="file-search-row">
            <label style={{ color: "var(--gold)", margin: 0, fontSize: 11 }}>Chọn hợp đồng</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                className="file-search-input"
                value={c.fileSearchQuery}
                onChange={(e) => c.setFileSearchQuery(e.target.value)}
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
            {c.filteredContracts.length === 0 ? (
              <div className="file-grid-empty">
                <FolderOpenIcon size={22} style={{ display: "block", margin: "0 auto 6px", opacity: 0.4 }} />
                Nhấn tải lại để lấy danh sách
              </div>
            ) : (
              c.filteredContracts.map((file) => {
                const info = parseHDName(file.name);
                return (
                  <div
                    key={file.id}
                    className={`file-card${c.selectedContractId === file.id ? " fc-selected" : ""}`}
                    onClick={() => c.selectContract(file)}
                  >
                    <div className="fc-code">{info.code}</div>
                    <div className="fc-name">{info.project}</div>
                    {info.date && <div className="fc-date">{info.date}</div>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* IMPORT: BZ báo giá picker */}
      {c.appMode === "IMPORT" && (
        <div className="file-select-box">
          <div className="file-search-row">
            <label style={{ color: "var(--gold)", margin: 0, fontSize: 11 }}>1. Chọn Báo Giá</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                className="file-search-input"
                value={c.bzSearchQuery}
                onChange={(e) => c.setBzSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
              />
              <button
                className="btn-pop btn-pop-new"
                style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 8, fontSize: 13 }}
                onClick={c.refreshBZList}
                title="Tải lại"
              >
                <ArrowsClockwiseIcon size={14} />
              </button>
            </div>
          </div>
          <div className="file-grid">
            {c.filteredBZFiles.length === 0 ? (
              <div className="file-grid-empty">
                <FolderOpenIcon size={22} style={{ display: "block", margin: "0 auto 6px", opacity: 0.4 }} />
                Nhấn tải lại để lấy danh sách
              </div>
            ) : (
              c.filteredBZFiles.map((file) => {
                const info = parseBZName(file.name);
                return (
                  <div
                    key={file.id}
                    className={`file-card${c.selectedBZId === file.id ? " fc-selected" : ""}`}
                    onClick={() => c.selectBZFile(file)}
                  >
                    <div className="fc-code">{info.code}</div>
                    <div className="fc-name">{info.project}</div>
                  </div>
                );
              })
            )}
          </div>
          {c.selectedBZId && c.bzOptionList.length > 0 && (
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: "var(--gold)" }}>2. Chọn Option muốn nạp:</label>
              <div className="custom-dropdown-container">
                <div
                  className={`custom-select-display${bzDropdownOpen ? " open" : ""}`}
                  onClick={() => setBzDropdownOpen((v) => !v)}
                >
                  <span style={{ color: c.selectedBZOption ? "var(--text)" : "var(--text-dim)" }}>
                    {c.selectedBZOption || "-- Chọn Option --"}
                  </span>
                  <CaretDownIcon className="csd-arrow" size={11} />
                </div>
                {bzDropdownOpen && (
                  <ul className="custom-dropdown-list">
                    {c.bzOptionList.map((opt) => (
                      <li
                        key={opt}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          c.selectBZOption(opt);
                          setBzDropdownOpen(false);
                        }}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Số hợp đồng */}
      <div className="flex-row">
        <DateField
          label="Ngày ký"
          value={f.ngayky}
          target="form"
          field="ngayky"
          openDatePicker={openDatePicker}
        />
        <div className="form-group">
          <label>Mã ngày</label>
          <input type="text" readOnly value={f.sohdDate} />
        </div>
      </div>
      <div className="flex-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label>Brand / KH viết tắt</label>
          <input
            type="text"
            value={f.brand}
            onChange={(e) => setField("brand", e.target.value)}
            placeholder="VD: Vinfast"
          />
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label>Số hợp đồng</label>
          <input type="text" value={f.sohd} onChange={(e) => setField("sohd", e.target.value)} />
        </div>
      </div>

      <hr className="divider" />
      <div className="section-title">Bên A — Khách hàng (*)</div>

      <div className="flex-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label>Tên công ty (*)</label>
          <input
            className={`tencty-input${c.errTencty ? " inp-err" : ""}`}
            type="text"
            value={f.tencty}
            list="cust-list"
            onChange={(e) => setField("tencty", e.target.value)}
            onBlur={(e) => c.applyCustomer(e.target.value)}
            placeholder="Tên công ty / tổ chức"
          />
          <datalist id="cust-list">
            {c.savedCustomers.map((cust) => (
              <option key={cust.tencty} value={cust.tencty} />
            ))}
          </datalist>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Mã số thuế</label>
          <input
            type="text"
            inputMode="numeric"
            value={f.mst}
            onChange={(e) => setField("mst", e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Địa chỉ</label>
        <input type="text" value={f.diachi} onChange={(e) => setField("diachi", e.target.value)} />
      </div>
      <div className="flex-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label>Người đại diện (*)</label>
          <input
            className={c.errDaidien ? "inp-err" : ""}
            type="text"
            value={f.nguoidaidien}
            onChange={(e) => setField("nguoidaidien", e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Chức vụ</label>
          <input
            type="text"
            value={f.chucvu}
            onChange={(e) => setField("chucvu", e.target.value)}
          />
        </div>
      </div>
      <div className="flex-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label>Email</label>
          <input type="text" value={f.email} onChange={(e) => setField("email", e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Điện thoại</label>
          <input type="text" value={f.sdt} onChange={(e) => setField("sdt", e.target.value)} />
        </div>
      </div>

      <hr className="divider" />
      <div className="section-title">Nội dung hợp đồng</div>

      <div className="form-group">
        <label>Dự án</label>
        <input type="text" value={f.duann} onChange={(e) => setField("duann", e.target.value)} />
      </div>
      <div className="form-group">
        <label>Mô tả dịch vụ</label>
        <div className="preset-row">
          {DV_PRESETS.map((dv, i) => (
            <button
              key={dv}
              type="button"
              className={`preset-btn${c.selectedDvPreset === i ? " active" : ""}`}
              onClick={() => c.selectDvPreset(i)}
            >
              {dv}
            </button>
          ))}
        </div>
        <textarea
          rows={2}
          value={f.motadv}
          onChange={(e) => setField("motadv", e.target.value)}
          placeholder="Mô tả dịch vụ cung cấp..."
        />
      </div>
      <div className="flex-row">
        <DateField label="Từ ngày" value={f.tu} target="form" field="tu" openDatePicker={openDatePicker} />
        <DateField label="Đến ngày" value={f.den} target="form" field="den" openDatePicker={openDatePicker} />
      </div>
      <div className="form-group">
        <label>Địa điểm</label>
        <input
          type="text"
          value={f.diadiem}
          onChange={(e) => setField("diadiem", e.target.value)}
          placeholder="Địa điểm thực hiện..."
        />
      </div>

      <hr className="divider" />
      <ContractCategoryTabs c={c} />

      {/* Summary */}
      <div className="summary-section">
        <div className="discount-box">
          <label>
            <TagIcon size={12} weight="fill" style={{ marginRight: 6, color: "var(--gold)" }} />
            Chiết khấu
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={f.ck ? formatThousands(String(f.ck)) : ""}
            onChange={(e) => c.onCkInput(e.target.value)}
            placeholder="VD: 500.000"
            style={{ marginTop: 6 }}
          />
          <div className="ck-presets">
            <button type="button" onClick={() => c.setCkPct(0)} title="Bỏ chiết khấu">
              Xóa
            </button>
            <button type="button" onClick={() => c.setCkPct(5)}>
              5%
            </button>
            <button type="button" onClick={() => c.setCkPct(10)}>
              10%
            </button>
            <button type="button" onClick={() => c.setCkPct(15)}>
              15%
            </button>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <input
              type="checkbox"
              checked={f.applyVat}
              onChange={(e) => setField("applyVat", e.target.checked)}
            />
            Áp dụng VAT
            {f.applyVat && (
              <input
                type="number"
                value={f.vatPct}
                onChange={(e) => setField("vatPct", Number(e.target.value) || 0)}
                style={{ width: 60, marginLeft: 4 }}
              />
            )}
            {f.applyVat && <span>%</span>}
          </label>
        </div>
        <div className="total-summary-box">
          <div className="subtotal-line">
            Tạm tính: <b>{formatMoney(c.subTotal)}</b>
          </div>
          {f.ck > 0 && (
            <div className="subtotal-line">
              Sau chiết khấu: <b>{formatMoney(c.afterCk)}</b>
            </div>
          )}
          {f.applyVat && (
            <div className="subtotal-line">
              VAT ({f.vatPct}%): <b>{formatMoney(c.vatAmount)}</b>
            </div>
          )}
          <div className="chu-line">
            Bằng chữ: <b>{c.tongTienChu}</b>
          </div>
          <div className="total-chip">
            <span className="total-label">Tổng giá trị HĐ</span>
            <span className="total-value">{formatMoney(c.tonggiatri)}</span>
          </div>
        </div>
      </div>

      <hr className="divider" />
      <div className="section-title">Phương thức thanh toán</div>
      <div className="preset-row">
        {PAYMENT_PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            className={`preset-btn${c.selectedPreset === i ? " active" : ""}`}
            onClick={() => c.selectPreset(i)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {c.selectedPreset != null && PAYMENT_PRESETS[c.selectedPreset]?.tmpl && (
        <div className="form-group">
          <label>Số ngày làm việc</label>
          <input
            type="number"
            value={f.payDays}
            onChange={(e) => setField("payDays", Number(e.target.value) || 0)}
            style={{ width: 100 }}
          />
        </div>
      )}
      <div className="form-group">
        <textarea
          rows={4}
          value={f.thanhtoantxt}
          onChange={(e) => setField("thanhtoantxt", e.target.value)}
          placeholder="Điều khoản thanh toán..."
        />
      </div>
      <div className="form-group">
        <label>Ghi chú bổ sung</label>
        <textarea
          rows={2}
          value={f.ghichu}
          onChange={(e) => setField("ghichu", e.target.value)}
          placeholder="Ghi chú thêm (nếu có)..."
        />
      </div>

      <button type="button" className="btn-submit" onClick={c.confirmCreate}>
        <div className="submit-label">
          <RocketLaunchIcon size={15} weight="fill" />
          {submitLabel}
        </div>
        {c.tonggiatri > 0 && <div className="submit-total">{formatMoney(c.tonggiatri)}</div>}
      </button>
      {c.appMode === "EDIT" && c.selectedContractId && (
        <button
          type="button"
          className="btn-add-row"
          style={{ width: "100%", marginTop: 8 }}
          onClick={c.duplicateContract}
        >
          <SpinnerIcon size={13} /> Nhân bản hợp đồng này (số mới)
        </button>
      )}
      <div className="shortcut-hint">
        Mẹo: <b>Ctrl + Enter</b> — xuất hợp đồng
      </div>
    </>
  );
};

export default ContractFormPanel;
