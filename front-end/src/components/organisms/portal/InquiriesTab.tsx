import { useState } from "react";
import {
  EnvelopeSimpleIcon,
  PhoneIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { apiDelete, invalidateApiCache } from "#lib/api";
import type { ApiInquiry } from "#lib/apiTypes";
import { INQUIRIES_CHANGED_EVENT } from "#hooks/useInquiries";
import { isUnseenInquiry } from "#hooks/useUnseenInquiries";
import { usePortalToast } from "#components/organisms/portal/PortalToast";
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
import { Badge } from "#components/ui/badge";
import { Button } from "#components/ui/button";
import { TableSkeleton } from "#components/ui/portal/TableSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";

type TabProps = {
  data: ApiInquiry[] | null;
  loading: boolean;
  /** Không cần onRefetch: xoá xong bắn INQUIRIES_CHANGED_EVENT, hook tự tải lại. */
};

/** Formats an ISO date as a compact, locale-aware "12 Jun 2026, 14:30". */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InquiriesTab({ data, loading }: TabProps) {
  const [viewing, setViewing] = useState<ApiInquiry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiInquiry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { toast } = usePortalToast();

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDelete(`/api/contact/inquiries/${confirmDelete.id}`);
      invalidateApiCache("/api/contact/inquiries");
      // Một tín hiệu là đủ: MỌI bản useInquiries (bảng này + badge ở sidebar) đều
      // nghe và tự tải lại. Gọi thêm onRefetch() sẽ tạo request trùng.
      window.dispatchEvent(new Event(INQUIRIES_CHANGED_EVENT));
      toast("Đã chuyển liên hệ vào Thùng rác", "ok");
      setConfirmDelete(null);
      if (viewing?.id === confirmDelete.id) setViewing(null);
    } catch (e) {
      setDeleteError((e as Error).message);
      toast("Không xoá được: " + (e as Error).message, "err");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <TableSkeleton cols={5} rows={5} />;

  const rows = data ?? [];

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Liên hệ</h2>
          <p className="text-foreground/40 text-xs">
            Tin nhắn gửi từ form liên hệ trên website ({rows.length})
          </p>
        </div>
      </div>

      {/* ── Empty state ── */}
      {rows.length === 0 ? (
        <div className="border-foreground/8 text-foreground/30 rounded-xl border border-dashed py-16 text-center text-sm">
          Chưa có tin nhắn nào.
        </div>
      ) : (
        <div className="border-foreground/8 overflow-hidden rounded-xl border">
          <Table containerClassName="max-h-[70vh]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {["Họ và tên", "Liên hệ", "Dịch vụ", "Tin nhắn", "Thời gian", ""].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => setViewing(c)}
                >
                  <TableCell className="text-foreground text-xs font-medium">{c.name}</TableCell>
                  <TableCell className="text-foreground/60 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1">
                        <EnvelopeSimpleIcon size={11} className="shrink-0" />
                        {c.email}
                      </span>
                      {c.phone && (
                        <span className="inline-flex items-center gap-1">
                          <PhoneIcon size={11} className="shrink-0" />
                          {c.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.serviceName ? (
                      <Badge
                        variant="outline"
                        className="border-foreground/10 bg-foreground/5 text-foreground/60"
                      >
                        {c.serviceName}
                      </Badge>
                    ) : (
                      <span className="text-foreground/25 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground/50 text-xs">
                    <p className="line-clamp-2 max-w-xs">{c.message}</p>
                  </TableCell>
                  <TableCell className="text-foreground/40 text-xs whitespace-nowrap">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(c);
                        setDeleteError(null);
                      }}
                      className="border-foreground/10 text-foreground/50 border hover:border-red-500/50 hover:text-red-400"
                      title="Xoá tin nhắn"
                    >
                      <TrashIcon size={11} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Detail modal ── */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="border-foreground/10 bg-card w-full max-w-lg rounded-2xl border shadow-2xl">
            <div className="border-foreground/8 flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-foreground font-semibold">{viewing.name}</h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setViewing(null)}
                className="text-foreground/40 hover:bg-foreground/8 hover:text-foreground"
              >
                <XIcon size={14} />
              </Button>
            </div>

            <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 py-5 text-sm">
              <Field label="Email">
                <a href={`mailto:${viewing.email}`} className="text-primary hover:underline">
                  {viewing.email}
                </a>
              </Field>
              {viewing.phone && (
                <Field label="Điện thoại">
                  <a href={`tel:${viewing.phone}`} className="text-primary hover:underline">
                    {viewing.phone}
                  </a>
                </Field>
              )}
              <Field label="Dịch vụ quan tâm">
                {viewing.serviceName || <span className="text-foreground/30">—</span>}
              </Field>
              <Field label="Thời gian">{formatDate(viewing.createdAt)}</Field>
              <Field label="Tin nhắn">
                <p className="text-foreground/80 whitespace-pre-line">{viewing.message}</p>
              </Field>
            </div>

            <div className="border-foreground/8 flex items-center justify-between gap-3 border-t px-5 py-4">
              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmDelete(viewing);
                  setDeleteError(null);
                }}
                className="border border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/60 hover:bg-red-500/20"
              >
                <TrashIcon size={13} />
                Xoá
              </Button>
              <Button asChild className="bg-primary text-black hover:opacity-80">
                <a href={`mailto:${viewing.email}`}>Trả lời qua email</a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá tin nhắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Tin nhắn từ "<span className="text-foreground/80">{confirmDelete?.name}</span>" sẽ được
              chuyển vào Thùng rác. Bạn vẫn khôi phục lại được ở mục Thùng rác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Đang xoá…" : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Bản rút gọn cho trang Tổng quan: 5 liên hệ mới nhất, không có cột tin nhắn và
 * không có nút xoá — bấm một dòng là sang trang Liên hệ để xử lý. Dòng chưa xem
 * được đánh dấu "Mới".
 */
export function InquiriesPreview({
  data,
  loading,
  seenAt,
  onOpenAll,
}: {
  data: ApiInquiry[] | null;
  loading: boolean;
  seenAt: number;
  onOpenAll: () => void;
}) {
  if (loading) return <TableSkeleton cols={4} rows={3} />;

  const rows = (data ?? []).slice(0, 5);
  if (rows.length === 0) {
    return (
      <div className="border-foreground/8 text-foreground/30 rounded-xl border border-dashed py-10 text-center text-sm">
        Chưa có liên hệ nào.
      </div>
    );
  }

  return (
    <div className="border-foreground/8 overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {["Họ và tên", "Liên hệ", "Dịch vụ", "Thời gian"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id} className="cursor-pointer" onClick={onOpenAll}>
              <TableCell className="text-foreground text-xs font-medium">
                <span className="inline-flex items-center gap-2">
                  {c.name}
                  {isUnseenInquiry(c, seenAt) && (
                    <Badge className="border-primary/30 bg-primary/15 text-primary border px-1.5 py-0 text-[9px]">
                      Mới
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-foreground/60 text-xs">
                <span className="inline-flex items-center gap-1">
                  <EnvelopeSimpleIcon size={11} className="shrink-0" />
                  {c.email}
                </span>
              </TableCell>
              <TableCell>
                {c.serviceName ? (
                  <Badge
                    variant="outline"
                    className="border-foreground/10 bg-foreground/5 text-foreground/60"
                  >
                    {c.serviceName}
                  </Badge>
                ) : (
                  <span className="text-foreground/25 text-xs">—</span>
                )}
              </TableCell>
              <TableCell className="text-foreground/40 text-xs whitespace-nowrap">
                {formatDate(c.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-foreground/35 text-[10px] font-medium tracking-wider uppercase">
        {label}
      </span>
      <div className="text-foreground/70">{children}</div>
    </div>
  );
}
