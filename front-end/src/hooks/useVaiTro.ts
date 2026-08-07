import { useMemo } from "react";
import type { PortalUser } from "#lib/portal.types";

/**
 * Vai trò của người đang đăng nhập Portal.
 *
 * CHỈ DÙNG ĐỂ HIỂN THỊ — ẩn bớt mục cho gọn mắt và đỡ bấm nhầm. Đây KHÔNG phải
 * lớp bảo vệ: giá trị này đọc từ trình duyệt nên sửa được bằng tay. Cánh cửa
 * thật nằm ở máy chủ (`back-end/src/routes/index.ts`), và nó đọc vai trò thẳng
 * từ cơ sở dữ liệu chứ không tin thứ gì do trình duyệt gửi lên.
 */
export function useVaiTro() {
  return useMemo(() => {
    let nguoi: PortalUser | null = null;
    try {
      const raw = localStorage.getItem("portal_user");
      if (raw) nguoi = JSON.parse(raw) as PortalUser;
    } catch {
      nguoi = null;
    }
    const vaiTro = nguoi?.accountRole ?? "member";
    return {
      nguoi,
      vaiTro,
      /** Quản trị: làm được mọi thứ. */
      laQuanTri: vaiTro === "admin",
      /** Id để so khi chỉ cho sửa hồ sơ của chính mình. */
      idCuaToi: nguoi?.id ?? null,
    };
  }, []);
}

/**
 * Những mục trong Portal chỉ quản trị mới vào được. Phải khớp với luật ở máy
 * chủ — lệch nhau thì nhân viên thấy mục nhưng bấm vào chỉ nhận lỗi.
 */
export const DUONG_DAN_CHI_QUAN_TRI = [
  "/portal/analytics",
  "/portal/brands",
  "/portal/services",
  "/portal/inquiries",
  "/portal/settings",
  "/portal/trash",
];
