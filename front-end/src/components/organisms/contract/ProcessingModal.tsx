// Loading/processing modal with fake progress bar -> success checkmark.
// Ported verbatim from back-end/scripts/google/hop-dong/index.html (lines 1300-1321).

import { CheckCircleIcon } from "@phosphor-icons/react";
import type { ContractBuilder } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
};

const ProcessingModal = ({ c }: Props) => {
  return (
    <div className="overlay">
      <div className="popup" style={{ maxWidth: 320 }}>
        {!c.isProcessingDone && (
          <div className="ll-wrap">
            <div className="ll-ring" />
            <div className="ll-inner">
              <img
                src="https://drive.google.com/thumbnail?id=1A08TfiPaQ99gcDu7THMh9O98gpVwUbJS&sz=w200-h200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://i.imgur.com/NymLXBn.png";
                }}
                alt="Bee Z"
              />
            </div>
          </div>
        )}
        {c.isProcessingDone && (
          <div style={{ marginBottom: 12 }}>
            <CheckCircleIcon size={52} weight="fill" className="ok-ic" />
          </div>
        )}
        <div
          style={{
            fontWeight: 800,
            fontSize: 15,
            marginBottom: 7,
            color: c.isProcessingDone ? "var(--green)" : "var(--gold)",
          }}
        >
          {c.isProcessingDone
            ? c.appMode === "BBNT"
              ? "Tạo biên bản thành công!"
              : c.appMode === "DNTT"
                ? "Tạo đề nghị thành công!"
                : "Tạo hợp đồng thành công!"
            : "Đang xử lý..."}
        </div>
        {!c.isProcessingDone && (
          <div>
            <div className="prog-w">
              <div className="prog-f" style={{ width: `${c.progressValue}%` }} />
            </div>
            <div className="prog-p">{Math.floor(c.progressValue)}%</div>
            <button
              type="button"
              className="bp bp-cl"
              style={{ width: "100%", marginTop: 16 }}
              onClick={() => c.cancelCreate()}
            >
              Dừng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingModal;
