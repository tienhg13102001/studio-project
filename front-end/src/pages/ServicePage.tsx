import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  LightningIcon,
  PlayIcon,
  PlusIcon,
  RocketLaunchIcon,
  StarIcon,
} from "@phosphor-icons/react";
import { apiFetch, resolveAssetUrl } from "#lib/api";
import HighlightIcon from "#components/HighlightIcon";
import { useLanguage, useTranslation, type Lang } from "#i18n";
import { localized } from "#lib/localized";
import { breadcrumbSchema, faqSchema, serviceSchema } from "#lib/structuredData";
import Reveal from "#components/Reveal";
import Seo from "#components/Seo";
import { Button } from "#components/ui/button";
import ProjectDetail from "#components/organisms/ProjectDetail";
import type { ApiProject, ApiService } from "#lib/apiTypes";
import { duongDanDichVu, duongDanDuAn } from "#lib/urls";
import { mapCaseStudy, type ProjectDisplay } from "#hooks/useProjects";
import CTASection from "#components/organisms/CTASection";
import TestimonialSection from "#components/organisms/TestimonialSection";

const PROJECT_PARAM = "project";

/** Maps a populated API project into the shape ProjectDetail expects. */
function toProjectDisplay(f: ApiProject, lang: Lang): ProjectDisplay {
  return {
    id: f.id,
    tag: f.service?.tag ?? "",
    thumbnailImage: resolveAssetUrl(f.thumbnailImage),
    title: f.title,
    subtitle: localized(f.subtitle, lang),
    video: f.video ? resolveAssetUrl(f.video) : undefined,
    photos: f.photos?.map((p) => resolveAssetUrl(p)),
    shootDate: f.shootDate,
    shootLocation: f.shootLocation,
    members: f.members?.map((m) => m.name),
    caseStudy: mapCaseStudy(f.caseStudy, lang),
  };
}

