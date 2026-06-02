import { Children, type FC, type ReactNode } from "react";

type Props = {
  direction: "left" | "right";
  children: ReactNode;
};

// Mỗi "nửa" track nên có ~10 card để phủ kín cả màn hình rộng (không hở mép).
const TARGET_PER_HALF = 10;

/**
 * Marquee cuộn ngang vô hạn. Số bản copy được tính THÍCH ỨNG theo số card:
 * - Ít card → nhân nhiều bản để vẫn phủ kín màn rộng (không hở).
 * - Nhiều card → ít bản, để phần tử KHÔNG quá rộng vượt giới hạn texture GPU
 *   của iOS Safari (nguyên nhân marquee "biến mất" nhưng vẫn bấm được trên iPhone).
 * Luôn render đúng 2 track giống hệt nhau → animation dịch -50% là loop liền mạch.
 */
const MarqueeRow: FC<Props> = ({ direction, children }) => {
  const baseCount = Math.max(1, Children.count(children));
  const repeats = Math.max(1, Math.ceil(TARGET_PER_HALF / baseCount));
  const totalCopies = repeats * 2; // 2 track → translateX -50% loop liền mạch

  return (
    <div className="relative w-full overflow-hidden">
      <div className={direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}>
        {Array.from({ length: totalCopies }).map((_, i) => (
          <div key={i} className="flex shrink-0 gap-4 px-2 md:gap-6 md:px-3" aria-hidden={i > 0}>
            {children}
          </div>
        ))}
      </div>

      {/* Mờ 2 mép bằng lớp gradient phủ (thay cho mask-image — tránh bug render
          trắng/đen trên iOS Safari). pointer-events-none để không chặn chạm. */}
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-[8%] bg-linear-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-[8%] bg-linear-to-l to-transparent" />
    </div>
  );
};

export default MarqueeRow;
