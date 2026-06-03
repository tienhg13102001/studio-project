import { HouseIcon, ListIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import ThemeToggle from "#components/molecules/ThemeToggle";

type Props = { userName: string; onMenuClick?: () => void };

export default function PortalHeader({ userName, onMenuClick }: Props) {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-foreground/8 bg-background/80 px-4 py-3 backdrop-blur md:px-8 md:py-4">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {/* Hamburger — opens the sidebar drawer on mobile */}
        <button
          onClick={onMenuClick}
          aria-label="Mở menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5 text-foreground/60 hover:text-foreground lg:hidden"
        >
          <ListIcon size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground md:text-lg">
            {greeting()}, {userName.split(" ")[0]} 👋
          </h1>
          <p className="hidden text-xs text-foreground/30 sm:block">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year:    "numeric",
              month:   "long",
              day:     "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <Link
          to="/"
          aria-label="Về trang chủ"
          className="flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/5 px-2.5 py-1.5 text-xs text-foreground/50 transition-colors hover:text-foreground md:px-3"
        >
          <HouseIcon size={14} weight="duotone" />
          <span className="hidden sm:inline">Trang chủ</span>
        </Link>
      </div>
    </header>
  );
}
