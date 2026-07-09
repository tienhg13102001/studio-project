// Success modal with PDF / Sheet links + copy-sheet-link, and next-step actions.

import { CheckIcon, FilePdfIcon, LinkIcon, TableIcon } from "@phosphor-icons/react";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  q: QuoteBuilder;
};

const SuccessModal = ({ q }: Props) => {
  const r = q.resultData;
  return (
    <div className="overlay">
      <div className="popup">
        <div className="popup-title green">Tạo Thành Công</div>
        <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
          Đang làm việc trên {r.sobg}
        </div>
        <div className="result-links">
          <a href={r.pdfUrl} target="_blank" rel="noreferrer" className="result-link pdf">
            <FilePdfIcon size={16} /> Mở File PDF
          </a>
          <a href={r.sheetUrl} target="_blank" rel="noreferrer" className="result-link sheet">
            <TableIcon size={16} /> Mở Google Sheet
          </a>
          <button
            type="button"
            className={`result-link copy-sheet${q.copySheetSuccess ? " copied" : ""}`}
            onClick={q.copySheetLink}
          >
            {q.copySheetSuccess ? <CheckIcon size={16} /> : <LinkIcon size={16} />}
            {q.copySheetSuccess ? "Đã copy link!" : "Copy Link Sheet"}
          </button>
        </div>
        <div className="popup-action-row" style={{ flexDirection: "column", gap: 8 }}>
          <button type="button" className="btn-pop btn-pop-edit" onClick={q.handleEditOption}>
            Chỉnh sửa Option (Lưu đè)
          </button>
          <button type="button" className="btn-pop btn-pop-add" onClick={q.handleAddOption}>
            Thêm Option (Giữ Data)
          </button>
          <button type="button" className="btn-pop btn-pop-close" onClick={q.resetForm}>
            Đóng (Tạo báo giá mới)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
