import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartLineUpIcon,
  DeviceMobileIcon,
  LightningIcon,
  MicrophoneStageIcon,
  PlayIcon,
  PlusIcon,
  RocketLaunchIcon,
  StarIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import { apiFetch, resolveAssetUrl } from "#lib/api";
import { useLanguage, type Lang } from "#i18n";
import { localized } from "#lib/localized";
import Seo from "#components/Seo";
import { Button } from "#components/ui/button";
import ProjectDetail from "#components/organisms/ProjectDetail";
import type { ApiProject, ApiService } from "#lib/apiTypes";
import type { ProjectDisplay } from "#hooks/useProjects";

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
  };
}

const ServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const vi = lang === "vi";

  const [service, setService] = useState<ApiService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openProject = (projectId: string) => {
    setSearchParams((prev) => {
      prev.set(PROJECT_PARAM, projectId);
      return prev;
    });
  };

  const closeProject = () => {
    setSearchParams((prev) => {
      prev.delete(PROJECT_PARAM);
      return prev;
    });
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<ApiService>(`/api/services/${id}`)
      .then(setService)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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
  const imageUrl = resolveAssetUrl(service.thumbnailImage);

  // Prominent projects float to the front of the showcase grid.
  const projects = [
    ...service.projects.filter((f) => f.prominent),
    ...service.projects.filter((f) => !f.prominent),
  ];

  const selectedProjectId = searchParams.get(PROJECT_PARAM);
  const selectedProject = selectedProjectId
    ? service.projects.find((f) => f.id === selectedProjectId) ?? null
    : null;

  // ── Static, localized supporting content (mirrors the 96hz shortform page) ──
  const highlights = [
    {
      icon: <MicrophoneStageIcon size={22} weight="duotone" />,
      title: vi ? "Talking Head" : "Talking Head Videos",
      desc: vi
        ? "Nội dung dẫn dắt bởi chuyên gia với motion graphics phức tạp."
        : "Expert-led content with complex motion graphics.",
    },
    {
      icon: <TrendUpIcon size={22} weight="duotone" />,
      title: vi ? "Nội Dung Bắt Trend" : "Trend-Based Content",
      desc: vi
        ? "Meme, audio thịnh hành, các format viral trên mọi lĩnh vực."
        : "Memes, trending audio, viral formats across industries.",
    },
    {
      icon: <DeviceMobileIcon size={22} weight="duotone" />,
      title: vi ? "Đa Nền Tảng" : "Multi-Platform",
      desc: vi
        ? "TikTok, YouTube Shorts, Facebook & Instagram Reels."
        : "TikTok, YouTube Shorts, Facebook & Instagram Reels.",
    },
  ];

  const stats = [
    { value: "1000+", label: vi ? "Video Đã Sản Xuất" : "Videos Produced" },
    { value: "5+", label: vi ? "Năm Kinh Nghiệm" : "Years Experience" },
    { value: "1B+", label: vi ? "Lượt Xem" : "Combined Views" },
    { value: "4", label: vi ? "Nền Tảng" : "Platforms" },
  ];

  return (
    <div className="min-h-screen">
      <Seo
        title={title}
        description={description.slice(0, 160)}
        path={`/service/${id}`}
        image={imageUrl}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-20 text-center md:pb-28">
        {/* Soft brand glow */}
        <div className="from-primary/15 via-background to-background pointer-events-none absolute inset-0 bg-linear-to-b" />
        <div className="bg-primary/20 pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <span className="border-primary/30 bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide">
            <LightningIcon size={14} weight="fill" />
            {vi ? "5+ Năm Kinh Nghiệm Đa Nền Tảng" : "5+ Years Multi-Platform Experience"}
          </span>

          <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-6xl">
            {title}
            <span className="from-primary via-chart-2 to-chart-4 mt-1 block bg-linear-to-r bg-clip-text text-transparent">
              {vi ? "Sản Xuất Video" : "Video Production"}
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
            {description}
          </p>
          <p className="text-muted-foreground/70 mx-auto mt-3 max-w-2xl text-sm leading-relaxed">
            {vi
              ? "Talking head chuyên nghiệp, motion graphics phức tạp, meme giải trí và video bắt trend cho mọi ngành hàng và phong cách!"
              : "Professional talking head content, complex motion graphics, entertainment memes, and trend-based videos for every industry and style!"}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-auto gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              <RocketLaunchIcon size={18} weight="fill" />
              {vi ? "Bắt Đầu Dự Án" : "Let's Talk"}
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-auto gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              <a href="#showcase">
                <PlayIcon size={16} weight="fill" />
                {vi ? "Xem Dự Án" : "View Work"}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {service.faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-foreground mb-10 text-center text-3xl font-bold">
            {vi ? "Câu Hỏi Thường Gặp" : "Frequently Asked Questions"}
          </h2>
          <div className="flex flex-col gap-3">
            {service.faqs.map((faq, i) => (
              <div key={i} className="border-border bg-card overflow-hidden rounded-2xl border">
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
            ))}
          </div>
        </section>
      )}

      {/* ── Video Showcase ───────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section id="showcase" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-foreground text-3xl font-bold">
              {vi ? "Thư Viện Video" : "Video Showcase"}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {vi
                ? "Một số dự án nội dung dạng ngắn của chúng tôi"
                : "Sample work from our shortform content production"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {projects.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => openProject(f.id)}
                className="group border-border bg-muted relative aspect-9/16 overflow-hidden rounded-2xl border text-left"
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
                    {vi ? "Nổi bật" : "Featured"}
                  </span>
                )}

                <div className="absolute right-0 bottom-0 left-0 p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-white/70">{localized(f.subtitle, lang)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Feature highlights ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6"
            >
              <div className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                {h.icon}
              </div>
              <h3 className="text-foreground text-base font-semibold">{h.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="border-border bg-card grid grid-cols-2 gap-8 rounded-3xl border px-6 py-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-primary text-4xl font-bold md:text-5xl">{s.value}</span>
              <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="from-primary/10 via-background to-background pointer-events-none absolute inset-0 bg-linear-to-t" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-foreground text-3xl font-bold md:text-4xl">
            {vi ? "Sẵn Sàng Tạo Nội Dung Viral?" : "Ready to Go Viral?"}
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            {vi
              ? "Cùng nhau xây dựng hệ thống nội dung dạng ngắn cho thương hiệu của bạn"
              : "Let's build your short-form content empire together"}
          </p>
          <Button
            onClick={() => navigate("/contact")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 h-auto gap-2 rounded-full px-8 py-3 text-sm font-semibold"
          >
            <ChartLineUpIcon size={18} weight="bold" />
            {vi ? "Bắt Đầu Ngay" : "Start Creating"}
            <ArrowRightIcon size={16} weight="bold" />
          </Button>
        </div>
      </section>

      {selectedProject && (
        <ProjectDetail project={toProjectDisplay(selectedProject, lang)} onClose={closeProject} />
      )}
    </div>
  );
};

export default ServicePage;
