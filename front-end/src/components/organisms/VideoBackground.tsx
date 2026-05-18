const VideoBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden bg-white">
      <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4"
          type="video/mp4"
        />
        Trình duyệt của bạn không hỗ trợ thẻ video.
      </video>
      <div className="absolute inset-0 bg-black/75" />
    </div>
  );
};

export default VideoBackground;
