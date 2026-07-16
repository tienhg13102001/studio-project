// Left-panel contract form for NEW / EDIT / IMPORT modes. Ported to match the
// original hop-dong Vue app markup (back-end/scripts/google/hop-dong/index.html,
// lines 626-956) — same DOM, classes and FontAwesome icons.

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowsClockwiseIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  ClipboardTextIcon,
  CopyIcon,
  FileArrowDownIcon,
  FileTextIcon,
  FolderOpenIcon,
  HashIcon,
  InvoiceIcon,
  ListChecksIcon,
  MoneyIcon,
  ReceiptIcon,
  TagIcon,
  TextAlignLeftIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { formatDateOnly, formatMoney, formatTabTotal } from "#lib/contract/format";
import { CATEGORIES, type CatKey } from "#lib/contract/types";
import { DV_PRESETS, PAYMENT_PRESETS } from "./constants";
import type { ContractBuilder, DateTarget } from "./useContractBuilder";

type OpenPicker = (
  target: DateTarget,
  field: string,
  e: React.MouseEvent<HTMLDivElement>,
) => void;

type Props = { c: ContractBuilder; openDatePicker: OpenPicker };

const formatShortMoney = (n: number) => (n ? Number(n).toLocaleString("vi-VN") : "");

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

function parseBZName(name: string): { code: string; project: string; date: string } {
  const m = name.match(/^(BZ[\d.]+)\s*-?\s*(.*)$/);
  if (m) return { code: m[1], project: (m[2] || "").trim(), date: "" };
  return { code: name.slice(0, 12), project: name, date: "" };
}

type ItemDropdown = { tab: CatKey; index: number; top: number; left: number; width: number } | null;

