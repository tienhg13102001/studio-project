import { useMemo, useState } from "react";
import { ArrowCounterClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import { apiDelete, apiPost, invalidateApiCache, resolveAssetUrl } from "#lib/api";
import type { ApiTrash, ApiTrashItem } from "#lib/apiTypes";
import { INQUIRIES_CHANGED_EVENT } from "#hooks/useInquiries";
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
import { Skeleton } from "#components/ui/skeleton";

/**
 * Khôi phục xong phải xoá bộ nhớ đệm của chính danh sách đó, nếu không người
 * dùng bấm sang tab Dự án vẫn thấy dữ liệu cũ và tưởng khôi phục hỏng.
 */
const CACHE_TO_CLEAR: Record<string, string[]> = {
  projects: ["/api/projects", "/api/projects/photos", "/api/services?limit=100"],
  services: ["/api/services?limit=100", "/api/projects/photos"],
  brands: ["/api/brands"],
  portfolio: ["/api/portfolio"],
  inquiries: ["/api/contact/inquiries"],
};

/** "còn 27 ngày" — đếm ngược tới lúc cơ sở dữ liệu tự dọn hẳn. */
function daysLeft(purgeAt: string): number {
  const ms = new Date(purgeAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

function formatDeletedAt(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type TabProps = { data: ApiTrash | null; loading: boolean; onRefetch: () => void };

export default function TrashTab({ data, loading, onRefetch }: TabProps) {
  const [filter, setFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmPurge, setConfirmPurge] = useState<ApiTrashItem | null>(null);
  const [purging, setPurging] = useState(false);
  const { toast } = usePortalToast();

  const items = useMemo(() => data?.items ?? [], [data]);
  const ttlDays = data?.ttlDays ?? 30;

  /** Số mục theo từng loại, để hiện lên các nút lọc. */
  const counts = useMemo(() => {
    const map = new Map<string, { label: string; n: number }>();
    for (const it of items) {
      const cur = map.get(it.type);
      map.set(it.type, { label: it.typeLabel, n: (cur?.n ?? 0) + 1 });
    }
    return [...map.entries()];
  }, [items]);

  const shown = filter === "all" ? items : items.filter((i) => i.type === filter);

  /** Báo cho các màn khác biết dữ liệu vừa đổi. */
  const notifyChanged = (type: string) => {
    for (const path of CACHE_TO_CLEAR[type] ?? []) invalidateApiCache(path);
    if (type === "inquiries") window.dispatchEvent(new Event(INQUIRIES_CHANGED_EVENT));
  };

  const handleRestore = async (item: ApiTrashItem) => {
    setBusyId(item.id);
    try {
      await apiPost(`/api/trash/${item.type}/${item.id}/restore`, {});
      notifyChanged(item.type);
      onRefetch();
      toast(`Đã khôi phục "${item.title}"`, "ok");
    } catch (e) {
      toast("Không khôi phục được: " + (e as Error).message, "err");
    } finally {
      setBusyId(null);
    }
  };

  const handlePurge = async () => {
    if (!confirmPurge) return;
    setPurging(true);
    try {
      await apiDelete(`/api/trash/${confirmPurge.type}/${confirmPurge.id}`);
      notifyChanged(confirmPurge.type);
      onRefetch();
      toast("Đã xoá vĩnh viễn", "ok");
      setConfirmPurge(null);
    } catch (e) {
      toast("Không xoá được: " + (e as Error).message, "err");
    } finally {
      setPurging(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Thùng rác</h2>
          <p className="text-foreground/40 text-xs">
            Mục đã xoá được giữ {ttlDays} ngày trước khi mất hẳn.
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="Tất cả"
              n={items.length}
            />
            {counts.map(([type, { label, n }]) => (
              <FilterChip
                key={type}
                active={filter === type}
                onClick={() => setFilter(type)}
                label={label}
                n={n}
              />
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="border-foreground/8 h-20 rounded-xl border" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="border-foreground/8 bg-foreground/3 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center">
          <TrashIcon size={26} className="text-foreground/20" weight="duotone" />
          <p className="text-foreground/50 text-sm">Thùng rác trống</p>
          <p className="text-foreground/30 max-w-xs text-xs">
            Mọi thứ bị xoá trong portal sẽ nằm ở đây {ttlDays} ngày, đủ thời gian để lấy lại nếu lỡ
            tay.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((item) => {
            const left = daysLeft(item.purgeAt);
            const busy = busyId === item.id;
            return (
              <div
                key={`${item.type}-${item.id}`}
                className="border-foreground/8 bg-foreground/3 hover:border-primary/25 flex items-center gap-3 rounded-xl border p-3 transition-colors"
              >
                {item.image ? (
                  <img
                    src={resolveAssetUrl(item.image)}
                    alt=""
                    className="border-foreground/8 h-12 w-12 shrink-0 rounded-lg border object-cover opacity-60"
                  />
                ) : (
                  <div className="border-foreground/8 bg-foreground/5 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border">
                    <TrashIcon size={16} className="text-foreground/25" weight="duotone" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-foreground/85 truncate text-sm font-medium">{item.title}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {item.typeLabel}
                    </Badge>
                  </div>
                  {item.subtitle && (
                    <p className="text-foreground/35 truncate text-xs">{item.subtitle}</p>
                  )}
                  <p className="text-foreground/30 mt-0.5 text-[11px]">
                    Xoá lúc {formatDeletedAt(item.deletedAt)} ·{" "}
                    <span className={left <= 3 ? "text-red-400" : ""}>
                      {left === 0 ? "sắp mất hẳn" : `còn ${left} ngày`}
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void handleRestore(item)}
                    className="hover:border-primary/40 hover:text-primary"
                  >
                    <ArrowCounterClockwiseIcon size={13} weight="bold" />
                    {busy ? "Đang khôi phục…" : "Khôi phục"}
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Xoá vĩnh viễn"
                    disabled={busy}
                    onClick={() => setConfirmPurge(item)}
                    className="text-foreground/35 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <TrashIcon size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!confirmPurge}
        onOpenChange={(open) => {
          if (!open) setConfirmPurge(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá vĩnh viễn?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{confirmPurge?.title}&rdquo; sẽ mất hẳn ngay bây giờ và không có cách nào lấy
              lại. Nếu chưa chắc, cứ để yên — hệ thống tự dọn khi hết hạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={purging}>Để yên</AlertDialogCancel>
            <AlertDialogAction
              disabled={purging}
              onClick={(e) => {
                // Giữ hộp thoại mở tới khi server trả lời, để lỗi còn hiện được.
                e.preventDefault();
                void handlePurge();
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {purging ? "Đang xoá…" : "Xoá vĩnh viễn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  n,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  n: number;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-foreground/10 text-foreground/45 hover:border-foreground/20 hover:text-foreground/70",
      ].join(" ")}
    >
      {label} <span className="opacity-60">{n}</span>
    </button>
  );
}
