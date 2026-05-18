import type { Lang } from "../i18n";

type LocalizedString = { en: string; vi: string };

type RawServiceItem = {
  id: number;
  title: LocalizedString;
  description: LocalizedString;
};

export type ServiceItem = {
  id: number;
  title: string;
  description: string;
};

// Chỉ phần text cần dịch — icon & image URL giữ riêng trong component
const services: RawServiceItem[] = [
  {
    id: 1,
    title: {
      en: "TVC Production",
      vi: "Sản Xuất TVC",
    },
    description: {
      en: "Building brand value through inspiring visuals and storytelling",
      vi: "Xây dựng giá trị thương hiệu thông qua hình ảnh và câu chuyện truyền cảm hứng",
    },
  },
  {
    id: 2,
    title: {
      en: "Short-form Content",
      vi: "Nội Dung Dạng Ngắn",
    },
    description: {
      en: "TikTok, Reels, Shorts — multi-platform content with 1B+ views",
      vi: "TikTok, Reels, Shorts - Nội dung đa nền tảng với hơn 1 tỷ+ lượt xem",
    },
  },
  {
    id: 3,
    title: {
      en: "Food & Beverage (F&B)",
      vi: "Đồ Ăn & Thức Uống (F&B)",
    },
    description: {
      en: "Creative, professional video production for restaurants and F&B brands",
      vi: "Sản xuất video sáng tạo, chuyên nghiệp cho nhà hàng và ngành F&B",
    },
  },
];

// Giả lập API call — sau này thay bằng: fetch(`/api/services?lang=${lang}`)
export const getServicesContent = (lang: Lang): ServiceItem[] =>
  services.map((s) => ({ id: s.id, title: s.title[lang], description: s.description[lang] }));
