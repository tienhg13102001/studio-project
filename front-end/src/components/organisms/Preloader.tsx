import { useEffect, useState } from "react";
import Logo from "../../assets/icons/Logo";

type Props = {
  onComplete: () => void;
};

const Preloader = ({ onComplete }: Props) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let current = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      // 15% chance burst (+4–7), otherwise normal (+1–3)
      const isBurst = Math.random() < 0.15;
      const increment = isBurst
        ? Math.floor(Math.random() * 4) + 4
        : Math.floor(Math.random() * 3) + 1;

      current = Math.min(current + increment, 100);
      setProgress(current);

      if (current >= 100) {
        setIsExiting(true);
        setTimeout(onComplete, 750);
        return;
      }

      // Chậm lại gần các mốc 25 / 55 / 80 / 92
      const isSlowZone = [25, 55, 80, 92].some((cp) => Math.abs(current - cp) < 4);
      // 12% khả năng "khựng" - dừng lại 300–700ms
      const isPause = Math.random() < 0.12;

      let delay: number;
      if (isPause) {
        delay = 300 + Math.random() * 400;
      } else if (isSlowZone) {
        delay = 100 + Math.random() * 150;
      } else {
        delay = 25 + Math.random() * 55;
      }

      timeoutId = setTimeout(tick, delay);
    };

    timeoutId = setTimeout(tick, 120);
    return () => clearTimeout(timeoutId);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center transition-transform duration-700 ease-in-out ${
        isExiting ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Logo className="w-14 h-14 mb-12 opacity-80" />

      {/* Thanh trượt */}
      <div className="w-64 md:w-96 flex flex-col gap-3">
        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-[width] duration-75 ease-linear" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500 tabular-nums select-none">
          <span className="tracking-widest uppercase">Loading</span>
          <span className="text-white font-medium">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
