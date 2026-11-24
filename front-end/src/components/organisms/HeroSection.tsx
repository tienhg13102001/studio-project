import HeroCTA from "#components/molecules/HeroCTA";
import { useLanguage } from "#i18n";
import { useLanding } from "#hooks/useLanding";
import { useSettings } from "#hooks/useSettings";
import { ArrowDownIcon } from "@phosphor-icons/react";
import LogoYellow from "../../assets/icons/LogoYellow";
import VideoBackground from "./VideoBackground";

const HeroSection = () => {
  const { lang } = useLanguage();
  const { data } = useLanding(lang);
  const { backgroundImage } = useSettings();

  // Use mock as fallback while API loads to avoid layout shift
  const content = data ?? {
    heroLine1: lang === "en" ? "Welcome to" : "Chào mừng đến với",
    heroLine2: "Bee Z Production",
    subheading:
      lang === "en"
        ? "Your one-stop creative studio for stunning visuals and unforgettable stories"
        : "Studio sáng tạo tất cả trong một của bạn cho hình ảnh tuyệt đẹp và câu chuyện khó quên",
  };

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative z-10 flex min-h-screen grow flex-col items-center justify-center px-4 pt-20 text-center lg:pb-24">
      {/* MÀN ĐẦU CHỈ MỘT ĐIỂM NHẤN — video nền (Hoàn chốt 24/11/2026).
          Trước đó 5 thứ lặp mãi cùng lúc: video, chữ quét sáng, tia điện quanh
          logo, mũi tên nảy, vòng sáng nút Zalo. Logo giờ đứng yên (bỏ tia điện
          theo ý Hoàn), chữ vàng đứng yên. `LogoTiaDien` và `ShinyText` vẫn giữ
          trong mã nguồn nếu sau này muốn dùng chỗ khác. */}
      <div className="mb-6">
        <LogoYellow className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24" />
      </div>
      <h1 className="mb-4 text-4xl leading-tight font-bold tracking-tight md:text-6xl lg:text-7xl">
        <span className="block text-white">{content.heroLine1}</span>
        <span className="text-primary block">{content.heroLine2}</span>
      </h1>
      <p className="mx-auto mb-5 max-w-2xl text-sm leading-relaxed font-light text-gray-300 md:mb-10 md:text-base">
        {content.subheading}
      </p>
      <HeroCTA />
      {/* Mũi tên đứng yên (thôi nảy). Là <button> thật để bàn phím và trình đọc
          màn hình dùng được. */}
      <button
        type="button"
        aria-label="Cuộn xuống phần tiếp theo"
        className="focus-visible:ring-primary absolute bottom-8 left-1/2 z-10 -translate-x-1/2 cursor-pointer rounded-full p-1 focus-visible:ring-2 focus-visible:outline-none"
        onClick={handleScrollDown}
      >
        <ArrowDownIcon size={32} className="text-primary" />
      </button>
      {/* Ảnh nền cấu hình trong portal được dùng làm ảnh chờ cho video, và thay
          hẳn video trên điện thoại. */}
      <VideoBackground src={data?.videoBackground} poster={backgroundImage || undefined} />
    </section>
  );
};

export default HeroSection;
