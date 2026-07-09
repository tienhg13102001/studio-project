// Discount input + presets, subtotal, amount-in-words, THANH TOÁN chip.

import { TagIcon } from "@phosphor-icons/react";
import { formatMoney } from "#lib/quote/format";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  q: QuoteBuilder;
};

const SummarySection = ({ q }: Props) => {
  return (
    <div className="summary-section">
      <div className="discount-box">
        <label>
          <TagIcon size={12} weight="fill" style={{ marginRight: 6, color: "var(--gold)" }} />
          Chiết khấu (% hoặc số tiền)
        </label>
        <input
          type="text"
          value={q.rawCk}
          onChange={(e) => q.setRawCk(e.target.value)}
          placeholder="VD: 10% hoặc 500.000"
          style={{ marginTop: 6 }}
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
        {q.form.ckValue > 0 && <div className="ck-line">- {formatMoney(q.form.ckValue)}</div>}
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
