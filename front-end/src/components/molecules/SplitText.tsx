import { useEffect, useRef, useState, type CSSProperties } from "react";

type Props = {
  children: string;
  className?: string;
  /** ms between each character's entrance */
  stagger?: number;
  /** delay before the first character (ms) */
  delay?: number;
};

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Reveals a heading character-by-character (blur + rise) the first time it
 * scrolls into view. Renders an inline wrapper that carries the full accessible
 * label while the per-glyph spans are aria-hidden — so screen readers and SEO
 * still see the whole phrase. Reserve for 1–2 signature headings; the plain
 * `Reveal` covers everything else.
 */
export default function SplitText({ children, className, stagger = 34, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
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
          io.unobserve(el);
        }
      },
      // Fire slightly before it reaches the bottom edge so the motion plays in view.
      { threshold: 0, rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={className} aria-label={children} style={{ display: "inline-block" }}>
      {[...children].map((ch, i) => {
        const ms = delay + i * stagger;
        const style: CSSProperties = {
          display: "inline-block",
          whiteSpace: "pre",
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(0.4em)",
          filter: shown ? "blur(0)" : "blur(5px)",
          transition: `opacity 0.5s ease ${ms}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${ms}ms, filter 0.5s ease ${ms}ms`,
          willChange: "opacity, transform",
        };
        return (
          <span key={i} aria-hidden="true" style={style}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}
