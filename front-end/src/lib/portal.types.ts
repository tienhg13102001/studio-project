export type PortalUser = {
  id:          string;
  name:        string;
  email:       string;
  accountRole: "admin" | "member" | "editor";
};

/**
 * Nhãn tiếng Việt của quyền tài khoản — CHỈ để hiển thị. Giá trị gốc
 * (admin/member/editor) vẫn là thứ lưu DB và dùng so sánh quyền, nên
 * ROLE_COLOR bên dưới vẫn tra bằng key gốc.
 */
export const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị",
  member: "Thành viên",
  editor: "Biên tập",
};

export const ROLE_COLOR: Record<string, string> = {
  admin:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  member: "bg-blue-500/15  text-blue-400  border-blue-500/30",
  editor: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};
