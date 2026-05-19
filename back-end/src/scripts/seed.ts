import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Landing } from "../models/Landing.ts";
import { Service } from "../models/Service.ts";
import { Feature } from "../models/Feature.ts";

async function seed() {
  await connectDB();
  console.log("🌱 Seeding database....");

  await Promise.all([Landing.deleteMany({}), Service.deleteMany({}), Feature.deleteMany({})]);

  // ─── Landing ──────────────────────────────────────────────────────────────
  await Landing.create({
    heroLine1: { en: "We Are", vi: "Chúng Tôi Là" },
    heroLine2: { en: "BeeZ Production", vi: "BeeZ Production" },
    subheading: {
      en: "BeeZ Production - Hanoi's premier video production agency crafting unforgettable content for brands that dare to be different",
      vi: "BeeZ Production - Agency sản xuất video hàng đầu Hà Nội, kiến tạo nội dung đáng nhớ cho những thương hiệu dám khác biệt",
    },
    videoBackground: "/videos/video-bg.webm",
  });
  console.log("  ✓ Landing");

  // ─── Services ─────────────────────────────────────────────────────────────
  const insertedServices = await Service.insertMany([
    {
      order: 1,
      tag: "TVC",
      iconName: "TelevisionSimple",
      image: "/images/NAQ03133.webp",
      title: { en: "TVC Production", vi: "Sản Xuất TVC" },
      description: {
        en: "Building brand value through inspiring visuals and storytelling",
        vi: "Xây dựng giá trị thương hiệu thông qua hình ảnh và câu chuyện truyền cảm hứng",
      },
    },
    {
      order: 2,
      tag: "SHORT",
      iconName: "DeviceMobileCamera",
      image: "/images/services1.webp",
      title: { en: "Short-form Content", vi: "Nội Dung Dạng Ngắn" },
      description: {
        en: "TikTok, Reels, Shorts — multi-platform content with 1B+ views",
        vi: "TikTok, Reels, Shorts - Nội dung đa nền tảng với hơn 1 tỷ+ lượt xem",
      },
    },
    {
      order: 3,
      tag: "F&B",
      iconName: "Phone",
      image: "/images/services2.webp",
      title: { en: "Food & Beverage (F&B)", vi: "Đồ Ăn & Thức Uống (F&B)" },
      description: {
        en: "Creative, professional video production for restaurants and F&B brands",
        vi: "Sản xuất video sáng tạo, chuyên nghiệp cho nhà hàng và ngành F&B",
      },
    },
    {
      order: 4,
      tag: "INTERVIEW",
      iconName: "Microphone",
      image: "/images/services2.webp",
      title: { en: "Interview Production", vi: "Sản Xuất Phỏng Vấn" },
      description: {
        en: "In-depth interview videos that tell authentic stories and build trust",
        vi: "Video phỏng vấn chuyên sâu, kể câu chuyện chân thực và xây dựng niềm tin",
      },
    },
  ]);
  console.log("  ✓ Services (4)");

  // Build tag → ObjectId lookup
  const tagMap = new Map(insertedServices.map((s) => [s.tag, s._id]));

  // ─── Features ─────────────────────────────────────────────────────────────
  await Feature.insertMany([
    // top cards
    {
      layout: "vertical",
      order: 1,
      tag: tagMap.get("SHORT"),
      image:
        "/images/feature1.webp",
      title: "Greenfield Dental - V-Line...",
      subtitle: "Greenfield",
    },
    {
      layout: "vertical",
      order: 2,
      tag: tagMap.get("SHORT"),
      image:
        "/images/feature1.webp",
      title: "bb.q Chicken - Birthday Ce...",
      subtitle: "bb.q Chicken",
    },
    {
      layout: "vertical",
      order: 3,
      tag: tagMap.get("SHORT"),
      image:
        "/images/feature1.webp",
      title: "Greenfield Braces - Nerdy...",
      subtitle: "Greenfield Dental",
    },
    {
      layout: "vertical",
      order: 4,
      tag: tagMap.get("SHORT"),
      image:
        "/images/feature1.webp",
      title: "bb.q Chicken - Crispy Chic...",
      subtitle: "bb.q Chicken",
    },
    {
      layout: "vertical",
      order: 5,
      tag: tagMap.get("SHORT"),
      image:
        "/images/feature1.webp",
      title: "Greenfield Braces - Sporty...",
      subtitle: "Greenfield Dental",
    },
    {
      layout: "vertical",
      order: 6,
      tag: tagMap.get("F&B"),
      image:
        "/images/feature1.webp",
      title: "Grouper Fish - Chef's Sign...",
      subtitle: "Chapter Fine Dining",
    },
    {
      layout: "vertical",
      order: 7,
      tag: tagMap.get("F&B"),
      image:
        "/images/feature1.webp",
      title: "Fresh Sashimi - Master...",
      subtitle: "Chapter Fine Dining",
    },
    // bottom cards
    {
      layout: "horizontal",
      order: 1,
      tag: tagMap.get("INTERVIEW"),
      image:
        "/images/feature2.webp",
      title: "Emotional Interview - 45 Minutes of Talking",
      subtitle: "Healthcare",
    },
    {
      layout: "horizontal",
      order: 2,
      tag: tagMap.get("TVC"),
      image:
        "/images/feature2.webp",
      title: "Join Our Club - Wake Up The Champion",
      subtitle: "Greenfield Dental",
    },
    {
      layout: "horizontal",
      order: 3,
      tag: tagMap.get("TVC"),
      image:
        "/images/feature2.webp",
      title: "A Gleaming Miracle",
      subtitle: "Greenfield Dental",
    },
    {
      layout: "horizontal",
      order: 4,
      tag: tagMap.get("TVC"),
      image:
        "/images/feature2.webp",
      title: "Đóng Stress - Mở Strong",
      subtitle: "T-Matsuoka Medical Center",
    },
  ]);
  console.log("  ✓ Features (7 top, 4 bottom)");

  console.log("✅ Seed complete");
  await disconnectDB();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
