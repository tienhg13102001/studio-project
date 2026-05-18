import { CaretDownIcon } from "@phosphor-icons/react";
import { useTranslation } from "#i18n";
import type { Translations } from "#i18n";

type NavKey = keyof Translations["nav"];

const NAV_ITEMS: { key: NavKey; href: string; active?: boolean; hasDropdown?: boolean }[] = [
  { key: "home", href: "#", active: true },
  { key: "services", href: "#", hasDropdown: true },
  { key: "rental", href: "#" },
  { key: "blog", href: "#" },
  { key: "team", href: "#" },
  { key: "contact", href: "#" },
];

const NavLinks = () => {
  const t = useTranslation();

  return (
    <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.key}
          href={item.href}
          className={`flex items-center gap-1 transition-colors ${
            item.active ? "text-white" : "text-white/60 hover:text-white"
          }`}
        >
          {t.nav[item.key]}
          {item.hasDropdown && <CaretDownIcon size={11} />}
        </a>
      ))}
    </nav>
  );
};

export default NavLinks;
