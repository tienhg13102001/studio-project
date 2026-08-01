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
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";
import { Skeleton } from "#components/ui/skeleton";
import { apiDelete, apiPost, apiPut, resolveAssetUrl } from "#lib/api";
import type { ApiPortfolioItem } from "#lib/apiTypes";
import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useDragSort } from "#hooks/useDragSort";
import { usePortalToast } from "#components/organisms/portal/PortalToast";

// ─── Edit form ───────────────────────────────────────────────────────────────

type PortfolioForm = { image: string; title: string; order: number };

function toForm(p: ApiPortfolioItem): PortfolioForm {
  return { image: p.image, title: p.title, order: p.order };
}

function emptyPortfolioForm(order: number): PortfolioForm {
  return { image: "", title: "", order };
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = { data: ApiPortfolioItem[] | null; loading: boolean; onRefetch: () => void };

export default function PortfolioTab({ data, loading, onRefetch }: TabProps) {
  const { toast } = usePortalToast();
  const [editing, setEditing] = useState<ApiPortfolioItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm]       = useState<PortfolioForm | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiPortfolioItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openEdit = (p: ApiPortfolioItem) => { setEditing(p); setCreating(false); setForm(toForm(p)); setError(null); };
  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyPortfolioForm(data?.length ?? 0));
    setError(null);
  };
  const closeEdit = () => { setEditing(null); setCreating(false); setForm(null); };

  const handleSave = async () => {
    if (!form) return;
    if (!creating && !editing) return;
    if (!form.image) { setError("Vui lòng chọn ảnh"); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = { image: form.image, title: form.title, order: form.order };
      if (creating) {
        await apiPost(`/api/portfolio`, payload);
      } else {
        await apiPut(`/api/portfolio/${editing!.id}`, payload);
      }
      onRefetch();
      closeEdit();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDelete(`/api/portfolio/${confirmDelete.id}`);
      onRefetch();
      setConfirmDelete(null);
      closeEdit();
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const set = (k: keyof PortfolioForm, v: unknown) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  // Kéo thả đổi thứ tự ảnh. Thứ tự áp ngay trên màn hình rồi mới gửi lên máy
  // chủ; lỗi thì trả lại đúng thứ tự cũ.
  const { order: items, savingOrder, dragProps } = useDragSort(data ?? [], {
    type: "portfolio",
    onSaved: onRefetch,
    onError: (m) => toast("Không lưu được thứ tự: " + m, "err"),
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Portfolio</h2>
          <p className="text-foreground/40 text-xs">
            {savingOrder ? "Đang lưu thứ tự…" : "Kéo thả một ảnh để đổi thứ tự hiển thị."}
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-primary text-black hover:opacity-80">
          <PlusIcon size={12} weight="bold" />
          Add image
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl border border-foreground/8" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-foreground/40">
          Chưa có ảnh nào. Nhấn “Add image” để thêm.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <div
              key={p.id}
              {...dragProps(p.id)}
              className="group relative cursor-grab overflow-hidden rounded-xl border border-foreground/8 bg-foreground/3 active:cursor-grabbing"
            >
              <img
                src={resolveAssetUrl(p.image)}
                alt={p.title || "Portfolio"}
                className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.03]"
              />
              <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
                #{p.order}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => openEdit(p)}
                className="absolute right-1.5 top-1.5 border border-foreground/10 bg-background text-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:border-primary/30 hover:text-primary"
              >
                <PencilSimpleIcon size={10} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <EditModal
        title={creating ? "Add Image" : `Edit — ${editing?.title || "Portfolio"}`}
        isOpen={!!editing || creating}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
        onDelete={
          editing
            ? () => {
                setConfirmDelete(editing);
                setDeleteError(null);
                closeEdit();
              }
            : undefined
        }
        deleting={deleting}
      >
        {form && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* ── Left ──────────────────────────────── */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Caption (tùy chọn)</Label>
                  <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) => set("order", Number(e.target.value))}
                  />
                  <p className="mt-1 text-[10px] text-foreground/30">
                    Số nhỏ hiển thị trước.
                  </p>
                </div>
              </div>

              {/* ── Right: image ──────────────────────── */}
              <div>
                <Label>Image</Label>
                <ImageUpload value={form.image} onChange={(path) => set("image", path)} />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>

      {/* ── Confirm Delete Dialog ── */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá ảnh?</AlertDialogTitle>
            <AlertDialogDescription>
              Ảnh này sẽ được chuyển vào Thùng rác. Bạn vẫn khôi phục lại được ở mục Thùng rác.
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
