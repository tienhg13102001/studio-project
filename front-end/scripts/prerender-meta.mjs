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

/**
 * Nguồn dữ liệu cho các trang chi tiết (dịch vụ, dự án).
 *
 * Gọi thẳng API đang chạy thật: lúc dựng ảnh Docker không có cơ sở dữ liệu,
 * nhưng có mạng. Đổi được qua biến môi trường để chạy thử với máy chủ khác.
 */
const API = process.env.PRERENDER_API_URL ?? `${SITE}/api`;
/** Chờ tối đa ngần này rồi bỏ cuộc — không để bản dựng treo vì API chậm. */
const API_TIMEOUT_MS = Number(process.env.PRERENDER_TIMEOUT_MS ?? 20000);

const ROUTES = [
  {
    path: "/service",
    title: "Dịch vụ sản xuất video & TVC",
    description:
      "Các dịch vụ của BeeZ Production: sản xuất TVC, phim quảng cáo, phim doanh nghiệp, brand film và nội dung mạng xã hội — trọn gói từ ý tưởng tới hậu kỳ.",
     loai: "tinh",
  },
  {
    path: "/portfolio",
    title: "Portfolio — dự án đã thực hiện",
    description:
      "Tuyển tập TVC, phim doanh nghiệp và hình ảnh hậu trường do BeeZ Production thực hiện cho các thương hiệu tại Việt Nam.",
     loai: "tinh",
  },
  {
    path: "/team",
    title: "Đội ngũ",
    description:
      "Những người trực tiếp làm nên mỗi dự án của BeeZ Production — đạo diễn, quay phim, dựng phim và sản xuất.",
     loai: "tinh",
  },
  {
    path: "/contact",
    title: "Liên hệ",
    description:
      "Liên hệ BeeZ Production để nhận tư vấn và báo giá sản xuất TVC, phim doanh nghiệp, brand film tại Hà Nội.",
     loai: "tinh",
  },
];

/** Thoát ký tự đặc biệt để nội dung không phá cấu trúc HTML. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let warnings = 0;

/**
 * Thay giá trị của một thẻ meta.
 *
 * CỐ Ý chỉ cảnh báo chứ không dừng: script này chạy trong bước dựng ảnh Docker,
 * nên nếu nó dừng vì không khớp mẫu thì cả lần triển khai bị chặn — hỏng nặng
 * hơn nhiều so với việc một trang thiếu thẻ mô tả. Mẫu cũng viết linh hoạt để
 * không phụ thuộc thứ tự thuộc tính (công cụ dựng có thể sắp lại khi rút gọn).
 */
