import { useEffect, useState } from "react";

type Props = {
  src?: string;
  /** Ảnh hiện ngay trong lúc video chưa tải, và thay hẳn video trên điện thoại. */
  poster?: string;
};

const mimeFromSrc = (url?: string) => {
  const ext = url?.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return "video/mp4";
};

const DEFAULT_POSTER = "/bg-main.webp";

/**
 * Quyết định có tải video nền hay không.
 *
 * Video nền nặng vài chục MB. Trên điện thoại khung hình đằng nào cũng bị cắt
 * gần hết mà lại tốn dung lượng 4G của khách, nên chỉ hiện ảnh tĩnh. Cũng bỏ
 * qua khi khách bật tiết kiệm dữ liệu hoặc giảm chuyển động.
 */
function useShouldPlayVideo(): boolean {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const decide = () => {
      const bigScreen = window.matchMedia("(min-width: 768px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // `saveData` chỉ có trên một số trình duyệt — không có thì coi như không bật.
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      setPlay(bigScreen && !reduced && !conn?.saveData);
    };
    decide();
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", decide);
    return () => mq.removeEventListener("change", decide);
  }, []);

  return play;
}

const VideoBackground = ({ src, poster }: Props) => {
  const shouldPlay = useShouldPlayVideo();
  const posterSrc = poster || DEFAULT_POSTER;

  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
      {shouldPlay && src ? (
        <video
          key={src}
          autoPlay
          loop
          muted
          playsInline
          // Hiện ảnh ngay lập tức thay vì khung đen chờ video buffer xong.
          poster={posterSrc}
          preload="metadata"
          className="absolute top-0 left-0 h-full w-full object-cover"
        >
          <source src={src} type={mimeFromSrc(src)} />
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      ) : (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          // Đây là ảnh đầu tiên khách nhìn thấy nên tải sớm, không lazy.
          fetchPriority="high"
          decoding="async"
          className="absolute top-0 left-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/75" />
      {/* background black mờ dần từ dưới lên */}
      <div className="absolute inset-0 bg-linear-to-b from-background/10 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent" />
    </div>
  );
};

export default VideoBackground;
