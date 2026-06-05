import Reveal from "#components/Reveal";
import SectionHeader from "#components/molecules/SectionHeader";
import { useProjectPhotos } from "#hooks/useProjectPhotos";
import { useTranslation } from "#i18n";
import { cn } from "#lib/utils";
import { XIcon } from "@phosphor-icons/react";
import { useEffect, useState, type FC } from "react";

// Số ảnh tối đa render để section không quá dài / nặng trên mobile.
const MAX_PHOTOS = 18;

/**
 * Một ô ảnh trong gallery: hiện skeleton pulse trong lúc ảnh tải, rồi fade-in
 * mượt khi `onLoad` — tránh cảnh ảnh "nhảy" ra đột ngột hoặc khoảng trắng khi
 * mạng chậm. Bấm vào để mở lightbox.
 */
const GalleryImage: FC<{ src: string; index: number; onOpen: (src: string) => void }> = ({
  src,
  index,
  onOpen,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onOpen(src)}
      aria-label={`Xem ảnh ${index + 1}`}
      className="group border-border bg-muted focus-visible:ring-primary relative block w-full break-inside-avoid overflow-hidden rounded-2xl border focus-visible:ring-2 focus-visible:outline-none"
    >
      {/* Skeleton giữ chỗ + nhịp pulse trong lúc chờ tải; min-height để cột không sụp. */}
      {!loaded && <div className="bg-foreground/8 absolute inset-0 min-h-50 animate-pulse" />}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-auto w-full object-cover transition-all duration-700 ease-out group-hover:scale-105",
          loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-sm",
        )}
      />
    </button>
  );
};

const ProductGallery: FC = () => {
  const t = useTranslation();
  const { photos, loading } = useProjectPhotos();
  // Ảnh đang phóng to (lightbox). null = đóng. — giống cơ chế icon mắt ở ProjectDetail.
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Đóng lightbox bằng phím Escape + khoá scroll body khi đang mở.
  useEffect(() => {
    if (!lightboxSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSrc(null);
    };
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [lightboxSrc]);

  if (loading) {
    // Skeleton grid trong lúc gọi API — giữ bố cục ổn định, không nhảy layout.
    return (
      <section className="overflow-hidden py-16 font-sans md:py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <SectionHeader title={t.gallery.sectionTitle} subtitle={t.gallery.sectionSubtitle} />
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 *:mb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "bg-foreground/8 w-full break-inside-avoid animate-pulse rounded-2xl",
                  i % 3 === 0 ? "h-72" : i % 3 === 1 ? "h-56" : "h-64",
                )}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Không có ảnh nào → ẩn hẳn section, tránh khoảng trống.
  if (!photos || photos.length === 0) return null;

  const items = photos.slice(0, MAX_PHOTOS);

  return (
    <section className="overflow-hidden py-16 font-sans md:py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <Reveal>
          <SectionHeader title={t.gallery.sectionTitle} subtitle={t.gallery.sectionSubtitle} />
        </Reveal>

        {/* Masonry-style layout qua CSS columns: ảnh giữ nguyên tỉ lệ, lấp đầy đẹp mắt. */}
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 *:mb-4">
          {items.map((src, i) => (
            <Reveal key={`${src}-${i}`} direction="up" delay={(i % 4) * 80}>
              <GalleryImage src={src} index={i} onOpen={setLightboxSrc} />
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox: phóng to ảnh khi bấm — giống icon con mắt trong ProjectDetail. */}
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
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </section>
  );
};

export default ProductGallery;
