import fs from "node:fs";
import path from "node:path";

/**
 * Sinh sẵn thẻ mô tả riêng cho từng trang, ghi ra `dist/<đường-dẫn>/index.html`.
 *
 * VÌ SAO CẦN: web dựng bằng JavaScript nên thẻ tiêu đề/mô tả chỉ được đặt SAU
 * khi trình duyệt chạy xong mã. Máy tìm kiếm và trình quét link của Facebook/Zalo
 * không chờ điều đó, nên trước đây mọi đường dẫn đều trả về đúng một bản HTML của
 * trang chủ — tệ nhất là thẻ `canonical` trỏ hết về trang chủ, tức là tự khai báo
 * rằng /service, /portfolio, /contact chỉ là bản trùng lặp và không đáng xếp hạng.
 *
 * nginx đã có `try_files $uri $uri/ /index.html`, nên chỉ cần tồn tại
 * `dist/service/index.html` là nó tự phục vụ file đó — không phải sửa cấu hình.
 *
 * Đây KHÔNG phải dựng sẵn toàn bộ nội dung (thân trang vẫn rỗng cho tới khi mã
 * chạy). Nó chỉ sửa dứt điểm phần thẻ mô tả — bước tiếp theo nếu muốn máy đọc
 * được cả nội dung là chuyển sang dựng tĩnh khi xuất bản.
 */

const SITE = "https://www.beezvn.com";
const DIST = path.resolve(process.cwd(), "dist");
const SUFFIX = " — BeeZ Production";

const ROUTES = [
  {
    path: "/service",
    title: "Dịch vụ sản xuất video & TVC",
    description:
      "Các dịch vụ của BeeZ Production: sản xuất TVC, phim quảng cáo, phim doanh nghiệp, brand film và nội dung mạng xã hội — trọn gói từ ý tưởng tới hậu kỳ.",
  },
  {
    path: "/portfolio",
    title: "Portfolio — dự án đã thực hiện",
    description:
      "Tuyển tập TVC, phim doanh nghiệp và hình ảnh hậu trường do BeeZ Production thực hiện cho các thương hiệu tại Việt Nam.",
  },
  {
    path: "/team",
    title: "Đội ngũ",
    description:
      "Những người trực tiếp làm nên mỗi dự án của BeeZ Production — đạo diễn, quay phim, dựng phim và sản xuất.",
  },
  {
    path: "/contact",
    title: "Liên hệ",
    description:
      "Liên hệ BeeZ Production để nhận tư vấn và báo giá sản xuất TVC, phim doanh nghiệp, brand film tại Hà Nội.",
  },
];

/** Thoát ký tự đặc biệt để nội dung không phá cấu trúc HTML. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Thay giá trị của một thẻ meta theo tên thuộc tính; báo lỗi nếu không tìm thấy. */
function replaceMeta(html, attr, name, value, label) {
  const re = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`, "i");
  if (!re.test(html)) throw new Error(`Không tìm thấy thẻ ${label} trong dist/index.html`);
  return html.replace(re, `$1${esc(value)}$2`);
}

const indexPath = path.join(DIST, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("Chưa có dist/index.html — cần chạy `vite build` trước.");
  process.exit(1);
}
const base = fs.readFileSync(indexPath, "utf8");

for (const route of ROUTES) {
  const url = SITE + route.path;
  const fullTitle = route.title + SUFFIX;
  let html = base;

  // <title>
  if (!/<title>[^<]*<\/title>/i.test(html)) throw new Error("Không tìm thấy thẻ <title>");
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(fullTitle)}</title>`);

  html = replaceMeta(html, "name", "description", route.description, "meta description");
  html = replaceMeta(html, "property", "og:title", fullTitle, "og:title");
  html = replaceMeta(html, "property", "og:description", route.description, "og:description");
  html = replaceMeta(html, "property", "og:url", url, "og:url");
  html = replaceMeta(html, "name", "twitter:title", fullTitle, "twitter:title");
  html = replaceMeta(html, "name", "twitter:description", route.description, "twitter:description");

  // canonical — đây chính là thẻ đang trỏ nhầm về trang chủ ở mọi đường dẫn
  const canonRe = /(<link\s+rel="canonical"\s+href=")[^"]*(")/i;
  if (!canonRe.test(html)) throw new Error("Không tìm thấy thẻ canonical");
  html = html.replace(canonRe, `$1${url}$2`);

  const outDir = path.join(DIST, route.path.replace(/^\//, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  console.log(`✓ dist${route.path}/index.html — "${fullTitle}"`);
}

console.log(`\nĐã sinh ${ROUTES.length} trang có thẻ mô tả riêng.`);
