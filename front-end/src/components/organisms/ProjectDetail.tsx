import MediaPlayer from "#components/molecules/MediaPlayer";
import { Button } from "#components/ui/button";
import type { ProjectDisplay } from "#hooks/useProjects";
import { useTranslation } from "#i18n";
import { cn } from "#lib/utils";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CheckIcon,
  EyeIcon,
  FilmReelIcon,
  LinkIcon,
  MapPinIcon,
  PlayCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, type CSSProperties, type FC } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  project: ProjectDisplay;
  onClose: () => void;
};

/** Formats an ISO/date string like "2024-05-01" → "01/05/2024"; returns "" if invalid. */
function formatShootDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("vi-VN");
}

/** Bottom-sheet bounds: collapsed peek (px) and max share of the viewport. */
const SHEET_PEEK = 150;
const SHEET_MAX_RATIO = 0.6; // tối đa 50dvh

const maxSheetHeight = () =>
  typeof window !== "undefined" ? window.innerHeight * SHEET_MAX_RATIO : 400;

const ProjectDetail: FC<Props> = ({ project, onClose }) => {
  const navigate = useNavigate();
  const t = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  // Bottom sheet drag state — free-drag in px, capped at SHEET_MAX_RATIO of the
  // viewport. Lives where released ("kéo tới đâu dừng tới đó").
  const [sheetHeight, setSheetHeight] = useState(SHEET_PEEK);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ y: number; h: number } | null>(null);
  const isSheetExpanded = sheetHeight > SHEET_PEEK + 4;
  const totalImages = project?.photos?.length || 0;
  // Ảnh đang phóng to (lightbox). null = đóng.
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback for non-secure contexts where the Clipboard API is unavailable
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Đóng lightbox bằng phím Escape
  useEffect(() => {
    if (!lightboxSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxSrc]);

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    dragStart.current = { y: e.touches[0].clientY, h: sheetHeight };
    setDragging(true);
  };

  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (!dragStart.current) return;
    // Drag up grows the sheet; clamp between the peek and 50dvh.
    const delta = dragStart.current.y - e.touches[0].clientY;
    const next = Math.min(Math.max(dragStart.current.h + delta, SHEET_PEEK), maxSheetHeight());
    setSheetHeight(next);
  };

  const handleSheetTouchEnd = () => {
    dragStart.current = null;
    setDragging(false); // stays exactly where released
  };

  // Caret button: snap between peek and full (50dvh).
  const toggleSheet = () =>
    setSheetHeight((h) => (h > SHEET_PEEK + 4 ? SHEET_PEEK : maxSheetHeight()));

  const handleNext = () => {
    if (currentIndex < totalImages - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Hàm tính toán CSS linh hoạt cho từng thẻ ảnh dựa trên vị trí của nó so với ảnh hiện tại
  const getCardStyle = (index: number): CSSProperties => {
    const offset = index - currentIndex;

    if (offset === 0) {
      // Thẻ đang hiển thị chính (Active)
      return {
        transform: "translateY(0px) scale(1) rotate(0deg)",
        transformOrigin: "bottom center",
        zIndex: 20,
        opacity: 1,
      };
    } else if (offset > 0 && offset <= 3) {
      // Các thẻ phía sau — hiệu ứng xoè bài
      const rotation = offset * 7; // 7°, 14°, 21°
      const translateY = offset * 10; // dịch xuống 10px, 20px, 30px
      const scale = 1 - offset * 0.03; // thu nhỏ nhẹ theo khoảng cách
      const zIndex = 20 - offset * 5; // z-index giảm dần
      return {
        transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: "bottom center",
        zIndex,
        opacity: 1,
        pointerEvents: "none" as const,
      };
    } else if (offset > 3) {
      // Các thẻ quá xa — ẩn đi, giữ vị trí cuối của nhóm xoè
      return {
        transform: "translateY(30px) scale(0.91) rotate(28deg)",
        transformOrigin: "bottom center",
        zIndex: 0,
        opacity: 0,
        pointerEvents: "none" as const,
      };
    } else {
      // Các thẻ đã qua — trượt sang trái và biến mất
      return {
        transform: "translateX(-110%) scale(0.95) rotate(-5deg)",
        transformOrigin: "bottom center",
        zIndex: 30,
        opacity: 0,
        pointerEvents: "none" as const,
      };
    }
  };

  return (
    <div className="bg-background/95 text-foreground fixed inset-0 z-50 flex h-dvh w-screen items-start justify-center overflow-hidden font-sans transition-opacity duration-300 lg:items-center lg:overflow-y-auto">
      {/* Icon close */}
      <Button
        onClick={onClose}
        className="bg-foreground/10 text-foreground hover:bg-foreground/20 fixed top-6 right-6 z-60 h-10 w-10 rounded-full p-3 backdrop-blur-md transition-colors"
      >
        <XIcon size={20} />
      </Button>

      {/* MOBILE LAYOUT */}
      <div className="relative h-dvh w-full overflow-hidden lg:hidden">
        {/* Video / Thumbnail — height tracks the sheet so the media always sits
            flush above its top edge, shrinking as the sheet is dragged up. */}
        <div
          className="absolute top-0 right-0 left-0 flex items-center justify-center bg-black"
          style={{
            height: `calc(100dvh - ${sheetHeight}px)`,
            transition: dragging ? "none" : "height 300ms ease-out",
          }}
        >
          {project.video ? (
            <MediaPlayer
              src={project.video}
              poster={project.thumbnailImage}
              alt={project.title}
              className="h-full w-full"
              videoClassName="object-contain"
            />
          ) : (
            <img
              src={project.thumbnailImage}
              alt={project.title}
              className="h-full w-full object-contain"
            />
          )}
        </div>

        {/* Draggable Bottom Sheet */}
        <div
          className="bg-card/95 text-card-foreground absolute right-0 bottom-0 left-0 z-40 flex flex-col rounded-t-3xl backdrop-blur-md"
          style={{
            height: `${sheetHeight}px`,
            transition: dragging ? "none" : "height 300ms ease-out",
          }}
        >
          {/* Drag handle + Header — the grab zone that resizes the sheet */}
          <div
            onTouchStart={handleSheetTouchStart}
            onTouchMove={handleSheetTouchMove}
            onTouchEnd={handleSheetTouchEnd}
            className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="bg-muted-foreground/40 h-1 w-10 rounded-full" />
            </div>

            <div className="flex items-start justify-between gap-3 px-5 pb-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="bg-foreground/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <FilmReelIcon size={22} className="text-foreground" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h1 className="text-foreground truncate text-base font-bold">{project.title}</h1>
                  <div className="mt-1.5 flex items-center gap-2">
                    {project.subtitle && (
                      <span className="text-muted-foreground truncate text-xs">
                        {project.subtitle}
                      </span>
                    )}
                    {project.tag && (
                      <span className="bg-primary/20 text-primary inline-block rounded-md px-2 py-0.5 text-[11px] font-medium">
                        {project.tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label={copied ? "Đã copy đường dẫn" : "Copy đường dẫn"}
                  className="bg-foreground/10 text-foreground hover:bg-foreground/20 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                >
                  {copied ? (
                    <CheckIcon size={16} className="text-primary" />
                  ) : (
                    <LinkIcon size={16} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleSheet}
                  className="bg-foreground/10 text-foreground hover:bg-foreground/20 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                >
                  <CaretDownIcon
                    size={16}
                    className={cn(
                      "transition-transform duration-300",
                      !isSheetExpanded && "rotate-180",
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable expanded content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-10">
            <div className="mt-4">
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                {t.project.about}
              </h3>
              <p className="text-foreground/80 text-sm leading-relaxed">{project.subtitle}</p>
            </div>

            {(project.shootLocation || project.shootDate) && (
              <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-sm">
                {project.shootLocation && (
                  <div className="flex items-center gap-1.5">
                    <MapPinIcon size={15} /> {project.shootLocation}
                  </div>
                )}
                {project.shootDate && (
                  <div className="flex items-center gap-1.5">
                    <CalendarBlankIcon size={15} /> {formatShootDate(project.shootDate)}
                  </div>
                )}
              </div>
            )}

            {project.members && project.members.length > 0 && (
              <div className="mt-4">
                <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  {t.project.members}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.members.map((m) => (
                    <span
                      key={m}
                      className="bg-foreground/10 text-foreground/80 rounded-full px-3 py-1 text-xs"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.photos && totalImages > 0 && (
              <>
                <div className="border-border my-6 border-t" />
                <div>
                  <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                    {t.project.productImages}
                  </h3>
                  {/* Masonry — keeps each photo's natural ratio (Pinterest style) */}
                  <div className="columns-2 gap-2">
                    {project.photos.map((image, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLightboxSrc(image)}
                        aria-label={`Xem ảnh ${idx + 1}`}
                        className="group focus-visible:ring-primary mb-2 block w-full break-inside-avoid overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <img
                          src={image}
                          alt={`Behind the scenes ${idx + 1}`}
                          loading="lazy"
                          className="h-auto w-full transition-transform duration-300 group-active:scale-95"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div
        className={cn(
          "relative hidden w-full items-center gap-10 px-8 lg:flex lg:flex-row max-w-480",
          totalImages > 0 ? "lg:justify-start" : "lg:justify-center",
        )}
      >
        {/* CỘT TRÁI: VIDEO NẾU CÓ */}
        {project.video && (
          <div className="grow relative flex w-full justify-center lg:w-1/3">
            <MediaPlayer
              src={project.video}
              poster={project.thumbnailImage}
              alt={project.title}
              // Box co theo video: cao tối đa 80vh, rộng tối đa cột → giữ NGUYÊN
              // tỉ lệ gốc (video dọc hay ngang đều không bị crop / méo).
              className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl"
              videoClassName="h-auto max-h-[80vh] w-auto max-w-full object-contain"
            />
          </div>
        )}
        {/* CỘT GIỮA: THÔNG TIN (Info Column) */}
        <div className="border-border relative z-30 flex h-fit w-full flex-col justify-center space-y-8 rounded-3xl border px-10 py-20 backdrop-blur-sm lg:w-1/3">
          {/* Copy link button — top-right corner */}
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label={copied ? "Đã copy đường dẫn" : "Copy đường dẫn"}
            className="bg-foreground/10 text-foreground hover:bg-foreground/20 absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          >
            {copied ? <CheckIcon size={16} className="text-primary" /> : <LinkIcon size={16} />}
          </button>

          {/* Header Info */}
          <div>
            <span className="bg-primary/20 text-primary mb-4 inline-block rounded-md px-3 py-1 text-sm font-medium">
              {project.tag}
            </span>
            <h1 className="text-foreground mb-4 flex items-center gap-3 text-4xl font-bold">
              <span className="bg-foreground/10 rounded-lg p-2">
                <FilmReelIcon size={24} className="text-foreground" />
              </span>
              {project.title}
            </h1>

            {(project.shootLocation || project.shootDate) && (
              <div className="text-muted-foreground flex flex-wrap items-center gap-6 text-sm">
                {project.shootLocation && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon size={16} /> {project.shootLocation}
                  </div>
                )}
                {project.shootDate && (
                  <div className="flex items-center gap-2">
                    <CalendarBlankIcon size={16} /> {formatShootDate(project.shootDate)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-border border-t" />

          {/* About */}
          <div>
            <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wider uppercase">
              {t.project.about}
            </h3>
            <p className="text-foreground/80 text-sm leading-relaxed">{project.subtitle}</p>
          </div>

          {/* Members */}
          {project.members && project.members.length > 0 && (
            <div>
              <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wider uppercase">
                {t.project.members}
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.members.map((m) => (
                  <span
                    key={m}
                    className="bg-foreground/10 text-foreground/80 rounded-full px-3 py-1 text-xs"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-colors"
            onClick={() => navigate("/service")}
          >
            {t.project.watchMore} <PlayCircleIcon size={20} />
          </button>
        </div>

        {/* CỘT PHẢI: SLIDER HÌNH ẢNH (Slider Column) */}
        {project.photos && totalImages > 0 && (
          <div className="relative flex h-100 w-full items-center lg:h-150 lg:w-1/3">
            {/* Khu vực chứa các thẻ ảnh */}
            <div className="relative flex h-full w-full items-center justify-center md:h-full">
              {project.photos.map((image, index) => {
                const overlayOpacity = Math.min(Math.max(index - currentIndex, 0) * 0.3, 0.85);
                return (
                  <div
                    key={index}
                    className="bg-muted absolute top-0 left-0 h-full w-full origin-center overflow-hidden rounded-2xl shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    style={getCardStyle(index)}
                  >
                    <img src={image} alt={image} className="h-full w-full object-cover" />

                    {/* Gradient để dễ đọc text trên ảnh - giữ đen vì luôn nằm trên ảnh */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20"></div>

                    {/* Lớp phủ đen tối dần theo khoảng cách */}
                    <div
                      className="absolute inset-0 bg-black transition-all duration-700 rounded-lg"
                      style={{ opacity: overlayOpacity }}
                    ></div>

                    {/* Số thứ tự - giữ trắng vì luôn trên ảnh */}
                    <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium tracking-widest text-white backdrop-blur-sm">
                      {index + 1} / {totalImages}
                    </div>

                    {/* Tiêu đề & Icon - giữ trắng vì luôn trên ảnh */}
                    <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between">
                      <h2 className="text-xl font-semibold text-white drop-shadow-sm md:text-2xl">
                        {project.title}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setLightboxSrc(image)}
                        aria-label="Phóng to ảnh"
                        className="rounded-full bg-black/40 p-3 backdrop-blur-md transition-colors hover:bg-black/60"
                      >
                        <EyeIcon size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-0 left-0 z-40 flex w-full flex-col items-center gap-4 translate-y-[200%]">
              <div className="flex items-center gap-6">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={cn(
                    "flex items-center justify-center rounded-full p-3 transition-all",
                    currentIndex === 0
                      ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                      : "bg-foreground/10 text-foreground hover:bg-foreground/20 backdrop-blur-md",
                  )}
                >
                  <ArrowLeftIcon size={24} />
                </button>

                <span className="text-muted-foreground text-sm tracking-widest uppercase">
                  {t.project.clickArrows}
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === totalImages - 1}
                  className={cn(
                    "flex items-center justify-center rounded-full p-3 transition-all",
                    currentIndex === totalImages - 1
                      ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                      : "bg-foreground/10 text-foreground hover:bg-foreground/20 backdrop-blur-md",
                  )}
                >
                  <ArrowRightIcon size={24} />
                </button>
              </div>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {project.photos &&
                  project.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        idx === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/40 w-1.5",
                      )}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox: phóng to ảnh khi bấm icon con mắt */}
      {lightboxSrc && (
        <div
          className="animate-in fade-in fixed inset-0 z-120 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm duration-200"
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            aria-label="Đóng"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <XIcon size={24} />
          </button>
          <img
            src={lightboxSrc}
            alt={project.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
