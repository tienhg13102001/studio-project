import { useState } from "react";
import { PencilSimpleIcon, TrashIcon, PlusIcon } from "@phosphor-icons/react";
import { apiPut, apiPost, apiDelete, resolveAssetUrl } from "#lib/api";
import type { ApiUser } from "#lib/apiTypes";
import { ROLE_COLOR } from "#lib/portal.types";
import { TableSkeleton } from "#components/ui/portal/TableSkeleton";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";
import AutoTextarea from "#components/ui/portal/AutoTextarea";

const inp =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors";
const sel =
  "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none transition-colors";
const lbl = "block text-xs font-medium text-white/50 mb-1.5";

// ─── TeamTable (also used by OverviewTab) ────────────────────────────────────

type TableProps = {
  data:      ApiUser[] | null;
  loading:   boolean;
  preview?:  boolean;
  onEdit?:   (u: ApiUser) => void;
  onDelete?: (u: ApiUser) => void;
};

export function TeamTable({ data, loading, preview, onEdit, onDelete }: TableProps) {
  const rows = preview ? (data ?? []).slice(0, 4) : (data ?? []);

  if (loading) return <TableSkeleton cols={onEdit ? 6 : 5} rows={4} />;

  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <table className="w-full text-sm">
        <thead className="border-b border-white/8 bg-white/3">
          <tr>
            {["Member", "Role", "Skills", "Account Role", "Status", ...(onEdit ? [""] : [])].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/3">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {u.photo ? (
                    <img src={resolveAssetUrl(u.photo)} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                      {u.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-white">{u.name}</p>
                    {u.featured && <p className="text-[10px] text-primary">Featured</p>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-white/60">{u.role.en}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {u.skills.slice(0, 2).map((s) => (
                    <span key={s} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                      {s}
                    </span>
                  ))}
                  {u.skills.length > 2 && (
                    <span className="text-[10px] text-white/30">+{u.skills.length - 2}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_COLOR[u.accountRole] ?? ""}`}>
                  {u.accountRole}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </td>
              {onEdit && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(u)}
                      className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/50 transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <PencilSimpleIcon size={11} />
                      Edit
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(u)}
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/50 transition-colors hover:border-red-500/50 hover:text-red-400"
                        title="Delete user"
                      >
                        <TrashIcon size={11} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Edit form ───────────────────────────────────────────────────────────────

type TeamForm = {
  name:        string;
  email:       string;
  password:    string;
  roleEn:      string;
  roleVi:      string;
  quoteEn:     string;
  quoteVi:     string;
  bioEn:       string;
  bioVi:       string;
  photo:       string;
  skills:      string;
  featured:    boolean;
  accountRole: "admin" | "member" | "editor";
};

function toForm(u: ApiUser): TeamForm {
  return {
    name:        u.name,
    email:       u.email ?? "",
    password:    "",
    roleEn:      u.role.en,
    roleVi:      u.role.vi,
    quoteEn:     u.quote?.en ?? "",
    quoteVi:     u.quote?.vi ?? "",
    bioEn:       u.bio?.en ?? "",
    bioVi:       u.bio?.vi ?? "",
    photo:       u.photo ?? "",
    skills:      u.skills.join(", "),
    featured:    u.featured,
    accountRole: u.accountRole,
  };
}

function emptyForm(): TeamForm {
  return {
    name: "", email: "", password: "",
    roleEn: "", roleVi: "",
    quoteEn: "", quoteVi: "",
    bioEn: "", bioVi: "",
    photo: "", skills: "",
    featured: false, accountRole: "member",
  };
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = { data: ApiUser[] | null; loading: boolean; onRefetch: () => void };

export default function TeamTab({ data, loading, onRefetch }: TabProps) {
  const [editing, setEditing] = useState<ApiUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm]       = useState<TeamForm | null>(null);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ApiUser | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openEdit   = (u: ApiUser) => { setEditing(u); setCreating(false); setForm(toForm(u)); setError(null); };
  const openCreate = () => { setCreating(true); setEditing(null); setForm(emptyForm()); setError(null); };
  const closeEdit  = () => { setEditing(null); setCreating(false); setForm(null); };

  const handleSave = async () => {
    if (!form) return;
    if (creating) {
      if (!form.name || !form.email || !form.password || !form.roleEn || !form.roleVi) {
        setError("Name, email, password and role (EN/VI) are required.");
        return;
      }
    } else if (!editing) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name:        form.name,
        email:       form.email,
        role:        { en: form.roleEn, vi: form.roleVi },
        quote:       form.quoteEn || form.quoteVi ? { en: form.quoteEn, vi: form.quoteVi } : undefined,
        bio:         form.bioEn   || form.bioVi   ? { en: form.bioEn,   vi: form.bioVi   } : undefined,
        photo:       form.photo || undefined,
        skills:      form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        featured:    form.featured,
        accountRole: form.accountRole,
      };
      if (creating) {
        await apiPost(`/api/users`, { ...payload, password: form.password });
      } else if (editing) {
        await apiPut(`/api/users/${editing.id}`, payload);
      }
      onRefetch();
      closeEdit();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof TeamForm, v: unknown) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDelete(`/api/users/${confirmDelete.id}`);
      onRefetch();
      setConfirmDelete(null);
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Team Members</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-black transition-all hover:opacity-80"
        >
          <PlusIcon size={12} weight="bold" />
          Add member
        </button>
      </div>
      <TeamTable data={data} loading={loading} onEdit={openEdit} onDelete={(u) => { setConfirmDelete(u); setDeleteError(null); }} />

      <EditModal
        title={creating ? "Add member" : `Edit — ${editing?.name ?? ""}`}
        isOpen={!!editing || creating}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
      >
        {form && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]">
              {/* ── Left: text fields ─────────────────── */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Name</label>
                    <input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Email</label>
                    <input className={inp} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                </div>
                {creating && (
                  <div>
                    <label className={lbl}>Password</label>
                    <input
                      className={inp}
                      type="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Role in team (EN)</label>
                    <input className={inp} value={form.roleEn} onChange={(e) => set("roleEn", e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Role in team (VI)</label>
                    <input className={inp} value={form.roleVi} onChange={(e) => set("roleVi", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Quote (EN)</label>
                    <input className={inp} value={form.quoteEn} onChange={(e) => set("quoteEn", e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Quote (VI)</label>
                    <input className={inp} value={form.quoteVi} onChange={(e) => set("quoteVi", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Bio (EN)</label>
                    <AutoTextarea className={inp} value={form.bioEn} onChange={(e) => set("bioEn", e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Bio (VI)</label>
                    <AutoTextarea className={inp} value={form.bioVi} onChange={(e) => set("bioVi", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Skills (comma-separated)</label>
                  <input
                    className={inp}
                    placeholder="React, TypeScript, …"
                    value={form.skills}
                    onChange={(e) => set("skills", e.target.value)}
                  />
                </div>
                <div>
                  <label className={lbl}>Account Role</label>
                  <select
                    className={sel}
                    value={form.accountRole}
                    onChange={(e) => set("accountRole", e.target.value as TeamForm["accountRole"])}
                  >
                    <option value="admin">admin</option>
                    <option value="member">member</option>
                    <option value="editor">editor</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="team-featured"
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <label htmlFor="team-featured" className="text-sm text-white/60">
                    Featured member
                  </label>
                </div>
              </div>

              {/* ── Right: photo ──────────────────────── */}
              <div>
                <label className={lbl}>Photo</label>
                <ImageUpload value={form.photo} onChange={(path) => set("photo", path)} />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#161616] shadow-2xl">
            <div className="border-b border-white/8 px-6 py-4">
              <h3 className="font-semibold text-white">Delete user</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-white/70">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">{confirmDelete.name}</span>? This action
                cannot be undone.
              </p>
              {deleteError && <p className="mt-3 text-xs text-red-400">{deleteError}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-white/8 px-6 py-4">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
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
