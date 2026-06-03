import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "#lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

type Props = {
  children: ReactNode;
  className?: string;
  /** Travel direction as it enters (default "up" = rises from below). */
  direction?: Direction;
  /** Entrance delay in ms — use for staggering siblings. */
  delay?: number;
  /** Transition duration in ms. */
  duration?: number;
  /** Travel distance in px. */
  distance?: number;
  /** Re-animate each time it enters the viewport (default: animate once). */
  repeat?: boolean;
};

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Wraps children and reveals them (fade + slide) when scrolled into view — or
 * immediately on mount if already visible. One mechanism covers both the
 * "animate on mount" and "fly in on scroll" cases. Honours reduced-motion.
 */
export default function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 700,
  distance = 28,
  repeat = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (!repeat) io.unobserve(el);
        } else if (repeat) {
          setShown(false);
        }
      },
      // Trigger slightly before fully in view so it feels responsive.
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [repeat]);

  const offset: Record<Direction, string> = {
    up: `translate3d(0, ${distance}px, 0)`,
    down: `translate3d(0, -${distance}px, 0)`,
    left: `translate3d(${distance}px, 0, 0)`,
    right: `translate3d(-${distance}px, 0, 0)`,
    none: "translate3d(0, 0, 0)",
  };

  const style: CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "translate3d(0, 0, 0)" : offset[direction],
    transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} className={cn(className)} style={style}>
      {children}
    </div>
  );
}
