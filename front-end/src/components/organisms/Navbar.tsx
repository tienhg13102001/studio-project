import { useState, useEffect } from "react";
import { UserIcon, ListIcon } from "@phosphor-icons/react";
import Logo from "../../assets/icons/Logo";
import { Button } from "#components/ui/button";
import NavLinks from "#components/molecules/NavLinks";
import ThemeToggle from "#components/molecules/ThemeToggle";
import { useLanguage, useTranslation } from "#i18n";

type Props = {};

const Navbar: React.FC<Props> = () => {
  const { lang, setLang } = useLanguage();
  const t = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 z-20 flex w-full items-center justify-between px-6 py-4 transition-all duration-800 md:px-12 ${scrolled ? "bg-background/90 shadow-sm backdrop-blur-sm" : "bg-transparent"}`}
    >
      {/* Logo */}
      <div className="flex cursor-pointer items-center">
        <Logo className="h-8 w-8 text-white" />
      </div>

      {/* Center Navigation */}
      <NavLinks scrolled={scrolled} />

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Language */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === "en" ? "vi" : "en")}
          className="hidden items-center gap-1.5 rounded-md border border-white/20 bg-white/10 text-sm text-white hover:bg-white/20 md:flex"
        >
          {lang === "en" ? "🇺🇸 EN" : "🇻🇳 VI"}
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Login */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          <UserIcon />
        </Button>

        {/* Let's Talk CTA */}
        <Button className="bg-primary text-primary-foreground hidden rounded-full px-6 text-sm font-semibold hover:brightness-110 md:flex">
          {t.nav.letsTalk}
        </Button>

        {/* Mobile Menu */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/20 lg:hidden"
        >
          <ListIcon size={20} />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
