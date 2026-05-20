import { useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { apiPut, resolveAssetUrl } from "#lib/api";
import type { ApiUser } from "#lib/apiTypes";
import { ROLE_COLOR } from "#lib/portal.types";
import { TableSkeleton } from "#components/ui/portal/TableSkeleton";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";

const inp =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors";
const sel =
  "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none transition-colors";
const lbl = "block text-xs font-medium text-white/50 mb-1.5";

// ─── TeamTable (also used by OverviewTab) ────────────────────────────────────

type TableProps = {
  data:     ApiUser[] | null;
  loading:  boolean;
  preview?: boolean;
  onEdit?:  (u: ApiUser) => void;
};

export function TeamTable({ data, loading, preview, onEdit }: TableProps) {
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
                  <button
                    onClick={() => onEdit(u)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/50 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <PencilSimpleIcon size={11} />
                    Edit
                  </button>
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
  roleEn:      string;
  roleVi:      string;
  photo:       string;
  skills:      string;
  order:       number;
  featured:    boolean;
  accountRole: "admin" | "member" | "editor";
};

function toForm(u: ApiUser): TeamForm {
  return {
    name:        u.name,
    roleEn:      u.role.en,
    roleVi:      u.role.vi,
    photo:       u.photo ?? "",
    skills:      u.skills.join(", "),
    order:       u.order,
    featured:    u.featured,
    accountRole: u.accountRole,
  };
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = { data: ApiUser[] | null; loading: boolean; onRefetch: () => void };

export default function TeamTab({ data, loading, onRefetch }: TabProps) {
  const [editing, setEditing] = useState<ApiUser | null>(null);
  const [form, setForm]       = useState<TeamForm | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const openEdit  = (u: ApiUser) => { setEditing(u); setForm(toForm(u)); setError(null); };
  const closeEdit = () => { setEditing(null); setForm(null); };

  const handleSave = async () => {
    if (!editing || !form) return;
    setSaving(true);
    setError(null);
    try {
      await apiPut(`/api/users/${editing.id}`, {
        name:        form.name,
        role:        { en: form.roleEn, vi: form.roleVi },
        photo:       form.photo || undefined,
        skills:      form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        order:       form.order,
        featured:    form.featured,
        accountRole: form.accountRole,
      });
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

  return (
    <>
      <h2 className="text-lg font-semibold text-white">Team Members</h2>
      <TeamTable data={data} loading={loading} onEdit={openEdit} />

      <EditModal
        title={`Edit — ${editing?.name ?? ""}`}
        isOpen={!!editing}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
      >
        {form && (
          <>
            <div>
              <label className={lbl}>Name</label>
              <input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Role (EN)</label>
                <input className={inp} value={form.roleEn} onChange={(e) => set("roleEn", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Role (VI)</label>
                <input className={inp} value={form.roleVi} onChange={(e) => set("roleVi", e.target.value)} />
              </div>
            </div>

            <div>
              <label className={lbl}>Photo URL</label>
              <ImageUpload value={form.photo} onChange={(path) => set("photo", path)} />
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Order</label>
                <input
                  className={inp}
                  type="number"
                  value={form.order}
                  onChange={(e) => set("order", Number(e.target.value))}
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

            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>
    </>
  );
}
