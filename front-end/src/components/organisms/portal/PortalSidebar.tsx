import type { PortalUser } from "#lib/portal.types";
import {
  BriefcaseIcon,
  GearIcon,
  ImageSquareIcon,
  SignOutIcon,
  SquaresFourIcon,
  StarIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import LogoYellow from "../../../assets/icons/LogoYellow";

type NavItem = {
  icon: React.ReactNode;
  label: string;
  to: string;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { icon: <SquaresFourIcon size={18} weight="duotone" />, label: "Overview",     to: "/portal/dashboard" },
  { icon: <UsersThreeIcon  size={18} weight="duotone" />, label: "Team Members", to: "/portal/team" },
  { icon: <StarIcon        size={18} weight="duotone" />, label: "Brands",       to: "/portal/brands" },
  { icon: <BriefcaseIcon   size={18} weight="duotone" />, label: "Services",     to: "/portal/services" },
  { icon: <ImageSquareIcon size={18} weight="duotone" />, label: "Projects",     to: "/portal/projects" },
  { icon: <GearIcon        size={18} weight="duotone" />, label: "Settings",     to: "/portal/settings" },
];

type Props = {
  user: PortalUser;
  onLogout: () => void;
};

export default function PortalSidebar({ user, onLogout }: Props) {
  const { pathname } = useLocation();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-white/8 bg-black/40">
      {/* LogoYellow */}
      <div className="flex items-center gap-2.5 border-b border-white/8 px-5 py-5">
        <LogoYellow className="text-primary h-7 w-7 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm leading-tight font-bold text-white">BeeZ Portal</p>
          <p className="text-[10px] leading-tight text-white/30">Admin Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          if (item.soon) {
            return (
              <button
                key={item.to}
                disabled
                className="group flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/20 transition-all"
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] text-white/25">
                  Soon
                </span>
              </button>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-white/50 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <span className={active ? "text-primary" : ""}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="flex flex-col gap-2 border-t border-white/8 p-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
          <div className="bg-primary/20 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">{user.name}</p>
            <p className="truncate text-[10px] text-white/30">{user.accountRole}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/40 transition-colors hover:bg-white/5 hover:text-red-400"
        >
          <SignOutIcon size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
