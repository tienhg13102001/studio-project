import {
  DeviceMobileCameraIcon,
  PhoneIcon,
  TelevisionSimpleIcon,
} from "@phosphor-icons/react";
import type { ElementType } from "react";
import type { Lang } from "../i18n";

type LocalizedString = { en: string; vi: string };

type RawServiceItem = {
  id: number;
  icon: ElementType;
  image: string;
  title: LocalizedString;
  description: LocalizedString;
};

export type ServiceItem = {
  id: number;
  icon: ElementType;
  image: string;
  title: string;
  description: string;
};

const services: RawServiceItem[] = [
  {
    id: 1,
    icon: TelevisionSimpleIcon,
    image: "/images/services1.webp",
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
    icon: DeviceMobileCameraIcon,
    image: "/images/services2.webp",
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
    icon: PhoneIcon,
    image: "/images/NAQ03133.webp",
    title: {
      en: "Food & Beverage (F&B)",
      vi: "Đồ Ăn & Thức Uống (F&B)",
    },
    description: {
      en: "Creative, professional video production for restaurants and F&B brands",
      vi: "Sản xuất video sáng tạo, chuyên nghiệp cho nhà hàng và ngành F&B",
    },
  },
  {
    id: 4,
    icon: PhoneIcon,
    image: "/images/NAQ03133.webp",
    title: {
      en: "Food & Beverage (F&B)",
      vi: "Đồ Ăn & Thức Uống (F&B)",
    },
    description: {
      en: "Creative, professional video production for restaurants and F&B brands",
      vi: "Sản xuất video sáng tạo, chuyên nghiệp cho nhà hàng và ngành F&B",
    },
  },
  {
    id: 5,
    icon: PhoneIcon,
    image: "/images/NAQ03133.webp",
    title: {
      en: "Food & Beverage (F&B)",
      vi: "Đồ Ăn & Thức Uống (F&B)",
    },
    description: {
      en: "Creative, professional video production for restaurants and F&B brands",
      vi: "Sản xuất video sáng tạo, chuyên nghiệp cho nhà hàng và ngành F&B",
    },
  },
  {
    id: 6,
    icon: PhoneIcon,
    image: "/images/NAQ03133.webp",
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
  services.map((s) => ({
    id: s.id,
    icon: s.icon,
    image: s.image,
    title: s.title[lang],
    description: s.description[lang],
  }));
