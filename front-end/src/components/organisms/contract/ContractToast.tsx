// Stacked toasts (bottom), one per c.toasts entry, teleported to document.body.
// Ported verbatim from back-end/scripts/google/hop-dong/index.html (lines 1347-1356).

import { createPortal } from "react-dom";
import type { ContractBuilder } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
};

const ContractToast = ({ c }: Props) => {
  return createPortal(
    <div className="toasts">
      {c.toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i
            className={`fas ${
              t.type === "err"
                ? "fa-circle-exclamation"
                : t.type === "ok"
                  ? "fa-circle-check"
                  : "fa-circle-info"
            }`}
          />
          <span>{t.msg}</span>
          <button
            type="button"
            className="toast-x"
            onClick={() => c.removeToast(t.id)}
            aria-label="Đóng"
          >
            &times;
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
};

export default ContractToast;
