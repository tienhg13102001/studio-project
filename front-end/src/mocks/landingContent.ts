import type { Lang } from "../i18n";

// Kiểu dữ liệu trả về từ API (sau này sẽ match với schema DB)
export type LandingContent = {
  heroLine1: string;
  heroLine2: string;
  subheading: string;
};

// Mock data — thay bằng API call thực khi có backend
const content: Record<Lang, LandingContent> = {
  en: {
    heroLine1: "We Are",
    heroLine2: "BeeZ Production",
    subheading:
      "BeeZ Production - Hanoi's premier video production agency crafting unforgettable content for brands that dare to be different",
  },
  vi: {
    heroLine1: "Chúng Tôi Là",
    heroLine2: "BeeZ Production",
    subheading:
      "BeeZ Production - Agency sản xuất video hàng đầu Hà Nội, kiến tạo nội dung đáng nhớ cho những thương hiệu dám khác biệt",
  },
};

// Giả lập API call — sau này thay bằng: fetch(`/api/landing?lang=${lang}`)
export const getLandingContent = (lang: Lang): LandingContent => content[lang];
