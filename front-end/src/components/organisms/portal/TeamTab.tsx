import { useRef, useState } from "react";
import {
  PencilSimpleIcon,
  TrashIcon,
  PlusIcon,
  KeyIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { apiPut, apiPost, apiDelete, resolveAssetUrl } from "#lib/api";
import type { ApiUser } from "#lib/apiTypes";
import { ROLE_COLOR, ROLE_LABEL, type PortalUser } from "#lib/portal.types";
import { normalizeVi } from "#lib/utils";
import { usePortalToast } from "#components/organisms/portal/PortalToast";
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
  /**
   * Dòng nào được phép bấm Sửa. Không truyền = ai cũng sửa được.
   * Nhân viên chỉ sửa được hồ sơ của chính mình, nên nút Sửa ở dòng người khác
   * phải biến mất — để đó thì bấm vào chỉ nhận lỗi "không có quyền".
   */
  canEdit?: (u: ApiUser) => boolean;
};

export function TeamTable({ data, loading, preview, onEdit, onDelete, onChangePassword, canChangePassword, canEdit }: TableProps) {
  const rows = preview ? (data ?? []).slice(0, 4) : (data ?? []);

  if (loading) return <TableSkeleton cols={onEdit ? 6 : 5} rows={4} />;

  return (
    // `bang-the`: dưới 640px bảng đổi thành thẻ xếp dọc — xem index.css.
    <div className="bang-the overflow-hidden rounded-xl border border-foreground/8">
      {/* Bản preview trên Tổng quan chỉ 4 dòng nên không cần giới hạn chiều cao. */}
      <Table containerClassName={preview ? undefined : "max-h-[70vh]"}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {["Thành viên", "Vai trò", "Kỹ năng", "Quyền", "Trạng thái", ...(onEdit ? [""] : [])].map((h) => (
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
                    {u.featured && <p className="text-[10px] text-primary">Nổi bật</p>}
                  </div>
                </div>
              </TableCell>
              <TableCell data-label="Vai trò" className="text-xs text-foreground/60">{u.role.en}</TableCell>
              <TableCell data-label="Kỹ năng">
                <div className="flex flex-wrap gap-1">
                  {u.skills.slice(0, 2).map((s) => (
                    <Badge key={s} variant="default" className="text-[10px]">{s}</Badge>
                  ))}
                  {u.skills.length > 2 && (
                    <span className="text-[10px] text-foreground/30">+{u.skills.length - 2}</span>
                  )}
                </div>
              </TableCell>
              <TableCell data-label="Quyền">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_COLOR[u.accountRole ?? "member"] ?? ""}`}>
                  {ROLE_LABEL[u.accountRole ?? "member"] ?? u.accountRole}
                </span>
              </TableCell>
              <TableCell data-label="Trạng thái">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Đang hoạt động
                </span>
              </TableCell>
              {onEdit && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(!canEdit || canEdit(u)) && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onEdit(u)}
                        className="border-foreground/10 text-foreground/50 hover:border-primary/40 hover:text-primary"
                      >
                        <PencilSimpleIcon size={11} />
                        Sửa
                      </Button>
                    )}
                    {onChangePassword && (!canChangePassword || canChangePassword(u)) && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onChangePassword(u)}
                        className="border border-foreground/10 text-foreground/50 hover:border-primary/40 hover:text-primary"
                        title="Đổi mật khẩu"
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
                        title="Xoá thành viên"
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
    accountRole: u.accountRole ?? "member",
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
  const [query, setQuery]     = useState("");
  const { toast } = usePortalToast();
  // Ảnh chụp form lúc mới mở để biết chính xác đã sửa hay chưa: ô "Nổi bật" là
  // Radix Checkbox, nó phát sự kiện click chứ không phải change nên cách tự đoán
  // của EditModal không thấy được.
  const baselineRef = useRef("");

  const isAdmin = currentUser?.accountRole === "admin";
  // Admin can change anyone's password; a normal user only their own.
  const allowPasswordChange = (u: ApiUser) => isAdmin || currentUser?.id === u.id;
  const pwIsSelf = !!pwUser && currentUser?.id === pwUser.id;

  // Chụp lại form ngay khi mở để `dirty` so sánh được (xem baselineRef ở trên).
  const openWith = (initial: TeamForm) => { setForm(initial); baselineRef.current = JSON.stringify(initial); setError(null); };
  const openEdit   = (u: ApiUser) => { setEditing(u); setCreating(false); openWith(toForm(u)); };
  const openCreate = () => { setCreating(true); setEditing(null); openWith(emptyForm()); };
  const closeEdit  = () => { setEditing(null); setCreating(false); setForm(null); baselineRef.current = ""; };

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
        // Hai ô này chỉ quản trị mới được đổi. Máy chủ đã chặn rồi, nhưng cũng
        // KHÔNG gửi lên khi không phải quản trị: gửi một thứ mình biết chắc sẽ
        // bị bỏ qua chỉ tổ làm người đọc mã sau này tưởng nó có tác dụng.
        ...(isAdmin ? { featured: form.featured, accountRole: form.accountRole } : {}),
      };
      if (creating) {
        await apiPost(`/api/users`, { ...payload, password: form.password });
      } else if (editing) {
        await apiPut(`/api/users/${editing.id}`, payload);
      }
      onRefetch();
      closeEdit();
      toast(creating ? "Đã thêm thành viên" : "Đã lưu thay đổi", "ok");
    } catch (e) {
      setError((e as Error).message);
      toast("Lưu không thành công: " + (e as Error).message, "err");
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
      toast("Đã xoá thành viên", "ok");
    } catch (e) {
      setDeleteError((e as Error).message);
      toast("Không xoá được: " + (e as Error).message, "err");
    } finally {
      setDeleting(false);
    }
  };

  // Lọc ngay trên máy (danh sách nhân sự nhỏ) và so sánh không dấu để gõ
  // "hoan" vẫn ra "Hoàn". Giữ null khi chưa tải để phân biệt với "rỗng".
  const q = normalizeVi(query.trim());
  const filtered: ApiUser[] | null = !q
    ? data
    : (data ?? []).filter((u) =>
        [u.name, u.email, u.role?.en, u.role?.vi, u.accountRole, ...(u.skills ?? [])].some((f) =>
          normalizeVi(f ?? "").includes(q),
        ),
      );

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Đội ngũ</h2>
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
              aria-label="Tìm nhanh trong danh sách thành viên"
              className="h-8 pl-7 text-xs"
            />
          </div>
          {/* Tạo tài khoản là việc của quản trị. Máy chủ chặn nhân viên ở
              POST /api/users, nên để nút này lại thì bấm vào chỉ nhận lỗi. */}
          {isAdmin && (
            <Button size="sm" onClick={openCreate} className="bg-primary text-black hover:opacity-80">
              <PlusIcon size={12} weight="bold" />
              Thêm thành viên
            </Button>
          )}
        </div>
      </div>

      {/* Không tìm thấy gì: nói rõ là do bộ lọc, không phải chưa có dữ liệu. */}
      {!loading && q && (filtered?.length ?? 0) === 0 ? (
        <div className="border-foreground/8 text-foreground/30 rounded-xl border border-dashed py-12 text-center text-sm">
          Không tìm thấy thành viên nào khớp “{query}”.
        </div>
      ) : (
      <TeamTable
        data={filtered}
        loading={loading}
        onEdit={openEdit}
        // Chỉ quản trị mới thấy nút xoá — máy chủ không cho nhân viên xoá bất
        // cứ thứ gì (sửa nhầm còn cứu được, xoá nhầm thì không).
        onDelete={isAdmin ? (u) => { setConfirmDelete(u); setDeleteError(null); } : undefined}
        onChangePassword={openPassword}
        canChangePassword={allowPasswordChange}
        canEdit={(u) => isAdmin || currentUser?.id === u.id}
      />
      )}

      {/* ── Edit Modal ── */}
      <EditModal
        title={creating ? "Thêm thành viên" : `Sửa — ${editing?.name ?? ""}`}
        isOpen={!!editing || creating}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
        dirty={!!form && JSON.stringify(form) !== baselineRef.current}
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
                {/*
                  CHỈ QUẢN TRỊ thấy ô này. Máy chủ đã chặn nhân viên tự đổi vai
                  trò (xem back-end/src/routes/users.ts) — nhưng để ô này hiện ra
                  thì nhân viên chọn "Quản trị", bấm Lưu, nhận thông báo "Đã lưu"
                  rồi tưởng mình đã lên quyền, tới lúc tải lại mới thấy không đổi.
                  Vừa khó hiểu, vừa trông y như một lỗ hổng.
                */}
                {isAdmin && (
                  <div>
                    <Label>Vai trò tài khoản</Label>
                    <Select
                      value={form.accountRole}
                      onValueChange={(v) => set("accountRole", v as TeamForm["accountRole"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Quản trị</SelectItem>
                        <SelectItem value="editor">Biên tập</SelectItem>
                        <SelectItem value="member">Thành viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/*
                  Khối nổi bật trên trang Đội ngũ là bố cục lớn có ảnh to và
                  trích dẫn — chỉ vừa MỘT người. Nói thẳng điều đó ra đây, chứ
                  không để người dùng tick vài người rồi tự đoán vì sao trang
                  không như mong đợi.

                  CHỈ QUẢN TRỊ: đây không phải thông tin cá nhân mà là quyết định
                  về bố cục trang web. Để nhân viên tự tick thì họ tự đẩy mình lên
                  mặt tiền và đá người đang ở đó xuống. Máy chủ cũng chặn.
                */}
                {isAdmin && (
                  <div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="team-featured"
                        checked={form.featured}
                        onCheckedChange={(checked) => set("featured", !!checked)}
                      />
                      <label
                        htmlFor="team-featured"
                        className="text-foreground/60 cursor-pointer text-sm"
                      >
                        Đưa lên khối nổi bật
                      </label>
                    </div>
                    <p className="text-foreground/40 mt-1 text-xs leading-relaxed">
                      Chỉ <b>một người</b> được lên khối nổi bật ở đầu trang Đội ngũ. Tick nhiều
                      người thì chỉ người đầu danh sách được lên đó, những người còn lại vẫn hiện
                      bình thường ở lưới bên dưới.
                    </p>
                  </div>
                )}
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
                placeholder="Tối thiểu 6 ký tự"
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
            <AlertDialogCancel disabled={deleting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Đang xoá…" : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
