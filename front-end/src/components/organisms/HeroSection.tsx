import HeroCTA from "#components/molecules/HeroCTA";
import ShinyText from "#components/molecules/ShinyText";
import { useLanguage } from "#i18n";
import { useLanding } from "#hooks/useLanding";
import { useSettings } from "#hooks/useSettings";
import { ArrowDownIcon } from "@phosphor-icons/react";
import LogoTiaDien from "#components/molecules/LogoTiaDien";
import VideoBackground from "./VideoBackground";

const HeroSection = () => {
  const { lang } = useLanguage();
  const { data } = useLanding(lang);
  const { backgroundImage } = useSettings();

  // Use mock as fallback while API loads to avoid layout shift
  const content = data ?? {
    heroLine1: lang === "en" ? "Welcome to" : "Chào mừng đến với",
    heroLine2: "BeeZ Production",
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
      {/* Logo có tia điện chạy dọc viền. `opacity-90` bỏ đi: làm mờ cả khối thì
          quầng sáng của tia cũng mờ theo, mà chính quầng đó mới ra chất điện. */}
      <div className="mb-6">
        <LogoTiaDien className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24" />
      </div>
      <h1 className="mb-4 text-4xl leading-tight font-bold tracking-tight md:text-6xl lg:text-7xl">
        <span className="block text-white">{content.heroLine1}</span>
        <ShinyText className="block">{content.heroLine2}</ShinyText>
      </h1>
      <p className="mx-auto mb-5 max-w-2xl text-sm leading-relaxed font-light text-gray-300 md:mb-10 md:text-base">
        {content.subheading}
      </p>
      <HeroCTA />
      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce cursor-pointer"
        onClick={handleScrollDown}
      >
        <ArrowDownIcon size={32} className="text-primary" />
      </div>
      {/* Ảnh nền cấu hình trong portal được dùng làm ảnh chờ cho video, và thay
          hẳn video trên điện thoại. */}
      <VideoBackground src={data?.videoBackground} poster={backgroundImage || undefined} />
    </section>
  );
};

export default HeroSection;
