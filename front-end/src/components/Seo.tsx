import { useLanguage } from "#i18n";
import type { FC } from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.beezvn.com";
const SITE_NAME = "BeeZ Production";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

type Props = {
  /** Page title — final tag becomes "<title> — BeeZ Production" unless titleTemplate is false. */
  title: string;
  description: string;
  /** Path beginning with "/" — used for canonical + og:url. Defaults to current location. */
  path?: string;
  /** Absolute or root-relative image URL for OG/Twitter cards. */
  image?: string;
  /** "website" (default) or "article". */
  type?: "website" | "article";
  /** Set false to use `title` verbatim without the " — BeeZ Production" suffix. */
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

  const fullTitle = titleTemplate ? `${title} — ${SITE_NAME}` : title;
  const canonical = path ? `${SITE_URL}${path}` : SITE_URL;
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

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Cùng một URL phục vụ cả tiếng Việt lẫn tiếng Anh (đổi bằng nút trên
          trang), nên khai báo để Google biết đây là trang song ngữ. */}
      <link rel="alternate" hrefLang="vi" href={canonical} />
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default Seo;
