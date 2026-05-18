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
      <div className="min-h-screen w-full flex flex-col font-sans text-white relative antialiased selection:bg-brand-yellow selection:text-black">
        <VideoBackground />
        {/* Header / Navbar */}
        <HeroSection />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer">
          <ArrowDown size={32} className="text-primary" />
        </div>
      </div>
    </>
  );
};

export default LandingPage;