const ServicePage: React.FC = () => {
  /**
   * Trang này phục vụ BA dạng địa chỉ cùng lúc:
   *   /service/<tên-hoặc-mã>                  — trang dịch vụ
   *   /du-an/<tên-dự-án>                      — địa chỉ chính thức của dự án
   *   /service/<mã>/<mã-dự-án>                — dạng cũ, chỉ còn để chuyển hướng
   *
   * Dạng cũ và tham số `?project=` không bị xoá: chúng đã nằm trong link khách
   * lưu và tin nhắn đã gửi. Chúng vẫn mở đúng dự án rồi tự đổi địa chỉ trên
   * thanh trình duyệt sang dạng mới, nên mỗi dự án chỉ còn MỘT địa chỉ chính
   * thức trong mắt máy tìm kiếm.
   */
  const {
    id,
    projectId: projectIdParam,
    projectSlug,
  } = useParams<{ id?: string; projectId?: string; projectSlug?: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = useTranslation();
  const [searchParams] = useSearchParams();

  const [service, setService] = useState<ApiService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Mount animation for the hero — flips on after first paint so the
  // staggered fade-up transitions actually play.
  const [heroIn, setHeroIn] = useState(false);

  /**
   * Mở một dự án = đổi địa chỉ sang `/du-an/<tên>`.
   *
   * Trước đây dự án chỉ là tham số `?project=` — chia sẻ lên Facebook hay Zalo
   * thì trình quét link không đọc tham số, nên mọi dự án đều hiện ra cùng một
   * tiêu đề và cùng một ảnh của trang dịch vụ.
   *
   * `replace` khi đóng để nút Quay lại của trình duyệt không kẹt lại ở chính
   * dự án vừa đóng.
   */
  const openProject = (project: ApiProject) => {
    if (!service) return;
    navigate(duongDanDuAn(project, service));
  };

  const closeProject = () => {
    if (!service) return;
    navigate(duongDanDichVu(service), { replace: true });
  };

  /**
   * Vào bằng `/du-an/<tên>` thì chưa biết dự án thuộc dịch vụ nào — mà nội dung
   * trang lại dựng quanh dịch vụ. Hỏi máy chủ một câu để biết, rồi phần còn lại
   * chạy y như khi vào thẳng trang dịch vụ.
   */
  const [khoaDichVuTuDuAn, setKhoaDichVuTuDuAn] = useState<string | null>(null);
  useEffect(() => {
    if (!projectSlug) return;
    let huy = false;
    apiFetch<{ serviceSlug: string | null; serviceId: string }>(
      `/api/projects/by-slug/${encodeURIComponent(projectSlug)}`,
    )
      .then((r) => {
        if (!huy) setKhoaDichVuTuDuAn(r.serviceSlug || r.serviceId);
      })
      .catch((err: Error) => {
        if (!huy) { setError(err.message); setLoading(false); }
      });
    return () => { huy = true; };
  }, [projectSlug]);

  // Khoá dùng để gọi máy chủ: lấy từ địa chỉ, hoặc tra ra từ tên dự án.
  const khoaDichVu = id ?? khoaDichVuTuDuAn;

  // Link kiểu cũ `?project=<mã>` vẫn mở đúng dự án. Việc đổi sang địa chỉ mới
  // làm ở dưới, sau khi có dữ liệu để biết tên đường dẫn của dự án đó.
  const legacyProjectId = searchParams.get(PROJECT_PARAM);

  // Fire only once the hero is actually in the DOM (after the loading
  // spinner clears), otherwise the transition would settle while hidden.
  useEffect(() => {
    if (loading || !service) return;
    const raf = requestAnimationFrame(() => setHeroIn(true));
    return () => cancelAnimationFrame(raf);
  }, [loading, service]);

  useEffect(() => {
    if (!khoaDichVu) return;
    setLoading(true);
    apiFetch<ApiService>(`/api/services/${encodeURIComponent(khoaDichVu)}`)
      .then(setService)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [khoaDichVu]);

  /**
   * Đưa mọi địa chỉ cũ về đúng một địa chỉ chính thức.
   *
   * Phải chờ có dữ liệu mới làm được: từ mã dự án trong link cũ, phải tra ra
   * tên đường dẫn của nó thì mới biết đích đến. `replace` để nút Quay lại không
   * ném khách trở lại chính cái link cũ vừa rời đi.
   *
   * Dự án trong link cũ đã bị xoá thì bỏ luôn phần đó và về trang dịch vụ —
   * khách vẫn xem được các dự án khác thay vì gặp một trang trống.
   */
  const maDuAnCu = projectIdParam ?? legacyProjectId;
  useEffect(() => {
    if (!service || projectSlug) return; // đang ở địa chỉ mới rồi

    if (maDuAnCu) {
      const duAn = service.projects.find((f) => f.id === maDuAnCu);
      if (duAn?.slug) navigate(`/du-an/${duAn.slug}`, { replace: true });
      else if (!duAn) navigate(duongDanDichVu(service), { replace: true });
      // Có dự án nhưng chưa kịp có tên đường dẫn: ở lại địa chỉ cũ, vẫn mở đúng.
      return;
    }

    if (id && service.slug && id !== service.slug) {
      navigate(duongDanDichVu(service), { replace: true });
    }
  }, [service, maDuAnCu, projectSlug, id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error ?? "Service not found"}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeftIcon size={16} className="mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  const title = localized(service.title, lang);
  const description = localized(service.description, lang);
  // Hero accent line — sourced from the service document, falling back to the
  // localized default so services created before this field render something.
  const heroTagline =
    (service.heroTagline && localized(service.heroTagline, lang)) || t.service.heroTagline;
  const imageUrl = resolveAssetUrl(service.thumbnailImage);

  // Staggered fade-up: each hero element shares the same transition and only
  // differs by delay, so they cascade in after mount.
  const reveal = (delay: string) =>
    `transition-all duration-700 ease-out ${delay} ${
      heroIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`;

  // Prominent projects float to the front of the showcase grid.
  const projects = [
    ...service.projects.filter((f) => f.prominent),
    ...service.projects.filter((f) => !f.prominent),
  ];

  // Địa chỉ mới tìm theo tên; hai dạng cũ vẫn tìm theo mã để link đã lỡ chia sẻ
  // không chết trong lúc chờ chuyển hướng ở trên chạy.
  const selectedProject = projectSlug
    ? (service.projects.find((f) => f.slug === projectSlug) ?? null)
    : maDuAnCu
      ? (service.projects.find((f) => f.id === maDuAnCu) ?? null)
      : null;

  // ── Supporting content — sourced from the service document, with a fall-back
  //    to the localized defaults so services created before these fields
  //    existed still render something sensible. ──
  const highlights: { title: string; desc: string; icon: string | undefined }[] =
    service.highlights.length > 0
      ? service.highlights.map((h) => ({
          title: localized(h.title, lang),
          desc: localized(h.desc, lang),
          icon: h.icon,
        }))
      : t.service.highlights.map((h) => ({ ...h, icon: undefined }));

  const stats =
    service.stats.length > 0
      ? service.stats.map((s) => ({ value: s.value, label: localized(s.label, lang) }))
      : t.service.stats;

  // Chỉ khai báo hỏi-đáp khi dịch vụ này thực sự có FAQ (hàm trả null nếu rỗng).
  const faqLd = faqSchema(
    service.faqs.map((faq) => ({
      question: localized(faq.question, lang),
      answer: localized(faq.answer, lang),
    })),
  );

  return (
    <div className="min-h-screen">
      {/*
        Đang mở một dự án thì thẻ mô tả nói về chính dự án đó, không phải về cả
        dịch vụ — chia sẻ link ra ngoài mới hiện đúng tên và đúng ảnh.
      */}
      <Seo
        title={selectedProject ? selectedProject.title : title}
        description={
          selectedProject
            ? localized(selectedProject.subtitle, lang).slice(0, 160)
            : description.slice(0, 160)
        }
        path={
          selectedProject ? duongDanDuAn(selectedProject, service) : duongDanDichVu(service)
        }
        image={selectedProject ? resolveAssetUrl(selectedProject.thumbnailImage) : imageUrl}
        // Khai báo dịch vụ + câu hỏi thường gặp cho máy đọc: Google có thể hiện
        // thẳng phần hỏi-đáp trong kết quả, và trợ lý AI hay trích đúng dạng này.
        jsonLd={[
          serviceSchema({
            name: title,
            description: description.slice(0, 300),
            // PHẢI dựng từ `service`, không phải từ tham số địa chỉ: vào bằng
            // /du-an/<tên> thì không có tham số dịch vụ nào cả, ghép chuỗi thẳng
            // sẽ khai ra ".../service/undefined" cho máy tìm kiếm.
            path: duongDanDichVu(service),
            image: imageUrl,
          }),
          breadcrumbSchema([
            { name: t.nav.home, path: "/" },
            { name: t.nav.services, path: "/service" },
            { name: title, path: duongDanDichVu(service) },
            // Dự án nay có địa chỉ riêng nên nó là một nấc thật trong đường dẫn,
            // không còn là một trạng thái của trang dịch vụ.
            ...(selectedProject
              ? [
                  {
                    name: selectedProject.title,
                    path: duongDanDuAn(selectedProject, service),
                  },
                ]
              : []),
          ]),
          ...(faqLd ? [faqLd] : []),
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-20 text-center md:pb-28">
        {/* Base wash — fades to transparent at the bottom so the global page
            background flows continuously into the FAQ (no hard seam). */}
        <div className="from-primary/15 via-background pointer-events-none absolute inset-0 bg-linear-to-b to-transparent" />
        {/* Animated brand glow ("vùng loang vàng") — sways + breathes, plus a
            wider-travelling twin so the movement reads clearly. */}
        <div className="animate-glow bg-primary/35 pointer-events-none absolute -top-24 left-1/2 h-80 w-80 rounded-full blur-3xl" />
        <div className="animate-glow2 bg-primary/25 pointer-events-none absolute -top-8 left-1/4 h-64 w-64 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <span
            className={`border-primary/30 bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide ${reveal("delay-0")}`}
          >
            <LightningIcon size={14} weight="fill" />
            {t.service.experienceBadge}
          </span>

          <h1
            className={`text-foreground text-4xl font-bold tracking-tight md:text-6xl ${reveal("delay-100")}`}
          >
            {title}
            {/* Dòng vàng phải KHÁC NHAU giữa các mảng — xem `heroAccentByTag`
                trong i18n để biết vì sao. Mảng chưa khai thì lùi về câu chung. */}
            <span className="from-primary via-chart-2 to-chart-4 mt-1 block bg-linear-to-r bg-clip-text text-transparent">
              {t.service.heroAccentByTag[service.tag] ?? t.service.heroAccent}
            </span>
          </h1>

          <p
            className={`text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg ${reveal("delay-200")}`}
          >
            {description}
          </p>
          <p
            className={`text-muted-foreground/70 mx-auto mt-3 max-w-2xl text-sm leading-relaxed ${reveal("delay-300")}`}
          >
            {heroTagline}
          </p>

          <div
            className={`mt-9 flex flex-wrap items-center justify-center gap-3 ${reveal("delay-500")}`}
          >
            <Button
              onClick={() => navigate("/contact")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-auto gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              <RocketLaunchIcon size={18} weight="fill" />
              {t.service.startProject}
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-auto gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              <a href="#showcase">
                <PlayIcon size={16} weight="fill" />
                {t.service.viewWork}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {service.faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <Reveal>
            <h2 className="text-foreground mb-10 text-center text-3xl font-bold">
              {t.service.faqTitle}
            </h2>
          </Reveal>
          <div className="flex flex-col gap-3">
            {service.faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="border-border bg-card overflow-hidden rounded-2xl border">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="text-foreground hover:bg-muted/50 flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-medium transition-colors"
                  >
                    <span>{localized(faq.question, lang)}</span>
                    <PlusIcon
                      size={18}
                      className={`text-primary shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="border-border text-muted-foreground border-t px-6 py-4 text-sm leading-relaxed">
                        {localized(faq.answer, lang)}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Video Showcase ───────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section id="showcase" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16">
          <Reveal>
            <div className="mb-10 text-center">
              <h2 className="text-foreground text-3xl font-bold">{t.service.showcaseTitle}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{t.service.showcaseSubtitle}</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {projects.map((f, i) => (
              <Reveal key={f.id} delay={i * 60}>
                <button
                  type="button"
                  onClick={() => openProject(f)}
                  className="group border-border bg-muted relative aspect-9/16 w-full overflow-hidden rounded-2xl border text-left"
                >
                  <img
                    src={resolveAssetUrl(f.thumbnailImage)}
                    alt={f.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent" />

                  {/* Play button */}
                  <span className="bg-primary/90 text-primary-foreground absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full opacity-90 shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <PlayIcon size={20} weight="fill" />
                  </span>

                  {/* Featured badge */}
                  {f.prominent && (
                    <span className="bg-primary text-primary-foreground absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                      <StarIcon size={11} weight="fill" />
                      {t.service.featuredBadge}
                    </span>
                  )}

                  <div className="absolute right-0 bottom-0 left-0 p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-white/70">{localized(f.subtitle, lang)}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Feature highlights ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 100}>
              <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6">
                <div className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                  <HighlightIcon icon={h.icon} index={i} size={22} weight="duotone" />
                </div>
                <h3 className="text-foreground text-base font-semibold">{h.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{h.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <Reveal>
          <div className="border-border bg-card grid grid-cols-2 gap-8 rounded-3xl border px-6 py-10 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-primary text-4xl font-bold md:text-5xl">{s.value}</span>
                  <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                    {s.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Nhận xét của khách ĐÃ TỪNG THUÊ ĐÚNG mảng này — không lấy chung của cả
          web. Khách đang đọc trang quay sự kiện thì lời của một khách quay cưới
          không nói lên điều gì với họ. Khối tự ẩn nếu mảng này chưa có nhận xét
          nào được gắn vào. */}
      <TestimonialSection serviceId={service.id} />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <CTASection />

      {selectedProject && (
        <ProjectDetail project={toProjectDisplay(selectedProject, lang)} onClose={closeProject} />
      )}
    </div>
  );
};

export default ServicePage;
