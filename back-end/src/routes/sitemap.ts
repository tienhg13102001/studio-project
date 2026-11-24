import { Router } from "express";
import { Service } from "../models/Service.ts";
import { Project } from "../models/Project.ts";
import { BaiViet } from "../models/BaiViet.ts";

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
 * KHÔNG liệt kê /portal: công cụ nội bộ cần đăng nhập (robots.txt cũng đã chặn).
 * (/bao-gia và /hop-dong đã gỡ hẳn khỏi web.)
 */

const router = Router();

const SITE = "https://www.beezvn.com";

type Entry = { loc: string; changefreq: string; priority: string; lastmod?: string };

const STATIC: Entry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/service", changefreq: "weekly", priority: "0.9" },
  { loc: "/portfolio", changefreq: "weekly", priority: "0.9" },
  { loc: "/team", changefreq: "monthly", priority: "0.8" },
  // Hai trang bảng giá là file tĩnh nằm trong front-end/public/, nginx phục vụ
  // thẳng — React không có route nào cho chúng. Vẫn phải khai ở đây vì sitemap
  // sinh từ backend chứ không đọc thư mục, nên trang tĩnh không tự vào được.
  //
  // /bang-gia-psc (bảng giá cưới Bee Z Wedding Film): 18/11–24/11/2026 để noindex
  // và không khai; từ 24/11 mở lại (xem dòng bên dưới).
  { loc: "/bang-gia", changefreq: "monthly", priority: "0.8" },
  // 24/11/2026 Hoàn chốt mở lại cho Google: đã bỏ noindex ở index.html và
  // bao-gia.html (trang cảm ơn xac-nhan.html vẫn noindex, không khai ở đây).
  // Có dấu "/" cuối vì nginx chuyển /bang-gia-psc → /bang-gia-psc/.
  { loc: "/bang-gia-psc/", changefreq: "monthly", priority: "0.7" },
  { loc: "/bang-gia-psc/bao-gia.html", changefreq: "monthly", priority: "0.5" },
  { loc: "/contact", changefreq: "monthly", priority: "0.7" },
  { loc: "/chinh-sach-bao-mat", changefreq: "yearly", priority: "0.3" },
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
    const [services, projects, baiViet] = await Promise.all([
      Service.find().select("_id slug updatedAt").lean(),
      Project.find().select("slug service updatedAt").lean(),
      // Chỉ bài đã đăng; bản nháp không bao giờ lộ ra sitemap.
      BaiViet.find({ trangThai: "dang", ngayDang: { $ne: null, $lte: new Date() } })
        .select("slug updatedAt")
        .sort({ ngayDang: -1 })
        .lean(),
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
      projects as { _id: unknown; slug?: string; service?: unknown; updatedAt?: Date }[]
    ).flatMap((p) => {
      const serviceId = p.service ? String(p.service) : "";
      if (!liveServices.has(serviceId)) return [];
      // Chưa có tên đường dẫn thì bỏ qua thay vì khai địa chỉ mã cũ: mã cũ giờ
      // chỉ còn là lối chuyển hướng, khai nó ra là mời máy tìm kiếm đi đường vòng.
      if (!p.slug) return [];
      return [
        {
          loc: `/du-an/${p.slug}`,
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
      // Ưu tiên tên đường dẫn; mã cũ chỉ dùng khi chưa kịp điền tên, để sitemap
      // không bao giờ rỗng dù việc điền tên có trục trặc.
      ...services.map((s) => ({
        loc: `/service/${(s as { slug?: string }).slug || String(s._id)}`,
        changefreq: "monthly",
        priority: "0.8",
        lastmod: day((s as { updatedAt?: Date }).updatedAt),
      })),
      ...projectEntries,
      // Mục bài viết chỉ khai khi đã có bài — khai một trang danh sách rỗng là
      // mời Google lập chỉ mục một trang mỏng.
      ...(baiViet.length
        ? [
            {
              loc: "/bai-viet",
              changefreq: "weekly",
              priority: "0.6",
              lastmod: day((baiViet[0] as { updatedAt?: Date }).updatedAt),
            },
            ...baiViet.map((b) => ({
              loc: `/bai-viet/${(b as { slug: string }).slug}`,
              changefreq: "monthly",
              priority: "0.6",
              lastmod: day((b as { updatedAt?: Date }).updatedAt),
            })),
          ]
        : []),
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
