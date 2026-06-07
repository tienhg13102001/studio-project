import Reveal from "#components/Reveal";
import SectionHeader from "#components/molecules/SectionHeader";
import { useProjectPhotos } from "#hooks/useProjectPhotos";
import { useLanguage, useTranslation } from "#i18n";
import { localized } from "#lib/localized";
import { cn } from "#lib/utils";
import { XIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FC } from "react";

// Số ảnh tối đa mỗi nhóm — giữ khối gallery gọn trong khung, không dàn quá dài.
const MAX_PER_GROUP = 12;
const GAP = 6; // khoảng cách giữa các ảnh (px) — nhỏ cho thoáng nhẹ
// Tỉ lệ mặc định (w/h) khi chưa đo được ảnh — đa số ảnh là chân dung nên giả định dọc.
const DEFAULT_RATIO = 0.72;

type Row = { indexes: number[]; height: number };

/**
 * Justified-rows layout (kiểu Flickr): mỗi ảnh giữ NGUYÊN tỉ lệ gốc (không crop);
 * mỗi hàng được scale để lấp đầy đúng chiều rộng khung, các hàng cao bằng nhau.
 * Hàng cuối không bị kéo giãn full-width (giữ chiều cao mục tiêu) để ảnh lẻ không
 * phình to bất thường.
 */
function justify(ratios: number[], width: number, targetHeight: number): Row[] {
  if (width <= 0) return [];
  const rows: Row[] = [];
  let cur: number[] = [];
  let ratioSum = 0;
  for (let i = 0; i < ratios.length; i++) {
    cur.push(i);
    ratioSum += ratios[i];
    const rowWidth = ratioSum * targetHeight + GAP * (cur.length - 1);
    if (rowWidth >= width) {
      const avail = width - GAP * (cur.length - 1);
      rows.push({ indexes: cur, height: avail / ratioSum });
      cur = [];
      ratioSum = 0;
    }
  }
  if (cur.length) {
    const avail = width - GAP * (cur.length - 1);
    rows.push({ indexes: cur, height: Math.min(targetHeight, avail / ratioSum) });
  }
  return rows;
}

/**
 * Một ô ảnh: hiện skeleton pulse trong lúc tải, fade-in mượt khi `onLoad`, đồng
 * thời báo tỉ lệ gốc lên trên để layout justified tính toán. Bấm để mở lightbox.
 */
const GalleryImage: FC<{
  src: string;
  index: number;
  style: CSSProperties;
  onOpen: (src: string) => void;
  onRatio: (src: string, ratio: number) => void;
}> = ({ src, index, style, onOpen, onRatio }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onOpen(src)}
      aria-label={`Xem ảnh ${index + 1}`}
      style={style}
      className="group border-border/40 bg-muted focus-visible:ring-primary relative block shrink-0 overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:outline-none"
    >
      {!loaded && <div className="bg-foreground/8 absolute inset-0 animate-pulse" />}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={(e) => {
          const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
          if (w > 0 && h > 0) onRatio(src, w / h);
          setLoaded(true);
        }}
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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  // Tỉ lệ gốc (w/h) của từng ảnh, đo khi ảnh load — dùng cho layout justified.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  // Chiều rộng thật của khung gallery — theo dõi để layout co giãn theo màn hình.
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => groups?.find((g) => g.tag === activeTag) ?? groups?.[0] ?? null,
    [groups, activeTag],
  );
  const items = useMemo(() => active?.photos.slice(0, MAX_PER_GROUP) ?? [], [active]);

  // Theo dõi chiều rộng khung để tính lại layout khi resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  const rows = useMemo(() => {
    if (!width) return [];
    const targetHeight = width < 480 ? 190 : width < 640 ? 230 : 260;
    const rs = items.map((src) => ratios[src] ?? DEFAULT_RATIO);
    return justify(rs, width, targetHeight);
  }, [items, ratios, width]);

  const onRatio = (src: string, ratio: number) =>
    setRatios((prev) => (prev[src] === ratio ? prev : { ...prev, [src]: ratio }));

  // Đóng lightbox bằng Escape + khoá scroll body khi đang mở.
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
          <div className="mx-auto flex max-w-3xl flex-wrap gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-foreground/8 h-60 flex-1 animate-pulse rounded-lg"
                style={{ minWidth: i % 2 ? 180 : 220 }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!groups || groups.length === 0 || !active) return null;

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

        {/* Justified rows — đóng khung trong max-w-3xl, ảnh giữ đúng tỉ lệ (không crop). */}
        <div ref={containerRef} className="mx-auto flex max-w-3xl flex-col" style={{ gap: GAP }}>
          {rows.map((row, ri) => (
            <div key={`${active.tag}-${ri}`} className="flex" style={{ gap: GAP }}>
              {row.indexes.map((i) => {
                const src = items[i];
                const ratio = ratios[src] ?? DEFAULT_RATIO;
                return (
                  <GalleryImage
                    key={`${src}-${i}`}
                    src={src}
                    index={i}
                    style={{ width: row.height * ratio, height: row.height }}
                    onOpen={setLightboxSrc}
                    onRatio={onRatio}
                  />
                );
              })}
            </div>
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
