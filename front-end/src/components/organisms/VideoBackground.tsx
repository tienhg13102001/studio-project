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
 * Điện thoại CŨNG chạy video như máy tính: màn hình đầu tiên là thứ quyết định
 * ấn tượng về một hãng làm phim, mà phần lớn khách vào bằng điện thoại — cắt
 * video ở đó là cắt đúng chỗ cần nhất.
 *
 * Vẫn chừa hai lối thoát, và chỉ hai: khách tự bật tiết kiệm dữ liệu, hoặc tự
 * bật giảm chuyển động trong hệ điều hành. Đó là lựa chọn của họ, không phải
 * mình đoán hộ.
 */
function useShouldPlayVideo(): boolean {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => {
      // `saveData` chỉ có trên một số trình duyệt — không có thì coi như không bật.
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      setPlay(!reduced.matches && !conn?.saveData);
    };
    decide();
    reduced.addEventListener("change", decide);
    return () => reduced.removeEventListener("change", decide);
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
      {/* Lớp tối để chữ trắng đọc được. Trước để 75% — video và ảnh nền gần như
          biến mất sau nó, đổi ảnh trong portal cũng không thấy khác gì. */}
      <div className="absolute inset-0 bg-black/60" />
      {/* background black mờ dần từ dưới lên */}
      <div className="absolute inset-0 bg-linear-to-b from-background/10 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent" />
    </div>
  );
};

export default VideoBackground;
