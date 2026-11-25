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

import { Marked } from "marked";
import { CHAN_TRANG, khoiLienKet, khoiNoiDung, khoiTrang } from "./lien-ket-noi-bo.mjs";

/**
 * Dòng vàng dưới tên dịch vụ — PHẢI KHỚP `service.heroAccentByTag` trong
 * src/i18n/locales/vi.ts. Trang thật vẽ H1 = tên + dòng vàng, nên bản dựng sẵn
 * cho bot cũng phải có đủ cả hai, không thì Google thấy một H1, khách thấy H1 khác.
 */
// Phải khớp từng ký tự với heroAccentByTag trong vi.ts (kể cả dấu cách không ngắt \u00a0).
const DONG_VANG = {
  TVC: "Phim quảng cáo tại Hà\u00a0Nội & TP.HCM",
  "F&B": "Chụp món ăn, video sản phẩm tại Hà\u00a0Nội & TP.HCM",
  LOOKBOOK: "Lookbook, campaign tại Hà\u00a0Nội & TP.HCM",
  SHORT: "Video TikTok, Reels tại Hà\u00a0Nội & TP.HCM",
  EVENT: "Hội nghị, ra\u00a0mắt, concert tại Hà\u00a0Nội & TP.HCM",
  WEDDING: "Phóng sự cưới, pre-wedding tại Hà\u00a0Nội & TP.HCM",
};


const SITE = "https://www.beezvn.com";
const DIST = path.resolve(process.cwd(), "dist");
const SUFFIX = " — Bee Z Production";

/**
 * Nguồn dữ liệu cho các trang chi tiết (dịch vụ, dự án).
 *
 * Gọi thẳng API đang chạy thật: lúc dựng ảnh Docker không có cơ sở dữ liệu,
 * nhưng có mạng. Đổi được qua biến môi trường để chạy thử với máy chủ khác.
 */
const API = process.env.PRERENDER_API_URL ?? `${SITE}/api`;
/** Chờ tối đa ngần này rồi bỏ cuộc — không để bản dựng treo vì API chậm. */
const API_TIMEOUT_MS = Number(process.env.PRERENDER_TIMEOUT_MS ?? 20000);

/**
 * Tiêu đề + mô tả các trang tĩnh lấy từ src/data/seo-trang-tinh.json — cùng tệp
 * mà component Seo dùng lúc chạy JavaScript, nên hai bản không còn lệch nhau.
 */
const SEO_TINH = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "src/data/seo-trang-tinh.json"), "utf8"),
);
const ROUTES = ["/service", "/portfolio", "/team", "/contact", "/chinh-sach-bao-mat"].map((p) => ({
  path: p,
  title: SEO_TINH[p].title,
  description: SEO_TINH[p].description,
  loai: "tinh",
}));

/** Thoát ký tự đặc biệt để nội dung không phá cấu trúc HTML. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let warnings = 0;

/**
 * Markdown → HTML cho bài viết. GIỐNG HỆT src/lib/baiViet.ts (chặn HTML thô,
 * bỏ link javascript:, bỏ chú thích <!-- -->). Sửa một chỗ thì sửa cả hai.
 */
