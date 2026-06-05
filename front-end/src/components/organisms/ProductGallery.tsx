import Reveal from "#components/Reveal";
import SectionHeader from "#components/molecules/SectionHeader";
import { useProjectPhotos } from "#hooks/useProjectPhotos";
import { useTranslation } from "#i18n";
import { XIcon } from "@phosphor-icons/react";
import { useEffect, useState, type FC } from "react";

// Số ảnh tối đa render để section không quá dài / nặng trên mobile.
const MAX_PHOTOS = 18;

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

  // Ẩn hẳn section khi đang tải hoặc không có ảnh nào — tránh khoảng trống.
  if (loading || !photos || photos.length === 0) return null;

  const items = photos.slice(0, MAX_PHOTOS);

  return (
    <section className="overflow-hidden py-16 font-sans md:py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <Reveal>
          <SectionHeader title={t.gallery.sectionTitle} subtitle={t.gallery.sectionSubtitle} />
        </Reveal>

        {/* Masonry-style layout qua CSS columns: ảnh giữ nguyên tỉ lệ, lấp đầy đẹp mắt. */}
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {items.map((src, i) => (
            <Reveal key={`${src}-${i}`} direction="up" delay={(i % 4) * 80}>
              <button
                type="button"
                onClick={() => setLightboxSrc(src)}
                aria-label={`Xem ảnh ${i + 1}`}
                className="group border-border bg-muted focus-visible:ring-primary block w-full break-inside-avoid overflow-hidden rounded-2xl border focus-visible:ring-2 focus-visible:outline-none"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
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
