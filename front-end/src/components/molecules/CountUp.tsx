import { useEffect, useRef, useState } from "react";

type Props = {
  /** Raw display value, e.g. "1000+", "100+", "1 Tỷ". */
  value: string;
  className?: string;
  /** Count duration in ms. */
  durationMs?: number;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts the numeric part of `value` up from zero the first time it scrolls into
 * view, keeping any surrounding text intact ("1000+" counts, the "+" stays).
 * Values whose number is < 10 (e.g. "1 Tỷ") render static — counting 0→1 reads
 * as broken rather than impressive. Honours prefers-reduced-motion.
 */
export default function CountUp({ value, className, durationMs = 1600 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(/\d[\d.,]*/);
    const target = match ? parseInt(match[0].replace(/[.,]/g, ""), 10) : NaN;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Nothing worth animating (no number, tiny number, or user opted out) →
    // leave the label exactly as authored.
    if (!match || !Number.isFinite(target) || target < 10 || reduce) {
      setDisplay(value);
      return;
    }

    const render = (n: number) => value.replace(match[0], String(n));
    setDisplay(render(0));

    let raf = 0;
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min((ts - startTs) / durationMs, 1);
      setDisplay(render(Math.round(target * easeOut(p))));
      if (p < 1) raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(step);
          io.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