const md = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return esc(text);
    },
    link({ href, title, tokens }) {
      const chu = this.parser.parseInline(tokens);
      if (!/^(https?:|mailto:|tel:|\/|#)/i.test(href)) return chu;
      const ngoai = /^https?:/i.test(href) && !/^https?:\/\/(www\.)?beezvn\.com/i.test(href);
      return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}${ngoai ? ' target="_blank" rel="noopener"' : ""}>${chu}</a>`;
    },
  },
});
const markdownSangHtml = (s) => md.parse(String(s ?? "").replace(/<!--[\s\S]*?-->/g, ""), { async: false });

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
const SITE_NAME_LD = "Bee Z Production";

function duLieuCoCauTruc(route) {
  const khoi = [];
  // Trang bản sao phải khai địa chỉ CHÍNH TẮC, không khai địa chỉ của chính nó
  // — nếu không thì mỗi bản sao lại tự nhận mình là một tác phẩm riêng.
  const url = SITE + (route.canonicalTo ?? route.path);

  if (route.loai === "dich-vu") {
    khoi.push({
      "@context": "https://schema.org",
      "@type": "Service",
      // Tên thật của dịch vụ, KHÔNG dùng tiêu đề SEO: khối này khai "Bee Z bán
      // dịch vụ gì", tên phải sạch chứ không phải một dòng nhồi từ khoá.
      name: route.tenThat ?? route.title,
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
      name: route.tenThat ?? route.title,
      description: route.description,
      url,
      ...(absUrl(route.image) ? { image: absUrl(route.image) } : {}),
      creator: { "@id": `${SITE}/#organization` },
      inLanguage: "vi",
      // Bài case study đưa luôn vào dữ liệu có cấu trúc. Khối này sinh ra để
      // máy đọc nên không có chuyện bị coi là chữ giấu, và nó đứng được kể cả
      // khi Google chưa kịp chạy JavaScript.
      ...(route.caseStudy?.challenge?.vi?.trim()
        ? { abstract: route.caseStudy.challenge.vi.trim() }
        : {}),
    });
    khoi.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE + "/" },
        // Cấp 2 là MẢNG của dự án (khớp đường dẫn hiện trên ProjectPage).
        route.tenMang
          ? { "@type": "ListItem", position: 2, name: route.tenMang, item: SITE + route.dichVuPath }
          : { "@type": "ListItem", position: 2, name: "Portfolio", item: SITE + "/portfolio" },
        { "@type": "ListItem", position: 3, name: route.tenThat ?? route.title, item: url },
      ],
    });
    /*
     * Khai video cho Google (mục Video, kết quả có ảnh video). Ngày đăng đọc từ
     * TÊN TỆP (máy chủ đặt tên theo lúc tải lên: …-20260612_111328.mp4), chỉ
     * lấy ngày. Không đọc được thì không khai — không bịa ngày. Giống hệt
     * ngayDangVideo() trong src/lib/seoTrangTinh.ts.
     */
    const ngay = String(route.video ?? "").match(/(20\d{2})(\d{2})(\d{2})_\d{6}/);
    if (route.video && ngay) {
      khoi.push({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: route.tenThat ?? route.title,
        description: route.description,
        ...(absUrl(route.image) ? { thumbnailUrl: absUrl(route.image) } : {}),
        uploadDate: `${ngay[1]}-${ngay[2]}-${ngay[3]}`,
        contentUrl: absUrl(route.video),
        url,
        publisher: { "@id": `${SITE}/#organization` },
      });
    }
  }

  if (route.loai === "bai-viet") {
    khoi.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: route.title,
      description: route.description,
      url,
      mainEntityOfPage: url,
      ...(absUrl(route.image) ? { image: absUrl(route.image) } : {}),
      ...(route.ngayDang ? { datePublished: route.ngayDang } : {}),
      ...(route.ngaySua ? { dateModified: route.ngaySua } : {}),
      inLanguage: "vi",
      author: { "@id": `${SITE}/#organization` },
      publisher: { "@id": `${SITE}/#organization` },
    });
    khoi.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Bài viết", item: SITE + "/bai-viet" },
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

