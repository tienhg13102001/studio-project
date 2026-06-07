import { useState } from "react";
import { PencilSimpleIcon, TrashIcon, PlusIcon, KeyIcon } from "@phosphor-icons/react";
import { apiPut, apiPost, apiDelete, resolveAssetUrl } from "#lib/api";
import type { ApiUser } from "#lib/apiTypes";
import { ROLE_COLOR, type PortalUser } from "#lib/portal.types";
import { TableSkeleton } from "#components/ui/portal/TableSkeleton";
import EditModal from "#components/ui/portal/EditModal";
import ImageUpload from "#components/ui/portal/ImageUpload";
import AutoTextarea from "#components/ui/portal/AutoTextarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "#components/ui/alert-dialog";
import { Badge } from "#components/ui/badge";
import { Button } from "#components/ui/button";
import { Checkbox } from "#components/ui/checkbox";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui/table";

// ─── ROLE_COLOR badge variant mapping ─────────────────────────────────────────
// ROLE_COLOR from portal.types is used as className string still for TeamTable badge

// ─── TeamTable (also used by OverviewTab) ────────────────────────────────────

type TableProps = {
  data:      ApiUser[] | null;
  loading:   boolean;
  preview?:  boolean;
  onEdit?:   (u: ApiUser) => void;
  onDelete?: (u: ApiUser) => void;
  onChangePassword?:  (u: ApiUser) => void;
  canChangePassword?: (u: ApiUser) => boolean;
};

