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

  /**
   * Tách theo TỪ trước, rồi mới tách từng chữ cái BÊN TRONG mỗi từ.
   *
   * VÌ SAO KHÔNG tách thẳng từng chữ cái như trước: mỗi chữ cái là một khối
   * `inline-block`, mà trình duyệt được phép xuống dòng giữa hai khối bất kỳ —
   * nên một từ bị cắt đôi giữa chừng. Trên điện thoại đã thấy thật:
   * "nội dung của bạn vi / ral".
   *
   * Bọc mỗi từ trong một khối `nowrap` thì chữ cái bên trong không tách ra được
   * nữa; chỗ duy nhất còn xuống dòng được là khoảng trắng GIỮA các từ — đúng như
   * chữ bình thường. Hiệu ứng không đổi: số thứ tự chữ cái vẫn chạy liên tục
   * xuyên suốt câu nên nhịp hiện ra y hệt.
   */
  const doan = children.split(/(\s+)/).filter((s) => s !== "");
  let thuTuChu = 0;

  return (
    <span ref={ref} className={className} aria-label={children} style={{ display: "inline-block" }}>
      {doan.map((tu, ti) => {
        // Khoảng trắng giữ nguyên — đây là chỗ DUY NHẤT được phép xuống dòng.
        if (/^\s+$/.test(tu)) {
          thuTuChu += tu.length;
          return (
            <span key={ti} aria-hidden="true" style={{ whiteSpace: "pre-wrap" }}>
              {tu}
            </span>
          );
        }
        return (
          <span
            key={ti}
            aria-hidden="true"
            style={{ display: "inline-block", whiteSpace: "nowrap" }}
          >
            {[...tu].map((ch, ci) => {
              const ms = delay + thuTuChu++ * stagger;
              const style: CSSProperties = {
                display: "inline-block",
                opacity: shown ? 1 : 0,
                transform: shown ? "translateY(0)" : "translateY(0.4em)",
                filter: shown ? "blur(0)" : "blur(5px)",
                transition: `opacity 0.5s ease ${ms}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${ms}ms, filter 0.5s ease ${ms}ms`,
                willChange: "opacity, transform",
              };
              return (
                <span key={ci} style={style}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
