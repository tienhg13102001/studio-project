import Seo from "#components/Seo";
import Reveal from "#components/Reveal";
import CaseStudyBlock from "#components/molecules/CaseStudyBlock";
import MediaPlayer from "#components/molecules/MediaPlayer";
import CTASection from "#components/organisms/CTASection";
import { useLanguage, useTranslation } from "#i18n";
import { apiFetch, resolveAssetUrl, srcSetAnh } from "#lib/api";
import type { ApiProject, ApiService } from "#lib/apiTypes";
import { mapCaseStudy } from "#hooks/useProjects";
import { localized } from "#lib/localized";
import { ngayDangVideo, nhanMang } from "#lib/seoTrangTinh";
import { SITE_URL, breadcrumbSchema } from "#lib/structuredData";
import { duongDanDichVu, duongDanDuAn } from "#lib/urls";
import { CalendarBlankIcon, MapPinIcon, PlayIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

/**
 * TRANG DỰ ÁN RIÊNG — /du-an/<tên> (Hoàn duyệt 24/11/2026, mục N1).
 *
 * VÌ SAO: trước đây địa chỉ này dựng NGUYÊN trang dịch vụ rồi bật hộp nổi lên
 * trên. Google chạy JavaScript xong thấy 74 trang dự án gần như trùng hệt trang
 * dịch vụ (trang VF9 giống trang TVC 9.430/10.212 ký tự, đo 23/11/2026), dữ liệu
 * máy đọc còn bị thay bằng hỏi-đáp của TVC — khớp với cảnh hàng loạt trang "đã
 * phát hiện, chưa lập chỉ mục". Giờ mỗi dự án là một trang thật, chỉ nói về nó.
 *
 * Tiêu đề, mô tả, dữ liệu máy đọc PHẢI khớp với bản dựng sẵn ở
 * scripts/prerender-meta.mjs (cùng nhãn mảng, cùng cách lấy ngày đăng video).
 */

function formatNgay(iso: string | undefined, lang: "vi" | "en"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return lang === "en"
    ? d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : `tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
}

const ProjectPage = () => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const { lang, dd } = useLanguage();
  const en = lang === "en";
  const t = useTranslation();
  const [service, setService] = useState<ApiService | null>(null);
  const [khongCo, setKhongCo] = useState(false);

  useEffect(() => {
    if (!projectSlug) return;
    let huy = false;
    setService(null);
    setKhongCo(false);
    // Hỏi dự án thuộc mảng nào, rồi lấy cả mảng: dữ liệu dự án nằm trong đó, và
    // phần "dự án cùng mảng" cũng cần nó.
    apiFetch<{ serviceSlug: string | null; serviceId: string }>(
      `/api/projects/by-slug/${encodeURIComponent(projectSlug)}`,
    )
      .then((r) => apiFetch<ApiService>(`/api/services/${encodeURIComponent(r.serviceSlug || r.serviceId)}`))
      .then((s) => { if (!huy) setService(s); })
      .catch(() => { if (!huy) setKhongCo(true); });
    return () => { huy = true; };
  }, [projectSlug]);

  const duAn: ApiProject | undefined = service?.projects.find((p) => p.slug === projectSlug);

  // Không có dự án này (đổi tên, đã xoá): trang "Không tìm thấy" có noindex.
  if (khongCo || (service && !duAn)) return <NotFoundPage />;

  if (!service || !duAn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  const tenMang = localized(service.title, lang);
  const nhan = nhanMang(service.slug, lang);
  const phuDe = localized(duAn.subtitle, lang).trim();
  const anhBia = resolveAssetUrl(duAn.thumbnailImage);
  const video = duAn.video ? resolveAssetUrl(duAn.video) : undefined;
  const caseStudy = mapCaseStudy(duAn.caseStudy, lang);
  const duongDan = duongDanDuAn(duAn, service);
  const ngayQuay = formatNgay(duAn.shootDate, lang);
  const moTa = (phuDe && phuDe.toLowerCase() !== duAn.title.trim().toLowerCase()
    ? phuDe
    : en
      ? `${duAn.title.trim()}: a ${tenMang} project by Bee Z Production.`
      : `Dự án ${duAn.title.trim()} do Bee Z Production thực hiện — ${tenMang.toLocaleLowerCase(lang)}.`
  ).slice(0, 160);
  const ngayDang = ngayDangVideo(video);
  const cungMang = service.projects.filter((p) => p.id !== duAn.id && p.slug).slice(0, 6);
  const doc = duAn.layout === "vertical";

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: duAn.title.trim(),
      description: moTa,
      url: SITE_URL + dd(duongDan),
      image: anhBia,
      creator: { "@id": `${SITE_URL}/#organization` },
      inLanguage: lang,
      ...(caseStudy?.challenge ? { abstract: caseStudy.challenge } : {}),
    },
    breadcrumbSchema([
      { name: en ? "Home" : "Trang chủ", path: dd("/") },
      { name: tenMang, path: dd(duongDanDichVu(service)) },
      { name: duAn.title.trim(), path: dd(duongDan) },
    ]),
  ];
  // Khai video cho Google chỉ khi có đủ ngày đăng thật (đọc từ tên tệp).
  if (video && ngayDang) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: duAn.title.trim(),
      description: moTa,
      thumbnailUrl: anhBia,
      uploadDate: ngayDang,
      contentUrl: video,
      url: SITE_URL + dd(duongDan),
      publisher: { "@id": `${SITE_URL}/#organization` },
    });
  }

  return (
    <div className="min-h-screen">
      <Seo
        title={nhan ? `${duAn.title.trim()} · ${nhan}` : duAn.title.trim()}
        description={moTa}
        path={duongDan}
        image={anhBia}
        type="article"
        jsonLd={jsonLd}
      />

      <article className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <nav aria-label={en ? "Breadcrumb" : "Đường dẫn"} className="text-muted-foreground mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <Link to={dd("/")} className="hover:text-primary transition-colors">{en ? "Home" : "Trang chủ"}</Link>
          <span aria-hidden="true">/</span>
          <Link to={dd(duongDanDichVu(service))} className="hover:text-primary transition-colors">{tenMang}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground line-clamp-1">{duAn.title.trim()}</span>
        </nav>

        <header className="mb-8 max-w-3xl">
          <p className="text-primary mb-3 text-xs font-semibold tracking-[0.2em] uppercase">{nhan || tenMang}</p>
          <h1 className="text-foreground text-3xl leading-tight font-bold md:text-5xl">{duAn.title.trim()}</h1>
          {phuDe && <p className="text-muted-foreground mt-4 text-base leading-relaxed md:text-lg">{phuDe}</p>}
          {(duAn.shootLocation || ngayQuay) && (
            <p className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {duAn.shootLocation && (
                <span className="inline-flex items-center gap-1.5"><MapPinIcon size={15} /> {duAn.shootLocation}</span>
              )}
              {ngayQuay && (
                <span className="inline-flex items-center gap-1.5"><CalendarBlankIcon size={15} /> {ngayQuay}</span>
              )}
            </p>
          )}
        </header>

        {/* Video (hoặc ảnh bìa nếu dự án chưa có video). Dự án quay dọc thì khung
            dọc, giới hạn chiều cao để không phải cuộn mới xem hết. */}
        <div
          className={`bg-card border-border overflow-hidden rounded-2xl border ${
            doc ? "mx-auto aspect-9/16 max-h-[80vh] w-full max-w-[min(100%,calc(80vh*9/16))]" : "aspect-video w-full"
          }`}
        >
          {video ? (
            <MediaPlayer src={video} poster={anhBia} alt={duAn.title.trim()} className="h-full w-full" videoClassName="object-contain" />
          ) : (
            <img src={anhBia} alt={duAn.title.trim()} className="h-full w-full object-cover" fetchPriority="high" />
          )}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            {caseStudy ? (
              <CaseStudyBlock caseStudy={caseStudy} />
            ) : (
              phuDe && <p className="text-muted-foreground leading-relaxed">{phuDe}</p>
            )}
          </div>

          <aside className="space-y-8">
            {duAn.members && duAn.members.length > 0 && (
              <div>
                <h2 className="text-foreground mb-3 text-sm font-semibold tracking-wider uppercase">{t.project.members}</h2>
                <ul className="text-muted-foreground space-y-1.5 text-sm">
                  {duAn.members.map((m) => <li key={m.id}>{m.name}</li>)}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Link
                to={dd("/contact")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors"
              >
                {t.service.startProject}
              </Link>
              <a href="/bang-gia" className="text-muted-foreground hover:text-primary text-center text-sm underline underline-offset-4">
                {t.service.xemBangGia}
              </a>
            </div>
          </aside>
        </div>

        {duAn.photos && duAn.photos.length > 0 && (
          <section className="mt-16">
            <h2 className="text-foreground mb-6 text-xl font-bold">{t.project.productImages}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {duAn.photos.map((p, i) => (
                <img
                  key={p}
                  src={resolveAssetUrl(p)}
                  srcSet={srcSetAnh(resolveAssetUrl(p))}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  alt={`${duAn.title.trim()} — ${en ? "photo" : "ảnh"} ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="border-border aspect-4/3 w-full rounded-xl border object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {cungMang.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-foreground text-xl font-bold">
                {en ? `More ${tenMang} projects` : `Dự án ${tenMang.toLocaleLowerCase(lang)} khác`}
              </h2>
              <Link to={dd(duongDanDichVu(service))} className="text-primary text-sm hover:underline">{en ? "View all" : "Xem tất cả"}</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {cungMang.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <Link to={dd(duongDanDuAn(p, service))} className="group border-border bg-card block overflow-hidden rounded-xl border">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={resolveAssetUrl(p.thumbnailImage)}
                        srcSet={srcSetAnh(resolveAssetUrl(p.thumbnailImage))}
                        sizes="(min-width: 768px) 33vw, 50vw"
                        alt={p.title.trim()}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {p.video && (
                        <span className="bg-primary/90 text-primary-foreground absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full">
                          <PlayIcon size={14} weight="fill" />
                        </span>
                      )}
                    </div>
                    <p className="text-foreground line-clamp-2 p-3 text-sm font-semibold">{p.title.trim()}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </article>

      <CTASection title={service.slug ? t.service.ctaTitleBySlug[service.slug] : undefined} />
    </div>
  );
};

export default ProjectPage;
