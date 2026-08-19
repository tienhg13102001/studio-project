import { useState, useEffect } from "react";
import { UserIcon, ListIcon, ArrowLeftIcon, PhoneIcon } from "@phosphor-icons/react";
import { useLanding } from "#hooks/useLanding";
import LogoYellow from "../../assets/icons/LogoYellow";
import { Button } from "#components/ui/button";
import NavLinks from "#components/molecules/NavLinks";
import MobileMenu from "#components/molecules/MobileMenu";
import { useLanguage, useTranslation } from "#i18n";
import { useLocation, useNavigate } from "react-router-dom";
import UKFlag from "../../assets/icons/UKFlag";
import VietNamFlag from "../../assets/icons/VietNamFlag";

type Props = {};

const Navbar: React.FC<Props> = () => {
  const { lang, setLang } = useLanguage();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const t = useTranslation();
  const { data: landing } = useLanding(lang);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/*
        Bố cục LƯỚI 3 cột `1fr auto 1fr` chứ không phải `justify-between`.

        VÌ SAO: với `justify-between`, cụm menu giữa chỉ nằm đúng tâm màn hình
        khi hai bên rộng bằng nhau. Bên trái chỉ có logo nhỏ, bên phải có số điện
        thoại + đổi ngôn ngữ + đăng nhập + nút Kết Nối — nên menu bị đẩy lệch hẳn
        sang trái. Lưới với hai cột biên bằng nhau (1fr) thì cột giữa luôn nằm
        đúng tâm, bất kể hai bên rộng bao nhiêu.

        Trên điện thoại cụm menu bị ẩn (`lg:flex`) nên cột giữa co về 0 — logo
        vẫn sát trái, nhóm nút vẫn sát phải, không đổi gì.
      */}
      <nav
        className={`fixed top-0 left-0 z-20 grid w-full grid-cols-[1fr_auto_1fr] items-center px-6 py-4 transition-all duration-700 md:px-12 ${scrolled && pathname === "/" ? "bg-background/50 shadow-sm backdrop-blur-sm" : pathname !== "/" ? "bg-background/50 shadow-sm backdrop-blur-sm" : "bg-transparent"}`}
      >
        {/* LogoYellow */}
        <div className="flex cursor-pointer items-center justify-self-start" onClick={() => navigate("/")}>
          <LogoYellow className="h-8 w-8 text-white" />
        </div>

        {/* Center Navigation */}
        <NavLinks scrolled={scrolled} />

        {/* Right Actions */}
        <div className="flex items-center gap-2 justify-self-end">
          {/* Hotline — khách gọi trực tiếp, 1 chạm. Chỗ hẹp trên mobile nên chỉ
              hiện từ desktop; bản mobile nằm trong menu trượt. */}
          {landing?.phone && (
            <a
              href={`tel:${landing.phone}`}
              className="text-foreground hover:text-primary focus-visible:ring-primary mr-1 hidden items-center gap-1.5 rounded-md px-1 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none lg:inline-flex"
            >
              <PhoneIcon size={16} weight="fill" className="text-primary" />
              {landing.phone}
            </a>
          )}

          {/* Language */}
          <Button variant="outline" onClick={() => setLang(lang === "en" ? "vi" : "en")}>
            {lang === "en" ? (
              <>
                <UKFlag /> EN
              </>
            ) : (
              <>
                <VietNamFlag /> VI
              </>
            )}
          </Button>

          {/* User Login */}
          <Button variant="outline" onClick={() => navigate("/portal")}>
            <UserIcon />
          </Button>

          {/* Let's Talk CTA */}
          <Button
            variant="outline"
            className="hidden lg:inline-flex"
            onClick={() => navigate("/contact")}
          >
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
