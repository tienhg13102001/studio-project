import { Marked } from "marked";

/**
 * Đổi thân bài (Markdown) sang HTML để hiện trên web.
 *
 * CHẶN HTML THÔ: Markdown cho phép gõ thẳng thẻ HTML, tức là ai sửa được bài
 * là chèn được <script> lên web. Ô soạn chỉ quản trị dùng, nhưng tài khoản có
 * thể bị lộ — nên mọi đoạn HTML thô bị hiện thành chữ thường chứ không chạy.
 * Link `javascript:` cũng bị bỏ.
 *
 * GIỐNG HỆT bản trong scripts/prerender-meta.mjs (bản dựng sẵn cho máy tìm kiếm).
 * Sửa một chỗ thì sửa cả hai, không thì Google đọc một bài, khách đọc một bài.
 */
const thoat = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const md = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return thoat(text);
    },
    link({ href, title, tokens }) {
      const chu = this.parser.parseInline(tokens);
      if (!/^(https?:|mailto:|tel:|\/|#)/i.test(href)) return chu;
      // Link ra ngoài mở tab mới; link trong beezvn.com giữ nguyên tab.
      const ngoai = /^https?:/i.test(href) && !/^https?:\/\/(www\.)?beezvn\.com/i.test(href);
      return `<a href="${thoat(href)}"${title ? ` title="${thoat(title)}"` : ""}${
        ngoai ? ' target="_blank" rel="noopener"' : ""
      }>${chu}</a>`;
    },
  },
});

export function markdownSangHtml(noiDung: string): string {
  // Bỏ chú thích <!-- ... --> (bản nháp ghi nguồn số liệu bằng chú thích):
  // để nguyên thì bộ chặn HTML thô ở trên biến chúng thành chữ hiện lên trang.
  return md.parse(noiDung.replace(/<!--[\s\S]*?-->/g, ""), { async: false }) as string;
}

/** Số phút đọc, ước theo 200 chữ/phút. */
export function phutDoc(noiDung: string): number {
  const chu = noiDung.replace(/<!--[\s\S]*?-->/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(chu / 200));
}

/** "24 tháng 11, 2026" */
export function ngayViet(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
}
