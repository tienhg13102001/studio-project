import HeroSection from "#components/organisms/HeroSection";
import Preloader from "#components/organisms/Preloader";
import VideoBackground from "#components/organisms/VideoBackground";
import { ArrowDown } from "@phosphor-icons/react";
import { useState } from "react";

const LandingPage = () => {
  const [isReady, setIsReady] = useState(false);

  const handlePreloaderComplete = () => {
    setIsReady(true);
  };

  return (
    <>
      {!isReady && <Preloader onComplete={handlePreloaderComplete} />}
      <div className="relative flex min-h-dvh w-full flex-col font-sans text-white antialiased selection:text-primary">
        <VideoBackground />
        {/* Header / Navbar */}
        <HeroSection />
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce cursor-pointer">
          <ArrowDown size={32} className="text-primary" />
        </div>
      </div>
    </>
  );
};

export default LandingPage;
