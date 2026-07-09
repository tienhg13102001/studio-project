// Item rows table for one category. Includes per-row name autocomplete
// (portaled to body), price live-formatting, note toggle, add/remove.

import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import { NoteIcon, TrashIcon } from "@phosphor-icons/react";
import { formatThousands } from "#lib/quote/format";
import type { CatKey, QuoteItem, Service } from "#lib/quote/types";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  tab: CatKey;
  short: string;
  q: QuoteBuilder;
};

type DropdownState = {
  index: number;
  top: number;
  left: number;
  width: number;
} | null;

const shortMoney = (n: number) => (!n || n === 0 ? "" : Number(n).toLocaleString("vi-VN"));

const ItemTable = ({ tab, short, q }: Props) => {
  const items = q.form.items[tab];
  const [dropdown, setDropdown] = useState<DropdownState>(null);

  const openDropdown = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    const container = e.target.closest(".custom-dropdown-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setDropdown({
      index,
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 240),
    });
  };
  const closeDropdown = () => setTimeout(() => setDropdown(null), 200);

  const onPrice = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    q.onPriceInput(tab, index, digits);
  };

  const chooseService = (index: number, opt: Service) => {
    q.selectService(tab, index, opt);
    setDropdown(null);
  };

  const renderDropdown = (index: number, item: QuoteItem) => {
    if (!dropdown || dropdown.index !== index) return null;
    const options = q.filteredServices(tab, item.ten);
    return createPortal(
      <ul
        className="bz-dropdown-list"
        style={{
          position: "fixed",
          top: dropdown.top,
          left: dropdown.left,
          width: dropdown.width,
          zIndex: 9999,
        }}
      >
        {options.map((opt) => (
          <li key={opt.ten} onMouseDown={(e) => e.preventDefault()} onClick={() => chooseService(index, opt)}>
            {opt.ten}
          </li>
        ))}
        {options.length === 0 && (
          <li style={{ color: "var(--text-dim)", fontStyle: "italic" }}>Không tìm thấy...</li>
        )}
      </ul>,
      document.body,
    );
  };

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: "44%", textAlign: "left", paddingLeft: 12 }}>Tên hạng mục</th>
              <th style={{ width: "8%" }}>SL</th>
              <th style={{ width: "9%" }}>ĐVT</th>
              <th style={{ width: "15%" }}>Đơn giá</th>
              <th style={{ width: "8%" }}>Ngày</th>
              <th style={{ width: "16%" }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const amt = (item.dongia || 0) * (item.sl || 1) * (item.sn || 1);
              return (
                <Fragment key={item.id}>
                  <tr>
                    <td data-label="Tên HM:" style={{ textAlign: "left" }}>
                      <div className="custom-dropdown-container">
                        <input
                          type="text"
                          className="item-name"
                          value={item.ten}
                          onChange={(e) => q.updateItem(tab, index, { ten: e.target.value })}
                          onFocus={(e) => openDropdown(index, e)}
                          onBlur={closeDropdown}
                          placeholder="Gõ tìm hạng mục..."
                          style={{ textAlign: "left", width: "100%", paddingLeft: 10 }}
                        />
                        {renderDropdown(index, item)}
                      </div>
                    </td>
                    <td data-label="Số lượng:">
                      <input
                        type="number"
                        min={1}
                        value={item.sl}
                        onChange={(e) =>
                          q.updateItem(tab, index, { sl: Number(e.target.value) || 0 })
                        }
                        style={{ textAlign: "center" }}
                      />
                    </td>
                    <td data-label="Đơn vị:">
                      <input
                        type="text"
                        value={item.dvt}
                        onChange={(e) => q.updateItem(tab, index, { dvt: e.target.value })}
                        style={{ textAlign: "center" }}
                      />
                    </td>
                    <td data-label="Đơn giá:">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="price-input"
                        value={item.dongia ? formatThousands(String(item.dongia)) : ""}
                        onChange={(e) => onPrice(index, e)}
                        style={{ textAlign: "right", fontWeight: 700, fontSize: 12 }}
                      />
                    </td>
                    <td data-label="Số ngày:">
                      <input
                        type="number"
                        min={1}
                        value={item.sn}
                        onChange={(e) =>
                          q.updateItem(tab, index, {
                            sn: Number(e.target.value) || 0,
                            snTouched: true,
                          })
                        }
                        style={{
                          textAlign: "center",
                          fontWeight: 800,
                          color: item.snTouched ? "var(--gold)" : "var(--text)",
                        }}
                      />
                    </td>
                    <td data-label="Thành tiền:">
                      <div className="action-cell">
                        <span>
                          {shortMoney(amt)}
                          {amt > 0 && <small className="dvn">đ</small>}
                        </span>
                        <button
                          type="button"
                          className={`btn-note${item.showNote ? " active" : ""}${
                            item.ghichu && item.ghichu.trim() ? " has-note" : ""
                          }`}
                          onClick={() => q.updateItem(tab, index, { showNote: !item.showNote })}
                          title="Ghi chú"
                        >
                          <NoteIcon size={11} />
                        </button>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => q.removeItem(tab, index)}
                        >
                          <TrashIcon size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {item.showNote && (
                    <tr className="note-row">
                      <td colSpan={6} className="note-cell">
                        <div className="note-label">
                          <NoteIcon size={10} style={{ marginRight: 4 }} /> Ghi chú / mô tả
                        </div>
                        <textarea
                          className="note-input"
                          value={item.ghichu}
                          rows={2}
                          onChange={(e) => q.updateItem(tab, index, { ghichu: e.target.value })}
                          placeholder="Mô tả / ghi chú hạng mục..."
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="action-row">
        <button type="button" className="btn-add-row" onClick={() => q.addItem(tab)}>
          + Thêm {short}
        </button>
      </div>
    </>
  );
};

export default ItemTable;
