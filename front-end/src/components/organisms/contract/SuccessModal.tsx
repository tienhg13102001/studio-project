// Success modal with PDF / Docs links + copy-doc-link, and next-step actions.
// Ported verbatim from back-end/scripts/google/hop-dong/index.html (lines 1323-1345).

import { CheckIcon, FileDocIcon, FilePdfIcon, LinkIcon } from "@phosphor-icons/react";
import type { ContractBuilder } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
};

const SuccessModal = ({ c }: Props) => {
  return (
    <div className="overlay">
      <div className="popup">
        <div className="popup-title green">
          {c.appMode === "BBNT"
            ? "Biên Bản Đã Tạo!"
            : c.appMode === "DNTT"
              ? "Đề Nghị Đã Tạo!"
              : "Hợp Đồng Đã Tạo!"}
        </div>
        <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: 12, marginBottom: 12 }}>
          {c.resultData.sohd}
        </div>
        <div className="rlinks">
          <a href={c.resultData.pdfUrl} target="_blank" rel="noreferrer" className="rl pdf">
            <FilePdfIcon size={16} /> Mở File PDF
          </a>
          <a href={c.resultData.docUrl} target="_blank" rel="noreferrer" className="rl doc">
            <FileDocIcon size={16} /> Mở Google Docs
          </a>
          <button
            type="button"
            className={`rl cp${c.copyDocSuccess ? " ok" : ""}`}
            onClick={() => c.copyDocLink()}
          >
            {c.copyDocSuccess ? <CheckIcon size={16} /> : <LinkIcon size={16} />}
            {c.copyDocSuccess ? "Đã copy!" : "Copy Link Docs"}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <button
            type="button"
            className="bp bp-ok"
            style={{ width: "100%" }}
            onClick={() => c.resetForm()}
          >
            Tạo hợp đồng mới
          </button>
          <button
            type="button"
            className="bp bp-cl"
            style={{ width: "100%" }}
            onClick={() => c.closeSuccess()}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
