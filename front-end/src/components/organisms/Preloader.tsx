import { useEffect, useState } from "react";
import Logo from "../../assets/icons/Logo";

type Props = {
  onComplete: () => void;
};

const Preloader = ({ onComplete }: Props) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = 3300;
    const interval = 20;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      // Ease-out cubic: nhanh ở đầu, chậm dần ở cuối
      const eased = Math.round((1 - Math.pow(1 - current / steps, 3)) * 100);
      setProgress(Math.min(eased, 100));

      if (current >= steps) {
        clearInterval(timer);
        setIsExiting(true);
        setTimeout(onComplete, 750);
      }
    }, interval);

    return () => clearInterval(timer);
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
