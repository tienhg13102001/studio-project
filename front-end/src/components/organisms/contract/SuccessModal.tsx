// Success modal with PDF / Docs links + copy-doc-link, and next-step actions.

import { CheckIcon, FilePdfIcon, FileTextIcon, LinkIcon } from "@phosphor-icons/react";
import type { ContractBuilder } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
};

const SuccessModal = ({ c }: Props) => {
  const r = c.resultData;
  return (
    <div className="overlay">
      <div className="popup">
        <div className="popup-title green">Tạo Thành Công</div>
        <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
          Đang làm việc trên {r.sohd}
        </div>
        <div className="result-links">
          {r.pdfUrl && (
            <a href={r.pdfUrl} target="_blank" rel="noreferrer" className="result-link pdf">
              <FilePdfIcon size={16} /> Mở File PDF
            </a>
          )}
          {r.docUrl && (
            <a href={r.docUrl} target="_blank" rel="noreferrer" className="result-link sheet">
              <FileTextIcon size={16} /> Mở Google Docs
            </a>
          )}
          {r.docUrl && (
            <button
              type="button"
              className={`result-link copy-sheet${c.copyDocSuccess ? " copied" : ""}`}
              onClick={c.copyDocLink}
            >
              {c.copyDocSuccess ? <CheckIcon size={16} /> : <LinkIcon size={16} />}
              {c.copyDocSuccess ? "Đã copy link!" : "Copy Link Docs"}
            </button>
          )}
        </div>
        <div className="popup-action-row" style={{ flexDirection: "column", gap: 8 }}>
          <button type="button" className="btn-pop btn-pop-new" onClick={c.resetForm}>
            Tạo hợp đồng mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
