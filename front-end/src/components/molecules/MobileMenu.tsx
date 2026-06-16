import { useState } from "react";
import { createPortal } from "react-dom";
import { XIcon, CaretDownIcon } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "#components/ui/button";
import ThemeToggle from "#components/molecules/ThemeToggle";
import { useTranslation, useLanguage } from "#i18n";
import type { Translations } from "#i18n";
import { useServices } from "#hooks/useServices";

type NavKey = keyof Translations["nav"];

const NAV_ITEMS: { key: NavKey; to: string; hasDropdown?: boolean }[] = [
  { key: "home", to: "/" },
  { key: "services", to: "/service", hasDropdown: true },
  // { key: "rental", to: "/rental" },
  // { key: "blog",   to: "/blog" },
  { key: "team", to: "/team" },
  { key: "portfolio", to: "/portfolio" },
  { key: "contact", to: "/contact" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

const MobileMenu: React.FC<Props> = ({ open, onClose }) => {
  const t = useTranslation();
  const { lang, setLang } = useLanguage();
  const { pathname } = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);
  const { data: services } = useServices(lang);

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.key === "home") return pathname === "/";
    return pathname.startsWith(item.to);
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <div
        className={`bg-background fixed top-0 right-0 z-40 flex h-full w-80 flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <span className="text-foreground text-base font-semibold">Menu</span>
          <Button variant="outline" size="icon" onClick={onClose}>
            <XIcon size={18} />
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                {item.hasDropdown ? (
                  <div>
                    <button
                      onClick={() => setServicesOpen((v) => !v)}
                      className={`hover:bg-muted flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        isActive(item) ? "text-primary bg-primary/5" : "text-foreground"
                      }`}
                    >
                      <span>{t.nav[item.key]}</span>
                      <CaretDownIcon
                        size={14}
                        className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Services sub-list */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        servicesOpen ? "max-h-150 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <ul className="mt-1 flex flex-col gap-1 pl-2">
                        {(services ?? []).map((service) => {
                          return (
                            <li key={service.id}>
                              <Link
                                key={service.id}
                                to={`/service/${service.id}`}
                                onClick={onClose}
                                className="group hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
                              >
                                <span className="text-foreground text-sm font-medium">
                                  {service.title}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={`hover:bg-muted flex rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isActive(item) ? "text-primary bg-primary/5 font-semibold" : "text-foreground"
                    }`}
                  >
                    {t.nav[item.key]}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="border-border flex flex-col gap-3 border-t px-6 py-4">
          <Button className="w-full" onClick={onClose}>
            {t.nav.letsTalk}
          </Button>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setLang(lang === "en" ? "vi" : "en")}>
              {lang === "en" ? "🇺🇸 EN" : "🇻🇳 VI"}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default MobileMenu;
