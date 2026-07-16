// Loading modal with fake progress bar → success checkmark.

import { CheckCircleIcon } from "@phosphor-icons/react";
import { LOGO_FALLBACK, LOGO_SRC } from "./constants";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  q: QuoteBuilder;
};

const ProcessingModal = ({ q }: Props) => {
  return (
    <div className="overlay">
      <div className="popup" style={{ maxWidth: 340 }}>
        {!q.isProcessingDone && (
          <div className="loading-logo-wrap">
            <div className="loading-ring" />
            <div className="loading-logo-inner">
              <img
                src={LOGO_SRC}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = LOGO_FALLBACK;
                }}
                alt="Bee Z"
              />
            </div>
          </div>
        )}
        {q.isProcessingDone && (
          <div style={{ marginBottom: 14 }}>
            <CheckCircleIcon className="success-icon" size={64} weight="fill" />
          </div>
        )}
        <div
          style={{
            fontWeight: 800,
            fontSize: 16,
            marginBottom: 8,
            color: q.isProcessingDone ? "var(--green)" : "var(--gold)",
          }}
        >
          {q.isProcessingDone ? "Xử lý hoàn tất!" : "Đang tạo báo giá..."}
        </div>
        {!q.isProcessingDone && (
          <div>
            <div className="progress-wrap">
              <div className="progress-fill" style={{ width: `${q.progressValue}%` }} />
            </div>
            <div className="progress-pct">{Math.floor(q.progressValue)}%</div>
            <button
              type="button"
              className="btn-pop btn-pop-close"
              style={{ width: "100%", marginTop: 20 }}
              onClick={q.cancelCreate}
            >
              Dừng tiến trình
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingModal;
