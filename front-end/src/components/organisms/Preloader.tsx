import { useEffect, useRef, useState } from "react";
import LogoYellow from "../../assets/icons/LogoYellow";
import TextType from "#components/molecules/TextType";

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
  /**
   * Thời gian cho MỘT bậc 25%.
   *
   * Trước đây là 500–1000ms mỗi bậc, tức là thanh chạy hết 2–4 GIÂY dù dữ liệu
   * đã về từ giây thứ 1,5. Đo trên web thật ngày 21/08/2026: lớp phủ hiện lúc
   * 2994ms, tới 100% lúc 7052ms — khách ngồi nhìn hơn bốn giây không vì lý do
   * gì. Hoàn báo đúng chỗ này.
   *
   * 120–200ms vẫn đủ để thanh chạy thành một chuyển động mượt chứ không nhảy
   * giật từng khấc, mà tổng thời gian còn khoảng nửa giây.
   */
  const BAC_MS_MIN = 120;
  const BAC_MS_THEM = 80;
  /** Thời gian trượt lên và gỡ khỏi trang. Phải khớp với `duration-300` bên dưới. */
  const THOAT_MS = 320;
  const speedRef = useRef(STEP / (BAC_MS_MIN + BAC_MS_THEM));

  // Whenever the target rises, pick a fresh speed so each 25% step lasts 0.5–1s.
  useEffect(() => {
    targetRef.current = target;
    if (target > progressRef.current) {
      const perStepMs = BAC_MS_MIN + Math.random() * BAC_MS_THEM;
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

  /**
   * Giữ `onComplete` trong một ô nhớ thay vì cho nó vào danh sách phụ thuộc.
   *
   * ĐÂY LÀ CHỖ HỎNG CŨ: `onComplete` được khai lại mỗi lần trang cha vẽ lại, nên
   * nó là một hàm MỚI mỗi lần. Nó nằm trong danh sách phụ thuộc, nên chỉ cần
   * trang cha vẽ lại trong 750ms chờ thoát là hiệu ứng chạy lại → phần dọn dẹp
   * huỷ mất hẹn giờ → mà thân hàm thì bị chặn bởi `exitedRef` nên KHÔNG đặt hẹn
   * mới. Kết quả: lớp phủ trượt lên khuất mắt nhưng `onComplete` không bao giờ
   * chạy.
   *
   * Đo trên web thật: sau khi thanh đầy và lớp phủ đã trượt lên,
   * `sessionStorage.preloaded` vẫn là `null`. Nghĩa là khách quay lại trang chủ
   * trong cùng phiên phải ngồi xem lại từ đầu, và một thẻ div chết nằm lại
   * trong trang.
   */
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  /**
   * Thanh đã đầy VÀ dữ liệu đã về → chạy hiệu ứng thoát đúng một lần.
   *
   * KHÔNG huỷ hẹn giờ trong phần dọn dẹp của chính hiệu ứng này. Nó phụ thuộc
   * `target` và `progress`; chỉ cần một trong hai nhúc nhích trong 320ms chờ
   * thoát là dọn dẹp chạy, hẹn giờ bị huỷ, mà thân hàm thì đã bị `exitedRef`
   * chặn nên không đặt lại. Đó đúng là cái đã xảy ra: đo trên web thật thấy lớp
   * phủ trượt lên khuất mắt nhưng `sessionStorage.preloaded` mãi là `null`.
   *
   * Hẹn giờ giữ trong một ô nhớ và chỉ huỷ khi component thật sự bị gỡ — xem
   * hiệu ứng ngay dưới.
   */
  const hanGioRef = useRef<number | null>(null);
  useEffect(() => {
    if (!(target >= 100 && progress >= 99.5) || exitedRef.current) return;
    exitedRef.current = true;
    setIsExiting(true);
    hanGioRef.current = window.setTimeout(() => onCompleteRef.current(), THOAT_MS);
  }, [target, progress]);

  // Chỉ dọn khi bị gỡ khỏi trang, không dọn theo mỗi lần vẽ lại.
  useEffect(
    () => () => {
      if (hanGioRef.current !== null) window.clearTimeout(hanGioRef.current);
    },
    [],
  );

  const shown = Math.round(progress);

  return (
    <div
      className={`bg-background fixed inset-0 z-50 flex flex-col items-center justify-center transition-transform duration-300 ease-in-out ${
        isExiting ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <LogoYellow className="mb-6 h-14 w-14 opacity-80" />

      {/* Gõ chữ 40ms/ký tự chứ không phải 90ms mặc định: 15 ký tự x 90ms = 1,35s,
          dài hơn cả thời gian lớp phủ tồn tại sau khi rút ngắn, nên chữ chưa gõ
          xong đã bị trượt đi mất. */}
      <TextType
        text="BEEZ PRODUCTION"
        speed={40}
        className="text-foreground mb-10 text-sm font-semibold tracking-[0.25em] select-none"
      />

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