export function TeamTable({ data, loading, preview, onEdit, onDelete, onChangePassword, canChangePassword }: TableProps) {
  const rows = preview ? (data ?? []).slice(0, 4) : (data ?? []);

  if (loading) return <TableSkeleton cols={onEdit ? 6 : 5} rows={4} />;

  return (
    <div className="overflow-hidden rounded-xl border border-foreground/8">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {["Member", "Role", "Skills", "Account Role", "Status", ...(onEdit ? [""] : [])].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {u.photo ? (
                    <img src={resolveAssetUrl(u.photo)} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                      {u.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-foreground">{u.name}</p>
                    {u.featured && <p className="text-[10px] text-primary">Featured</p>}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-xs text-foreground/60">{u.role.en}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {u.skills.slice(0, 2).map((s) => (
                    <Badge key={s} variant="default" className="text-[10px]">{s}</Badge>
                  ))}
                  {u.skills.length > 2 && (
                    <span className="text-[10px] text-foreground/30">+{u.skills.length - 2}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_COLOR[u.accountRole] ?? ""}`}>
                  {u.accountRole}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </TableCell>
              {onEdit && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onEdit(u)}
                      className="border-foreground/10 text-foreground/50 hover:border-primary/40 hover:text-primary"
                    >
                      <PencilSimpleIcon size={11} />
                      Edit
                    </Button>
                    {onChangePassword && (!canChangePassword || canChangePassword(u)) && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onChangePassword(u)}
                        className="border border-foreground/10 text-foreground/50 hover:border-primary/40 hover:text-primary"
                        title="Change password"
                      >
                        <KeyIcon size={11} />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onDelete(u)}
                        className="border border-foreground/10 text-foreground/50 hover:border-red-500/50 hover:text-red-400"
                        title="Delete user"
                      >
                        <TrashIcon size={11} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Edit form ───────────────────────────────────────────────────────────────

// Reads the currently logged-in portal user (same store PortalLayout uses).
function readCurrentUser(): PortalUser | null {
  try {
    const raw = localStorage.getItem("portal_user");
    return raw ? (JSON.parse(raw) as PortalUser) : null;
  } catch {
    return null;
  }
}

type TeamForm = {
  name:        string;
  email:       string;
  password:    string; // create flow only
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

// ─── Password-change form ─────────────────────────────────────────────────────

type PwForm = {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
};

const emptyPwForm = (): PwForm => ({ currentPassword: "", newPassword: "", confirmPassword: "" });

// ─── Tab ─────────────────────────────────────────────────────────────────────

type TabProps = { data: ApiUser[] | null; loading: boolean; onRefetch: () => void };

export default function TeamTab({ data, loading, onRefetch }: TabProps) {
  const [currentUser] = useState<PortalUser | null>(() => readCurrentUser());
  const [editing, setEditing] = useState<ApiUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm]       = useState<TeamForm | null>(null);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ApiUser | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Password-change modal state ──
  const [pwUser, setPwUser]   = useState<ApiUser | null>(null);
  const [pwForm, setPwForm]   = useState<PwForm>(emptyPwForm);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const isAdmin = currentUser?.accountRole === "admin";
  // Admin can change anyone's password; a normal user only their own.
  const allowPasswordChange = (u: ApiUser) => isAdmin || currentUser?.id === u.id;
  const pwIsSelf = !!pwUser && currentUser?.id === pwUser.id;

  const openEdit   = (u: ApiUser) => { setEditing(u); setCreating(false); setForm(toForm(u)); setError(null); };
  const openCreate = () => { setCreating(true); setEditing(null); setForm(emptyForm()); setError(null); };
  const closeEdit  = () => { setEditing(null); setCreating(false); setForm(null); };

  const openPassword  = (u: ApiUser) => { setPwUser(u); setPwForm(emptyPwForm()); setPwError(null); };
  const closePassword = () => { setPwUser(null); setPwForm(emptyPwForm()); setPwError(null); };
  const setPw = (k: keyof PwForm, v: string) => setPwForm((f) => ({ ...f, [k]: v }));

  const handleChangePassword = async () => {
    if (!pwUser) return;
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    if (pwIsSelf && !pwForm.currentPassword) {
      setPwError("Please enter your current password.");
      return;
    }
    setPwSaving(true);
    setPwError(null);
    try {
      await apiPut(`/api/users/${pwUser.id}/password`, {
        actorId:         currentUser?.id,
        newPassword:     pwForm.newPassword,
        currentPassword: pwIsSelf ? pwForm.currentPassword : undefined,
      });
      closePassword();
    } catch (e) {
      setPwError((e as Error).message);
    } finally {
      setPwSaving(false);
    }
  };

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
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
        <Button size="sm" onClick={openCreate} className="bg-primary text-black hover:opacity-80">
          <PlusIcon size={12} weight="bold" />
          Add member
        </Button>
      </div>

      <TeamTable
        data={data}
        loading={loading}
        onEdit={openEdit}
        onDelete={(u) => { setConfirmDelete(u); setDeleteError(null); }}
        onChangePassword={openPassword}
        canChangePassword={allowPasswordChange}
      />

      {/* ── Edit Modal ── */}
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
              {/* ── Left: text fields ───────────────── */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                </div>
                {creating && (
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Role in team (EN)</Label>
                    <Input value={form.roleEn} onChange={(e) => set("roleEn", e.target.value)} />
                  </div>
                  <div>
                    <Label>Role in team (VI)</Label>
                    <Input value={form.roleVi} onChange={(e) => set("roleVi", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Quote (EN)</Label>
                    <Input value={form.quoteEn} onChange={(e) => set("quoteEn", e.target.value)} />
                  </div>
                  <div>
                    <Label>Quote (VI)</Label>
                    <Input value={form.quoteVi} onChange={(e) => set("quoteVi", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Bio (EN)</Label>
                    <AutoTextarea value={form.bioEn} onChange={(e) => set("bioEn", e.target.value)} />
                  </div>
                  <div>
                    <Label>Bio (VI)</Label>
                    <AutoTextarea value={form.bioVi} onChange={(e) => set("bioVi", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    placeholder="React, TypeScript, …"
                    value={form.skills}
                    onChange={(e) => set("skills", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Account Role</Label>
                  <Select
                    value={form.accountRole}
                    onValueChange={(v) => set("accountRole", v as TeamForm["accountRole"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="team-featured"
                    checked={form.featured}
                    onCheckedChange={(checked) => set("featured", !!checked)}
                  />
                  <label htmlFor="team-featured" className="text-sm text-foreground/60 cursor-pointer">
                    Featured member
                  </label>
                </div>
              </div>

              {/* ── Right: photo ────────────────── */}
              <div>
                <Label>Photo</Label>
                <ImageUpload value={form.photo} onChange={(path) => set("photo", path)} />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </EditModal>

      {/* ── Change Password Modal ── */}
      <EditModal
        title={pwIsSelf ? "Change your password" : `Change password — ${pwUser?.name ?? ""}`}
        isOpen={!!pwUser}
        onClose={closePassword}
        onSubmit={handleChangePassword}
        saving={pwSaving}
      >
        {pwUser && (
          <div className="flex max-w-md flex-col gap-4">
            {pwIsSelf && (
              <div>
                <Label>Current password</Label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPw("currentPassword", e.target.value)}
                />
              </div>
            )}
            <div>
              <Label>New password</Label>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={pwForm.newPassword}
                onChange={(e) => setPw("newPassword", e.target.value)}
              />
            </div>
            <div>
              <Label>Confirm new password</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPw("confirmPassword", e.target.value)}
              />
            </div>
            {pwError && <p className="text-xs text-red-400">{pwError}</p>}
          </div>
        )}
      </EditModal>

      {/* ── Confirm Delete Dialog ── */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{confirmDelete?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
