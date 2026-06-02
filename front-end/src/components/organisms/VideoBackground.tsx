type Props = {
  src?: string;
};

const mimeFromSrc = (url?: string) => {
  const ext = url?.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return "video/mp4";
};

const VideoBackground = ({ src }: Props) => {
  const videoSrc = src;

  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
      <video
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 h-full w-full object-cover"
      >
        <source src={videoSrc} type={mimeFromSrc(videoSrc)} />
        Trình duyệt của bạn không hỗ trợ thẻ video.
      </video>
      <div className="absolute inset-0 bg-black/75" />
      {/* background black mờ dần từ dưới lên */}
      <div className="absolute inset-0 bg-linear-to-b from-background/10 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent" />
    </div>
  );
};

export default VideoBackground;
