import type { ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "#components/ui/button";

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
      <div className="w-full max-w-7xl rounded-2xl border border-foreground/10 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-foreground/8 px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-foreground/40 hover:bg-foreground/8 hover:text-foreground"
          >
            <XIcon size={14} />
          </Button>
        </div>

        {/* Body */}
        <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-foreground/8 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            {onDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={deleting || saving}
                className="border border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/60 hover:bg-red-500/20"
              >
                {deleting ? "Deleting…" : (deleteLabel ?? "Delete")}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-foreground/10 text-foreground/60 hover:border-foreground/30 hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={saving}
              className="bg-primary text-black hover:opacity-80"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
