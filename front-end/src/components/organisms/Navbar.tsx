import { useState, useEffect } from "react";
import { UserIcon, ListIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import Logo from "../../assets/icons/Logo";
import { Button } from "#components/ui/button";
import NavLinks from "#components/molecules/NavLinks";
import ThemeToggle from "#components/molecules/ThemeToggle";
import MobileMenu from "#components/molecules/MobileMenu";
import { useLanguage, useTranslation } from "#i18n";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {};

const Navbar: React.FC<Props> = () => {
  const { lang, setLang } = useLanguage();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const t = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-20 flex w-full items-center justify-between px-6 py-4 transition-all duration-800 md:px-12 ${scrolled && pathname === "/" ? "bg-background/50 shadow-sm backdrop-blur-sm" : pathname !== "/" ? "bg-background/50 shadow-sm backdrop-blur-sm" : "bg-transparent"}`}
      >
        {/* Logo */}
        <div className="flex cursor-pointer items-center" onClick={() => navigate("/")}>
          <Logo className="h-8 w-8 text-white" />
        </div>

        {/* Center Navigation */}
        <NavLinks scrolled={scrolled} />

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <Button variant="outline" onClick={() => setLang(lang === "en" ? "vi" : "en")}>
            {lang === "en" ? "🇺🇸 EN" : "🇻🇳 VI"}
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Login */}
          <Button variant="outline" onClick={() => navigate("/portal")}>
            <UserIcon />
          </Button>

          {/* Let's Talk CTA */}
          <Button variant="outline" className="hidden lg:inline-flex">
            {t.nav.letsTalk}
          </Button>

          {/* Mobile Menu */}
          <Button
            variant="outline"
            size="icon-lg"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <ListIcon size={20} />
          </Button>
        </div>

        {/* Mobile Drawer */}
        <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </nav>

      {pathname !== "/" && (
        <button
          onClick={() => navigate("/")}
          className="bg-background/60 text-foreground hover:bg-background/80 border-border fixed top-20 left-3 z-20 flex items-center gap-2 rounded-full border p-2 text-sm font-medium backdrop-blur-sm transition-colors md:left-6 md:p-3"
        >
          <ArrowLeftIcon size={25} />
        </button>
      )}
    </>
  );
};

export default Navbar;
