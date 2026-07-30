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
import { Checkbox } from "#components/ui/checkbox";
import { DatePicker } from "#components/ui/date-picker";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "#components/ui/popover";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";
import ImagesUpload from "#components/ui/portal/ImagesUpload";
import { TableSkeleton } from "#components/ui/portal/TableSkeleton";
import VideoUpload from "#components/ui/portal/VideoUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import type { ProjectDisplay } from "#hooks/useProjects";
import { apiDelete, apiPost, apiPut } from "#lib/api";
import type { ApiProject, ApiService, ApiServiceTag, ApiUser } from "#lib/apiTypes";
import { normalizeVi } from "#lib/utils";
import {
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";

// ─── Edit form ───────────────────────────────────────────────────────────────

type ProjectForm = {
  title: string;
  subtitle: { en: string; vi: string };
  thumbnailImage: string;
  layout: "vertical" | "horizontal";
  prominent: boolean;
  service: string;
  video: string;
  photos: string[];
  shootDate: string;
  shootLocation: string;
  members: string[];
};

function toForm(f: ApiProject): ProjectForm {
  const service =
    f.service && typeof f.service === "object"
      ? (f.service as ApiServiceTag).id
      : ((f.service as string | undefined) ?? "");
  const sub = f.subtitle as { en?: string; vi?: string } | string | undefined;
  return {
    title: f.title,
    subtitle:
      typeof sub === "string" ? { en: sub, vi: sub } : { en: sub?.en ?? "", vi: sub?.vi ?? "" },
    thumbnailImage: f.thumbnailImage,
    layout: f.layout,
    prominent: f.prominent,
    service,
    video: f.video ?? "",
    photos: f.photos ?? [],
    shootDate: f.shootDate ? f.shootDate.slice(0, 10) : "",
    shootLocation: f.shootLocation ?? "",
    members: f.members?.map((m) => m.id) ?? [],
  };
}

function emptyProjectForm(): ProjectForm {
  return {
    title: "",
    subtitle: { en: "", vi: "" },
    thumbnailImage: "",
    layout: "vertical",
    prominent: false,
    service: "",
    video: "",
    photos: [],
    shootDate: "",
    shootLocation: "",
    members: [],
  };
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = {
  data: ProjectDisplay[];
  raw: ApiProject[] | null;
  services: ApiService[] | null;
  users: ApiUser[] | null;
  loading: boolean;
  onRefetch: () => void;
};

export default function ProjectsTab({ data, raw, services, users, loading, onRefetch }: TabProps) {
  const [editing, setEditing] = useState<ApiProject | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ProjectForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Khai báo TRƯỚC early-return `if (loading)` bên dưới, nếu không React sẽ báo
  // "rendered fewer hooks than expected" ở lần render đang tải.
  const [query, setQuery] = useState("");
  // So sánh với ảnh chụp form lúc mới mở để biết CHÍNH XÁC là đã sửa hay chưa.
  // Cần thiết vì chọn ngày / chọn người thực hiện không phát sự kiện DOM nên
  // cách tự đoán của EditModal không thấy được.
  const baselineRef = useRef("");

  const openEdit = (displayId: string) => {
    const rawItem = (raw ?? []).find((f) => f.id === displayId);
    if (!rawItem) return;
    setEditing(rawItem);
    setCreating(false);
    const initial = toForm(rawItem);
    setForm(initial);
    baselineRef.current = JSON.stringify(initial);
    setError(null);
  };
  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    const initial = emptyProjectForm();
    setForm(initial);
    baselineRef.current = JSON.stringify(initial);
    setError(null);
  };
  const closeEdit = () => {
    setEditing(null);
    setCreating(false);
    setForm(null);
    baselineRef.current = "";
  };

  const handleSave = async () => {
    if (!form) return;
    if (!creating && !editing) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        thumbnailImage: form.thumbnailImage,
        layout: form.layout,
        prominent: form.prominent,
        service: form.service,
        video: form.video || undefined,
        photos: form.photos,
        shootDate: form.shootDate || undefined,
        shootLocation: form.shootLocation || undefined,
        members: form.members.map((s) => s.trim()).filter(Boolean),
      };
      if (creating) {
        await apiPost(`/api/projects`, payload);
      } else {
        await apiPut(`/api/projects/${editing!.id}`, payload);
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
      await apiDelete(`/api/projects/${confirmDelete.id}`);
      onRefetch();
      setConfirmDelete(null);
      closeEdit();
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const set = (k: keyof ProjectForm, v: unknown) => setForm((f) => (f ? { ...f, [k]: v } : f));

  if (loading) return <TableSkeleton cols={5} rows={5} />;

  const q = normalizeVi(query.trim());
  const visible = !q
    ? data
    : data.filter((p) =>
        [p.title, p.subtitle, p.tag].some((f) => normalizeVi(f ?? "").includes(q)),
      );

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-foreground text-lg font-semibold">Dự án</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <MagnifyingGlassIcon
              size={13}
              className="text-foreground/30 pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhanh…"
              aria-label="Tìm nhanh trong danh sách dự án"
              className="h-8 pl-7 text-xs"
            />
          </div>
          <Button size="sm" onClick={openCreate} className="bg-primary text-black hover:opacity-80">
            <PlusIcon size={12} weight="bold" />
            Thêm dự án
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      {q && visible.length === 0 ? (
        <div className="border-foreground/8 text-foreground/30 rounded-xl border border-dashed py-12 text-center text-sm">
          Không tìm thấy dự án nào khớp “{query}”.
        </div>
      ) : (
      <div className="border-foreground/8 overflow-hidden rounded-xl border">
        <Table containerClassName="max-h-[70vh]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {["Dự án", "Tag", "Kiểu", "Nổi bật", ""].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((p) => {
              const rawItem = (raw ?? []).find((r) => r.id === p.id);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnailImage}
                        alt={p.title}
                        className="h-10 w-16 shrink-0 rounded object-cover opacity-80"
                      />
                      <div className="min-w-0">
                        <p className="text-foreground line-clamp-1 text-xs font-medium">
                          {p.title}
                        </p>
                        <p className="text-foreground/40 line-clamp-1 text-[10px]">{p.subtitle}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={"default"}>{p.tag}</Badge>
                  </TableCell>
                  <TableCell className="text-foreground/60 text-xs">
                    {rawItem?.layout ?? "—"}
                  </TableCell>
                  <TableCell>
                    {rawItem?.prominent ? (
                      <Badge variant="primary">Yes</Badge>
                    ) : (
                      <span className="text-foreground/30 text-[10px]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openEdit(p.id)}
                        className="hover:border-primary/40 hover:text-primary border-foreground/10 text-foreground/50"
                      >
                        <PencilSimpleIcon size={11} />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          const r = (raw ?? []).find((x) => x.id === p.id);
                          if (r) {
                            setConfirmDelete(r);
                            setDeleteError(null);
                          }
                        }}
                        className="border-foreground/10 text-foreground/50 border hover:border-red-500/50 hover:text-red-400"
                        title="Xoá dự án"
                      >
                        <TrashIcon size={11} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      )}

      {/* ── Edit / Create Modal ── */}
      <EditModal
        title={creating ? "Thêm dự án" : `Sửa — ${editing?.title ?? "…"}`}
        isOpen={!!editing || creating}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
        dirty={!!form && JSON.stringify(form) !== baselineRef.current}
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
              {/* ── Left: text fields ── */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={form.subtitle.en}
                      onChange={(e) => set("subtitle", { ...form.subtitle, en: e.target.value })}
                      placeholder="English"
                    />
                    <Input
                      value={form.subtitle.vi}
                      onChange={(e) => set("subtitle", { ...form.subtitle, vi: e.target.value })}
                      placeholder="Tiếng Việt"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Shoot date</Label>
                    <DatePicker value={form.shootDate} onChange={(v) => set("shootDate", v)} />
                  </div>
                  <div>
                    <Label>Shoot location</Label>
                    <Input
                      value={form.shootLocation}
                      onChange={(e) => set("shootLocation", e.target.value)}
                      placeholder="Hà Nội"
                    />
                  </div>
                </div>
                <div>
                  <Label>Người thực hiện</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-full justify-start font-normal"
                      >
                        {form.members.length > 0 ? (
                          `${form.members.length} thành viên`
                        ) : (
                          <span className="text-foreground/40">Chọn thành viên</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-64 w-(--radix-popover-trigger-width) overflow-y-auto p-2">
                      {(users ?? []).length === 0 ? (
                        <p className="text-foreground/40 px-2 py-1.5 text-xs">
                          Chưa có thành viên nào
                        </p>
                      ) : (
                        (users ?? []).map((u) => {
                          const checked = form.members.includes(u.id);
                          return (
                            <label
                              key={u.id}
                              className="hover:bg-foreground/5 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(c) =>
                                  set(
                                    "members",
                                    c
                                      ? [...form.members, u.id]
                                      : form.members.filter((id) => id !== u.id),
                                  )
                                }
                              />
                              <span className="text-foreground/80 text-sm">{u.name}</span>
                            </label>
                          );
                        })
                      )}
                    </PopoverContent>
                  </Popover>

                  {form.members.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {form.members.map((id) => {
                        const u = (users ?? []).find((x) => x.id === id);
                        return (
                          <span
                            key={id}
                            className="bg-foreground/10 text-foreground/80 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                          >
                            {u?.name ?? id}
                            <button
                              type="button"
                              onClick={() =>
                                set(
                                  "members",
                                  form.members.filter((m) => m !== id),
                                )
                              }
                              className="text-foreground/40 hover:text-foreground"
                            >
                              <XIcon size={10} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Service</Label>
                  <Select value={form.service} onValueChange={(v) => set("service", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="— Select service —" />
                    </SelectTrigger>
                    <SelectContent>
                      {(services ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.title.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Layout</Label>
                    <Select
                      value={form.layout}
                      onValueChange={(v) => set("layout", v as "vertical" | "horizontal")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vertical">Vertical</SelectItem>
                        <SelectItem value="horizontal">Horizontal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col justify-end pb-1">
                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={form.prominent}
                        onCheckedChange={(checked) => set("prominent", !!checked)}
                      />
                      <span className="text-foreground/50 text-xs">Nổi bật</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Right: thumbnail + video + photos ── */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Thumbnail Image</Label>
                  <ImageUpload
                    value={
                      form.thumbnailImage ||
                      (creating && form.layout === "vertical"
                        ? "https://beezvn.com/api/public/uploads/LOGO_BEEZ-PRODUCTION-01-20260619_031721.webp"
                        : "https://beezvn.com/api/public/uploads/LOGO_BEEZ-PRODUCTION-01-1-20260619_031737.webp")
                    }
                    onChange={(path) => set("thumbnailImage", path)}
                  />
                </div>
                <div>
                  <Label>Video (optional)</Label>
                  <VideoUpload value={form.video} onChange={(v) => set("video", v)} />
                </div>
                <div>
                  <Label>Product Photos (optional)</Label>
                  <ImagesUpload value={form.photos} onChange={(v) => set("photos", v)} />
                </div>
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
            <AlertDialogTitle>Xoá dự án?</AlertDialogTitle>
            <AlertDialogDescription>
              "<span className="text-foreground/80">{confirmDelete?.title}</span>" will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
