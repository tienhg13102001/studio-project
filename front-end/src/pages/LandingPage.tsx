import Seo from "#components/Seo";
import FeatureSection from "#components/organisms/FeatureSection";
import HeroSection from "#components/organisms/HeroSection";
import Preloader from "#components/organisms/Preloader";
import ServiceSection from "#components/organisms/ServiceSection";
import StatsAndBrands from "#components/organisms/StatsAndBrands";
import { useLandingProgress } from "#hooks/useLandingProgress";
import { useState } from "react";

const LandingPage = () => {
  const [isReady, setIsReady] = useState(() => sessionStorage.getItem("preloaded") === "1");
  const { target } = useLandingProgress();

  const handlePreloaderComplete = () => {
    sessionStorage.setItem("preloaded", "1");
    setIsReady(true);
  };

  return (
    <>
      <Seo
        title="Agency sản xuất video & TVC tại Hà Nội"
        description="BeeZ Production — agency sản xuất video hàng đầu Hà Nội. TVC, phim quảng cáo, brand film và nội dung mạng xã hội điện ảnh cho những thương hiệu dám khác biệt."
        path="/"
      />
      {!isReady && <Preloader target={target} onComplete={handlePreloaderComplete} />}
      <div className="selection:text-primary relative flex w-full flex-col font-sans text-white antialiased">
        <HeroSection />
        <ServiceSection />
        <FeatureSection />
        <StatsAndBrands />
      </div>
    </>
  );
};

export default LandingPage;
