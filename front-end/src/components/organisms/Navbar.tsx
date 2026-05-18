import { Sun, User } from "lucide-react";
import Logo from "../../assets/icons/Logo";

type Props = {};

const Navbar: React.FC<Props> = (props) => {
  return (
    <nav className="w-full py-4 px-6 md:px-12 flex items-center justify-between z-20 absolute top-0 left-0 bg-black/10 backdrop-blur-sm">
      {/* Logo Left */}
      <div className="flex items-center cursor-pointer">
        {/* Icon TV Placeholder cho logo */}
        <Logo className="w-8 h-8 text-white" />
      </div>
      {/* Center Navigation (Ẩn trên mobile) */}
      <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
        <a href="#" className="relative nav-active text-white hover:text-gray-300 transition-colors">
          Home
        </a>
        <a href="#" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
          Services <i className="fa-solid fa-chevron-down text-[10px]" />
        </a>
        <a href="#" className="text-gray-300 hover:text-white transition-colors">
          Rental
        </a>
        <a href="#" className="text-gray-300 hover:text-white transition-colors">
          Blog
        </a>
        <a href="#" className="text-gray-300 hover:text-white transition-colors">
          Team
        </a>
        <a href="#" className="text-gray-300 hover:text-white transition-colors">
          Contact
        </a>
      </nav>
      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Language (Giả lập) */}
        <button className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md border border-white/20 transition-colors text-sm">
          🇺🇸 <span>EN</span>
        </button>
        {/* Theme Toggle */}
        <button className="w-9 h-9 p-2 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-md border border-white/20 transition-colors text-brand-yellow">
          <Sun />
        </button>
        {/* User Login */}
        <button className="w-9 h-9 p-2 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-md border border-white/20 transition-colors">
          <User />
        </button>
        {/* Let's Talk CTA */}
        <button className="hidden md:block bg-brand-yellow hover:bg-yellow-500 text-black font-semibold text-sm px-6 py-2 rounded-full transition-transform hover:scale-105">
          Let's Talk
        </button>
        {/* Mobile Menu Toggle */}
        <button className="lg:hidden text-white text-2xl ml-2">
          <i className="fa-solid fa-bars" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
