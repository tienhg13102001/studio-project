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
import { Skeleton } from "#components/ui/skeleton";
import AutoTextarea from "#components/ui/portal/AutoTextarea";
import EditModal from "#components/ui/portal/EditModal";
import { usePortalToast } from "#components/organisms/portal/PortalToast";
import { useDragSort } from "#hooks/useDragSort";
import { useServices } from "#hooks/useServices";
import { useLanguage } from "#i18n";
import { apiDelete, apiPost, apiPut } from "#lib/api";
import type { ApiTestimonial } from "#lib/apiTypes";
import { localized } from "#lib/localized";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilSimpleIcon,
  PlusIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";

/**
 * Radix Select KHÔNG nhận value là chuỗi rỗng (nó dùng "" làm dấu hiệu "chưa
 * chọn gì"), nên phải có một giá trị thật đại diện cho "không gắn mảng nào".
 * Đổi qua lại ở đúng hai chỗ: lúc nạp form và lúc gửi đi.
 */
const KHONG_GAN = "__none__";

type Form = {
  quoteVi: string;
  quoteEn: string;
  authorName: string;
  authorTitle: string;
  service: string;
  featured: boolean;
  active: boolean;
};

function toForm(t: ApiTestimonial): Form {
  return {
    quoteVi: t.quote?.vi ?? "",
    quoteEn: t.quote?.en ?? "",
    authorName: t.authorName ?? "",
    authorTitle: t.authorTitle ?? "",
    service: t.service ?? KHONG_GAN,
    featured: t.featured,
    active: t.active,
  };
}

const formTrong = (): Form => ({
  quoteVi: "",
  quoteEn: "",
  authorName: "",
  authorTitle: "",
  service: KHONG_GAN,
  featured: false,
  active: true,
});

type Props = { data: ApiTestimonial[] | null; loading: boolean; onRefetch: () => void };

