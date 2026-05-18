import HeroSection from "#components/organisms/HeroSection";
import Preloader from "#components/organisms/Preloader";
import ServiceSection from "#components/organisms/ServiceSection";
import VideoBackground from "#components/organisms/VideoBackground";
import { useState } from "react";

const LandingPage = () => {
  const [isReady, setIsReady] = useState(false);

  const handlePreloaderComplete = () => {
    setIsReady(true);
  };

  return (
    <>
      {!isReady && <Preloader onComplete={handlePreloaderComplete} />}
      <div className="relative flex w-full flex-col font-sans text-white antialiased selection:text-primary">
        {/* Hero Section */}
        <HeroSection />
        {/* Service Section */}
        <ServiceSection />
      </div>
    </>
  );
};

export default LandingPage;
