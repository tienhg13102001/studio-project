// Stacked toasts (bottom), one per c.toasts entry.

import { CheckCircleIcon, InfoIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import type { ContractBuilder, ToastType } from "./useContractBuilder";

type Props = {
  c: ContractBuilder;
};

function toastIcon(type: ToastType) {
  if (type === "err") return <WarningIcon size={16} weight="fill" />;
  if (type === "ok") return <CheckCircleIcon size={16} weight="fill" />;
  return <InfoIcon size={16} weight="fill" />;
}

const ContractToast = ({ c }: Props) => {
  if (c.toasts.length === 0) return null;
  return (
    <div className="toast-stack">
      {c.toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {toastIcon(t.type)}
          <span>{t.msg}</span>
          <button
            className="toast-close"
            onClick={() => c.removeToast(t.id)}
            aria-label="Đóng"
          >
            <XIcon size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ContractToast;
