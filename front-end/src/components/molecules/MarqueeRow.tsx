type Props = {
  direction: "left" | "right";
  children: React.ReactNode;
};

// Render 4 copies so even a small number of items fills the viewport
// and the infinite loop is always seamless (no visible gap).
const COPIES = 4;

const MarqueeRow: React.FC<Props> = ({ direction, children }) => (
  <div className="relative w-full overflow-hidden">
    <div className={direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}>
      {Array.from({ length: COPIES }).map((_, i) => (
        <div key={i} className="flex shrink-0 gap-4 px-2 md:gap-6 md:px-3" aria-hidden={i > 0}>
          {children}
        </div>
      ))}
    </div>

    {/* Mờ 2 mép bằng lớp gradient phủ (thay cho mask-image — tránh bug render
        trắng/đen trên iOS Safari). pointer-events-none để không chặn chạm. */}
    <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-[8%] bg-linear-to-r to-transparent" />
    <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-[8%] bg-linear-to-l to-transparent" />
  </div>
);

export default MarqueeRow;
