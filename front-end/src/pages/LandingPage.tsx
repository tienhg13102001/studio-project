import VideoBackground from "#components/organisms/VideoBackground";
import HeroSection from "#components/organisms/HeroSection";
import { ArrowDown } from "@phosphor-icons/react";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col font-sans text-white relative antialiased selection:bg-brand-yellow selection:text-black">
      <VideoBackground />
      {/* Header / Navbar */}
      <HeroSection />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer">
        <ArrowDown size={32} className="text-primary"/>
      </div>
    </div>
  );
};

export default LandingPage;
