import { ROLE_LABEL, type PortalUser } from "#lib/portal.types";
import {
  BriefcaseIcon,
  ChartLineUpIcon,
  EnvelopeIcon,
  GearIcon,
  HouseIcon,
  ImageSquareIcon,
  SignOutIcon,
  SquaresFourIcon,
  StarIcon,
  TrashIcon,
  UsersThreeIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import LogoYellow from "../../../assets/icons/LogoYellow";
import { useVaiTro, DUONG_DAN_CHI_QUAN_TRI } from "#hooks/useVaiTro";

type NavItem = {
  icon: React.ReactNode;
  label: string;
  to: string;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { icon: <SquaresFourIcon size={18} weight="duotone" />, label: "Tổng quan",  to: "/portal/dashboard" },
  { icon: <ChartLineUpIcon size={18} weight="duotone" />, label: "Thống kê",   to: "/portal/analytics" },
  { icon: <UsersThreeIcon  size={18} weight="duotone" />, label: "Đội ngũ",    to: "/portal/team" },
  { icon: <StarIcon        size={18} weight="duotone" />, label: "Thương hiệu", to: "/portal/brands" },
  { icon: <BriefcaseIcon   size={18} weight="duotone" />, label: "Dịch vụ",    to: "/portal/services" },
  { icon: <ImageSquareIcon size={18} weight="duotone" />, label: "Dự án",      to: "/portal/projects" },
  { icon: <EnvelopeIcon    size={18} weight="duotone" />, label: "Liên hệ",    to: "/portal/inquiries" },
  { icon: <GearIcon        size={18} weight="duotone" />, label: "Cài đặt",    to: "/portal/settings" },
  { icon: <TrashIcon       size={18} weight="duotone" />, label: "Thùng rác",  to: "/portal/trash" },
];

type Props = {
  user: PortalUser;
  onLogout: () => void;
  /** Close the mobile drawer (no-op affordance on desktop). */
  onClose?: () => void;
  /** Số liên hệ chưa xem — hiện thành pill cạnh mục "Liên hệ". 0 = ẩn. */
  inquiryBadge?: number;
};

export default function PortalSidebar({ user, onLogout, onClose, inquiryBadge = 0 }: Props) {
  const { pathname } = useLocation();
  const { laQuanTri } = useVaiTro();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-foreground/8 bg-card">
      {/* LogoYellow */}
      <div className="flex items-center gap-2.5 border-b border-foreground/8 px-5 py-5">
        <LogoYellow className="text-primary h-7 w-7 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-tight font-bold text-foreground">BeeZ Portal</p>
          <p className="text-[10px] leading-tight text-foreground/30">Bảng điều khiển</p>
        </div>
        {/* Close button — mobile drawer only */}
        <button
          onClick={onClose}
          aria-label="Đóng menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 hover:bg-foreground/5 hover:text-foreground lg:hidden"
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* Nav */}
      {/*
        Nhân viên chỉ thấy những mục họ vào được. Đây là để gọn mắt và đỡ bấm
        nhầm — KHÔNG phải lớp bảo vệ. Cửa thật khoá ở máy chủ, và nó đọc vai trò
        thẳng từ cơ sở dữ liệu chứ không tin thứ trình duyệt gửi lên.
      */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {NAV.filter((i) => laQuanTri || !DUONG_DAN_CHI_QUAN_TRI.includes(i.to)).map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          if (item.soon) {
            return (
              <button
                key={item.to}
                disabled
                className="group flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground/20 transition-all"
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="rounded-full border border-foreground/10 px-1.5 py-0.5 text-[9px] text-foreground/25">
                  Sắp có
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
                  : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground",
              ].join(" ")}
            >
              <span className={active ? "text-primary" : ""}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {/* Badge liên hệ chưa xem — cùng hình dạng pill "Soon" ở trên để
                  không làm lệch chiều cao hàng nav. */}
              {item.to === "/portal/inquiries" && inquiryBadge > 0 && (
                <span
                  aria-label={`${inquiryBadge} liên hệ chưa xem`}
                  className="border-primary/30 bg-primary/15 text-primary shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-medium tabular-nums"
                >
                  {inquiryBadge > 9 ? "9+" : inquiryBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Home + Logout */}
      <div className="flex flex-col gap-2 border-t border-foreground/8 p-3">
        <Link
          to="/"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <HouseIcon size={15} weight="duotone" />
          Về trang chủ
        </Link>
        <div className="flex items-center gap-2.5 rounded-lg bg-foreground/5 px-3 py-2.5">
          <div className="bg-primary/20 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{user.name}</p>
            <p className="truncate text-[10px] text-foreground/30">
              {ROLE_LABEL[user.accountRole] ?? user.accountRole}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-red-400"
        >
          <SignOutIcon size={15} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