function replaceMeta(html, attr, name, value, label) {
  const re = new RegExp(`(<meta\\b[^>]*\\b${attr}="${name}"[^>]*\\bcontent=")[^"]*(")`, "i");
  if (re.test(html)) return html.replace(re, `$1${esc(value)}$2`);

  // Trường hợp `content` đứng trước `name`/`property`.
  const reSwapped = new RegExp(`<meta\\b[^>]*\\bcontent="[^"]*"[^>]*\\b${attr}="${name}"[^>]*>`, "i");
  const m = html.match(reSwapped);
  if (m) return html.replace(m[0], m[0].replace(/content="[^"]*"/i, `content="${esc(value)}"`));

  console.warn(`  ! Bỏ qua ${label}: không tìm thấy trong dist/index.html`);
  warnings++;
  return html;
}

const indexPath = path.join(DIST, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("Chưa có dist/index.html — cần chạy `vite build` trước.");
  process.exit(1);
}
const base = fs.readFileSync(indexPath, "utf8");

/** Đưa đường dẫn ảnh đã lưu về dạng tuyệt đối — thẻ chia sẻ không nhận đường dẫn tương đối. */
function absUrl(value) {
  if (!value) return null;
  // Gom về đúng một tên miền: ảnh lưu trong cơ sở dữ liệu dùng bản không có
  // www, mà mọi khai báo khác của web đều là bản www. Để lệch thì trình quét
  // link phải đi thêm một chặng chuyển hướng mới lấy được ảnh.
  if (/^https?:\/\//i.test(value)) return value.replace(/^https?:\/\/(www\.)?beezvn\.com/i, SITE);
  return SITE + (value.startsWith("/api") ? value : `/api/public${value}`);
}

/** Cắt mô tả cho vừa ô hiển thị của máy tìm kiếm, cắt ở ranh giới từ cho đỡ cụt. */
function trim(text, max = 158) {
  const s = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Dựng khối dữ liệu có cấu trúc cho từng trang và nhét thẳng vào HTML thô.
 *
 * VÌ SAO CẦN: trước đây HTML thô chỉ có khối `Organization` của cả web. Khối
 * `FAQPage` (12 câu hỏi trang TVC), `Service` và `BreadcrumbList` do React sinh
 * ra, tức là CHỈ CÓ SAU KHI CHẠY JAVASCRIPT. Google có chạy JS nhưng đó là lượt
 * quét thứ hai, chậm và không chắc — mà đây lại đúng là khối đáng giá nhất, cái
 * làm câu hỏi nở ra ngay trong kết quả tìm kiếm.
 *
 * Gắn `data-tra-truoc` để lúc React chạy còn biết đường gỡ bản này ra, tránh
 * một trang có hai khối giống hệt nhau (xem `src/components/Seo.tsx`).
 */
const SITE_NAME_LD = "BeeZ Production";

function duLieuCoCauTruc(route) {
  const khoi = [];
  const url = SITE + route.path;

  if (route.loai === "dich-vu") {
    khoi.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: route.title,
      description: route.description,
      url,
      ...(absUrl(route.image) ? { image: absUrl(route.image) } : {}),
      provider: { "@id": `${SITE}/#organization` },
      areaServed: { "@type": "Country", name: "Vietnam" },
    });
    khoi.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Dịch vụ", item: SITE + "/service" },
        { "@type": "ListItem", position: 3, name: route.title, item: url },
      ],
    });
    const faqs = (route.faqs ?? [])
      .map((f) => ({
        q: (f.question?.vi || f.question?.en || "").trim(),
        a: (f.answer?.vi || f.answer?.en || "").trim(),
      }))
      .filter((f) => f.q && f.a);
    if (faqs.length) {
      khoi.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }
  }

  if (route.loai === "du-an") {
    khoi.push({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: route.title,
      description: route.description,
      url,
      ...(absUrl(route.image) ? { image: absUrl(route.image) } : {}),
      creator: { "@id": `${SITE}/#organization` },
      inLanguage: "vi",
    });
    khoi.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Portfolio", item: SITE + "/portfolio" },
        { "@type": "ListItem", position: 3, name: route.title, item: url },
      ],
    });
  }

  if (route.loai === "tinh") {
    khoi.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: route.title, item: url },
      ],
    });
  }

  return khoi;
}

/** Nhét các khối JSON-LD vào ngay trước </head>. */
function nhetJsonLd(html, khoi) {
  if (!khoi.length) return html;
  const the = khoi
    .map(
      (k) =>
        `    <script type="application/ld+json" data-tra-truoc="1">${JSON.stringify(k).replace(/</g, "\u003c")}</script>`,
    )
    .join("\n");
  if (!/<\/head>/i.test(html)) {
    console.warn("  ! Bỏ qua JSON-LD: không tìm thấy </head>");
    warnings++;
    return html;
  }
  return html.replace(/<\/head>/i, `${the}
  </head>`);
}

