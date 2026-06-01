import { useState, useRef } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation, useLanguage } from "#i18n";
import type { Translations } from "#i18n";
import { useServices } from "#hooks/useServices";

type NavKey = keyof Translations["nav"];

const NAV_ITEMS: {
  key: NavKey;
  to: string;
  hasDropdown?: boolean;
}[] = [
  { key: "home", to: "/" },
  { key: "services", to: "/service", hasDropdown: true },
  // { key: "rental", to: "/rental" },
  // { key: "blog",   to: "/blog" },
  { key: "team", to: "/team" },
  { key: "contact", to: "/contact" },
];

type Props = {
  scrolled: boolean;
};

const NavLinks: React.FC<Props> = ({ scrolled }) => {
  const t = useTranslation();
  const { lang } = useLanguage();
  const { pathname } = useLocation();
  const [openDropdown, setOpenDropdown] = useState<NavKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: services } = useServices(lang);

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.key === "home") return pathname === "/";
    return pathname.startsWith(item.to);
  };

  const handleMouseEnter = (key: NavKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const linkClass = (item: (typeof NAV_ITEMS)[number]) => {
    const active = isActive(item);
    const base =
      "relative flex items-center gap-1 transition-colors duration-200 after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 hover:after:scale-x-100";
    if (active) {
      return `${base} after:scale-x-100 ${scrolled ? "text-foreground" : "text-primary"}`;
    }
    return `${base} ${scrolled ? "text-muted-foreground hover:text-foreground" : pathname !== "/" ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white"}`;
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
          {item.hasDropdown ? (
            <Link to={item.to} className={linkClass(item)}>
              {t.nav[item.key]}
              <CaretDownIcon
                size={11}
                className={`transition-transform duration-200 ${openDropdown === item.key ? "rotate-180" : ""}`}
              />
            </Link>
          ) : (
            <Link to={item.to} className={linkClass(item)}>
              {t.nav[item.key]}
            </Link>
          )}

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
                  return (
                    <Link
                      key={service.id}
                      to={`/service/${service.id}`}
                      className="group hover:bg-muted flex items-start gap-3 rounded-lg p-3 transition-colors"
                    >
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