export default function TestimonialsTab({ data, loading, onRefetch }: Props) {
  const { lang } = useLanguage();
  const { raw: services } = useServices(lang);
  const { toast } = usePortalToast();

  const [editing, setEditing] = useState<ApiTestimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiTestimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Chụp lại form lúc mở để EditModal biết có thay đổi chưa mà cảnh báo khi
  // thoát — Checkbox của Radix phát sự kiện click nên nó tự đoán không ra.
  const baselineRef = useRef("");

  const { order, savingOrder, dragProps, moveBy } = useDragSort(data ?? [], {
    type: "testimonials",
    onSaved: onRefetch,
    onError: (m) => toast("Không lưu được thứ tự: " + m, "err"),
  });

  const openWith = (initial: Form) => {
    setForm(initial);
    baselineRef.current = JSON.stringify(initial);
    setError(null);
  };
  const openEdit = (t: ApiTestimonial) => {
    setEditing(t);
    setCreating(false);
    openWith(toForm(t));
  };
  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    openWith(formTrong());
  };
  const closeEdit = () => {
    setEditing(null);
    setCreating(false);
    setForm(null);
    baselineRef.current = "";
  };

  const set = (k: keyof Form, v: unknown) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const handleSave = async () => {
    if (!form) return;
    if (!form.quoteVi.trim() && !form.quoteEn.trim()) {
      setError("Phải nhập lời nhận xét ở ít nhất một thứ tiếng.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        quote: { vi: form.quoteVi, en: form.quoteEn },
        authorName: form.authorName,
        authorTitle: form.authorTitle,
        service: form.service === KHONG_GAN ? null : form.service,
        featured: form.featured,
        active: form.active,
        // Mục mới xuống cuối danh sách; kéo thả lên sau.
        ...(creating ? { order: data?.length ?? 0 } : {}),
      };
      if (creating) await apiPost("/api/testimonials", payload);
      else await apiPut(`/api/testimonials/${editing!.id}`, payload);
      onRefetch();
      closeEdit();
      toast(creating ? "Đã thêm nhận xét" : "Đã lưu thay đổi", "ok");
    } catch (e) {
      setError((e as Error).message);
      toast("Lưu không thành công: " + (e as Error).message, "err");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/testimonials/${confirmDelete.id}`);
      onRefetch();
      setConfirmDelete(null);
      closeEdit();
      toast("Đã chuyển nhận xét vào Thùng rác", "ok");
    } catch (e) {
      toast("Không xoá được: " + (e as Error).message, "err");
    } finally {
      setDeleting(false);
    }
  };

  const tenDichVu = (id: string | null) => {
    const s = services?.find((x) => x.id === id);
    return s ? localized(s.title, lang) : null;
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Nhận xét khách</h2>
          <p className="text-foreground/40 text-xs">
            {savingOrder ? "Đang lưu thứ tự…" : "Kéo thả một thẻ để đổi thứ tự hiển thị."}
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-primary text-black hover:opacity-80">
          <PlusIcon size={12} weight="bold" />
          Thêm nhận xét
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="border-foreground/8 h-28 rounded-xl border" />
          ))}
        </div>
      ) : order.length === 0 ? (
        <div className="border-foreground/10 text-foreground/40 rounded-xl border border-dashed p-10 text-center text-sm">
          Chưa có nhận xét nào. Bấm <span className="text-foreground/70">Thêm nhận xét</span> để
          bắt đầu.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {order.map((t, i) => {
            // Không nổi bật và cũng không gắn mảng nào thì nhận xét này KHÔNG
            // xuất hiện ở đâu trên web. Nói thẳng ra, chứ không để Hoàn nhập
            // xong rồi đi tìm mãi không thấy nó hiện chỗ nào.
            const khongHienODau = !t.featured && !t.service;
            const ten = t.authorName?.trim();
            return (
              <div
                key={t.id}
                {...dragProps(t.id)}
                className="group border-foreground/8 bg-foreground/3 hover:border-primary/30 flex cursor-grab flex-col gap-3 rounded-xl border p-4 transition-all active:cursor-grabbing"
              >
                <div className="flex items-start gap-3">
                  <p className="text-foreground/70 flex-1 text-sm leading-relaxed">
                    <span className="text-primary/50">&ldquo;</span>
                    {(t.quote?.vi || t.quote?.en || "").slice(0, 180)}
                    {(t.quote?.vi || t.quote?.en || "").length > 180 ? "…" : ""}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    {/* Nút mũi tên là đường đổi thứ tự DUY NHẤT trên điện thoại —
                        màn cảm ứng không có sự kiện kéo thả của chuột. */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Lên trên"
                      disabled={i === 0}
                      onClick={() => moveBy(t.id, -1)}
                      className="text-foreground/40 hover:text-primary disabled:opacity-20"
                    >
                      <ArrowUpIcon size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Xuống dưới"
                      disabled={i === order.length - 1}
                      onClick={() => moveBy(t.id, 1)}
                      className="text-foreground/40 hover:text-primary disabled:opacity-20"
                    >
                      <ArrowDownIcon size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Sửa"
                      onClick={() => openEdit(t)}
                      className="border-foreground/10 bg-background text-foreground/40 hover:border-primary/30 hover:text-primary border"
                    >
                      <PencilSimpleIcon size={11} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="text-foreground/50">
                    {ten || <span className="text-foreground/30 italic">Ẩn danh</span>}
                    {t.authorTitle ? ` — ${t.authorTitle}` : ""}
                  </span>
                  <span className="flex-1" />
                  {t.featured && (
                    <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-2 py-0.5">
                      Trang chủ
                    </span>
                  )}
                  {t.service && (
                    <span className="border-foreground/15 text-foreground/50 rounded-full border px-2 py-0.5">
                      {tenDichVu(t.service) ?? "Mảng đã xoá"}
                    </span>
                  )}
                  {!t.active && (
                    <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 text-orange-300">
                      Đang tắt
                    </span>
                  )}
                  {khongHienODau && t.active && (
                    <span className="flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 text-orange-300">
                      <WarningIcon size={10} weight="fill" />
                      Chưa hiện ở đâu
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EditModal
        title={creating ? "Thêm nhận xét" : "Sửa nhận xét"}
        isOpen={!!editing || creating}
        onClose={closeEdit}
        onSubmit={handleSave}
        saving={saving}
        dirty={!!form && JSON.stringify(form) !== baselineRef.current}
        onDelete={
          editing
            ? () => {
                setConfirmDelete(editing);
                closeEdit();
              }
            : undefined
        }
        deleting={deleting}
      >
        {form && (
          <div className="flex flex-col gap-4">
            <div>
              <Label>Lời nhận xét (tiếng Việt)</Label>
              <AutoTextarea
                value={form.quoteVi}
                onChange={(e) => set("quoteVi", e.target.value)}
                placeholder="Dán nguyên câu khách nói…"
              />
            </div>
            <div>
              <Label>Lời nhận xét (tiếng Anh)</Label>
              <AutoTextarea
                value={form.quoteEn}
                onChange={(e) => set("quoteEn", e.target.value)}
              />
              <p className="text-foreground/40 mt-1 text-xs">
                Để trống cũng được — khách xem bản tiếng Anh sẽ thấy bản tiếng Việt.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Tên người nói</Label>
                <Input
                  value={form.authorName}
                  onChange={(e) => set("authorName", e.target.value)}
                  placeholder="Như Quỳnh"
                />
                <p className="text-foreground/40 mt-1 text-xs">
                  Để trống = nhận xét ẩn danh, web không hiện dòng tên.
                </p>
              </div>
              <div>
                <Label>Chức danh & nơi làm việc</Label>
                <Input
                  value={form.authorTitle}
                  onChange={(e) => set("authorTitle", e.target.value)}
                  placeholder="Giám đốc Marketing, OWEN"
                />
              </div>
            </div>

            <div>
              <Label>Thuộc mảng dịch vụ</Label>
              <Select value={form.service} onValueChange={(v) => set("service", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={KHONG_GAN}>— Không gắn mảng nào —</SelectItem>
                  {(services ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {localized(s.title, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-foreground/40 mt-1 text-xs">
                Nhận xét sẽ hiện ở trang của đúng mảng này.
              </p>
            </div>

            <div className="border-foreground/8 flex flex-col gap-3 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tst-featured"
                  checked={form.featured}
                  onCheckedChange={(c) => set("featured", !!c)}
                />
                <label htmlFor="tst-featured" className="text-foreground/60 cursor-pointer text-sm">
                  Hiện ở trang chủ
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tst-active"
                  checked={form.active}
                  onCheckedChange={(c) => set("active", !!c)}
                />
                <label htmlFor="tst-active" className="text-foreground/60 cursor-pointer text-sm">
                  Đang bật
                </label>
              </div>
              <p className="text-foreground/40 text-xs leading-relaxed">
                Trang chủ nên để <span className="text-foreground/70">3 nhận xét</span> — nhiều quá
                thì khách lướt qua hết. Tắt là gỡ khỏi web ngay mà vẫn giữ lại nội dung, dùng khi
                khách xin gỡ xuống.
              </p>
            </div>

            {!form.featured && form.service === KHONG_GAN && (
              <p className="flex items-start gap-2 rounded-lg border border-orange-400/30 bg-orange-400/10 p-3 text-xs leading-relaxed text-orange-300">
                <WarningIcon size={14} weight="fill" className="mt-0.5 shrink-0" />
                Chưa bật trang chủ và cũng chưa gắn mảng nào — lưu xong nhận xét này sẽ không xuất
                hiện ở đâu trên web.
              </p>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        )}
      </EditModal>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá nhận xét?</AlertDialogTitle>
            <AlertDialogDescription>
              Nhận xét sẽ được chuyển vào Thùng rác và khôi phục lại được trong 30 ngày.
              <span className="text-foreground/60 mt-2 block">
                Chỉ muốn tạm gỡ khỏi web thì nên bỏ tick <b>Đang bật</b> thay vì xoá.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
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