function renderPage(route) {
  const url = SITE + route.path;
  const fullTitle = route.title + SUFFIX;
  let html = base;

  // <title>
  if (/<title>[^<]*<\/title>/i.test(html)) {
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(fullTitle)}</title>`);
  } else {
    console.warn("  ! Bỏ qua <title>: không tìm thấy");
    warnings++;
  }

  html = replaceMeta(html, "name", "description", route.description, "meta description");
  html = replaceMeta(html, "property", "og:title", fullTitle, "og:title");
  html = replaceMeta(html, "property", "og:description", route.description, "og:description");
  html = replaceMeta(html, "property", "og:url", url, "og:url");
  html = replaceMeta(html, "name", "twitter:title", fullTitle, "twitter:title");
  html = replaceMeta(html, "name", "twitter:description", route.description, "twitter:description");

  // canonical — đây chính là thẻ đang trỏ nhầm về trang chủ ở mọi đường dẫn
  const canonRe = /(<link\b[^>]*\brel="canonical"[^>]*\bhref=")[^"]*(")/i;
  if (canonRe.test(html)) {
    html = html.replace(canonRe, `$1${url}$2`);
  } else {
    console.warn("  ! Bỏ qua canonical: không tìm thấy");
    warnings++;
  }

  // Ảnh chia sẻ riêng của trang. Thiếu thì giữ ảnh mặc định của cả web.
  const image = absUrl(route.image);
  if (image) {
    html = replaceMeta(html, "property", "og:image", image, "og:image");
    html = replaceMeta(html, "name", "twitter:image", image, "twitter:image");
  }

  html = nhetJsonLd(html, duLieuCoCauTruc(route));

  const outDir = path.join(DIST, route.path.replace(/^\//, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  return fullTitle;
}

for (const route of ROUTES) {
  console.log(`✓ dist${route.path}/index.html — "${renderPage(route)}"`);
}

// ─── Trang chi tiết: dịch vụ và dự án ────────────────────────────────────────
/**
 * VÌ SAO PHẢI GỌI API: sitemap khai báo 6 trang dịch vụ để máy tìm kiếm lập chỉ
 * mục, nhưng HTML thô của cả 6 lại là bản sao trang chủ — kể cả thẻ `canonical`,
 * tức là mỗi trang tự khai "tôi chính là trang chủ". Hai tín hiệu ngược nhau nên
 * không trang nào được xếp hạng, và mọi link dịch vụ chia sẻ lên Facebook/Zalo
 * đều hiện tiêu đề trang chủ.
 *
 * Danh sách dịch vụ nằm trong cơ sở dữ liệu, mà lúc dựng ảnh Docker không có
 * cơ sở dữ liệu — nên lấy qua API đang chạy thật.
 *
 * MỌI LỖI Ở ĐÂY CHỈ CẢNH BÁO: API chậm hay tắt thì bản dựng vẫn phải ra, chỉ là
 * các trang chi tiết tạm thời quay về thẻ mặc định như trước.
 */
async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(API_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} trả về ${res.status}`);
  const body = await res.json();
  if (!body?.success) throw new Error(`${url} báo lỗi: ${body?.error ?? "không rõ"}`);
  return body.data;
}

