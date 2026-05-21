import type { ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react";

type Props = {
  title:    string;
  isOpen:   boolean;
  onClose:  () => void;
  onSubmit: () => void;
  saving:   boolean;
  children: ReactNode;
  onDelete?:    () => void;
  deleting?:    boolean;
  deleteLabel?: string;
};

export default function EditModal({ title, isOpen, onClose, onSubmit, saving, children, onDelete, deleting, deleteLabel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-7xl rounded-2xl border border-white/10 bg-[#161616] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/8 hover:text-white"
          >
            <XIcon size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/8 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={deleting || saving}
                className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : (deleteLabel ?? "Delete")}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-black transition-all hover:opacity-80 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
