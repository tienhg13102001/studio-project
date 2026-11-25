import { srcSetAnh } from "#lib/api";
import type { ServiceDisplay } from "#hooks/useServices";
import { useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { duongDanDichVu } from "#lib/urls";
import { useLanguage } from "#i18n";

type Props = {
  service: ServiceDisplay;
  /**
   * Thẻ nằm ngay màn đầu (3 thẻ đầu trang /service): tải ảnh NGAY, ưu tiên cao.
   * Để tải lười thì chính tấm ảnh lớn nhất màn đầu bị hoãn — Lighthouse đo nó là
   * phần tử LCP của trang /service (23/11/2026).
   */
  uuTien?: boolean;
};

// Tilt only where it helps: a real mouse, and not when the user asked for less
// motion. Touch/keyboard users get the plain card.
const canTilt = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ServiceCard: React.FC<Props> = ({ service, uuTien = false }) => {
  // Fall back to a branded gradient when the thumbnail is missing/broken so the
  // card never shows a broken-image icon + alt text.
  const { dd } = useLanguage();
  const [imgOk, setImgOk] = useState(true);
  // Ảnh thu nhỏ (srcset) lỗi — ví dụ vài giây máy chủ khởi động lại lúc đẩy web —
  // thì thử lại bằng ảnh gốc trước, chỉ khi ảnh gốc cũng lỗi mới ẩn ảnh.
  const [dungAnhNho, setDungAnhNho] = useState(true);
  const rootRef = useRef<HTMLAnchorElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = rootRef.current;
    if (!el || !canTilt()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(800px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 8}deg) scale(1.02)`;
    if (spotRef.current) {
      spotRef.current.style.setProperty("--mx", `${px * 100}%`);
      spotRef.current.style.setProperty("--my", `${py * 100}%`);
    }
  };
  const handleLeave = () => {
    if (rootRef.current) rootRef.current.style.transform = "";
  };

  return (
    // Dùng <Link> (tức thẻ <a> thật) thay vì div bắt sự kiện bấm: máy tìm kiếm
    // chỉ đi theo liên kết thật, nên trước đây 6 trang dịch vụ — nội dung giá trị
    // nhất của web — gần như không có đường nào để Google vào.
    <Link
      to={dd(duongDanDichVu(service))}
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="group border-border/30 from-primary/15 via-card to-background focus-visible:ring-primary relative block h-60 cursor-pointer overflow-hidden rounded-2xl border bg-linear-to-br transition-[transform,box-shadow] duration-200 ease-out transform-3d hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none"
    >
      {/* Hình nền với hiệu ứng zoom khi hover */}
      {imgOk && (
        <img
          src={service.thumbnailImage}
          srcSet={dungAnhNho ? srcSetAnh(service.thumbnailImage) : undefined}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          alt={service.title}
          loading={uuTien ? "eager" : "lazy"}
          fetchPriority={uuTien ? "high" : "auto"}
          onError={() => (dungAnhNho && srcSetAnh(service.thumbnailImage) ? setDungAnhNho(false) : setImgOk(false))}
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-80"
        />
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-transparent" />

      {/* Nội dung */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-5">
        {/* Tiêu đề và Mô tả */}
        <div className="mt-auto translate-y-2 transform border-t border-white/20 pt-4 transition-transform duration-300 group-hover:translate-y-0">
          <h3 className="mb-2 text-xl font-semibold tracking-wide text-white">{service.title}</h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-300 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
            {service.description}
          </p>
        </div>
      </div>

      {/* Spotlight bám theo con trỏ — sáng lên khi hover, ẩn ở trạng thái thường. */}
      <div
        ref={spotRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(200px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.18), transparent 55%)",
        }}
      />
    </Link>
  );
};

export default ServiceCard;
