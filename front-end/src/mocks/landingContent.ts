import type { Lang } from "../i18n";

type LocalizedString = { en: string; vi: string };

type RawLandingContent = {
  heroLine1: LocalizedString;
  heroLine2: LocalizedString;
  subheading: LocalizedString;
};

// Kiểu dữ liệu trả về từ API (sau này sẽ match với schema DB)
export type LandingContent = {
  heroLine1: string;
  heroLine2: string;
  subheading: string;
};

// Mock data — thay bằng API call thực khi có backend
const landing: RawLandingContent = {
  heroLine1: {
    en: "We Are",
    vi: "Chúng Tôi Là",
  },
  heroLine2: {
    en: "BeeZ Production",
    vi: "BeeZ Production",
  },
  subheading: {
    en: "BeeZ Production - Hanoi's premier video production agency crafting unforgettable content for brands that dare to be different",
    vi: "BeeZ Production - Agency sản xuất video hàng đầu Hà Nội, kiến tạo nội dung đáng nhớ cho những thương hiệu dám khác biệt",
  },
};

// Giả lập API call — sau này thay bằng: fetch(`/api/landing?lang=${lang}`)
export const getLandingContent = (lang: Lang): LandingContent => ({
  heroLine1: landing.heroLine1[lang],
  heroLine2: landing.heroLine2[lang],
  subheading: landing.subheading[lang],
});
