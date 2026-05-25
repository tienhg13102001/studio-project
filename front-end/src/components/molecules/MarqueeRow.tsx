type Props = {
  direction: "left" | "right";
  children: React.ReactNode;
};

// Render 4 copies so even a small number of items fills the viewport
// and the infinite loop is always seamless (no visible gap).
const COPIES = 4;

const MarqueeRow: React.FC<Props> = ({ direction, children }) => (
  <div
    className="relative w-full overflow-hidden"
    style={{
      maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
    }}
  >
    <div className={direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}>
      {Array.from({ length: COPIES }).map((_, i) => (
        <div
          key={i}
          className="flex shrink-0 gap-4 px-4 md:gap-6 md:px-6"
          aria-hidden={i > 0}
        >
          {children}
        </div>
      ))}
    </div>
  </div>
);

export default MarqueeRow;
