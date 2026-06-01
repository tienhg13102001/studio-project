import { useEffect, useRef, useState } from "react";
import LogoYellow from "../../assets/icons/LogoYellow";

type Props = {
  /** 0-100, target progress driven by API loading state. */
  target: number;
  onComplete: () => void;
};

const Preloader = ({ target, onComplete }: Props) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const exitedRef = useRef(false);

  // Smoothly animate current progress toward the target (no jumpy 25 / 50 / 75 steps).
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setProgress((current) => {
        if (current >= target) return current;
        const delta = Math.max(0.5, (target - current) * 0.06); // ease-out: faster when far
        const next = Math.min(target, current + delta);
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  // When fully loaded AND the bar visually caught up → trigger exit once.
  useEffect(() => {
    if (target >= 100 && progress >= 99.5 && !exitedRef.current) {
      exitedRef.current = true;
      setIsExiting(true);
      const t = window.setTimeout(onComplete, 750);
      return () => window.clearTimeout(t);
    }
  }, [target, progress, onComplete]);

  const shown = Math.round(progress);

  return (
    <div
      className={`bg-background fixed inset-0 z-50 flex flex-col items-center justify-center transition-transform duration-700 ease-in-out ${
        isExiting ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <LogoYellow className="mb-12 h-14 w-14 opacity-80" />

      <div className="flex w-64 flex-col gap-3 md:w-96">
        <div className="bg-muted h-0.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-muted-foreground flex items-center justify-between text-xs tabular-nums select-none">
          <span className="tracking-widest uppercase">Loading</span>
          <span className="text-foreground font-medium">{shown}%</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