function renderPage(route, dsDichVu = [], dsDuAn = []) {
  /**
   * HAI ĐỊA CHỈ, ĐỪNG LẪN:
   *   route.path        — nơi ĐẶT tệp html
   *   route.canonicalTo — địa chỉ THẬT mà máy tìm kiếm nên tính điểm cho
   *
   * Chúng chỉ khác nhau ở trang bản sao. Xem chú thích chỗ dựng danh sách
   * dịch vụ để biết vì sao có bản sao.
   */
  const url = SITE + (route.canonicalTo ?? route.path);
  const fullTitle = route.khongThemDuoi ? route.title : route.title + SUFFIX;
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

  // Trang danh sách bài viết khi chưa có bài: không cho Google lập chỉ mục
  // một trang trống (bản chạy JS cũng đặt noindex y như vậy).
  if (route.noindex) html = replaceMeta(html, "name", "robots", "noindex, follow", "robots");
  if (route.loai === "bai-viet") html = replaceMeta(html, "property", "og:type", "article", "og:type");

  html = nhetJsonLd(html, duLieuCoCauTruc(route));

  /**
   * Nhét link nội bộ vào trong `#root`.
   *
   * React thay thế nguyên khối này ngay khi khởi động, nên người dùng không
   * thấy. Nhưng lượt quét ĐẦU TIÊN của Google chạy trước khi có JavaScript —
   * và trước hôm nay nó nhận về một `#root` rỗng, KHÔNG MỘT THẺ <a> NÀO.
   */
  const lienKet = khoiLienKet({
    dichVu: dsDichVu,
    duAn: dsDuAn,
    duongDanHienTai: route.path,
    loai: route.loai ?? "tinh",
    // Chỉ trang dự án mới có bài để nhét. Trang dịch vụ đã có mô tả dài sẵn
    // trong thẻ meta, trang tĩnh thì nội dung nằm trong mã nguồn giao diện.
    noiDung:
      route.noiDungHtml
        ? route.noiDungHtml + CHAN_TRANG
        : route.loai === "du-an"
        ? khoiNoiDung({ ten: route.tenThat ?? route.title, caseStudy: route.caseStudy }) + CHAN_TRANG
        : route.loai === "dich-vu"
          ? khoiTrang({
              h1: `${route.tenThat}: ${route.dongVang}`,
              doan: [route.moTaDay],
              muc: route.noiBat,
              hoiDap: (route.faqs ?? []).map((f) => ({ q: f.question?.vi, a: f.answer?.vi })),
            })
          : khoiTrangTinh(route.path, dsDichVu),
  });
  if (lienKet) {
    // Khớp cả khi #root ĐÃ có link — bước trang chủ ghi đè lên chính file gốc,
    // nên chạy script hai lần mà không dựng lại thì lần hai không thấy #root
    // rỗng nữa và bỏ qua toàn bộ 77 trang. Khớp lỏng thì chạy lại bao nhiêu lần
    // cũng ra kết quả như nhau. (Khối chèn vào không chứa <div> nên dấu </div>
    // đầu tiên luôn là dấu đóng của chính #root.)
    const reRoot = /<div id="root">[\s\S]*?<\/div>/i;
    if (reRoot.test(html)) {
      html = html.replace(reRoot, `<div id="root">${lienKet}</div>`);
    } else {
      console.warn("  ! Bỏ qua link nội bộ: không tìm thấy #root rỗng");
      warnings++;
    }
  }


  const outDir = path.join(DIST, route.path.replace(/^\//, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  return fullTitle;
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
      // Ưu tiên chữ soạn riêng cho máy tìm kiếm (Portal → Dịch vụ → "Chỉ dành
      // cho Google & Zalo"). Chưa điền thì lùi về tên và mô tả hiện trên trang.
      title: s.seoTitle?.vi?.trim() || s.title?.vi || s.title?.en || "Dịch vụ",
      // Tiêu đề SEO đã tự mang tên thương hiệu nên không thêm đuôi nữa.
      khongThemDuoi: Boolean(s.seoTitle?.vi?.trim()),
      description: trim(s.seoDescription?.vi?.trim() || s.description?.vi || s.description?.en),
      image: s.thumbnailImage,
      loai: "dich-vu",
      tenThat: s.title?.vi || s.title?.en || "Dịch vụ",
      dongVang: DONG_VANG[s.tag] ?? "Sản xuất video",
      faqs: s.faqs ?? [],
      // Cho khối chữ thật trong HTML thô (khoiTrang): đúng chữ trang hiện ra.
      moTaDay: s.description?.vi || "",
      noiBat: (s.highlights ?? []).map((h) => ({ h: h.title?.vi || "", p: h.desc?.vi || "" })),
    });

    /**
     * BẢN SAO Ở ĐỊA CHỈ MÃ MÁY — khai canonical trỏ về địa chỉ tên thật.
     *
     * Hồi web còn dùng mã máy, mỗi dịch vụ nằm ở /service/6a1ea4f100... Đổi
     * sang tên đọc được rồi thì địa chỉ cũ VẪN SỐNG: giao diện nhận cả hai
     * (`service/:id`), nên máy chủ trả 200 với nội dung y hệt.
     *
     * Đo log Googlebot ngày 05/09/2026: cả tuần Google chỉ bò được 96 lượt vào
     * beezvn.com, trong đó 8 lượt vào trang dịch vụ mà 3 lượt rơi vào mấy địa
     * chỉ mã máy này. Tệ hơn, chúng không có tệp dựng sẵn nên nhận file mặc
     * định — tức là khai canonical trỏ về TRANG CHỦ, một lời khai sai.
     *
     * Ngân sách bò của web nhỏ như beezvn.com rất hẹp (4 trang dự án mỗi tuần).
     * Mỗi lượt tiêu vào bản sao là một lượt không tiêu vào trang chưa ai đọc.
     *
     * KHÔNG chuyển hướng 301: giao diện đang phục vụ địa chỉ đó thật, và nếu
     * còn chỗ nào trong app hay trong tin nhắn cũ trỏ tới thì chuyển hướng có
     * thể làm hỏng. Khai canonical đạt đúng mục đích mà không đụng gì.
     */
    if (s.slug && s.id && s.slug !== s.id) {
      routes.push({
        ...routes[routes.length - 1],
        path: `/service/${s.id}`,
        canonicalTo: `/service/${s.slug}`,
      });
    }
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

  /**
   * TÊN DỰ ÁN BỊ TRÙNG — phải tách ra, nếu không hai trang khác nhau có chung
   * một thẻ <title> và máy tìm kiếm không phân biệt được.
   *
   * Đo ngày 21/08/2026: OWEN ×2, Cardina ×2, FPT Camera ×2. Đây là dự án làm
   * nhiều đợt cho cùng một khách, tên trên trang giữ nguyên là đúng — chỉ thẻ
   * tiêu đề cần phân biệt, và phân biệt bằng DỮ LIỆU CÓ SẴN (tháng/năm quay)
   * chứ không bịa thêm chữ.
   */
  const demTen = new Map();
  for (const p of projects) {
    const k = (p.title || "").trim().toLowerCase();
    demTen.set(k, (demTen.get(k) ?? 0) + 1);
  }

  /** "tháng 5/2026" — chỉ dùng khi thật sự có ngày quay. */
  const thangNam = (d) => {
    if (!d) return null;
    const x = new Date(d);
    return Number.isNaN(x.getTime()) ? null : `tháng ${x.getMonth() + 1}/${x.getFullYear()}`;
  };
  /** "22/05/2026" — dùng khi hai đợt rơi vào cùng một tháng. */
  const ngayDayDu = (d) => {
    if (!d) return null;
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return null;
    const hai = (n) => String(n).padStart(2, "0");
    return `${hai(x.getDate())}/${hai(x.getMonth() + 1)}/${x.getFullYear()}`;
  };

  /**
   * Tháng/năm chưa chắc tách được: FPT Camera quay hai đợt 08/05 và 22/05, cùng
   * tháng 5/2026, nên gắn tháng vào vẫn ra hai tiêu đề y hệt. Đếm lại lần nữa
   * trên tiêu đề ĐÃ gắn tháng; chỗ nào vẫn đụng thì xuống tới ngày.
   */
  const demSauThang = new Map();
  for (const p of projects) {
    const ten = (p.title || "Dự án").trim();
    const k = demTen.get(ten.toLowerCase()) > 1 && thangNam(p.shootDate)
      ? `${ten} — ${thangNam(p.shootDate)}`
      : ten;
    demSauThang.set(k.toLowerCase(), (demSauThang.get(k.toLowerCase()) ?? 0) + 1);
  }

  for (const p of projects) {
    const serviceId = typeof p.service === "string" ? p.service : p.service?.id;
    const serviceSlug = typeof p.service === "string" ? null : p.service?.slug;
    if (!serviceId) continue; // dự án mồ côi thì bỏ qua, không đoán
    const tenMang = typeof p.service === "string" ? null : p.service?.title?.vi;
    const khi = thangNam(p.shootDate);
    const noi = (p.shootLocation ?? "").trim();

    // `.trim()`: dữ liệu có tên thừa dấu cách ("OWEN "), để nguyên thì ra
    // "OWEN  — tháng 12/2025" với hai dấu cách giữa.
    const tenGoc = (p.title || "Dự án").trim();
    const bitrung = demTen.get(tenGoc.toLowerCase()) > 1;
    const theoThang = bitrung && khi ? `${tenGoc} — ${khi}` : tenGoc;
    const tieuDe =
      bitrung && demSauThang.get(theoThang.toLowerCase()) > 1 && ngayDayDu(p.shootDate)
        ? `${tenGoc} — ${ngayDayDu(p.shootDate)}`
        : theoThang;

    /**
     * PHỤ ĐỀ TRỐNG THÌ DỰNG MÔ TẢ TỪ DỮ LIỆU THẬT.
     *
     * 11 dự án có phụ đề rỗng hoặc chỉ lặp lại đúng cái tên, nên thẻ mô tả của
     * chúng cũng chỉ là cái tên — Google gọi đó là nội dung mỏng và bỏ qua.
     * Ghép từ mảng, địa điểm và tháng quay: toàn thứ có sẵn trong dữ liệu,
     * không bịa một chữ nào.
     */
    const phuDe = (p.subtitle?.vi || p.subtitle?.en || "").trim();
    const phuDeThat = phuDe && phuDe.toLowerCase() !== tenGoc.trim().toLowerCase() ? phuDe : "";
    const moTaGhep = [
      `Dự án ${tenGoc} do Bee Z Production thực hiện`,
      tenMang ? ` — ${tenMang.toLowerCase()}` : "",
      noi ? `, quay tại ${noi}` : "",
      khi ? `, ${khi}` : "",
      ". Xem phim, hình ảnh và thông tin dự án tại beezvn.com.",
    ].join("");

    // Nhãn mảng gắn vào tiêu đề ("MSI · Quay chụp sự kiện") — cùng nguồn với
    // ProjectPage.tsx (src/data/seo-trang-tinh.json, khoá _nhanMang).
    const nhan = SEO_TINH._nhanMang?.[serviceSlug] ?? "";
    routes.push({
      path: p.slug ? `/du-an/${p.slug}` : `/service/${serviceSlug || serviceId}/${p.id}`,
      title: nhan ? `${tieuDe} · ${nhan}` : tieuDe,
      tenMang,
      video: p.video,
      // Tên thật (chưa gắn tháng) dùng cho JSON-LD và cho khối link nội bộ.
      tenThat: tenGoc,
      description: trim(phuDeThat || moTaGhep),
      image: p.thumbnailImage,
      loai: "du-an",
      // Bài case study — nhét thẳng vào HTML tĩnh chứ không để JavaScript vẽ.
      caseStudy: p.caseStudy,
      // Để khối link nội bộ biết dự án này treo dưới mảng nào.
      dichVuPath: `/service/${serviceSlug || serviceId}`,
    });
  }

  return routes;
}

