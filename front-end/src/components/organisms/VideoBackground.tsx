import videoBg from "../../assets/video/video-bg.webm";

const VideoBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden ">
      <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
        <source src={videoBg} type="video/webm" />
        Trình duyệt của bạn không hỗ trợ thẻ video.
      </video>
      <div className="absolute inset-0 bg-black/75" />
    </div>
  );
};

export default VideoBackground;
