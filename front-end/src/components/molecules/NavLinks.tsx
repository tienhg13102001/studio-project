import { useState, useRef } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useTranslation, useLanguage } from "#i18n";
import type { Translations } from "#i18n";
import { useServices } from "#hooks/useServices";

type NavKey = keyof Translations["nav"];

const NAV_ITEMS: {
  key: NavKey;
  href: string;
  active?: boolean;
  hasDropdown?: boolean;
}[] = [
  { key: "home", href: "/", active: true },
  { key: "services", href: "#", hasDropdown: true },
  { key: "rental", href: "/rental" },
  { key: "blog", href: "/blog" },
  { key: "team", href: "/team" },
  { key: "contact", href: "/contact" },
];

type Props = {
  scrolled: boolean;
};

const NavLinks: React.FC<Props> = ({ scrolled }) => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState<NavKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: services } = useServices(lang);

  const handleMouseEnter = (key: NavKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
      {NAV_ITEMS.map((item) => (
        <div
          key={item.key}
          className="relative"
          onMouseEnter={() => (item.hasDropdown ? handleMouseEnter(item.key) : undefined)}
          onMouseLeave={item.hasDropdown ? handleMouseLeave : undefined}
        >
          <a
            href={item.href}
            className={`flex items-center gap-1 transition-colors duration-800 ${
              scrolled
                ? item.active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                : item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.nav[item.key]}
            {item.hasDropdown && (
              <CaretDownIcon
                size={11}
                className={`transition-transform duration-200 ${openDropdown === item.key ? "rotate-180" : ""}`}
              />
            )}
          </a>

          {/* Services Dropdown */}
          {item.key === "services" && openDropdown === "services" && (
            <div
              className="border-border bg-background/95 absolute top-full left-1/2 mt-3 w-140 -translate-x-1/2 rounded-xl border p-4 shadow-xl backdrop-blur-md"
              onMouseEnter={() => handleMouseEnter("services")}
              onMouseLeave={handleMouseLeave}
            >
              {/* Arrow */}
              <div className="border-border bg-background/95 absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm border-t border-l" />

              <div className="grid grid-cols-2 gap-2">
                {(services ?? []).map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.id}
                      to={`/service/${service.id}`}
                      className="group hover:bg-muted flex items-start gap-3 rounded-lg p-3 transition-colors"
                    >
                      <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors">
                        <Icon size={18} weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground text-sm font-semibold">{service.title}</p>
                        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                          {service.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default NavLinks;