// Dòng chữ màn đầu trang chủ (Portal → Trang chủ) cho khối chữ thật của trang chủ.
let landing = null;
try {
  landing = await fetchJson(`${API}/landing?lang=vi`);
} catch (e) {
  console.warn(`  ! Không lấy được /landing (${e.message}) — trang chủ chỉ có link + chân trang.`);
}

let details = [];
try {
  details = await detailRoutes();
} catch (e) {
  console.warn(
    `\n! Không lấy được dữ liệu từ ${API} (${e.message}).\n` +
      `  Bỏ qua các trang chi tiết — bản dựng vẫn chạy bình thường.`,
  );
  warnings++;
}

/**
 * DỰNG SAU KHI ĐÃ CÓ DANH SÁCH, KHÔNG DỰNG TRƯỚC.
 *
 * Khối link nội bộ cần biết đủ 6 mảng và 66 dự án mới dựng được, mà danh sách
 * đó nằm sau lời gọi API. Giữ thứ tự cũ thì chính trang portfolio — trang đáng
 * ra phải trỏ tới cả 66 dự án — lại là trang duy nhất không có link nào.
 *
 * API hỏng thì `details` rỗng: trang tĩnh vẫn dựng, chỉ là không có link dự án.
 */
const dsDichVu = details
  // Bỏ các bản trùng theo mã máy (/service/6a1e…): chúng có `canonicalTo` trỏ về
  // địa chỉ tên thật. Thiếu điều kiện này thì 85/86 trang mang 12 link dịch vụ
  // thay vì 6 — một nửa trỏ vào địa chỉ mã máy (đo 23/11/2026).
  .filter((r) => r.loai === "dich-vu" && !r.canonicalTo)
  .map((r) => ({ path: r.path, title: r.tenThat ?? r.title, moTa: r.moTaDay }));

