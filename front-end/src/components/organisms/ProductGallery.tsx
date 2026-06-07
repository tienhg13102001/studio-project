import Reveal from "#components/Reveal";
import SectionHeader from "#components/molecules/SectionHeader";
import { useProjectPhotos } from "#hooks/useProjectPhotos";
import { useLanguage, useTranslation } from "#i18n";
import { localized } from "#lib/localized";
import { cn } from "#lib/utils";
import { XIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type FC } from "react";

// Số ảnh tối đa mỗi nhóm — giữ khối bento gọn trong khung, không dàn quá dài.
const MAX_PER_GROUP = 12;

/**
 * Vị trí của một ô trong lưới bento (chỉ áp dụng từ breakpoint sm trở lên — trên
 * mobile mọi ô là 1x1 cho gọn). Mẫu lặp mỗi 4 ô lấp đầy đúng khối 4 cột × 2 hàng
 * nên đáy luôn phẳng, không bị lởm chởm. grid-flow-dense lấp các khe trống.
 */
function bentoSpan(i: number): string {
  const m = i % 4;
  if (m === 0) return "sm:col-span-2 sm:row-span-2"; // ô lớn vuông
  if (m === 3) return "sm:col-span-2"; // ô ngang
  return ""; // ô vuông nhỏ
}

/**
 * Một ô ảnh trong gallery: hiện skeleton pulse trong lúc ảnh tải, rồi fade-in
 * mượt khi `onLoad`. Bấm vào để mở lightbox.
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
      className="group border-border bg-muted focus-visible:ring-primary relative block h-full w-full overflow-hidden rounded-2xl border focus-visible:ring-2 focus-visible:outline-none"
    >
      {!loaded && <div className="bg-foreground/8 absolute inset-0 animate-pulse" />}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105",
          loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-sm",
        )}
      />
    </button>
  );
};

const ProductGallery: FC = () => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const { groups, loading } = useProjectPhotos();
  // Tag đang chọn. null = chưa chọn → mặc định rơi về nhóm đầu tiên (xem `active`).
  const [activeTag, setActiveTag] = useState<string | null>(null);
  // Ảnh đang phóng to (lightbox). null = đóng.
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const active = useMemo(
    () => groups?.find((g) => g.tag === activeTag) ?? groups?.[0] ?? null,
    [groups, activeTag],
  );

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
    return (
      <section className="overflow-hidden py-16 font-sans md:py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <SectionHeader title={t.gallery.sectionTitle} subtitle={t.gallery.sectionSubtitle} />
          <div className="mx-auto grid max-w-3xl auto-rows-[110px] grid-cols-2 gap-3 grid-flow-dense sm:auto-rows-[150px] sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn("bg-foreground/8 animate-pulse rounded-2xl", bentoSpan(i))}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Không có ảnh nào → ẩn hẳn section, tránh khoảng trống.
  if (!groups || groups.length === 0 || !active) return null;

  const items = active.photos.slice(0, MAX_PER_GROUP);

  return (
    <section className="overflow-hidden py-16 font-sans md:py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <Reveal>
          <SectionHeader title={t.gallery.sectionTitle} subtitle={t.gallery.sectionSubtitle} />
        </Reveal>

        {/* Tabs lọc theo tag (chỉ hiện khi có nhiều hơn 1 nhóm). */}
        {groups.length > 1 && (
          <Reveal>
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {groups.map((g) => {
                const isActive = g.tag === active.tag;
                const label = localized(g.title, lang) || g.tag;
                return (
                  <button
                    key={g.tag}
                    type="button"
                    onClick={() => setActiveTag(g.tag)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* Lưới bento — đóng khung trong max-w-3xl, đáy phẳng, không dàn hết section. */}
        <div className="mx-auto grid max-w-3xl auto-rows-[110px] grid-cols-2 gap-3 grid-flow-dense sm:auto-rows-[150px] sm:grid-cols-4">
          {items.map((src, i) => (
            <Reveal
              key={`${active.tag}-${src}-${i}`}
              direction="up"
              delay={(i % 4) * 80}
              className={bentoSpan(i)}
            >
              <GalleryImage src={src} index={i} onOpen={setLightboxSrc} />
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox: phóng to ảnh khi bấm. */}
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
