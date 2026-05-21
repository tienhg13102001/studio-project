import { useState } from "react";
import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { apiPost, apiPut, apiDelete } from "#lib/api";
import type { ApiProject, ApiService, ApiServiceTag } from "#lib/apiTypes";
import type { ProjectDisplay } from "#hooks/useProjects";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";
import { TableSkeleton } from "#components/ui/portal/TableSkeleton";

const inp =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors";
const sel =
  "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none transition-colors";
const lbl = "block text-xs font-medium text-white/50 mb-1.5";

const TAG_COLORS: Record<string, string> = {
  TVC: "bg-amber-500/15   text-amber-400   border-amber-500/30",
  SHORT: "bg-blue-500/15    text-blue-400    border-blue-500/30",
  "F&B": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  INTERVIEW: "bg-violet-500/15  text-violet-400  border-violet-500/30",
};

// ─── Edit form ───────────────────────────────────────────────────────────────

type ProjectForm = {
  title: string;
  subtitle: string;
  thumbnailImage: string;
  layout: "vertical" | "horizontal";
  prominent: boolean;
  service: string; // service ObjectId
};

function toForm(f: ApiProject): ProjectForm {
  const service =
    f.service && typeof f.service === "object"
      ? (f.service as ApiServiceTag).id
      : (f.service as string | undefined ?? "");
  return {
    title: f.title,
    subtitle: f.subtitle,
    thumbnailImage: f.thumbnailImage,
    layout: f.layout,
    prominent: f.prominent,
    service,
  };
}

function emptyProjectForm(): ProjectForm {
  return { title: "", subtitle: "", thumbnailImage: "", layout: "vertical", prominent: false, service: "" };
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
  const openCreate = () => { setCreating(true); setEditing(null); setForm(emptyProjectForm()); setError(null); };
  const closeEdit = () => { setEditing(null); setCreating(false); setForm(null); };

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

  if (loading) return <TableSkeleton cols={6} rows={5} />;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Projects</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-black transition-all hover:opacity-80"
        >
          <PlusIcon size={12} weight="bold" />
          Add project
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/8">
        <table className="w-full text-sm">
          <thead className="border-b border-white/8 bg-white/3">
            <tr>
              {["Project", "Tag", "Layout", "Prominent", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((p) => {
              const rawItem = (raw ?? []).find((r) => r.id === p.id);
              return (
              <tr key={p.id} className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/3">
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[p.tag] ?? "border-white/20 bg-white/10 text-white/60"}`}
                  >
                    {p.tag}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/60">{rawItem?.layout ?? "—"}</td>
                <td className="px-4 py-3">
                  {rawItem?.prominent ? (
                    <span className="text-[10px] text-primary">Yes</span>
                  ) : (
                    <span className="text-[10px] text-white/30">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(p.id)}
                      className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/50 transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <PencilSimpleIcon size={11} />
                      Edit
                    </button>
                    <button
                      onClick={() => { const r = (raw ?? []).find((x) => x.id === p.id); if (r) { setConfirmDelete(r); setDeleteError(null); } }}
                      className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/50 transition-colors hover:border-red-500/50 hover:text-red-400"
                      title="Delete project"
                    >
                      <TrashIcon size={11} />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EditModal
        title={creating ? "Add Project" : `Edit — ${editing?.title ?? "…"}`}
        isOpen={!!editing || creating}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
        onDelete={editing ? () => { setConfirmDelete(editing); setDeleteError(null); closeEdit(); } : undefined}
        deleting={deleting}
      >
        {form && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* ── Left: text + meta ─────────────────── */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className={lbl}>Title</label>
                  <input
                    className={inp}
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </div>
                <div>
                  <label className={lbl}>Subtitle</label>
                  <input
                    className={inp}
                    value={form.subtitle}
                    onChange={(e) => set("subtitle", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={lbl}>Layout</label>
                    <select
                      className={sel}
                      value={form.layout}
                      onChange={(e) => set("layout", e.target.value as ProjectForm["layout"])}
                    >
                      <option value="vertical">vertical</option>
                      <option value="horizontal">horizontal</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Service Tag</label>
                    <select
                      className={sel}
                      value={form.service}
                      onChange={(e) => set("service", e.target.value)}
                    >
                      {(services ?? []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.tag} — {s.title.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="prominent"
                    type="checkbox"
                    checked={form.prominent}
                    onChange={(e) => set("prominent", e.target.checked)}
                    className="accent-primary h-4 w-4"
                  />
                  <label htmlFor="prominent" className="text-sm text-white/60">
                    Prominent
                  </label>
                </div>
              </div>

              {/* ── Right: image ──────────────────────── */}
              <div>
                <label className={lbl}>Image</label>
                <ImageUpload value={form.thumbnailImage} onChange={(path) => set("thumbnailImage", path)} />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-2xl">
            <h3 className="mb-2 font-semibold text-white">Delete project?</h3>
            <p className="mb-5 text-sm text-white/50">
              “<span className="text-white/80">{confirmDelete.title}</span>” will be permanently deleted.
            </p>
            {deleteError && <p className="mb-3 text-xs text-red-400">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
