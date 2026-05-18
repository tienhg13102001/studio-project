type Props = {
  direction: "left" | "right";
  children: React.ReactNode;
};

const MarqueeRow: React.FC<Props> = ({ direction, children }) => (
  <div className="relative w-full">
    {/* Fade edges */}
    <div className="from-secondary-foreground pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r to-transparent md:w-32" />
    <div className="from-secondary-foreground pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l to-transparent md:w-32" />

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
