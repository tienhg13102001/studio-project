import { Router } from "express";
import { Service } from "../models/Service.ts";
import { Project } from "../models/Project.ts";

/**
 * Sinh sitemap.xml từ dữ liệu thật.
 *
 * Bản tĩnh trước đây chỉ liệt kê vài trang cố định, nên 6 trang dịch vụ — nội
 * dung giá trị nhất của website — không hề được khai báo với máy tìm kiếm.
 * Sinh động thì thêm/xoá dịch vụ trong portal là sitemap tự cập nhật, không ai
 * phải nhớ sửa file.
 *
 * Từng dự án cũng được khai. Bản dựng đã sinh sẵn cho mỗi dự án một trang HTML
 * có tiêu đề, mô tả và ảnh riêng (`front-end/scripts/prerender-meta.mjs`), nhưng
 * chúng chỉ tới được máy tìm kiếm qua đường lần theo link trong trang dịch vụ —
 * mà nội dung dự án lại nằm sau một cú bấm, nên rất dễ bị bỏ sót. Khai thẳng ra
 * đây là cách chắc chắn nhất để chúng được lập chỉ mục.
 *
 * KHÔNG liệt kê /portal, /bao-gia, /hop-dong: công cụ nội bộ cần đăng nhập
 * (robots.txt cũng đã chặn).
 */

const router = Router();

const SITE = "https://www.beezvn.com";

type Entry = { loc: string; changefreq: string; priority: string; lastmod?: string };

const STATIC: Entry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/service", changefreq: "weekly", priority: "0.9" },
  { loc: "/portfolio", changefreq: "weekly", priority: "0.9" },
  { loc: "/team", changefreq: "monthly", priority: "0.8" },
  { loc: "/contact", changefreq: "monthly", priority: "0.7" },
];

/** Chỉ lấy phần ngày (YYYY-MM-DD) — đủ chi tiết cho sitemap. */
const day = (d?: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function toXml(entries: Entry[]): string {
  const urls = entries
    .map((e) => {
      const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : "";
      return `  <url>
    <loc>${escapeXml(SITE + e.loc)}</loc>${lastmod}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

router.get("/", async (_req, res, next) => {
  try {
    const [services, projects] = await Promise.all([
      Service.find().select("_id updatedAt").lean(),
      Project.find().select("service updatedAt").lean(),
    ]);

    // Ngày sửa gần nhất của bất kỳ dự án nào — dùng cho trang portfolio.
    const latestProject = projects
      .map((p) => (p as { updatedAt?: Date }).updatedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b as Date).getTime() - new Date(a as Date).getTime())[0];

    /**
     * CHỈ khai dự án nào còn dịch vụ cha còn sống.
     *
     * Đường dẫn dự án là /service/<dịch-vụ>/<dự-án>, nên dịch vụ bị xoá là cả
     * đường dẫn hỏng theo. Khai một địa chỉ trả về 404 cho máy tìm kiếm còn hại
     * hơn là không khai — nó làm giảm độ tin của cả sitemap. Lọc trước cho chắc,
     * không đoán.
     */
    const liveServices = new Set(services.map((s) => String(s._id)));
    const projectEntries = (
      projects as { _id: unknown; service?: unknown; updatedAt?: Date }[]
    ).flatMap((p) => {
      const serviceId = p.service ? String(p.service) : "";
      if (!liveServices.has(serviceId)) return [];
      return [
        {
          loc: `/service/${serviceId}/${String(p._id)}`,
          // Dự án đã đăng thì gần như không sửa nữa — khai đúng để máy tìm kiếm
          // dồn lượt quét vào những trang thật sự hay đổi.
          changefreq: "yearly",
          // Thấp hơn trang dịch vụ (0.8): dự án là dẫn chứng, dịch vụ mới là
          // trang khách tìm kiếm để đặt hàng.
          priority: "0.6",
          lastmod: day(p.updatedAt),
        },
      ];
    });

    const entries: Entry[] = [
      ...STATIC.map((e) =>
        e.loc === "/portfolio" ? { ...e, lastmod: day(latestProject as Date) } : e,
      ),
      ...services.map((s) => ({
        loc: `/service/${String(s._id)}`,
        changefreq: "monthly",
        priority: "0.8",
        lastmod: day((s as { updatedAt?: Date }).updatedAt),
      })),
      ...projectEntries,
    ];

    res.type("application/xml");
    // Cho phép lưu tạm 1 giờ: sitemap không cần tươi từng phút, mà cũng tránh
    // để máy tìm kiếm gọi liên tục vào cơ sở dữ liệu.
    res.set("Cache-Control", "public, max-age=3600");
    res.send(toXml(entries));
  } catch (e) {
    next(e);
  }
});

export default router;
