import Logo from "../../assets/icons/Logo";
import HeroCTA from "#components/molecules/HeroCTA";

const HeroSection = () => {
  return (
    <main className="grow flex flex-col items-center justify-center text-center px-4 z-10 pt-20 pb-24">
      <div className="mb-6 opacity-90">
        <Logo className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-white" />
      </div>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-4">
        <span className="block text-white">We are</span>
        <span className="block text-brand-yellow">BeeZ Production</span>
      </h1>
      <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light">
        BeeZ Production - Hanoi's premier video production agency crafting unforgettable content
        <br className="hidden md:block" /> for brands that dare to be different
      </p>
      <HeroCTA />
    </main>
  );
};

export default HeroSection;
