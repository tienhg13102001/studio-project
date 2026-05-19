import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Landing } from "../models/Landing.ts";
import { Service } from "../models/Service.ts";
import { Feature } from "../models/Feature.ts";

async function seed() {
  await connectDB();
  console.log("🌱 Seeding database...");

  await Promise.all([
    Landing.deleteMany({}),
    Service.deleteMany({}),
    Feature.deleteMany({}),
  ]);

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
      image:
        "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=800&q=80",
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
      image:
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
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
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
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
      section: "top",
      order: 1,
      tag: tagMap.get("SHORT"),
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=600",
      title: "Greenfield Dental - V-Line...",
      subtitle: "Greenfield",
    },
    {
      section: "top",
      order: 2,
      tag: tagMap.get("SHORT"),
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400&h=600",
      title: "bb.q Chicken - Birthday Ce...",
      subtitle: "bb.q Chicken",
    },
    {
      section: "top",
      order: 3,
      tag: tagMap.get("SHORT"),
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400&h=600",
      title: "Greenfield Braces - Nerdy...",
      subtitle: "Greenfield Dental",
    },
    {
      section: "top",
      order: 4,
      tag: tagMap.get("SHORT"),
      image:
        "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400&h=600",
      title: "bb.q Chicken - Crispy Chic...",
      subtitle: "bb.q Chicken",
    },
    {
      section: "top",
      order: 5,
      tag: tagMap.get("SHORT"),
      image:
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=400&h=600",
      title: "Greenfield Braces - Sporty...",
      subtitle: "Greenfield Dental",
    },
    {
      section: "top",
      order: 6,
      tag: tagMap.get("F&B"),
      image:
        "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=400&h=600",
      title: "Grouper Fish - Chef's Sign...",
      subtitle: "Chapter Fine Dining",
    },
    {
      section: "top",
      order: 7,
      tag: tagMap.get("F&B"),
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400&h=600",
      title: "Fresh Sashimi - Master...",
      subtitle: "Chapter Fine Dining",
    },
    // bottom cards
    {
      section: "bottom",
      order: 1,
      tag: tagMap.get("INTERVIEW"),
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600&h=338",
      title: "Emotional Interview - 45 Minutes of Talking",
      subtitle: "Healthcare",
    },
    {
      section: "bottom",
      order: 2,
      tag: tagMap.get("TVC"),
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600&h=338",
      title: "Join Our Club - Wake Up The Champion",
      subtitle: "Greenfield Dental",
    },
    {
      section: "bottom",
      order: 3,
      tag: tagMap.get("TVC"),
      image:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600&h=338",
      title: "A Gleaming Miracle",
      subtitle: "Greenfield Dental",
    },
    {
      section: "bottom",
      order: 4,
      tag: tagMap.get("TVC"),
      image:
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600&h=338",
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