/**
 * Chữ thật cho các trang tĩnh trong HTML thô — chỉ thứ trang thật hiện ra:
 * tiêu đề lớn, dòng phụ, danh sách mảng (trang /service hiện thẻ có mô tả), và
 * chân trang. (Mục N2, 24/11/2026.)
 */
function khoiTrangTinh(duong, dsDV) {
  if (duong === "/service")
    return khoiTrang({
      h1: "Dịch vụ sản xuất video và chụp ảnh tại Hà Nội",
      doan: ["Từ TVC truyền hình đến video ngắn cho mạng xã hội"],
      muc: dsDV.map((d) => ({ h: d.title, p: d.moTa })),
    });
  if (duong === "/portfolio") return khoiTrang({ h1: "Dự án TVC, sự kiện và hình ảnh Bee Z đã thực hiện", doan: ["Vài dự án và hình ảnh tiêu biểu."] });
  if (duong === "/team") return khoiTrang({ h1: "Đội ngũ sản xuất phim của Bee Z Production" });
  if (duong === "/contact")
    return khoiTrang({ h1: "Liên hệ Bee Z Production tại Hà Nội", doan: ["Cần hỏi về dịch vụ, báo giá hay bất cứ điều gì, cứ nhắn. Bee Z trả lời."] });
  if (duong === "/chinh-sach-bao-mat") return khoiTrang({ h1: "Chính sách bảo mật" });
  return CHAN_TRANG;
}
const dsDuAn = details
  .filter((r) => r.loai === "du-an")
  .map((r) => ({ path: r.path, title: r.tenThat ?? r.title, dichVuPath: r.dichVuPath }));

