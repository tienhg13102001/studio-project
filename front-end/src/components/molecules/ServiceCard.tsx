import type { ServiceDisplay } from "#hooks/useServices";
import { useRef, useState, type PointerEvent } from "react";

type Props = {
  service: ServiceDisplay;
};

// Tilt only where it helps: a real mouse, and not when the user asked for less
// motion. Touch/keyboard users get the plain card.
const canTilt = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ServiceCard: React.FC<Props> = ({ service }) => {
  // Fall back to a branded gradient when the thumbnail is missing/broken so the
  // card never shows a broken-image icon + alt text.
  const [imgOk, setImgOk] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
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
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="group border-border/30 from-primary/15 via-card to-background relative h-60 cursor-pointer overflow-hidden rounded-2xl border bg-linear-to-br transition-[transform,box-shadow] duration-200 ease-out [transform-style:preserve-3d] hover:shadow-lg"
      onClick={() => (window.location.href = `/service/${service.id}`)}
    >
      {/* Hình nền với hiệu ứng zoom khi hover */}
      {imgOk && (
        <img
          src={service.thumbnailImage}
          alt={service.title}
          loading="lazy"
          onError={() => setImgOk(false)}
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
    </div>
  );
};

export default ServiceCard;
