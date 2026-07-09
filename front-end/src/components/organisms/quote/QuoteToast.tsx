// Single bottom toast with an optional action button.

import { XIcon } from "@phosphor-icons/react";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  q: QuoteBuilder;
};

const QuoteToast = ({ q }: Props) => {
  if (!q.toast.show) return null;
  return (
    <div className="toast">
      <span>{q.toast.msg}</span>
      {q.toast.actionLabel && (
        <button className="toast-btn" onClick={q.toastAction}>
          {q.toast.actionLabel}
        </button>
      )}
      <button className="toast-close" onClick={q.hideToast} aria-label="Đóng">
        <XIcon size={13} />
      </button>
    </div>
  );
};

export default QuoteToast;
