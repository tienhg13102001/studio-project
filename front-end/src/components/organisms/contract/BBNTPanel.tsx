// Left-panel form for BBNT (Biên bản nghiệm thu) mode: pick a contract, edit
// acceptance items + amounts, and export the acceptance record.
// Markup ported verbatim from back-end/scripts/google/hop-dong/index.html
// (lines 961-1122) to keep the same DOM/class names as the original Vue app.

import { formatDateOnly, formatMoney } from "#lib/contract/format";
import type { ContractBuilder } from "./useContractBuilder";
import {
  ArrowsClockwiseIcon,
  FolderOpenIcon,
  SpinnerIcon,
  WarningIcon,
  FileTextIcon,
  CalendarBlankIcon,
  TrashIcon,
  PercentIcon,
  HandCoinsIcon,
  ReceiptIcon,
  ClipboardTextIcon,
} from "@phosphor-icons/react";

type Props = {
  c: ContractBuilder;
  openDatePicker: (
    target: "form" | "bbnt" | "dntt",
    field: string,
    e: React.MouseEvent<HTMLDivElement>,
  ) => void;
};

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

const BBNTPanel = ({ c, openDatePicker }: Props) => {
  const { bbnt } = c;

  return (
    <div>
      {/* Picker chọn hợp đồng để nghiệm thu */}
      <div className="file-pick">
        <div className="fsrow">
          <label style={{ color: "var(--gold)", margin: 0, fontSize: 9 }}>
            Chọn hợp đồng để nghiệm thu
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="text"
              className="fsinp"
              value={c.bbntSearchQuery}
              onChange={(e) => c.setBbntSearchQuery(e.target.value)}
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
          {c.filteredBBNTContracts.map((f) => (
            <div
              key={f.id}
              className={`fcard${bbnt.contractId === f.id ? " sel" : ""}`}
              onClick={() => c.selectBBNTContract(f)}
            >
              <div className="fc-c">{parseHDName(f.name).code}</div>
              <div className="fc-n">{parseHDName(f.name).name || f.name}</div>
              {parseHDName(f.name).date && <div className="fc-d">{parseHDName(f.name).date}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Loading khi kéo data live */}
      {bbnt.loading && (
        <div style={{ textAlign: "center", padding: 22, color: "var(--gold)" }}>
          <SpinnerIcon size={22} className="animate-spin" />
          <div style={{ fontSize: 12, marginTop: 8, color: "var(--dim)" }}>
            Đang đọc dữ liệu hợp đồng...
          </div>
        </div>
      )}

      {/* Chưa chọn */}
      {!bbnt.contractId && !bbnt.loading && (
        <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--dim)", fontSize: 12 }}>
          Chọn 1 hợp đồng ở trên để lập biên bản nghiệm thu.
        </div>
      )}

      {/* Form nghiệm thu */}
      {bbnt.contractId && !bbnt.loading && (
        <>
          {bbnt.fromSnapshot && (
            <div
              style={{
                margin: "10px 0",
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.35)",
                fontSize: 11,
                color: "var(--red)",
              }}
            >
              <WarningIcon size={14} /> Không đọc được bảng giá sống trong Doc —
              đang dùng snapshot lúc tạo HĐ. Kiểm tra kỹ hạng mục.
            </div>
          )}

          {/* Thông tin hợp đồng */}
          <div className="sbox">
            <div className="stitle">
              <FileTextIcon size={14} style={{ color: "var(--gold)" }} />
              Hợp đồng nghiệm thu
            </div>
            <div className="fg" style={{ marginBottom: 10 }}>
              <label>Số hợp đồng</label>
              <input
                type="text"
                value={bbnt.sohd}
                onChange={(e) => c.setBBNTField("sohd", e.target.value)}
              />
            </div>
            <div className="fg" style={{ marginBottom: 10 }}>
              <label>Khách hàng (Bên A)</label>
              <input
                type="text"
                value={bbnt.tencty}
                onChange={(e) => c.setBBNTField("tencty", e.target.value)}
              />
            </div>
            <div className="fg" style={{ marginBottom: 10 }}>
              <label>Ngày nghiệm thu</label>
              <div className="dw" onClick={(e) => openDatePicker("bbnt", "ngayNthu", e)}>
                <input
                  type="text"
                  readOnly
                  value={formatDateOnly(bbnt.ngayNthu)}
                  placeholder="Chọn ngày..."
                  className="dd-inp"
                />
                <button type="button" className="dd-btn">
                  <CalendarBlankIcon size={14} />
                </button>
              </div>
            </div>
            <div className="fg">
              <label>Sản phẩm bàn giao / link nghiệm thu (mỗi dòng 1 mục)</label>
              <textarea
                value={bbnt.deliverables}
                onChange={(e) => c.setBBNTField("deliverables", e.target.value)}
                rows={3}
                placeholder={
                  "VD:\n01 video recap: https://drive.google.com/...\n01 bộ ảnh sự kiện đã hậu kỳ: https://..."
                }
              />
            </div>
          </div>

          {/* Bảng hạng mục nghiệm thu */}
          <div className="tw" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "26%", textAlign: "left", paddingLeft: 10 }}>Hạng mục</th>
                  <th style={{ width: "7%" }}>ĐVT</th>
                  <th style={{ width: "7%" }}>SL</th>
                  <th style={{ width: "15%" }}>Đơn giá</th>
                  <th style={{ width: "16%" }}>Thành tiền</th>
                  <th style={{ width: "10%" }}>Tỉ lệ %</th>
                  <th style={{ width: "19%" }}>TT nghiệm thu</th>
                </tr>
              </thead>
              <tbody>
                {bbnt.items.map((it, idx) => (
                  <tr key={idx}>
                    <td data-label="Hạng mục:" style={{ textAlign: "left" }}>
                      <input
                        type="text"
                        value={it.ten}
                        onChange={(e) => c.updateBBNTItem(idx, { ten: e.target.value })}
                        placeholder="Tên hạng mục..."
                        style={{ textAlign: "left", width: "100%", paddingLeft: 8 }}
                      />
                    </td>
                    <td data-label="ĐVT:">
                      <input
                        type="text"
                        value={it.dvt}
                        onChange={(e) => c.updateBBNTItem(idx, { dvt: e.target.value })}
                        style={{ textAlign: "center" }}
                      />
                    </td>
                    <td data-label="SL:">
                      <input
                        type="number"
                        value={it.sl}
                        min={1}
                        onChange={(e) => c.updateBBNTItem(idx, { sl: Number(e.target.value) })}
                        style={{ textAlign: "center" }}
                      />
                    </td>
                    <td data-label="Đơn giá:">
                      <input
                        type="text"
                        value={it.dongia ? Number(it.dongia).toLocaleString("vi-VN") : ""}
                        onChange={(e) =>
                          c.updateBBNTItem(idx, {
                            dongia: Math.max(0, parseInt(e.target.value.replace(/[^\d]/g, "")) || 0),
                          })
                        }
                        style={{ textAlign: "right", color: "var(--gold)", fontWeight: 700, fontSize: 11 }}
                      />
                    </td>
                    <td data-label="Thành tiền:">
                      <input
                        type="text"
                        value={it.tt ? Number(it.tt).toLocaleString("vi-VN") : ""}
                        onChange={(e) =>
                          c.updateBBNTItem(idx, {
                            tt: Math.max(0, parseInt(e.target.value.replace(/[^\d]/g, "")) || 0),
                          })
                        }
                        style={{ textAlign: "right", color: "var(--gold)", fontWeight: 700, fontSize: 11 }}
                      />
                    </td>
                    <td data-label="Tỉ lệ %:">
                      <input
                        type="number"
                        value={it.tyle}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          c.updateBBNTItem(idx, { tyle: Number(e.target.value) })
                        }
                        style={{ textAlign: "center", color: "var(--gold)", fontWeight: 800 }}
                      />
                    </td>
                    <td data-label="TT nghiệm thu:">
                      <div className="ac">
                        <span>{formatShortMoney(c.bbntItemNthu(it))}</span>
                        <button type="button" onClick={() => c.removeBBNTItem(idx)} className="btn-rm">
                          <TrashIcon size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="arow" style={{ gap: 8 }}>
            <button type="button" className="btn-add" onClick={c.addBBNTItem}>
              + Thêm hạng mục
            </button>
          </div>

          {/* Tỉ lệ nhanh + VAT + đã TT + tổng */}
          <div className="sumbox">
            <div>
              <label>
                <PercentIcon size={14} style={{ marginRight: 5, color: "var(--gold)" }} />
                Tỉ lệ nghiệm thu chung
              </label>
              <div className="ck-presets" style={{ marginTop: 7 }}>
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
              <label style={{ marginTop: 12 }}>
                <HandCoinsIcon size={14} style={{ marginRight: 5, color: "var(--gold)" }} />
                Đã thanh toán
              </label>
              <input
                type="text"
                value={bbnt.daTT ? Number(bbnt.daTT).toLocaleString("vi-VN") : ""}
                onChange={(e) =>
                  c.setBBNTField(
                    "daTT",
                    Math.max(0, parseInt(e.target.value.replace(/[^\d]/g, "")) || 0),
                  )
                }
                placeholder="VD: 10.000.000 (0 nếu chưa)"
                style={{ marginTop: 5 }}
              />
            </div>
            <div>
              <label>
                <ReceiptIcon size={14} style={{ marginRight: 5, color: "var(--gold)" }} />
                Thuế VAT
              </label>
              <div className="vrow" style={{ marginTop: 7 }}>
                <div className="vtog">
                  <input
                    type="checkbox"
                    id="bbntVatCk"
                    checked={bbnt.applyVat}
                    onChange={(e) => c.setBBNTField("applyVat", e.target.checked)}
                  />
                  <label htmlFor="bbntVatCk">Áp dụng VAT</label>
                </div>
                {bbnt.applyVat && (
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <input
                      type="number"
                      value={bbnt.vatPct}
                      onChange={(e) => c.setBBNTField("vatPct", Number(e.target.value))}
                      className="vpct"
                      min={0}
                      max={20}
                      step={1}
                    />
                    <span style={{ fontSize: 12, color: "var(--dim)" }}>%</span>
                  </div>
                )}
              </div>
              {bbnt.applyVat && c.bbntVat > 0 && (
                <div className="vat-l" style={{ marginTop: 6 }}>
                  VAT {bbnt.vatPct}%: + {formatMoney(c.bbntVat)}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div className="sub-l">
                Giá trị nghiệm thu (chưa VAT): <b>{formatMoney(c.bbntSumNthu)}</b>
              </div>
              <div className="sub-l">
                Đã thanh toán: <b>{formatMoney(bbnt.daTT)}</b>
              </div>
              <div className="chu-l">
                Còn phải TT (bằng chữ): <b>{c.bbntConPhaiChu}</b>
              </div>
              <div className="tot-chip">
                <span className="tot-lbl">Còn phải thanh toán</span>
                <input type="text" className="tot-val" readOnly value={formatMoney(c.bbntConPhai)} />
              </div>
            </div>
          </div>

          {/* Xuất BBNT */}
          <div className="submit-bar">
            <button type="button" className="btn-sub" onClick={c.exportBBNT}>
              <div className="sub-lbl">
                <ClipboardTextIcon size={14} style={{ marginRight: 7 }} />
                XUẤT BIÊN BẢN NGHIỆM THU
              </div>
              {c.bbntTong > 0 && <div className="sub-tot">{formatMoney(c.bbntTong)}</div>}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BBNTPanel;