/**
 * BÀI VIẾT (/bai-viet). Lấy danh sách bài đã đăng rồi từng bài một. API chưa có
 * đường này (máy chủ cũ) hay lỗi thì coi như chưa có bài, bản dựng vẫn chạy.
 *
 * LƯU Ý: bài đăng SAU lần dựng này chỉ có bản dựng sẵn ở lần đẩy kế tiếp. Trong
 * lúc chờ, trang vẫn chạy bằng JavaScript (Google đọc được, chỉ chậm hơn).
 */
let dsBai = [];
try {
  const ds = await fetchJson(`${API}/bai-viet`);
  for (const b of Array.isArray(ds) ? ds : []) {
    try {
      dsBai.push(await fetchJson(`${API}/bai-viet/${encodeURIComponent(b.slug)}`));
    } catch (e) {
      console.warn(`  ! Bỏ qua bài ${b.slug}: ${e.message}`);
      warnings++;
    }
  }
} catch (e) {
  console.log(`  (chưa lấy được bài viết: ${e.message} — coi như chưa có bài)`);
}
const ngayVi = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
};
const routeBaiViet = dsBai.map((b) => ({
  path: `/bai-viet/${b.slug}`,
  title: b.tieuDe,
  description: trim(b.moTa || b.tieuDe),
  image: b.anhBia || undefined,
  loai: "bai-viet",
  ngayDang: b.ngayDang || undefined,
  ngaySua: b.updatedAt || undefined,
  noiDungHtml:
    `<article><h1>${esc(b.tieuDe)}</h1>` +
    (b.ngayDang ? `<p>${esc(ngayVi(b.ngayDang))} · Bee Z Production</p>` : "") +
    markdownSangHtml(b.noiDung) +
    `</article>`,
}));
ROUTES.push({
  path: "/bai-viet",
  title: SEO_TINH["/bai-viet"].title,
  description: SEO_TINH["/bai-viet"].description,
  loai: "tinh",
  noindex: dsBai.length === 0,
  noiDungHtml:
    `<article><h1>Sản xuất video, nói bằng số thật</h1>` +
    `<p>Chi phí, quy trình và cách chọn ekip, viết từ bảng giá và những dự án Bee Z đã làm.</p>` +
    dsBai
      .map((b) => `<h2><a href="/bai-viet/${esc(b.slug)}">${esc(b.tieuDe)}</a></h2>${b.moTa ? `<p>${esc(b.moTa)}</p>` : ""}`)
      .join("") +
    `</article>`,
});

