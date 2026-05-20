import {
  SquaresFourIcon,
  UsersThreeIcon,
  StarIcon,
  GearIcon,
  SignOutIcon,
  BriefcaseIcon,
  ImageSquareIcon,
} from "@phosphor-icons/react";
import Logo from "../../../assets/icons/Logo";
import type { PortalUser } from "#lib/portal.types";

type NavItem = {
  icon: React.ReactNode;
  label: string;
  id: string;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { icon: <SquaresFourIcon size={18} weight="duotone" />, label: "Overview",      id: "overview" },
  { icon: <UsersThreeIcon  size={18} weight="duotone" />, label: "Team Members",  id: "team" },
  { icon: <StarIcon        size={18} weight="duotone" />, label: "Brands",        id: "brands" },
  { icon: <BriefcaseIcon   size={18} weight="duotone" />, label: "Services",      id: "services" },
  { icon: <ImageSquareIcon size={18} weight="duotone" />, label: "Projects",      id: "projects" },
  { icon: <GearIcon        size={18} weight="duotone" />, label: "Settings",      id: "settings", soon: true },
];

type Props = {
  user:         PortalUser;
  activeTab:    string;
  onTabChange:  (id: string) => void;
  onLogout:     () => void;
};

export default function PortalSidebar({ user, activeTab, onTabChange, onLogout }: Props) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-white/8 bg-black/40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/8">
        <Logo className="h-7 w-7 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-tight truncate">BeeZ Portal</p>
          <p className="text-[10px] text-white/30 leading-tight">Admin Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => !item.soon && onTabChange(item.id)}
              disabled={item.soon}
              className={[
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                active                    ? "bg-primary/15 text-primary font-medium" : "",
                !active && !item.soon     ? "text-white/50 hover:bg-white/5 hover:text-white" : "",
                item.soon                 ? "text-white/20 cursor-not-allowed" : "",
              ].join(" ")}
            >
              <span className={active ? "text-primary" : ""}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] text-white/25">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/8 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-[10px] text-white/30 truncate">{user.accountRole}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/40 hover:bg-white/5 hover:text-red-400 transition-colors"
        >
          <SignOutIcon size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
