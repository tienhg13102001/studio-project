import Seo from "#components/Seo";
import CTASection from "#components/organisms/CTASection";
import { useTranslation } from "#i18n";
import { apiFetch, resolveAssetUrl, srcSetAnh } from "#lib/api";
import type { ApiBaiViet } from "#lib/apiTypes";
import { markdownSangHtml, ngayViet, phutDoc } from "#lib/baiViet";
import { nhanMang } from "#lib/seoTrangTinh";
import { SITE_URL, breadcrumbSchema } from "#lib/structuredData";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

/**
 * Một bài viết — /bai-viet/<tên>.
 *
 * Tiêu đề, mô tả, dữ liệu máy đọc PHẢI khớp bản dựng sẵn ở
 * scripts/prerender-meta.mjs (loai "bai-viet").
 */
const BaiVietPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const t = useTranslation();
  // Kết quả gắn kèm slug nó thuộc về: đổi sang bài khác thì kết quả cũ tự
  // không khớp nữa, khỏi phải xoá trạng thái trong effect.
  const [kq, setKq] = useState<{ slug: string; bai: ApiBaiViet | null } | null>(null);

  useEffect(() => {
    if (!slug) return;
    let huy = false;
    apiFetch<ApiBaiViet>(`/api/bai-viet/${encodeURIComponent(slug)}`)
      .then((b) => { if (!huy) setKq({ slug, bai: b }); })
      .catch(() => { if (!huy) setKq({ slug, bai: null }); });
    return () => { huy = true; };
  }, [slug]);

  const khop = kq?.slug === slug ? kq : null;
  const bai = khop?.bai ?? null;
  const khongCo = !!khop && !khop.bai;
  const html = bai?.noiDung ? markdownSangHtml(bai.noiDung) : "";

  if (khongCo) return <NotFoundPage />;
  if (!bai) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  const duongDan = `/bai-viet/${bai.slug}`;
  const anh = bai.anhBia ? resolveAssetUrl(bai.anhBia) : "";
  const nhan = nhanMang(bai.dichVu);

  return (
    <div className="min-h-screen">
      <Seo
        title={bai.tieuDe}
        description={bai.moTa}
        path={duongDan}
        image={anh || undefined}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: bai.tieuDe,
            description: bai.moTa,
            url: SITE_URL + duongDan,
            mainEntityOfPage: SITE_URL + duongDan,
            ...(anh ? { image: anh } : {}),
            ...(bai.ngayDang ? { datePublished: bai.ngayDang } : {}),
            dateModified: bai.updatedAt,
            inLanguage: "vi",
            author: { "@id": `${SITE_URL}/#organization` },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          breadcrumbSchema([
            { name: "Trang chủ", path: "/" },
            { name: "Bài viết", path: "/bai-viet" },
            { name: bai.tieuDe, path: duongDan },
          ]),
        ]}
      />

      <article className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <nav
          aria-label="Đường dẫn"
          className="text-muted-foreground mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
        >
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <Link to="/bai-viet" className="hover:text-primary transition-colors">Bài viết</Link>
        </nav>

        <header className="mb-10">
          <h1 className="text-foreground text-3xl leading-tight font-bold text-balance md:text-[2.75rem]">
            {bai.tieuDe}
          </h1>
          <p className="text-muted-foreground mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {bai.ngayDang && <time dateTime={bai.ngayDang}>{ngayViet(bai.ngayDang)}</time>}
            <span>{phutDoc(bai.noiDung ?? "")} phút đọc</span>
            <span>Bee Z Production</span>
          </p>
        </header>

        {anh && (
          <img
            src={anh}
            srcSet={srcSetAnh(anh)}
            sizes="(min-width: 768px) 720px, 100vw"
            alt=""
            fetchPriority="high"
            className="mb-10 aspect-[16/9] w-full rounded-xl object-cover"
          />
        )}

        {/* Thân bài: HTML sinh từ Markdown, HTML thô đã bị chặn (lib/baiViet.ts). */}
        <div className="bai-viet" dangerouslySetInnerHTML={{ __html: html }} />

        {bai.dichVu && (
          <Link
            to={`/service/${bai.dichVu}`}
            className="border-border hover:border-primary/50 group mt-14 flex items-center justify-between gap-4 rounded-xl border p-5 transition-colors"
          >
            <span>
              <span className="text-muted-foreground block text-xs tracking-wide uppercase">Dịch vụ liên quan</span>
              <span className="text-foreground mt-1 block text-lg font-semibold">
                {nhan || "Xem dịch vụ"}
              </span>
            </span>
            <ArrowRightIcon size={20} className="text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </article>

      <CTASection title={bai.dichVu ? t.service.ctaTitleBySlug[bai.dichVu] : undefined} />
    </div>
  );
};

export default BaiVietPage;
