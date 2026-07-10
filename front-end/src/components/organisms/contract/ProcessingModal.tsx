// Loading modal with fake progress bar → success checkmark.

import { CheckCircleIcon } from "@phosphor-icons/react";
import { LOGO_SRC } from "./constants";
import type { ContractBuilder } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
};

const ProcessingModal = ({ c }: Props) => {
  return (
    <div className="overlay">
      <div className="popup" style={{ maxWidth: 340 }}>
        {!c.isProcessingDone && (
          <div className="loading-logo-wrap">
            <div className="loading-ring" />
            <div className="loading-logo-inner">
              <img src={LOGO_SRC} alt="Bee Z" />
            </div>
          </div>
        )}
        {c.isProcessingDone && (
          <div style={{ marginBottom: 14 }}>
            <CheckCircleIcon className="success-icon" size={64} weight="fill" />
          </div>
        )}
        <div
          style={{
            fontWeight: 800,
            fontSize: 16,
            marginBottom: 8,
            color: c.isProcessingDone ? "var(--green)" : "var(--gold)",
          }}
        >
          {c.isProcessingDone ? "Xử lý hoàn tất!" : "Đang xử lý..."}
        </div>
        {!c.isProcessingDone && (
          <div>
            <div className="progress-wrap">
              <div className="progress-fill" style={{ width: `${c.progressValue}%` }} />
            </div>
            <div className="progress-pct">{Math.floor(c.progressValue)}%</div>
            <button
              type="button"
              className="btn-pop btn-pop-close"
              style={{ width: "100%", marginTop: 20 }}
              onClick={c.cancelCreate}
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
