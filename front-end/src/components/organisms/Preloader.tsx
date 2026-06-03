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

  const progressRef = useRef(0); // latest progress, readable inside callbacks
  const targetRef = useRef(target);
  const lastRef = useRef(0); // last rAF timestamp (for dt)
  // Fill speed in % per ms. Each completed API (one 25% step) should take
  // 0.5–1s, so the bar deliberately trails the (instant) API completion.
  const STEP = 25;
  const speedRef = useRef(STEP / 750);

  // Whenever the target rises, pick a fresh speed so each 25% step lasts 0.5–1s.
  useEffect(() => {
    targetRef.current = target;
    if (target > progressRef.current) {
      const perStepMs = 500 + Math.random() * 500; // 0.5s – 1s for one API step
      speedRef.current = STEP / perStepMs;
    }
  }, [target]);

  // Advance progress at the current speed, scaled by real elapsed time (dt).
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = Math.min(50, now - lastRef.current); // clamp if the tab was backgrounded
      lastRef.current = now;
      setProgress((current) => {
        if (current >= targetRef.current) return current;
        const next = Math.min(targetRef.current, current + speedRef.current * dt);
        progressRef.current = next;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

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
            className="bg-primary h-full rounded-full"
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
