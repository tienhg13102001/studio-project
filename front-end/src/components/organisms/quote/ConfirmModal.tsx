// Confirmation modal shown before submitting to the backend.

import { WarningIcon } from "@phosphor-icons/react";
import { formatMoney } from "#lib/quote/format";
import type { QuoteBuilder } from "./useQuoteBuilder";

type Props = {
  q: QuoteBuilder;
};

function actionText(action: QuoteBuilder["pendingAction"]): string {
  if (action === "CREATE_NEW") return "Tạo file báo giá mới";
  if (action === "ADD_OPTION") return "Thêm Option vào Báo giá hiện tại";
  if (action === "EDIT_OPTION") return "Lưu ĐÈ lên Option hiện tại";
  return "";
}

const ConfirmModal = ({ q }: Props) => {
  return (
    <div className="overlay">
      <div className="popup">
        <div className="popup-title gold">Xác Nhận Báo Giá</div>
        <div className="summary-box" style={{ marginBottom: 16 }}>
          <div className="summary-item">
            <strong>Dự án:</strong>
            <span className="data-val">{q.form.duann || "(Chưa nhập)"}</span>
          </div>
          <div className="summary-item">
            <strong>Hành động:</strong>
            <span className="data-val" style={{ color: "var(--amber)" }}>
              {actionText(q.pendingAction)}
            </span>
          </div>
          <div className="summary-item">
            <strong>Tổng tiền:</strong>
            <span className="data-val summary-highlight">{formatMoney(q.finalTotal)}</span>
          </div>
        </div>
        {q.pendingAction === "EDIT_OPTION" && (
          <div className="warn-box">
            <WarningIcon size={14} weight="fill" />
            <span>
              Lưu đè sẽ <b>GHI ĐÈ toàn bộ</b> option này bằng dữ liệu đang nhập. Nếu bạn từng sửa
              tay trên Google Sheet, các thay đổi đó sẽ mất. Muốn giữ? Chọn <b>Thêm Option</b>.
            </span>
          </div>
        )}
        <div className="popup-action-row">
          <button type="button" className="btn-pop btn-pop-close" onClick={q.closeConfirm}>
            Quay lại
          </button>
          <button type="button" className="btn-pop btn-pop-new" onClick={q.executeProcess}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