const ContractFormPanel = ({ c, openDatePicker }: Props) => {
  const f = c.form;
  const [bzOpen, setBzOpen] = useState(false);
  const [itemDropdown, setItemDropdown] = useState<ItemDropdown>(null);

  const openItemDropdown = (tab: CatKey, index: number, e: React.FocusEvent<HTMLInputElement>) => {
    const container = e.target.closest(".cdc");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setItemDropdown({ tab, index, top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 240) });
  };
  const closeItemDropdown = () => setTimeout(() => setItemDropdown(null), 200);

  return (
    <>
      {/* MODE TABS */}
      <div className="mode-tabs">
        <div className={`mode-btn${c.appMode === "NEW" ? " active" : ""}`} onClick={() => c.setMode("NEW")}>
          <FileTextIcon size={14} />TẠO MỚI
        </div>
        <div className={`mode-btn${c.appMode === "EDIT" ? " active" : ""}`} onClick={() => c.setMode("EDIT")}>
          <FolderOpenIcon size={14} />CHỈNH SỬA
        </div>
        <div className={`mode-btn${c.appMode === "IMPORT" ? " active" : ""}`} onClick={() => c.setMode("IMPORT")}>
          <FileArrowDownIcon size={14} />TỪ BÁO GIÁ
        </div>
        <div className={`mode-btn${c.appMode === "BBNT" ? " active" : ""}`} onClick={() => c.setMode("BBNT")}>
          <ClipboardTextIcon size={14} />NGHIỆM THU
        </div>
        <div className={`mode-btn${c.appMode === "DNTT" ? " active" : ""}`} onClick={() => c.setMode("DNTT")}>
          <InvoiceIcon size={14} />THANH TOÁN
        </div>
      </div>

      {/* PROGRESS */}
      <div className="prog" title={`${c.progDone}/4 mục đã điền`}>
        <div className="prog-track">
          <div className="prog-fill" style={{ width: `${c.progPct}%` }} />
        </div>
        <span className="prog-lbl">
          {c.progDone}/4 · {c.progPct}%
        </span>
      </div>

      {/* EDIT: chọn hợp đồng cũ */}
      {c.appMode === "EDIT" && (
        <div className="file-pick">
          <div className="fsrow">
            <label style={{ color: "var(--gold)", margin: 0, fontSize: 9 }}>Chọn hợp đồng để sửa</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="text" className="fsinp" value={c.fileSearchQuery} onChange={(e) => c.setFileSearchQuery(e.target.value)} placeholder="Tìm kiếm..." />
              <button className="bp-ok bp" style={{ flexShrink: 0, padding: "6px 10px", borderRadius: 7, fontSize: 12 }} onClick={c.refreshContractList}>
                <ArrowsClockwiseIcon size={14} />
              </button>
            </div>
          </div>
          <div className="fgrid">
            {c.contractList.length === 0 ? (
              <div className="fg-empty">
                <FolderOpenIcon size={20} style={{ display: "block", marginBottom: 5, opacity: 0.4 }} />Nhấn 🔄 để tải
              </div>
            ) : (
              c.filteredContracts.map((file) => {
                const info = parseHDName(file.name);
                return (
                  <div key={file.id} className={`fcard${c.selectedContractId === file.id ? " sel" : ""}`} onClick={() => c.selectContract(file)}>
                    <div className="fc-c">{info.code}</div>
                    <div className="fc-n">{info.name || file.name}</div>
                    {info.date && <div className="fc-d">{info.date}</div>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* IMPORT: chọn báo giá */}
      {c.appMode === "IMPORT" && (
        <div className="file-pick">
          <div className="fsrow">
            <label style={{ color: "var(--gold)", margin: 0, fontSize: 9 }}>1. Chọn Báo Giá</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="text" className="fsinp" value={c.bzSearchQuery} onChange={(e) => c.setBzSearchQuery(e.target.value)} placeholder="Tìm kiếm..." />
              <button className="bp-ok bp" style={{ flexShrink: 0, padding: "6px 10px", borderRadius: 7, fontSize: 12 }} onClick={c.refreshBZList}>
                <ArrowsClockwiseIcon size={14} />
              </button>
            </div>
          </div>
          <div className="fgrid">
            {c.bzFileList.length === 0 ? (
              <div className="fg-empty">
                <FolderOpenIcon size={20} style={{ display: "block", marginBottom: 5, opacity: 0.4 }} />Nhấn 🔄 để tải
              </div>
            ) : (
              c.filteredBZFiles.map((file) => {
                const info = parseBZName(file.name);
                return (
                  <div key={file.id} className={`fcard${c.selectedBZId === file.id ? " sel" : ""}`} onClick={() => c.selectBZFile(file)}>
                    <div className="fc-c">{info.code}</div>
                    <div className="fc-n">{info.project || file.name}</div>
                    {info.date && <div className="fc-d">{info.date}</div>}
                  </div>
                );
              })
            )}
          </div>
          {c.selectedBZId && c.bzOptionList.length > 0 && (
            <div className="fg" style={{ margin: 0 }}>
              <label style={{ color: "var(--gold)" }}>2. Chọn Option:</label>
              <div className="cdc" tabIndex={-1} onBlur={() => setBzOpen(false)}>
                <div className={`cds${bzOpen ? " open" : ""}`} onClick={() => setBzOpen(!bzOpen)}>
                  <span style={{ color: c.selectedBZOption ? "var(--text)" : "var(--dim)" }}>{c.selectedBZOption || "-- Chọn Option --"}</span>
                  <CaretDownIcon size={10} className="cds-arr" />
                </div>
                {bzOpen && (
                  <ul className="cdl">
                    {c.bzOptionList.map((opt) => (
                      <li key={opt} onMouseDown={(e) => { e.preventDefault(); c.selectBZOption(opt); setBzOpen(false); }}>{opt}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SỐ HỢP ĐỒNG */}
      <div className={`sbox${c.sec.sohd ? " collapsed" : ""}`}>
        <div className="stitle sec-h" onClick={() => c.toggleSec("sohd")}>
          <HashIcon size={14} style={{ color: "var(--gold)" }} />Số hợp đồng
          <CaretDownIcon size={10} className={`sec-chev${c.sec.sohd ? " rot" : ""}`} />
        </div>
        <div className="fg" style={{ marginBottom: 10 }}>
          <label>Ngày ký</label>
          <div className="dw" onClick={(e) => openDatePicker("form", "ngayky", e)}>
            <input type="text" readOnly value={formatDateOnly(f.ngayky)} placeholder="Chọn ngày..." className="dd-inp" />
            <button type="button" className="dd-btn"><CalendarBlankIcon size={15} /></button>
          </div>
        </div>
        <div className="row">
          <div className="fg" style={{ flex: "0 0 110px" }}>
            <label>Mã ngày</label>
            <input type="text" value={f.sohdDate} readOnly style={{ color: "var(--gold)", fontWeight: 800, textAlign: "center" }} />
          </div>
          <div className="fg">
            <label>Brand / Viết tắt KH</label>
            <input value={f.brand} onChange={(e) => c.setField("brand", e.target.value)} type="text" placeholder="VD: FastMotion..." />
          </div>
        </div>
        <div className="fg">
          <label>Số hợp đồng (có thể sửa)</label>
          <input value={f.sohd} onChange={(e) => c.setField("sohd", e.target.value)} type="text" />
        </div>
      </div>

      {/* BÊN A */}
      <div className={`sbox${c.sec.bena ? " collapsed" : ""}`}>
        <div className="stitle sec-h" onClick={() => c.toggleSec("bena")}>
          <BuildingsIcon size={14} style={{ color: "var(--gold)" }} />Bên A — Khách hàng (*)
          <CaretDownIcon size={10} className={`sec-chev${c.sec.bena ? " rot" : ""}`} />
        </div>
        <div className="row">
          <div className="fg" style={{ flex: 2 }}>
            <label>Tên công ty (*)</label>
            <input value={f.tencty} list="cust-list" onChange={(e) => { c.setErrTencty(false); c.setField("tencty", e.target.value); }} onBlur={(e) => c.applyCustomer(e.target.value)} className={c.errTencty ? "inp-err" : ""} type="text" placeholder="CÔNG TY TNHH..." />
            <datalist id="cust-list">
              {c.savedCustomers.map((cust) => (
                <option key={cust.tencty} value={cust.tencty} />
              ))}
            </datalist>
          </div>
          <div className="fg">
            <label>Mã số thuế</label>
            <input value={f.mst} onChange={(e) => c.setField("mst", e.target.value)} type="text" inputMode="numeric" placeholder="0123456789" />
          </div>
        </div>
        <div className="fg" style={{ marginBottom: 10 }}>
          <label>Địa chỉ</label>
          <input value={f.diachi} onChange={(e) => c.setField("diachi", e.target.value)} type="text" placeholder="Địa chỉ đăng ký kinh doanh" />
        </div>
        <div className="row">
          <div className="fg">
            <label>Người đại diện</label>
            <input value={f.nguoidaidien} onChange={(e) => { c.setErrDaidien(false); c.setField("nguoidaidien", e.target.value); }} className={c.errDaidien ? "inp-err" : ""} type="text" placeholder="Họ và tên..." />
          </div>
          <div className="fg">
            <label>Chức vụ</label>
            <input value={f.chucvu} onChange={(e) => c.setField("chucvu", e.target.value)} type="text" placeholder="Giám đốc" />
          </div>
        </div>
        <div className="row">
          <div className="fg">
            <label>Email</label>
            <input value={f.email} onChange={(e) => c.setField("email", e.target.value)} type="email" placeholder="contact@company.com" />
          </div>
          <div className="fg">
            <label>Điện thoại</label>
            <input value={f.sdt} onChange={(e) => c.setField("sdt", e.target.value)} type="tel" placeholder="09xxxxxxxx" />
          </div>
        </div>
      </div>

      {/* NỘI DUNG HĐ */}
      <div className={`sbox${c.sec.noidung ? " collapsed" : ""}`}>
        <div className="stitle sec-h" onClick={() => c.toggleSec("noidung")}>
          <TextAlignLeftIcon size={14} style={{ color: "var(--gold)" }} />Nội dung hợp đồng
          <CaretDownIcon size={10} className={`sec-chev${c.sec.noidung ? " rot" : ""}`} />
        </div>
        <div className="fg" style={{ marginBottom: 10 }}>
          <label>Dự án / Tên dịch vụ</label>
          <input value={f.duann} onChange={(e) => c.setField("duann", e.target.value)} type="text" placeholder="VD: Sự kiện VinWonders Vũ Yên 2026" />
        </div>
        <div className="fg" style={{ marginBottom: 10 }}>
          <label>Mô tả dịch vụ (Điều 1)</label>
          <div className="dv-pre">
            {DV_PRESETS.map((p, i) => (
              <button key={i} type="button" className={`dv-btn${c.selectedDvPreset === i ? " sel" : ""}`} onClick={() => c.selectDvPreset(i)}>{p}</button>
            ))}
          </div>
          <textarea value={f.motadv} onChange={(e) => c.setField("motadv", e.target.value)} placeholder="Chọn loại dịch vụ hoặc nhập tự do..." />
        </div>
        <div className="row">
          <div className="fg">
            <label>Thời gian (từ)</label>
            <div className="dw" onClick={(e) => openDatePicker("form", "tu", e)}>
              <input type="text" readOnly value={formatDateOnly(f.tu)} placeholder="Ngày bắt đầu..." className="dd-inp" />
              <button type="button" className="dd-btn"><CalendarBlankIcon size={15} /></button>
            </div>
          </div>
          <div className="fg">
            <label>Thời gian (đến)</label>
            <div className="dw" onClick={(e) => openDatePicker("form", "den", e)}>
              <input type="text" readOnly value={formatDateOnly(f.den)} placeholder="Ngày kết thúc..." className="dd-inp" />
              <button type="button" className="dd-btn"><CalendarBlankIcon size={15} /></button>
            </div>
          </div>
        </div>
        <div className="fg">
          <label>Địa điểm thực hiện</label>
          <input value={f.diadiem} onChange={(e) => c.setField("diadiem", e.target.value)} type="text" placeholder="VD: Hà Nội / theo kế hoạch thỏa thuận" />
        </div>
      </div>

      <hr className="divider" />

      {/* BẢNG DỊCH VỤ */}
      <div className="ctabs">
        {CATEGORIES.map((tab) => (
          <button key={tab.key} type="button" className={`ctab${c.activeTab === tab.key ? " active" : ""}`} onClick={() => c.setActiveTab(tab.key)}>
            <span>{tab.tab}</span>
            {c.tabSubTotals[tab.key] > 0 && <span className="ctab-sub">{formatTabTotal(c.tabSubTotals[tab.key])}</span>}
          </button>
        ))}
      </div>

      {CATEGORIES.map((tab) => (
        <div key={tab.key} className={`tc${c.activeTab === tab.key ? " active" : ""}`}>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "40%", textAlign: "left", paddingLeft: 10 }}>Hạng mục</th>
                  <th style={{ width: "8%" }}>SL</th>
                  <th style={{ width: "8%" }}>Ngày</th>
                  <th style={{ width: "9%" }}>ĐVT</th>
                  <th style={{ width: "18%" }}>Đơn giá</th>
                  <th style={{ width: "17%" }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {f.items[tab.key].map((item, index) => (
                  <tr key={item.id}>
                    <td data-label="Hạng mục:" style={{ textAlign: "left" }}>
                      <div className="cdc">
                        <input
                          type="text"
                          value={item.ten}
                          onChange={(e) => c.updateItem(tab.key, index, { ten: e.target.value })}
                          onFocus={(e) => openItemDropdown(tab.key, index, e)}
                          onBlur={closeItemDropdown}
                          placeholder="Gõ tìm hạng mục..."
                          style={{ textAlign: "left", width: "100%", paddingLeft: 8 }}
                        />
                        {itemDropdown && itemDropdown.tab === tab.key && itemDropdown.index === index &&
                          createPortal(
                            <ul className="cdl" style={{ position: "fixed", top: itemDropdown.top, left: itemDropdown.left, width: itemDropdown.width, zIndex: 9999 }}>
                              {c.filteredServices(tab.key, item.ten).map((opt) => (
                                <li key={opt.ten} onMouseDown={(e) => { e.preventDefault(); c.selectService(tab.key, index, opt); setItemDropdown(null); }}>{opt.ten}</li>
                              ))}
                              {c.filteredServices(tab.key, item.ten).length === 0 && (
                                <li style={{ color: "var(--dim)", fontStyle: "italic" }}>Không tìm thấy...</li>
                              )}
                            </ul>,
                            // `.hd .cdl` scope dưới .hd — portal ra document.body là mất nền/viền/màu chữ
                            // → dropdown gợi ý hạng mục trong suốt, vô hình trên nền tối.
                            document.querySelector(".hd") ?? document.body,
                          )}
                      </div>
                    </td>
                    <td data-label="SL:"><input type="number" value={item.sl} min={1} onChange={(e) => c.updateItem(tab.key, index, { sl: Number(e.target.value) || 0 })} style={{ textAlign: "center" }} /></td>
                    <td data-label="Ngày:"><input type="number" value={item.sn} min={1} onChange={(e) => c.updateItem(tab.key, index, { sn: Number(e.target.value) || 0 })} style={{ textAlign: "center", fontWeight: 800, color: "var(--gold)" }} /></td>
                    <td data-label="ĐVT:"><input type="text" value={item.dvt} onChange={(e) => c.updateItem(tab.key, index, { dvt: e.target.value })} style={{ textAlign: "center" }} /></td>
                    <td data-label="Đơn giá:">
                      <input type="text" value={item.dongia ? Number(item.dongia).toLocaleString("vi-VN") : ""} onChange={(e) => c.onPriceInput(tab.key, index, e.target.value)} style={{ textAlign: "right", color: "var(--gold)", fontWeight: 700, fontSize: 11 }} />
                    </td>
                    <td data-label="Thành tiền:">
                      <div className="ac">
                        <span>{formatShortMoney((item.dongia || 0) * (item.sl || 1) * (item.sn || 1))}</span>
                        <button type="button" onClick={() => c.removeItem(tab.key, index)} className="btn-rm"><TrashIcon size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="arow" style={{ gap: 8 }}>
            <button type="button" className="btn-add" onClick={() => c.addItem(tab.key)}>+ Thêm {tab.short}</button>
            <button type="button" className="btn-add" onClick={c.openPicker}><ListChecksIcon size={13} style={{ marginRight: 5 }} />Chọn nhiều dịch vụ</button>
          </div>
        </div>
      ))}

      {/* VAT + CHIẾT KHẤU + TỔNG */}
      <div className="sumbox">
        <div>
          <label><TagIcon size={13} style={{ marginRight: 5, color: "var(--gold)" }} />Chiết khấu (số tiền)</label>
          <input type="text" value={f.ck ? Number(f.ck).toLocaleString("vi-VN") : ""} onChange={(e) => c.onCkInput(e.target.value)} placeholder="VD: 5.000.000 (để trống nếu không có)" style={{ marginTop: 5 }} />
          <div className="ck-presets">
            <button type="button" onClick={() => c.setCkPct(0)}>Xoá</button>
            <button type="button" onClick={() => c.setCkPct(5)}>5%</button>
            <button type="button" onClick={() => c.setCkPct(10)}>10%</button>
            <button type="button" onClick={() => c.setCkPct(15)}>15%</button>
          </div>
          {f.ck > 0 && <div style={{ fontSize: 11, color: "var(--red)", fontWeight: 700, marginTop: 4 }}>− {formatMoney(f.ck)}</div>}
        </div>
        <div>
          <label><ReceiptIcon size={13} style={{ marginRight: 5, color: "var(--gold)" }} />Thuế VAT</label>
          <div className="vrow" style={{ marginTop: 7 }}>
            <div className="vtog">
              <input type="checkbox" id="vatCk" checked={f.applyVat} onChange={(e) => c.setField("applyVat", e.target.checked)} />
              <label htmlFor="vatCk">Áp dụng VAT</label>
            </div>
            {f.applyVat && (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <input type="number" value={f.vatPct} onChange={(e) => c.setField("vatPct", Number(e.target.value) || 0)} className="vpct" min={0} max={20} step={1} />
                <span style={{ fontSize: 12, color: "var(--dim)" }}>%</span>
              </div>
            )}
          </div>
          {f.applyVat && c.vatAmount > 0 && <div className="vat-l" style={{ marginTop: 6 }}>VAT {f.vatPct}%: + {formatMoney(c.vatAmount)}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {f.ck > 0 && <div className="sub-l">Tạm tính: <b>{formatMoney(c.subTotal)}</b></div>}
          <div className="sub-l">Chưa VAT: <b>{formatMoney(c.afterCk)}</b></div>
          <div className="chu-l">Bằng chữ: <b>{c.tongTienChu}</b></div>
          <div className="tot-chip">
            <span className="tot-lbl">Tổng giá trị HĐ</span>
            <input type="text" className="tot-val" readOnly value={formatMoney(c.tonggiatri)} />
          </div>
        </div>
      </div>

      {/* PHƯƠNG THỨC THANH TOÁN */}
      <div className={`sbox sec-h-wrap${c.sec.thanhtoan ? " collapsed" : ""}`} style={{ marginTop: 12 }}>
        <div className="stitle sec-h" onClick={() => c.toggleSec("thanhtoan")}>
          <MoneyIcon size={14} style={{ color: "var(--gold)" }} />Phương thức thanh toán
          <CaretDownIcon size={10} className={`sec-chev${c.sec.thanhtoan ? " rot" : ""}`} />
        </div>
        <div className="pay-pre">
          {PAYMENT_PRESETS.map((p, i) => (
            <button key={i} type="button" className={`pre-btn${c.selectedPreset === i ? " sel" : ""}`} onClick={() => c.selectPreset(i)}>{p.label}</button>
          ))}
        </div>
        {c.selectedPreset !== null && (
          <div className="drow">
            <label style={{ margin: 0, textTransform: "none", fontSize: 12 }}>Số ngày làm việc:</label>
            <input type="number" value={f.payDays} onChange={(e) => c.setField("payDays", Number(e.target.value) || 0)} className="dinp" min={1} max={90} />
            <span style={{ fontSize: 12, color: "var(--dim)" }}>ngày</span>
          </div>
        )}
        <div className="fg">
          <label>Điều khoản thanh toán (có thể chỉnh)</label>
          <textarea value={f.thanhtoantxt} onChange={(e) => c.setField("thanhtoantxt", e.target.value)} rows={4} placeholder="Nhập điều khoản thanh toán..." />
        </div>
      </div>

      {/* GHI CHÚ */}
      <div className="fg" style={{ marginTop: 10 }}>
        <label>Ghi chú bổ sung</label>
        <textarea value={f.ghichu} onChange={(e) => c.setField("ghichu", e.target.value)} placeholder="Ghi chú, điều khoản đặc biệt..." />
      </div>

      {/* SUBMIT */}
      <div className="submit-bar">
        <button type="button" className="btn-sub" onClick={c.confirmCreate}>
          <div className="sub-lbl">{c.appMode === "EDIT" ? "CẬP NHẬT HỢP ĐỒNG" : "TẠO HỢP ĐỒNG"}</div>
          {c.tonggiatri > 0 && <div className="sub-tot">{formatMoney(c.tonggiatri)}</div>}
        </button>
        {c.appMode === "EDIT" && (
          <button type="button" className="btn-dup" onClick={c.duplicateContract}>
            <CopyIcon size={13} /> Nhân bản thành hợp đồng mới
          </button>
        )}
        <div style={{ textAlign: "center", fontSize: 10, color: "var(--dim)", marginTop: 8, fontStyle: "italic" }}>Ctrl + Enter — tạo hợp đồng</div>
      </div>
    </>
  );
};

export default ContractFormPanel;
