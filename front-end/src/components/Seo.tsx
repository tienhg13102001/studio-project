import { coBanTiengAnh, theoNgonNgu, useLanguage } from "#i18n";
import { useEffect, type FC } from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.beezvn.com";
const SITE_NAME = "Bee Z Production";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

type Props = {
  /** Page title — final tag becomes "<title> — Bee Z Production" unless titleTemplate is false. */
  title: string;
  description: string;
  /**
   * Đường dẫn TIẾNG VIỆT, bắt đầu bằng "/" (vd "/team"). Đang ở bản Anh thì
   * component tự gắn /en cho canonical/og:url và khai cặp hreflang vi ↔ en.
   */
  path?: string;
  /** Absolute or root-relative image URL for OG/Twitter cards. */
  image?: string;
  /** "website" (default) or "article". */
  type?: "website" | "article";
  /** Set false to use `title` verbatim without the " — Bee Z Production" suffix. */
  titleTemplate?: boolean;
  /** Discourage indexing (e.g. 404, private pages). */
  noindex?: boolean;
  /**
   * Dữ liệu có cấu trúc (JSON-LD) mô tả trang bằng ngôn ngữ máy đọc được.
   * Google dùng để hiện kết quả giàu thông tin, còn các trợ lý AI dùng để biết
   * Bee Z là ai và làm gì. Truyền một hoặc nhiều khối schema.
   */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const Seo: FC<Props> = ({
  title,
  description,
  path,
  image,
  type = "website",
  titleTemplate = true,
  noindex = false,
  jsonLd,
}) => {
  const { lang } = useLanguage();

  /**
   * Gỡ khối dữ liệu có cấu trúc do bản dựng nhét sẵn vào HTML.
   *
   * `scripts/prerender-meta.mjs` nhét `Service` / `FAQPage` / `BreadcrumbList`
   * thẳng vào HTML thô để máy tìm kiếm đọc được NGAY, không phải đợi chạy
   * JavaScript. Nhưng khi React chạy, chính component này lại dựng đúng những
   * khối đó một lần nữa — thành hai bản giống hệt trên cùng một trang, và Google
   * phải đoán tin bản nào.
   *
   * Gỡ bản dựng sẵn đi là xong: HTML thô vẫn có nó (thứ máy tìm kiếm đọc lượt
   * đầu), còn trên trình duyệt thì chỉ còn bản React quản — bản này còn tự đổi
   * theo khi khách bấm sang trang khác mà không tải lại.
   */
  useEffect(() => {
    document
      .querySelectorAll('script[type="application/ld+json"][data-tra-truoc]')
      .forEach((el) => el.remove());

    // Thẻ mô tả tĩnh đã gỡ ở main.tsx trước khi React vẽ; còn <title> tĩnh
    // (đánh dấu `data-tinh`) thì gỡ ở đây, vì trang này đã có tiêu đề của Seo.
    // Hai <title> cùng có mặt thì trình duyệt lấy cái ĐẦU — tức bản tĩnh cũ.
    document.querySelectorAll("title[data-tinh]").forEach((el) => el.remove());
  }, []);


  const fullTitle = titleTemplate ? `${title} — ${SITE_NAME}` : title;
  // Trang có bản Anh (đợt J, 25/11/2026): mỗi bản tự khai canonical về CHÍNH NÓ
  // và cùng khai cặp hreflang trỏ sang nhau — đúng cách Google hướng dẫn. Bài
  // viết chỉ có tiếng Việt nên không khai hreflang.
  const haiBan = !!path && !noindex && coBanTiengAnh(path);
  const urlVi = path ? `${SITE_URL}${path === "/" ? "/" : path}` : SITE_URL;
  const urlEn = path ? `${SITE_URL}${theoNgonNgu(path, "en")}` : SITE_URL;
  const canonical = haiBan && lang === "en" ? urlEn : urlVi;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={lang === "vi" ? "vi_VN" : "en_US"} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {/* Zalo/Facebook đọc chắc hơn khi biết trước kích thước ảnh. */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content={lang === "en" ? "Bee Z Production — TVC and commercial production in Hanoi" : "Bee Z Production — sản xuất TVC và phim quảng cáo tại Hà Nội"}
      />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* hreflang: khai lại từ đợt J (25/11/2026) khi đã có /en riêng. x-default
          là bản Việt — khách chính của Bee Z. PHẢI khớp bản dựng sẵn trong
          scripts/prerender-meta.mjs (theHreflang). */}
      {haiBan && <link rel="alternate" hrefLang="vi" href={urlVi} />}
      {haiBan && <link rel="alternate" hrefLang="en" href={urlEn} />}
      {haiBan && <link rel="alternate" hrefLang="x-default" href={urlVi} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default Seo;
