import { useState } from "react";

type Props = {
  /** Địa chỉ video gốc của dự án (…/api/videos/<tên>.mp4). */
  video?: string;
  /** Thẻ cha đang được rê chuột vào. */
  dangRe: boolean;
};

/**
 * Đoạn video 4 giây phát khi rê chuột lên thẻ dự án (24/11/2026, mục G8).
 *
 * - Chỉ máy có chuột thật và không bật giảm chuyển động: điện thoại không có rê
 *   chuột, tải video cho nó là phí 4G.
 * - Chỉ tải khi rê chuột lần đầu (không tải sẵn cả lưới 74 thẻ).
 * - Máy chủ chưa cắt xong đoạn (trả 404) thì im lặng để lại ảnh như cũ.
 * Đoạn video do back-end/routes/xem-truoc.ts cắt; đường dẫn tương đối để luôn
 * cùng tên miền với trang.
 */
const XemTruocVideo = ({ video, dangRe }: Props) => {
  const [daMo, setDaMo] = useState(false);
  const [hong, setHong] = useState(false);
  const [duocPhep] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  // Nhớ "đã rê chuột lần nào chưa" ngay lúc vẽ (không cần effect).
  if (dangRe && !daMo) setDaMo(true);

  const ten = video?.match(/\/api\/videos\/([^/?#]+\.(?:mp4|webm|mov))$/i)?.[1];
  if (!ten || !duocPhep || !daMo || hong) return null;

  return (
    <video
      src={`/api/xem-truoc/${ten}`}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      onError={() => setHong(true)}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
        dangRe ? "opacity-100" : "opacity-0"
      }`}
    />
  );
};

export default XemTruocVideo;
