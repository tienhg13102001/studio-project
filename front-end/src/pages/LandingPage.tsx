type Props = {};

const LandingPage = (props: Props) => {
  return (
    <div className="min-h-screen w-full flex flex-col font-sans text-white relative antialiased selection:bg-brand-yellow selection:text-black">
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden bg-white">
        {/* Thẻ video: autoplay (tự chạy), loop (lặp lại), muted (tắt tiếng - bắt buộc để tự chạy), playsinline (cho mobile) */}
        <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
          {/* Thay đổi link src dưới đây bằng link video 3s của bạn (định dạng mp4, webm) */}
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4"
            type="video/mp4"
          />
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
        {/* Lớp phủ gradient đen (Overlay 75%) để văn bản luôn dễ đọc */}
        <div className="absolute inset-0 bg-black/75" />
      </div>
      {/* Header / Navbar */}

      {/* Main Hero Content */}
      <main className="grow flex flex-col items-center justify-center text-center px-4 z-10 pt-20 pb-24">
        {/* Center Logo (Lớn hơn) */}
        <div className="mb-6 opacity-90">
          <svg className="w-20 h-20 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x={2} y={7} width={20} height={15} rx={2} ry={2} />
            <polyline points="17 2 12 7 7 2" />
            <text x={12} y={17} fontSize={6} textAnchor="middle" fontWeight="bold" fill="white" stroke="none">
              9,6Hz
            </text>
          </svg>
        </div>
        {/* Typography: Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-4">
          <span className="block text-white">Creative Video</span>
          <span className="block text-brand-yellow">Production Agency</span>
        </h1>
        {/* Subheading */}
        <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          9,6Hz Agency - Hanoi's premier video production agency crafting unforgettable content
          <br className="hidden md:block" /> for brands that dare to be different
        </p>
        {/* CTA Buttons & Socials */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Contact Button */}
          <button className="bg-brand-yellow hover:bg-yellow-500 text-black font-semibold px-8 py-3.5 rounded-full transition-transform hover:-translate-y-1 w-full sm:w-auto text-sm tracking-wide">
            LIÊN HỆ 9,6Hz
          </button>
          {/* View Work Button */}
          <button className="bg-transparent border border-gray-400 hover:border-white hover:bg-white/5 text-white font-medium px-8 py-3.5 rounded-full transition-all w-full sm:w-auto text-sm tracking-wide">
            Xem Dự Án
          </button>
          {/* Social Icons Divider (nhỏ) */}
          <div className="hidden sm:block w-px h-8 bg-gray-600 mx-2" />
          {/* Socials */}
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {/* Instagram */}
            <a
              href="#"
              className="w-10 h-10 rounded-full insta-gradient flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
            >
              <i className="fa-brands fa-instagram text-lg" />
            </a>
            {/* Zalo (Giả lập vì icon font không có sẵn icon chuẩn, dùng text) */}
            <a
              href="#"
              className="w-10 h-10 rounded-full zalo-bg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg font-bold text-[10px] tracking-tighter"
            >
              Zalo
            </a>
          </div>
        </div>
      </main>
      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer">
        <i className="fa-solid fa-arrow-down text-brand-yellow text-xl" />
      </div>
    </div>
  );
};

export default LandingPage;