for (const route of ROUTES) {
  console.log(`✓ dist${route.path}/index.html — "${renderPage(route, dsDichVu, dsDuAn)}"`);
}
for (const route of routeBaiViet) {
  console.log(`✓ dist${route.path}/index.html — "${renderPage(route, dsDichVu, dsDuAn)}"`);
}

try {
  for (const route of details) renderPage(route, dsDichVu, dsDuAn);
  // Đếm theo tiền tố chứ không theo số dấu gạch: từ khi dự án có địa chỉ phẳng
  // (/du-an/…) thì hai loại có cùng số đoạn, đếm kiểu cũ sẽ ra số sai.
  const nSvc = details.filter((r) => r.path.startsWith("/service/")).length;
  console.log(`✓ ${nSvc} trang dịch vụ + ${details.length - nSvc} trang dự án`);
} catch (e) {
  console.warn(`\n! Lỗi khi dựng trang chi tiết: ${e.message}`);
  warnings++;
}

/**
 * TRANG CHỦ CŨNG PHẢI CÓ LINK — nó là trang duy nhất bị sót.
 *
 * `dist/index.html` chính là file gốc mà mọi trang khác chép ra, nên nó không
 * nằm trong danh sách dựng và lần đầu chạy chỉ có 2 thẻ <a> trong khi các trang
 * khác có 13-79. Trớ trêu: trang được Google ghé nhiều nhất lại là trang không
 * dẫn đi đâu.
 *
 * Ghi ĐÈ sau cùng, khi `base` đã nằm sẵn trong bộ nhớ, nên không ảnh hưởng các
 * trang vừa dựng.
 */
const lienKetTrangChu = khoiLienKet({
  dichVu: dsDichVu,
  duAn: dsDuAn,
  duongDanHienTai: "/",
  loai: "tinh",
  noiDung: khoiTrang({
    h1: [landing?.heroLine1?.vi, landing?.heroLine2?.vi].filter(Boolean).join(" ") || "Bee Z Production",
    doan: [landing?.subheading?.vi],
    muc: dsDichVu.map((d) => ({ h: d.title, p: d.moTa })),
  }),
});
if (lienKetTrangChu) {
  const goc = fs.readFileSync(indexPath, "utf8");
  // Khớp cả khi #root ĐÃ có link — bước trang chủ ghi đè lên chính file gốc,
    // nên chạy script hai lần mà không dựng lại thì lần hai không thấy #root
    // rỗng nữa và bỏ qua toàn bộ 77 trang. Khớp lỏng thì chạy lại bao nhiêu lần
    // cũng ra kết quả như nhau. (Khối chèn vào không chứa <div> nên dấu </div>
    // đầu tiên luôn là dấu đóng của chính #root.)
    const reRoot = /<div id="root">[\s\S]*?<\/div>/i;
  if (reRoot.test(goc)) {
    fs.writeFileSync(indexPath, goc.replace(reRoot, `<div id="root">${lienKetTrangChu}</div>`));
    console.log("✓ dist/index.html — đã thêm link nội bộ cho trang chủ");
  } else {
    console.warn("  ! Trang chủ: không tìm thấy #root rỗng, bỏ qua link nội bộ");
    warnings++;
  }
}

console.log(`\nĐã sinh ${ROUTES.length + routeBaiViet.length + details.length} trang có thẻ mô tả riêng.`);
if (warnings > 0) {
  // Dòng này KHÔNG được đoán nguyên nhân. Trước đây nó khẳng định luôn "mẫu HTML
  // đã đổi", mà giờ cảnh báo còn đến từ chỗ khác (API chạy cũ hơn) — đoán sai
  // nguyên nhân còn hại hơn không đoán, vì nó dẫn người đọc đi sai hướng.
  console.warn(
    `\n! ${warnings} cảnh báo ở trên — đọc kỹ từng cái, mỗi cái có cách chữa riêng.\n` +
      `  Bản dựng vẫn chạy bình thường.`,
  );
}
