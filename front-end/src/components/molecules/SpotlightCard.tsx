import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "#lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  /** Diameter of the highlight in px. */
  size?: number;
};

/**
 * Wraps a card with a soft gold glow that follows the cursor — pure hover
 * polish, no layout change. Touch devices simply never trigger it (no hover),
 * so it's safe everywhere. The wrapper clips (overflow-hidden) so the glow
 * respects rounded corners; pass the card's rounding + surface via className.
 */
export default function SpotlightCard({ children, className, size = 260 }: Props) {
  const spotRef = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const spot = spotRef.current;
    if (!spot) return;
    spot.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    spot.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div onPointerMove={onMove} className={cn("group/spot relative overflow-hidden", className)}>
      {children}
      <div
        ref={spotRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(${size}px circle at var(--mx,50%) var(--my,50%), rgba(240,192,52,0.15), transparent 55%)`,
        }}
      />
    </div>
  );
}
