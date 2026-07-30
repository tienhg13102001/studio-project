import { useCallback, useEffect, useState, type ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "#components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#components/ui/alert-dialog";

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
  /**
   * Form đang có thay đổi chưa lưu hay không. Bỏ trống thì modal tự đoán bằng
   * cách nghe sự kiện thay đổi của các ô bên trong — kém chính xác hơn (sửa rồi
   * sửa lại như cũ vẫn tính là đã đổi) nhưng không cần tab nào phải sửa gì.
   */
  dirty?: boolean;
};

export default function EditModal({ title, isOpen, onClose, onSubmit, saving, children, onDelete, deleting, deleteLabel, dirty }: Props) {
  const [touched, setTouched] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const isDirty = dirty ?? touched;

  // Mỗi lần mở/đóng modal là một phiên nhập mới.
  useEffect(() => {
    setTouched(false);
    setConfirmDiscard(false);
  }, [isOpen]);

  const requestClose = useCallback(() => {
    // Đang lưu/xoá thì đóng giữa đường dễ gây hiểu nhầm là đã xong.
    if (saving || deleting) return;
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }, [saving, deleting, isDirty, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      // Đang mở Select/Popover/IconPicker thì để chúng nhận Escape trước, nếu
      // không một lần bấm sẽ đóng luôn cả modal.
      if (document.querySelector("[data-radix-popper-content-wrapper]")) return;
      requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, requestClose]);

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          // Dùng mousedown thay click: nếu bấm-giữ trong form rồi nhả chuột ra
          // ngoài, click sẽ tính trên nền và đóng mất form.
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) requestClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-7xl rounded-2xl border border-foreground/10 bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-foreground/8 px-4 py-3 sm:px-6 sm:py-4">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={requestClose}
                aria-label="Đóng"
                className="text-foreground/40 hover:bg-foreground/8 hover:text-foreground"
              >
                <XIcon size={14} />
              </Button>
            </div>

            {/* Body */}
            <div
              // Bắt thay đổi của mọi ô con để biết form đã bị sửa. Bỏ qua sự kiện
              // phát từ popover Radix (ô tìm icon) — gõ ở đó không phải sửa form.
              onChange={(e) => {
                if (!(e.target as HTMLElement).closest("[data-radix-popper-content-wrapper]")) {
                  setTouched(true);
                }
              }}
              className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
            >
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
                  onClick={requestClose}
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
      )}

      {/* Hỏi lại khi đóng giữa lúc form còn thay đổi chưa lưu */}
      <AlertDialog open={confirmDiscard} onOpenChange={(open) => !open && setConfirmDiscard(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bỏ các thay đổi chưa lưu?</AlertDialogTitle>
            <AlertDialogDescription>
              Những gì bạn vừa sửa trong biểu mẫu này sẽ không được lưu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục sửa</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDiscard(false);
                onClose();
              }}
            >
              Bỏ thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
