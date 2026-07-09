// Fixed bottom bar (<1100px): Tổng cộng + submit button.

import { RocketLaunchIcon } from "@phosphor-icons/react";
import { formatMoney } from "#lib/quote/format";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  q: QuoteBuilder;
};

const MobileBar = ({ q }: Props) => {
  if (q.windowWidth >= 1100 || q.modalOpen) return null;
  const label =
    q.appMode === "NEW" ? "Tạo báo giá" : q.editActionType === "EDIT_OPTION" ? "Lưu đè" : "Thêm Option";
  return (
    <div className="mobile-bar">
      <div className="mb-total">
        <span className="mb-label">Tổng cộng</span>
        <span className="mb-value">{formatMoney(q.finalTotal)}</span>
      </div>
      <button type="button" className="mb-btn" onClick={q.confirmCreate}>
        <RocketLaunchIcon size={14} weight="fill" /> {label}
      </button>
    </div>
  );
};

export default MobileBar;
