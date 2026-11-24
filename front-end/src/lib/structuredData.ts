/**
 * Sinh dữ liệu có cấu trúc (JSON-LD) cho các trang public.
 *
 * Đây là "danh thiếp máy đọc được" của Bee Z: Google dùng để hiện kết quả giàu
 * thông tin (câu hỏi thường gặp nở ra, thông tin doanh nghiệp), còn các trợ lý
 * AI dùng để biết Bee Z là ai, làm gì, ở đâu khi có người hỏi.
 *
 * Nguyên tắc: chỉ khai báo thứ CÓ THẬT trong dữ liệu — thiếu thì bỏ trường đó đi,
 * không bịa. Khai sai còn hại hơn không khai.
 */

export const SITE_URL = "https://www.beezvn.com";
const SITE_NAME = "Bee Z Production";

/** Bỏ các khoá rỗng để JSON-LD không chứa trường trống. */
function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as T;
}

/*
 * Khối "Bee Z là ai" (ProfessionalService, "@id": `${SITE_URL}/#organization`)
 * KHÔNG dựng ở đây nữa: nó nằm tĩnh trong front-end/index.html từ 24/11/2026 để
 * có một nguồn duy nhất, có sẵn trong HTML thô. Các khối dưới chỉ trỏ tới nó.
 */

/** Ô tìm kiếm của site trong kết quả Google (chỉ khai ở trang chủ). */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: ["vi", "en"],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Một dịch vụ cụ thể (trang /service/:id). */
export function serviceSchema(input: { name: string; description: string; path: string; image?: string }) {
  return compact({
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    image: input.image,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "Vietnam" },
  });
}

/**
 * Câu hỏi thường gặp — Google có thể hiện trực tiếp trong kết quả tìm kiếm, và
 * AI hay trích đúng dạng hỏi-đáp này. Dữ liệu lấy từ FAQ đã nhập trong portal.
 */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  const usable = faqs.filter((f) => f.question?.trim() && f.answer?.trim());
  if (usable.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: usable.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Đường dẫn phân cấp, giúp Google hiện "Trang chủ › Dịch vụ › …". */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
