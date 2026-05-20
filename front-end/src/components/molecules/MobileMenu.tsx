import { useState } from "react";
import { createPortal } from "react-dom";
import { XIcon, CaretDownIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Button } from "#components/ui/button";
import ThemeToggle from "#components/molecules/ThemeToggle";
import { useTranslation, useLanguage } from "#i18n";
import type { Translations } from "#i18n";
import { useServices } from "#hooks/useServices";

type NavKey = keyof Translations["nav"];

const NAV_ITEMS: { key: NavKey; href: string; hasDropdown?: boolean }[] = [
  { key: "home", href: "#" },
  { key: "services", href: "#", hasDropdown: true },
  { key: "rental", href: "#" },
  { key: "blog", href: "#" },
  { key: "team", href: "#" },
  { key: "contact", href: "#" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

const MobileMenu: React.FC<Props> = ({ open, onClose }) => {
  const t = useTranslation();
  const { lang, setLang } = useLanguage();
  const [servicesOpen, setServicesOpen] = useState(false);
  const { data: services } = useServices(lang);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-40 flex h-full w-80 flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="text-base font-semibold text-foreground">Menu</span>
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
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
                          const Icon = service.icon;
                          return (
                            <li key={service.id}>
                              <Link
                                key={service.id}
                                to={`/service/${service.id}`}
                                onClick={onClose}
                                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                  <Icon size={16} weight="duotone" />
                                </div>
                                <span className="text-sm font-medium text-foreground">
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
                  <a
                    href={item.href}
                    onClick={onClose}
                    className="flex rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {t.nav[item.key]}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-border px-6 py-4 flex flex-col gap-3">
          <Button className="w-full" onClick={onClose}>
            {t.nav.letsTalk}
          </Button>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setLang(lang === "en" ? "vi" : "en")}
            >
              {lang === "en" ? "🇺🇸 EN" : "🇻🇳 VI"}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default MobileMenu;
