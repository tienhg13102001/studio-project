import Reveal from "#components/Reveal";
import Seo from "#components/Seo";
import {
  ApertureIcon,
  FilmReelIcon,
  FilmSlateIcon,
  PlayCircleIcon,
} from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import LogoYellow from "../assets/icons/LogoYellow";

/** Decorative film icons that drift around the background. */
const FLOATERS = [
  { Icon: FilmReelIcon, className: "left-[8%] top-[18%] h-12 w-12", rot: "-12deg", delay: "0s" },
  { Icon: FilmSlateIcon, className: "right-[10%] top-[24%] h-14 w-14", rot: "10deg", delay: "1.2s" },
  { Icon: PlayCircleIcon, className: "left-[14%] bottom-[20%] h-10 w-10", rot: "8deg", delay: "0.6s" },
  { Icon: ApertureIcon, className: "right-[14%] bottom-[24%] h-16 w-16", rot: "-8deg", delay: "1.8s" },
] as const;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="text-foreground relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 font-sans">
      <Seo title="404 — Không tìm thấy trang" description="Trang bạn tìm không tồn tại." noindex />

      {/* ── Drifting brand-tinted glow blobs ── */}
      <div className="bg-primary/15 animate-nf-drift pointer-events-none absolute -top-20 -left-10 h-72 w-72 rounded-full blur-3xl" />
      <div className="bg-primary/10 animate-nf-drift2 pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full blur-3xl" />

      {/* ── Floating film icons ── */}
      {FLOATERS.map(({ Icon, className, rot, delay }, i) => (
        <Icon
          key={i}
          weight="thin"
          style={{ "--nf-rot": rot, animationDelay: delay } as CSSProperties}
          className={`text-primary/15 animate-nf-float pointer-events-none absolute ${className}`}
        />
      ))}

      {/* ── Sweeping scanline (film/scan vibe) ── */}
      <div className="animate-nf-scan via-primary/40 pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-linear-to-r from-transparent to-transparent" />

      {/* Chữ 404 nền mờ — trôi nhẹ */}
      <span className="animate-nf-float pointer-events-none absolute text-[20rem] leading-none font-bold text-white/4 select-none">
        404
      </span>

      {/* LogoYellow */}
      <Reveal direction="down" className="mb-10">
        <LogoYellow className="h-10 w-10 opacity-60" />
      </Reveal>

      {/* Nội dung chính */}
      <Reveal delay={120} className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="mb-2 flex items-center gap-3">
          <div className="bg-primary h-px w-10" />
          <span className="text-primary text-xs font-medium tracking-[0.3em] uppercase">
            Page not found
          </span>
          <div className="bg-primary h-px w-10" />
        </div>

        <h1 className="animate-nf-glitch text-5xl leading-none font-bold text-white md:text-7xl">
          Lost in frame
        </h1>

        <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed md:text-base">
          Trang bạn tìm không tồn tại hoặc đã bị xoá.
          <br />
          Hãy quay lại trang chủ.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground mt-6 rounded-full px-8 py-3 text-sm font-semibold tracking-wide transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          Về trang chủ
        </button>
      </Reveal>

      {/* Đường kẻ trang trí góc dưới */}
      <div className="via-primary/40 absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent to-transparent" />
    </div>
  );
};

export default NotFoundPage;
