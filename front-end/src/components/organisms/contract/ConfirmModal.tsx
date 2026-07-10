// Confirmation modal shown before submitting to the backend.

import { WarningIcon } from "@phosphor-icons/react";
import { formatMoney } from "#lib/contract/format";
import type { ContractBuilder } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
};

const ConfirmModal = ({ c }: Props) => {
  return (
    <div className="overlay">
      <div className="popup">
        <div className="popup-title gold">Xác Nhận Hợp Đồng</div>
        <div className="summary-box" style={{ marginBottom: 16 }}>
          <div className="summary-item">
            <strong>Số HĐ:</strong>
            <span className="data-val">{c.form.sohd}</span>
          </div>
          <div className="summary-item">
            <strong>Khách hàng:</strong>
            <span className="data-val">{c.form.tencty || "(Chưa nhập)"}</span>
          </div>
          <div className="summary-item">
            <strong>Tổng giá trị:</strong>
            <span className="data-val summary-highlight">{formatMoney(c.tonggiatri)}</span>
          </div>
        </div>
        {c.dupWarn && (
          <div className="warn-box">
            <WarningIcon size={14} weight="fill" />
            <span>
              ⚠ Đã tồn tại hợp đồng trùng mã: {c.dupWarn}
            </span>
          </div>
        )}
        <div className="popup-action-row">
          <button type="button" className="btn-pop btn-pop-close" onClick={c.closeConfirm}>
            Quay lại
          </button>
          <button type="button" className="btn-pop btn-pop-new" onClick={c.executeProcess}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
