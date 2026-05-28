import FeatureSection from "#components/organisms/FeatureSection";
import HeroSection from "#components/organisms/HeroSection";
import Preloader from "#components/organisms/Preloader";
import ServiceSection from "#components/organisms/ServiceSection";
import StatsAndBrands from "#components/organisms/StatsAndBrands";
import { useState } from "react";

const LandingPage = () => {
  const [isReady, setIsReady] = useState(() => sessionStorage.getItem("preloaded") === "1");

  const handlePreloaderComplete = () => {
    sessionStorage.setItem("preloaded", "1");
    setIsReady(true);
  };

  return (
    <>
      {!isReady && <Preloader onComplete={handlePreloaderComplete} />}
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
