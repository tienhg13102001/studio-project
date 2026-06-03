import { Children, useEffect, useRef, type FC, type ReactNode } from "react";

type Props = {
  direction: "left" | "right";
  children: ReactNode;
};

// Mỗi "group" nên có ~10 card để phủ kín màn rộng (không hở mép).
const TARGET_PER_GROUP = 10;
// Tốc độ cuộn (px/giây).
const SPEED_PX_PER_SEC = 40;
// Khi hover: tốc độ mục tiêu (theo tỉ lệ so với bình thường) — vẫn trôi chậm, không dừng hẳn.
const HOVER_SPEED_FACTOR = 0.15;
// Độ "đằm" của quá trình tăng/giảm tốc (cao = đổi nhanh hơn). ~0.4s để về tốc độ mới.
const EASE_RATE = 4;

/**
 * Marquee cuộn ngang vô hạn — điều khiển bằng requestAnimationFrame + translate3d
 * theo pixel ĐO THỰC TẾ (scrollWidth), KHÔNG dùng CSS animation + translateX(%).
 *
 * Lý do: trên iOS Safari, animation CSS với `width: max-content` + translateX(%)
 * hay bị tính sai phần trăm (đứng yên) hoặc rớt paint của layer (biến mất nhưng
 * vẫn bấm được). rAF + translate3d(px) chạy ổn định trên mọi trình duyệt.
 *
 * Render đúng 2 group giống hệt nhau; wrap offset trong [-half, 0] → loop liền mạch.
 */
const MarqueeRow: FC<Props> = ({ direction, children }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  // speedRef = hệ số tốc độ hiện tại; targetRef = hệ số đang hướng tới (1 = full).
  const speedRef = useRef(1);
  const targetRef = useRef(1);
  const hoverCapableRef = useRef(false);

  const baseCount = Math.max(1, Children.count(children));
  const repeats = Math.max(1, Math.ceil(TARGET_PER_GROUP / baseCount));

  useEffect(() => {
    hoverCapableRef.current = window.matchMedia("(hover: hover)").matches;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const dir = direction === "left" ? -1 : 1;
    let half = track.scrollWidth / 2; // 2 group giống hệt → 1 group = nửa
    let offset = dir === 1 ? -half : 0; // "right" bắt đầu lệch trái rồi trôi sang phải
    let last = 0;
    let raf = 0;

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000); // clamp tránh nhảy khi tab quay lại
      last = now;

      // Nội suy mượt hệ số tốc độ về mục tiêu → tăng/giảm tốc từ từ thay vì giật.
      speedRef.current += (targetRef.current - speedRef.current) * Math.min(1, dt * EASE_RATE);

      if (half <= 0) half = track.scrollWidth / 2;
      if (half > 0) {
        offset += dir * SPEED_PX_PER_SEC * speedRef.current * dt;
        if (offset <= -half) offset += half;
        else if (offset >= 0) offset -= half;
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      half = track.scrollWidth / 2;
    });
    ro.observe(track);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [direction, repeats, baseCount]);

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => {
        if (hoverCapableRef.current) targetRef.current = HOVER_SPEED_FACTOR;
      }}
      onMouseLeave={() => {
        targetRef.current = 1;
      }}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {Array.from({ length: repeats * 2 }).map((_, i) => (
          <div key={i} className="flex shrink-0 gap-4 px-2 md:gap-6 md:px-3" aria-hidden={i > 0}>
            {children}
          </div>
        ))}
      </div>

      {/* Mờ 2 mép bằng lớp gradient phủ (pointer-events-none để không chặn chạm). */}
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-[8%] bg-linear-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-[8%] bg-linear-to-l to-transparent" />
    </div>
  );
};

export default MarqueeRow;
