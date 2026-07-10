// Confirmation modal shown before submitting to the backend.
// Ported verbatim from back-end/scripts/google/hop-dong/index.html (lines 1263-1276).

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
        <div className="si">
          <strong>Số HĐ:</strong>
          <span className="dv">{c.form.sohd}</span>
        </div>
        <div className="si">
          <strong>Khách hàng:</strong>
          <span className="dv">{c.form.tencty || "(Chưa nhập)"}</span>
        </div>
        <div className="si">
          <strong>Tổng giá trị:</strong>
          <span className="dv sh">{formatMoney(c.tonggiatri)}</span>
        </div>
        {c.dupWarn && (
          <div
            className="si"
            style={{ borderColor: "rgba(239,68,68,.4)", background: "rgba(239,68,68,.08)" }}
          >
            <strong style={{ color: "var(--red)" }}>⚠ Trùng</strong>
            <span className="dv" style={{ color: "var(--red)" }}>
              Đã có: {c.dupWarn}
            </span>
          </div>
        )}
        <div className="par">
          <button type="button" className="bp bp-cl" onClick={() => c.closeConfirm()}>
            Quay lại
          </button>
          <button type="button" className="bp bp-ok" onClick={() => c.executeProcess()}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
