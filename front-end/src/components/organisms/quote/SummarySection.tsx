// Discount input + presets, subtotal, amount-in-words, THANH TOÁN chip.

import { useState } from "react";
import { CaretDownIcon, TagIcon } from "@phosphor-icons/react";
import { formatMoney } from "#lib/quote/format";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  q: QuoteBuilder;
};

const SummarySection = ({ q }: Props) => {
  // Toggle ẩn/hiện khu nhập chiết khấu (bấm mở, bấm lại đóng). Thu gọn vẫn hiện số ck ở nút.
  const [ckOpen, setCkOpen] = useState(false);
  return (
    <div className="summary-section">
      <div className="discount-box">
        <button
          type="button"
          className={`ck-toggle${ckOpen ? " ck-open" : ""}`}
          onClick={() => setCkOpen((v) => !v)}
        >
          <TagIcon size={12} weight="fill" />
          <span>
            Chiết khấu
            {q.form.ckValue > 0 && (
              <span className="ck-badge"> · -{formatMoney(q.form.ckValue)}</span>
            )}
          </span>
          <CaretDownIcon size={11} className="ck-caret" />
        </button>
        {ckOpen && (
          <>
            <input
              type="text"
              value={q.rawCk}
              onChange={(e) => q.setRawCk(e.target.value)}
              placeholder="VD: 10% hoặc 500.000"
              style={{ marginTop: 8 }}
            />
            <div className="ck-presets">
              <button type="button" onClick={() => q.setCkPct(0)} title="Bỏ chiết khấu">
                Xóa
              </button>
              <button type="button" onClick={() => q.setCkPct(5)}>
                5%
              </button>
              <button type="button" onClick={() => q.setCkPct(10)}>
                10%
              </button>
              <button type="button" onClick={() => q.setCkPct(15)}>
                15%
              </button>
            </div>
          </>
        )}
      </div>
      <div className="total-summary-box">
        <div className="subtotal-line">
          Tạm tính: <b>{formatMoney(q.subTotal)}</b>
        </div>
        <div className="chu-line">
          Bằng chữ: <b>{q.tongTienChu}</b>
        </div>
        <div className="total-chip">
          <span className="total-label">Tổng cộng</span>
          <span className="total-value">{formatMoney(q.finalTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