async function detailRoutes() {
  const [services, projectsRaw] = await Promise.all([
    fetchJson(`${API}/services?limit=100`),
    fetchJson(`${API}/projects`),
  ]);

  const routes = [];

  // Địa chỉ phải khớp TỪNG KÝ TỰ với thứ mà thẻ canonical và sitemap khai, nếu
  // không thì thẻ mô tả dựng sẵn nằm ở một đường dẫn còn máy tìm kiếm lại đi
  // đường khác — công dựng thành vô ích. Lùi về mã máy khi chưa có tên đường
  // dẫn, đúng như `front-end/src/lib/urls.ts` làm.
  for (const s of services.items ?? []) {
    routes.push({
      path: `/service/${s.slug || s.id}`,
      title: s.title?.vi || s.title?.en || "Dịch vụ",
      description: trim(s.description?.vi || s.description?.en),
      image: s.thumbnailImage,
      loai: "dich-vu",
      faqs: s.faqs ?? [],
    });
  }

  const projects = [...(projectsRaw.verticalCards ?? []), ...(projectsRaw.horizontalCards ?? [])];

  /**
   * CẢNH BÁO KHI API CHẠY CŨ HƠN BẢN ĐANG DỰNG.
   *
   * Thẻ mô tả được sinh lúc đóng gói, mà lúc đó nó hỏi API ĐANG CHẠY — tức là
   * bản trước, chưa có thứ vừa thêm. Lần đổi sang địa chỉ đọc được đã vấp đúng
   * chỗ này: sitemap khai /du-an/<tên> trong khi trang dựng sẵn nằm ở địa chỉ
   * mã máy, nên chia sẻ lên Facebook/Zalo hiện tiêu đề chung suốt một lượt deploy
   * mà không có gì báo.
   *
   * Nay nó nói thẳng ra, kèm cách chữa. Vẫn chỉ là cảnh báo — bản dựng phải ra
   * được trong mọi hoàn cảnh.
   */
  const thieuTen = [
    ...(services.items ?? []).filter((s) => !s.slug),
    ...projects.filter((p) => !p.slug),
  ].length;
  if (thieuTen > 0) {
    console.warn(
      `\n! ${thieuTen} mục từ ${API} chưa có tên đường dẫn.\n` +
        `  Nhiều khả năng API đang chạy là bản CŨ hơn mã nguồn này. Thẻ mô tả sẽ\n` +
        `  được dựng ở địa chỉ mã máy, lệch với địa chỉ sitemap khai.\n` +
        `  CÁCH CHỮA: đợi backend lên xong rồi dựng lại giao diện một lần nữa.`,
    );
    warnings++;
  }

  for (const p of projects) {
    const serviceId = typeof p.service === "string" ? p.service : p.service?.id;
    const serviceSlug = typeof p.service === "string" ? null : p.service?.slug;
    if (!serviceId) continue; // dự án mồ côi thì bỏ qua, không đoán
    routes.push({
      path: p.slug ? `/du-an/${p.slug}` : `/service/${serviceSlug || serviceId}/${p.id}`,
      title: p.title || "Dự án",
      description: trim(p.subtitle?.vi || p.subtitle?.en || p.title),
      image: p.thumbnailImage,
      loai: "du-an",
    });
  }

  return routes;
}

let details = [];
try {
  details = await detailRoutes();
  for (const route of details) renderPage(route);
  // Đếm theo tiền tố chứ không theo số dấu gạch: từ khi dự án có địa chỉ phẳng
  // (/du-an/…) thì hai loại có cùng số đoạn, đếm kiểu cũ sẽ ra số sai.
  const nSvc = details.filter((r) => r.path.startsWith("/service/")).length;
  console.log(`✓ ${nSvc} trang dịch vụ + ${details.length - nSvc} trang dự án`);
} catch (e) {
  console.warn(
    `\n! Không lấy được dữ liệu từ ${API} (${e.message}).\n` +
      `  Bỏ qua các trang chi tiết — bản dựng vẫn chạy bình thường.`,
  );
  warnings++;
}

console.log(`\nĐã sinh ${ROUTES.length + details.length} trang có thẻ mô tả riêng.`);
if (warnings > 0) {
  // Dòng này KHÔNG được đoán nguyên nhân. Trước đây nó khẳng định luôn "mẫu HTML
  // đã đổi", mà giờ cảnh báo còn đến từ chỗ khác (API chạy cũ hơn) — đoán sai
  // nguyên nhân còn hại hơn không đoán, vì nó dẫn người đọc đi sai hướng.
  console.warn(
    `\n! ${warnings} cảnh báo ở trên — đọc kỹ từng cái, mỗi cái có cách chữa riêng.\n` +
      `  Bản dựng vẫn chạy bình thường.`,
  );
}
