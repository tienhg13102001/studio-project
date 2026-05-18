import HeroCTA from "#components/molecules/HeroCTA";
import { useLanguage } from "#i18n";
import { ArrowDownIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import Logo from "../../assets/icons/Logo";
import { getLandingContent } from "../../mocks/landingContent";
import VideoBackground from "./VideoBackground";

const HeroSection = () => {
  const { lang } = useLanguage();
  const content = useMemo(() => getLandingContent(lang), [lang]);

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <main className="relative z-10 flex min-h-dvh grow flex-col items-center justify-center px-4 pt-20 text-center lg:pb-24">
      <div className="mb-6 opacity-90">
        <Logo className="h-16 w-16 text-white md:h-20 md:w-20 lg:h-24 lg:w-24" />
      </div>
      <h1 className="mb-4 text-4xl leading-tight font-bold tracking-tight md:text-6xl lg:text-7xl">
        <span className="block text-white">{content.heroLine1}</span>
        <span className="text-primary block">{content.heroLine2}</span>
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
      <VideoBackground />
    </main>
  );
};

export default HeroSection;
