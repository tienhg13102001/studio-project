type Props = {
  direction: "left" | "right";
  children: React.ReactNode;
};

const MarqueeRow: React.FC<Props> = ({ direction, children }) => (
  <div
    className="relative w-full overflow-hidden"
    style={{
      maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
    }}
  >

    <div className={direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}>
      <div className="flex shrink-0 gap-4 pl-4 pr-4 md:gap-6 md:pl-6 md:pr-6">
        {children}
      </div>
      <div className="flex shrink-0 gap-4 pr-4 md:gap-6 md:pr-6" aria-hidden>
        {children}
      </div>
    </div>
  </div>
);

export default MarqueeRow;
