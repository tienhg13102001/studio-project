import HeroSection from "#components/organisms/HeroSection";
import Preloader from "#components/organisms/Preloader";
import { lazy, Suspense, useState } from "react";

const ServiceSection = lazy(() => import("#components/organisms/ServiceSection"));
const FeatureSection = lazy(() => import("#components/organisms/FeatureSection"));
const StatsAndBrands = lazy(() => import("#components/organisms/StatsAndBrands"));

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
        <Suspense fallback={null}>
          <ServiceSection />
          <FeatureSection />
          <StatsAndBrands />
        </Suspense>
      </div>
    </>
  );
};

export default LandingPage;
