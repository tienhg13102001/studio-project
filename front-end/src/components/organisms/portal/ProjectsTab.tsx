import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";
import ImagesUpload from "#components/ui/portal/ImagesUpload";
import { TableSkeleton } from "#components/ui/portal/TableSkeleton";
import VideoUpload from "#components/ui/portal/VideoUpload";
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
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
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
import type { ApiProject, ApiService, ApiServiceTag } from "#lib/apiTypes";
import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";

const TAG_VARIANT: Record<string, "amber" | "blue" | "emerald" | "violet"> = {
  TVC: "amber",
  SHORT: "blue",
  "F&B": "emerald",
  INTERVIEW: "violet",
};

// ─── Edit form ───────────────────────────────────────────────────────────────

type ProjectForm = {
  title: string;
  subtitle: string;
  thumbnailImage: string;
  layout: "vertical" | "horizontal";
  prominent: boolean;
  service: string;
  video: string;
  photos: string[];
};

function toForm(f: ApiProject): ProjectForm {
  const service =
    f.service && typeof f.service === "object"
      ? (f.service as ApiServiceTag).id
      : ((f.service as string | undefined) ?? "");
  return {
    title: f.title,
    subtitle: f.subtitle,
    thumbnailImage: f.thumbnailImage,
    layout: f.layout,
    prominent: f.prominent,
    service,
    video: f.video ?? "",
    photos: f.photos ?? [],
  };
}

function emptyProjectForm(): ProjectForm {
  return {
    title: "",
    subtitle: "",
    thumbnailImage: "",
    layout: "vertical",
    prominent: false,
    service: "",
    video: "",
    photos: [],
  };
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = {
  data: ProjectDisplay[];
  raw: ApiProject[] | null;
  services: ApiService[] | null;
  loading: boolean;
  onRefetch: () => void;
};

export default function ProjectsTab({ data, raw, services, loading, onRefetch }: TabProps) {
  const [editing, setEditing] = useState<ApiProject | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ProjectForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openEdit = (displayId: string) => {
    const rawItem = (raw ?? []).find((f) => f.id === displayId);
    if (!rawItem) return;
    setEditing(rawItem);
    setCreating(false);
    setForm(toForm(rawItem));
    setError(null);
  };
  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyProjectForm());
    setError(null);
  };
  const closeEdit = () => {
    setEditing(null);
    setCreating(false);
    setForm(null);
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
  console.log(data)

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Projects</h2>
        <Button size="sm" onClick={openCreate} className="bg-primary text-black hover:opacity-80">
          <PlusIcon size={12} weight="bold" />
          Add project
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-white/8">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {["Project", "Tag", "Layout", "Prominent", ""].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p) => {
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
                        <p className="line-clamp-1 text-xs font-medium text-white">{p.title}</p>
                        <p className="line-clamp-1 text-[10px] text-white/40">{p.subtitle}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={TAG_VARIANT[p.tag] ?? "default"}>{p.tag}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-white/60">{rawItem?.layout ?? "—"}</TableCell>
                  <TableCell>
                    {rawItem?.prominent ? (
                      <Badge variant="primary">Yes</Badge>
                    ) : (
                      <span className="text-[10px] text-white/30">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openEdit(p.id)}
                        className="hover:border-primary/40 hover:text-primary border-white/10 text-white/50"
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
                        className="border border-white/10 text-white/50 hover:border-red-500/50 hover:text-red-400"
                        title="Delete project"
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

      {/* ── Edit / Create Modal ── */}
      <EditModal
        title={creating ? "Add Project" : `Edit — ${editing?.title ?? "…"}`}
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
                  <Input
                    value={form.subtitle}
                    onChange={(e) => set("subtitle", e.target.value)}
                    placeholder="Short description"
                  />
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
                      <span className="text-xs text-white/50">Prominent</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Right: thumbnail + video + photos ── */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Thumbnail Image</Label>
                  <ImageUpload
                    value={form.thumbnailImage}
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
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              "<span className="text-white/80">{confirmDelete?.title}</span>" will be permanently
              deleted.
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
