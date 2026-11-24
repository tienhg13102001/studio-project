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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import { Skeleton } from "#components/ui/skeleton";
import ImageUpload from "#components/ui/portal/ImageUpload";
import { usePortalToast } from "#components/organisms/portal/PortalToast";
import { useBaiViet } from "#hooks/useBaiViet";
import { useServices } from "#hooks/useServices";
import { useLanguage } from "#i18n";
import { apiDelete, apiPost, apiPut } from "#lib/api";
import type { ApiBaiViet } from "#lib/apiTypes";
import { markdownSangHtml, ngayViet } from "#lib/baiViet";
import { localized } from "#lib/localized";
import { ArrowLeftIcon, ArrowSquareOutIcon, PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { useMemo, useRef, useState } from "react";

/**
 * Portal → Bài viết (24/11/2026, mục C4).
 *
 * Soạn ngay trong trang chứ không trong hộp nổi: bài dài 1.500 chữ, hộp nổi quá
 * chật để soát. Thân bài gõ Markdown (## tiêu đề mục, **đậm**, - gạch đầu dòng,
 * [chữ](link), bảng |…|), bấm "Xem trước" để thấy đúng như trên web.
 *
 * Bài mới luôn là NHÁP; chỉ nút "Đăng" mới đưa lên web. Đăng xong muốn Google và
 * Bing biết sớm thì báo Claude chạy scripts/gui-indexnow.mjs với đường dẫn bài.
 */

const KHONG_GAN = "__none__";

type Form = {
  tieuDe: string;
  slug: string;
  moTa: string;
  anhBia: string;
  dichVu: string;
  noiDung: string;
};

const formTrong = (): Form => ({ tieuDe: "", slug: "", moTa: "", anhBia: "", dichVu: KHONG_GAN, noiDung: "" });
const toForm = (b: ApiBaiViet): Form => ({
  tieuDe: b.tieuDe,
  slug: b.slug,
  moTa: b.moTa ?? "",
  anhBia: b.anhBia ?? "",
  dichVu: b.dichVu || KHONG_GAN,
  noiDung: b.noiDung ?? "",
});

/** "Chi phí sản xuất TVC 2026" → "chi-phi-san-xuat-tvc-2026" */
function taoSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export default function BaiVietPortalPage() {
  const { data, loading, refetch } = useBaiViet(true);
  const { lang } = useLanguage();
  const { raw: services } = useServices(lang);
  const { toast } = usePortalToast();

  const [dangSua, setDangSua] = useState<ApiBaiViet | null>(null);
  const [taoMoi, setTaoMoi] = useState(false);
  const [form, setForm] = useState<Form>(formTrong());
  const [xemTruoc, setXemTruoc] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [xoa, setXoa] = useState<ApiBaiViet | null>(null);
  const goc = useRef("");
  // Đường dẫn tự theo tiêu đề cho tới khi người dùng tự sửa ô đường dẫn.
  const slugTuDong = useRef(true);

  const moSoan = (b: ApiBaiViet | null) => {
    const f = b ? toForm(b) : formTrong();
    setForm(f);
    goc.current = JSON.stringify(f);
    slugTuDong.current = !b;
    setDangSua(b);
    setTaoMoi(!b);
    setXemTruoc(false);
    setLoi(null);
  };
  const dong = () => {
    if (JSON.stringify(form) !== goc.current && !window.confirm("Bài có thay đổi chưa lưu. Bỏ thay đổi?")) return;
    setDangSua(null);
    setTaoMoi(false);
  };

  const htmlXemTruoc = useMemo(() => (xemTruoc ? markdownSangHtml(form.noiDung) : ""), [xemTruoc, form.noiDung]);

  const luu = async (trangThai?: "nhap" | "dang") => {
    if (!form.tieuDe.trim()) return setLoi("Thiếu tiêu đề.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      return setLoi("Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch nối.");
    }
    setDangLuu(true);
    setLoi(null);
    try {
      const body = {
        tieuDe: form.tieuDe,
        slug: form.slug,
        moTa: form.moTa,
        anhBia: form.anhBia,
        dichVu: form.dichVu === KHONG_GAN ? "" : form.dichVu,
        noiDung: form.noiDung,
        ...(trangThai ? { trangThai } : {}),
      };
      const bai = taoMoi
        ? await apiPost<ApiBaiViet>("/api/bai-viet", body)
        : await apiPut<ApiBaiViet>(`/api/bai-viet/${dangSua!.id}`, body);
      goc.current = JSON.stringify(form);
      setDangSua(bai);
      setTaoMoi(false);
      slugTuDong.current = false;
      refetch();
      toast(
        trangThai === "dang" ? "Đã đăng lên web" : trangThai === "nhap" ? "Đã gỡ xuống, bài thành nháp" : "Đã lưu",
        "ok",
      );
    } catch (e) {
      setLoi((e as Error).message);
      toast("Lưu không thành công: " + (e as Error).message, "err");
    } finally {
      setDangLuu(false);
    }
  };

  const xacNhanXoa = async () => {
    if (!xoa) return;
    try {
      await apiDelete(`/api/bai-viet/${xoa.id}`);
      toast("Đã chuyển bài vào Thùng rác", "ok");
      setXoa(null);
      setDangSua(null);
      setTaoMoi(false);
      refetch();
    } catch (e) {
      toast("Không xoá được: " + (e as Error).message, "err");
    }
  };

  const set = (k: keyof Form, v: string) =>
    setForm((f) => {
      const moi = { ...f, [k]: v };
      if (k === "tieuDe" && slugTuDong.current) moi.slug = taoSlug(v);
      if (k === "slug") slugTuDong.current = false;
      return moi;
    });

  // ─── Màn soạn ──────────────────────────────────────────────────────────────
  if (dangSua || taoMoi) {
    const daDang = dangSua?.trangThai === "dang";
    const doDaiMoTa = form.moTa.trim().length;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={dong} className="text-foreground/60">
            <ArrowLeftIcon size={14} /> Danh sách
          </Button>
          <span className="flex-1" />
          {daDang && (
            <a
              href={`/bai-viet/${dangSua!.slug}`}
              target="_blank"
              rel="noopener"
              className="text-foreground/60 hover:text-primary inline-flex items-center gap-1 text-xs"
            >
              Xem trên web <ArrowSquareOutIcon size={12} />
            </a>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] ${
              daDang
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-foreground/15 text-foreground/50"
            }`}
          >
            {daDang ? `Đã đăng ${ngayViet(dangSua!.ngayDang)}` : "Nháp — chưa lên web"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Tiêu đề (cũng là tiêu đề trên Google)</Label>
            <Input value={form.tieuDe} onChange={(e) => set("tieuDe", e.target.value)} placeholder="Quay hội nghị cần mấy máy quay?" />
            <p className="text-foreground/40 mt-1 text-xs">{form.tieuDe.trim().length} ký tự · nên dưới 60</p>
          </div>
          <div>
            <Label>Đường dẫn</Label>
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} />
            <p className="text-foreground/40 mt-1 text-xs">
              beezvn.com/bai-viet/<span className="text-foreground/70">{form.slug || "…"}</span>
              {daDang && " · Đã đăng thì đừng đổi: link cũ khách đã chia sẻ sẽ gãy."}
            </p>
          </div>
          <div>
            <Label>Dịch vụ liên quan (nút cuối bài)</Label>
            <Select value={form.dichVu} onValueChange={(v) => set("dichVu", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={KHONG_GAN}>— Không gắn —</SelectItem>
                {(services ?? [])
                  .filter((s) => s.slug)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.slug!}>
                      {localized(s.title, lang)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Mô tả ngắn (hiện dưới tiêu đề trên Google, khi chia sẻ Facebook/Zalo)</Label>
            <Input value={form.moTa} onChange={(e) => set("moTa", e.target.value)} />
            <p className={`mt-1 text-xs ${doDaiMoTa > 160 ? "text-orange-300" : "text-foreground/40"}`}>
              {doDaiMoTa} ký tự · nên 120–155
            </p>
          </div>
          <div className="md:col-span-2">
            <Label>Ảnh bìa</Label>
            <ImageUpload value={form.anhBia} onChange={(v) => set("anhBia", v)} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <Label className="m-0">Thân bài</Label>
            <span className="flex-1" />
            <div className="border-foreground/10 flex rounded-lg border p-0.5 text-xs">
              {[false, true].map((xt) => (
                <button
                  key={String(xt)}
                  type="button"
                  onClick={() => setXemTruoc(xt)}
                  className={`rounded-md px-3 py-1 ${xemTruoc === xt ? "bg-primary text-black" : "text-foreground/60"}`}
                >
                  {xt ? "Xem trước" : "Soạn"}
                </button>
              ))}
            </div>
          </div>
          {xemTruoc ? (
            <div className="border-foreground/10 bg-background rounded-xl border p-6">
              <h1 className="text-foreground mb-6 text-3xl font-bold">{form.tieuDe}</h1>
              <div className="bai-viet" dangerouslySetInnerHTML={{ __html: htmlXemTruoc }} />
            </div>
          ) : (
            <>
              <textarea
                value={form.noiDung}
                onChange={(e) => set("noiDung", e.target.value)}
                spellCheck={false}
                className="border-input bg-background text-foreground focus-visible:ring-primary/40 min-h-[60vh] w-full rounded-xl border p-4 font-mono text-sm leading-relaxed focus-visible:ring-2 focus-visible:outline-none"
                placeholder={"Đoạn mở đầu trả lời thẳng câu hỏi trong 2–3 câu.\n\n## Mục thứ nhất\n\nNội dung…"}
              />
              <p className="text-foreground/40 mt-1 text-xs leading-relaxed">
                Đừng gõ lại tiêu đề ở đầu bài — web tự hiện tiêu đề ở trên. Mục lớn: <code>## Tên mục</code> ·
                đậm: <code>**chữ**</code> · gạch đầu dòng: <code>- ý</code> · link: <code>[chữ](https://…)</code>.
              </p>
            </>
          )}
        </div>

        {loi && <p className="text-xs text-red-400">{loi}</p>}

        <div className="border-foreground/8 bg-background/95 sticky bottom-0 -mx-8 flex flex-wrap items-center gap-3 border-t px-8 py-4 backdrop-blur">
          {dangSua && (
            <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setXoa(dangSua)}>
              Xoá
            </Button>
          )}
          <span className="flex-1" />
          {daDang ? (
            <>
              <Button variant="outline" disabled={dangLuu} onClick={() => luu("nhap")}>
                Gỡ xuống
              </Button>
              <Button disabled={dangLuu} onClick={() => luu()} className="bg-primary text-black hover:opacity-80">
                {dangLuu ? "Đang lưu…" : "Lưu thay đổi"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" disabled={dangLuu} onClick={() => luu()}>
                {dangLuu ? "Đang lưu…" : "Lưu nháp"}
              </Button>
              <Button disabled={dangLuu} onClick={() => luu("dang")} className="bg-primary text-black hover:opacity-80">
                Đăng lên web
              </Button>
            </>
          )}
        </div>

        <AlertDialog open={!!xoa} onOpenChange={(o) => !o && setXoa(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xoá bài viết?</AlertDialogTitle>
              <AlertDialogDescription>
                Bài vào Thùng rác, khôi phục được trong 30 ngày. Chỉ muốn tạm gỡ khỏi web thì bấm{" "}
                <b>Gỡ xuống</b> thay vì xoá.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction onClick={xacNhanXoa}>Xoá</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ─── Danh sách ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Bài viết</h2>
          <p className="text-foreground/40 text-xs">Bài mới là nháp; chỉ bấm "Đăng lên web" mới hiện cho khách.</p>
        </div>
        <Button size="sm" onClick={() => moSoan(null)} className="bg-primary text-black hover:opacity-80">
          <PlusIcon size={12} weight="bold" /> Viết bài mới
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="border-foreground/8 h-20 rounded-xl border" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="border-foreground/10 text-foreground/40 rounded-xl border border-dashed p-10 text-center text-sm">
          Chưa có bài nào. Mục Bài viết ở chân trang web chỉ hiện khi có bài đầu tiên được đăng.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((b) => {
            const daDang = b.trangThai === "dang";
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => moSoan(b)}
                className="group border-foreground/8 bg-foreground/3 hover:border-primary/30 flex items-start gap-3 rounded-xl border p-4 text-left transition-all"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground group-hover:text-primary font-medium transition-colors">{b.tieuDe}</p>
                  <p className="text-foreground/40 mt-1 truncate text-xs">/bai-viet/{b.slug}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${
                    daDang
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-foreground/15 text-foreground/50"
                  }`}
                >
                  {daDang ? ngayViet(b.ngayDang) : "Nháp"}
                </span>
                <PencilSimpleIcon size={14} className="text-foreground/30 mt-0.5 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
