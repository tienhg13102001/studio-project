import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Landing } from "../models/Landing.ts";
import { Service } from "../models/Service.ts";
import { Project } from "../models/Project.ts";
import { Contact } from "../models/Contact.ts";
import { User } from "../models/User.ts";
import { Brand } from "../models/Brand.ts";

async function seed() {
  await connectDB();
  console.log("🌱 Seeding database....");

  await Promise.all([
    Landing.deleteMany({}),
    Service.deleteMany({}),
    Project.deleteMany({}),
    Contact.deleteMany({}),
    User.deleteMany({}),
    Brand.deleteMany({}),
  ]);

  // ─── Contact ──────────────────────────────────────────────────────────────
  // Created first so Landing can link to it (single source of truth for contact info).
  const contact = await Contact.create({
    heading: {
      en: "Let's Work Together",
      vi: "Hãy Cùng Hợp Tác",
    },
    subheading: {
      en: "Got a project in mind? Reach out and let's create something remarkable.",
      vi: "Bạn có dự án trong đầu? Hãy liên hệ và cùng nhau tạo nên điều đặc biệt.",
    },
    phone: "+84 901 234 567",
    email: "hello@beezvn.com",
    address: {
      en: "123 Kim Ma Street, Ba Dinh District, Hanoi, Vietnam",
      vi: "123 Đường Kim Mã, Quận Ba Đình, Hà Nội, Việt Nam",
    },
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8!2d105.8342!3d21.0285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAxJzQyLjYiTiAxMDXCsDUwJzAzLjEiRQ!5e0!3m2!1svi!2svn!4v1234567890",
    workingHours: [
      {
        label: { en: "Monday – Friday", vi: "Thứ 2 – Thứ 6" },
        hours: { en: "9:00 AM – 6:00 PM", vi: "9:00 SA – 6:00 CH" },
      },
      {
        label: { en: "Saturday", vi: "Thứ 7" },
        hours: { en: "10:00 AM – 4:00 PM", vi: "10:00 SA – 4:00 CH" },
      },
      {
        label: { en: "Sunday", vi: "Chủ Nhật" },
        hours: { en: "Closed", vi: "Nghỉ" },
      },
    ],
    socials: {
      facebook: "https://facebook.com/beezvn",
      instagram: "https://instagram.com/beezvn",
      youtube: "https://youtube.com/@beezvn",
      tiktok: "https://tiktok.com/@beezvn",
      zalo: "https://zalo.me/beezvn",
    },
  });
  console.log("  ✓ Contact");

  // ─── Landing ──────────────────────────────────────────────────────────────
  await Landing.create({
    heroLine1: { en: "We Are", vi: "Chúng Tôi Là" },
    heroLine2: { en: "BeeZ Production", vi: "BeeZ Production" },
    subheading: {
      en: "BeeZ Production - Hanoi's premier video production agency crafting unforgettable content for brands that dare to be different",
      vi: "BeeZ Production - Agency sản xuất video hàng đầu Hà Nội, kiến tạo nội dung đáng nhớ cho những thương hiệu dám khác biệt",
    },
    videoBackground: "/videos/video-bg.webm",
    contactId: contact._id,
  });
  console.log("  ✓ Landing (linked → Contact)");

  // ─── Services ─────────────────────────────────────────────────────────────
  const insertedServices = await Service.insertMany([
    {
      tag: "TVC",
      thumbnailImage: "/images/NAQ03133.webp",
      title: { en: "TVC Production", vi: "Sản Xuất TVC" },
      description: {
        en: "Building brand value through inspiring visuals and storytelling",
        vi: "Xây dựng giá trị thương hiệu thông qua hình ảnh và câu chuyện truyền cảm hứng",
      },
      faqs: [
        {
          question: {
            en: "How much does TVC production cost?",
            vi: "Chi phí sản xuất TVC là bao nhiêu?",
          },
          answer: {
            en: "Pricing depends on concept complexity, crew size, and shooting days. Contact us for a tailored quote.",
            vi: "Chi phí phụ thuộc vào độ phức tạp của ý tưởng, quy mô đội ngũ và số ngày quay. Liên hệ để nhận báo giá riêng.",
          },
        },
        {
          question: {
            en: "How long does TVC production take?",
            vi: "Thời gian sản xuất TVC là bao lâu?",
          },
          answer: {
            en: "A typical TVC takes 3–6 weeks from brief to final delivery, including pre-production, shooting, and post.",
            vi: "Một TVC tiêu chuẩn mất 3–6 tuần từ brief đến bàn giao, bao gồm tiền kỳ, quay và hậu kỳ.",
          },
        },
        {
          question: { en: "What equipment do you use?", vi: "Bạn sử dụng thiết bị gì?" },
          answer: {
            en: "We shoot on cinema-grade cameras (RED, ARRI, Sony FX) with professional lighting and sound rigs.",
            vi: "Chúng tôi quay trên máy quay điện ảnh (RED, ARRI, Sony FX) kết hợp hệ thống ánh sáng và âm thanh chuyên nghiệp.",
          },
        },
        {
          question: {
            en: "Do you handle the full production process?",
            vi: "Bạn có đảm nhiệm toàn bộ quy trình sản xuất không?",
          },
          answer: {
            en: "Yes — from concept development and scripting to shooting, editing, color, and final delivery.",
            vi: "Có — từ phát triển ý tưởng, biên kịch đến quay phim, dựng, màu và bàn giao thành phẩm.",
          },
        },
      ],
    },
    {
      tag: "SHORT",
      thumbnailImage: "/images/services1.webp",
      title: { en: "Short-form Content", vi: "Nội Dung Dạng Ngắn" },
      description: {
        en: "TikTok, Reels, Shorts — multi-platform content with 1B+ views",
        vi: "TikTok, Reels, Shorts - Nội dung đa nền tảng với hơn 1 tỷ+ lượt xem",
      },
      faqs: [
        {
          question: {
            en: "Which platforms do you create content for?",
            vi: "Bạn tạo nội dung cho những nền tảng nào?",
          },
          answer: {
            en: "TikTok, Instagram Reels, YouTube Shorts, and Facebook — we deliver optimised formats for each.",
            vi: "TikTok, Instagram Reels, YouTube Shorts và Facebook — chúng tôi bàn giao định dạng tối ưu cho từng nền tảng.",
          },
        },
        {
          question: {
            en: "How many videos can you produce per month?",
            vi: "Mỗi tháng bạn có thể sản xuất bao nhiêu video?",
          },
          answer: {
            en: "We can scale from 4 to 30+ videos per month depending on your package.",
            vi: "Chúng tôi có thể sản xuất từ 4 đến 30+ video mỗi tháng tuỳ gói dịch vụ.",
          },
        },
        {
          question: {
            en: "Do you provide the script and concept?",
            vi: "Bạn có cung cấp kịch bản và ý tưởng không?",
          },
          answer: {
            en: "Yes, our creative team handles research, scripting, shooting, and editing end-to-end.",
            vi: "Có, đội sáng tạo của chúng tôi đảm nhận nghiên cứu, viết kịch bản, quay và dựng từ đầu đến cuối.",
          },
        },
      ],
    },
    {
      tag: "F&B",
      thumbnailImage: "/images/services2.webp",
      title: { en: "Food & Beverage (F&B)", vi: "Đồ Ăn & Thức Uống (F&B)" },
      description: {
        en: "Creative, professional video production for restaurants and F&B brands",
        vi: "Sản xuất video sáng tạo, chuyên nghiệp cho nhà hàng và ngành F&B",
      },
      faqs: [
        {
          question: {
            en: "Do you provide food styling services?",
            vi: "Bạn có cung cấp dịch vụ tạo hình món ăn không?",
          },
          answer: {
            en: "Yes, we have an in-house food stylist who works with your dishes before every shoot.",
            vi: "Có, chúng tôi có stylist món ăn nội bộ làm việc trực tiếp với món của bạn trước mỗi buổi quay.",
          },
        },
        {
          question: {
            en: "Can you shoot at our restaurant location?",
            vi: "Bạn có thể quay tại nhà hàng của chúng tôi không?",
          },
          answer: {
            en: "Absolutely. We bring a compact, professional kit that works in any venue without disrupting service.",
            vi: "Hoàn toàn có thể. Chúng tôi mang theo bộ thiết bị gọn nhẹ, chuyên nghiệp, không làm gián đoạn hoạt động của nhà hàng.",
          },
        },
        {
          question: {
            en: "How long does a typical F&B shoot take?",
            vi: "Một buổi quay F&B thông thường mất bao lâu?",
          },
          answer: {
            en: "Most F&B shoots are completed in a single day, with delivery within 5–7 business days.",
            vi: "Hầu hết buổi quay F&B hoàn thành trong một ngày, bàn giao trong 5–7 ngày làm việc.",
          },
        },
      ],
    },
    {
      tag: "INTERVIEW",
      thumbnailImage: "/images/services2.webp",
      title: { en: "Interview Production", vi: "Sản Xuất Phỏng Vấn" },
      description: {
        en: "In-depth interview videos that tell authentic stories and build trust",
        vi: "Video phỏng vấn chuyên sâu, kể câu chuyện chân thực và xây dựng niềm tin",
      },
      faqs: [
        {
          question: {
            en: "How many camera angles do you use?",
            vi: "Bạn sử dụng bao nhiêu góc máy?",
          },
          answer: {
            en: "We typically set up 2–3 cameras for a dynamic, broadcast-quality interview.",
            vi: "Chúng tôi thường dựng 2–3 máy quay cho buổi phỏng vấn chất lượng phát sóng, đầy sức sống.",
          },
        },
        {
          question: {
            en: "Can you handle multi-person panel interviews?",
            vi: "Bạn có thể xử lý phỏng vấn nhiều người không?",
          },
          answer: {
            en: "Yes, we scale our setup for panels of up to 5 people with individual audio for each subject.",
            vi: "Có, chúng tôi mở rộng setup cho nhóm tối đa 5 người với audio riêng cho từng nhân vật.",
          },
        },
        {
          question: { en: "Do you provide subtitles?", vi: "Bạn có cung cấp phụ đề không?" },
          answer: {
            en: "Yes, we offer both automatic and manually reviewed subtitles in Vietnamese and English.",
            vi: "Có, chúng tôi cung cấp cả phụ đề tự động và được kiểm tra thủ công bằng tiếng Việt và tiếng Anh.",
          },
        },
      ],
    },
  ]);
  console.log("  ✓ Services (4)");

  // Build tag → ObjectId lookup
  const tagMap = new Map(insertedServices.map((s) => [s.tag, s._id]));

  // ─── Projects ─────────────────────────────────────────────────────────────
  const insertedProjects = await Project.insertMany([
    // SHORT
    {
      layout: "vertical",
      prominent: true,
      service: tagMap.get("SHORT"),
      thumbnailImage: "/images/feature1.webp",
      title: "Greenfield Dental - V-Line...",
      subtitle: "Greenfield",
    },
    {
      layout: "vertical",
      prominent: false,
      service: tagMap.get("SHORT"),
      thumbnailImage: "/images/feature1.webp",
      title: "bb.q Chicken - Birthday Ce...",
      subtitle: "bb.q Chicken",
    },
    {
      layout: "vertical",
      prominent: false,
      service: tagMap.get("SHORT"),
      thumbnailImage: "/images/feature1.webp",
      title: "Greenfield Braces - Nerdy...",
      subtitle: "Greenfield Dental",
    },
    {
      layout: "vertical",
      prominent: false,
      service: tagMap.get("SHORT"),
      thumbnailImage: "/images/feature1.webp",
      title: "bb.q Chicken - Crispy Chic...",
      subtitle: "bb.q Chicken",
    },
    {
      layout: "vertical",
      prominent: true,
      service: tagMap.get("SHORT"),
      thumbnailImage: "/images/feature1.webp",
      title: "Greenfield Braces - Sporty...",
      subtitle: "Greenfield Dental",
    },
    // F&B
    {
      layout: "vertical",
      prominent: true,
      service: tagMap.get("F&B"),
      thumbnailImage: "/images/feature1.webp",
      title: "Grouper Fish - Chef's Sign...",
      subtitle: "Chapter Fine Dining",
    },
    {
      layout: "vertical",
      prominent: false,
      service: tagMap.get("F&B"),
      thumbnailImage: "/images/feature1.webp",
      title: "Fresh Sashimi - Master...",
      subtitle: "Chapter Fine Dining",
    },
    // INTERVIEW
    {
      layout: "horizontal",
      prominent: true,
      service: tagMap.get("INTERVIEW"),
      thumbnailImage: "/images/feature2.webp",
      title: "Emotional Interview - 45 Minutes of Talking",
      subtitle: "Healthcare",
    },
    // TVC
    {
      layout: "horizontal",
      prominent: true,
      service: tagMap.get("TVC"),
      thumbnailImage: "/images/feature2.webp",
      title: "Join Our Club - Wake Up The Champion",
      subtitle: "Greenfield Dental",
    },
    {
      layout: "horizontal",
      prominent: false,
      service: tagMap.get("TVC"),
      thumbnailImage: "/images/feature2.webp",
      title: "A Gleaming Miracle",
      subtitle: "Greenfield Dental",
    },
    {
      layout: "horizontal",
      prominent: true,
      service: tagMap.get("TVC"),
      thumbnailImage: "/images/feature2.webp",
      title: "Đóng Stress - Mở Strong",
      subtitle: "T-Matsuoka Medical Center",
    },
  ]);
  console.log("  ✓ Projects (7 vertical, 4 horizontal)");

  // ─── Link projects back to each service ──────────────────────────────────
  const projectsByServiceId = new Map<string, (typeof insertedProjects)[number]["_id"][]>();
  for (const f of insertedProjects) {
    const svcId = f.service!.toString();
    if (!projectsByServiceId.has(svcId)) projectsByServiceId.set(svcId, []);
    projectsByServiceId.get(svcId)!.push(f._id);
  }
  await Promise.all(
    insertedServices.map((s) =>
      s.updateOne({ projects: projectsByServiceId.get(s._id.toString()) ?? [] }),
    ),
  );
  console.log("  ✓ Service.projects linked");

  // ─── Brands ───────────────────────────────────────────────────────────────
  // Map project titles to their IDs for easy linking
  const featureMap = new Map(insertedProjects.map((f) => [f.title, f._id]));

  await Brand.insertMany([
    { name: "Techcombank", logo: "/brands/techcombank.svg", order: 3, features: [] },
    { name: "Vietcombank", logo: "/brands/vietcombank.svg", order: 5, features: [] },
    { name: "Shopee", logo: "/brands/shopee.svg", order: 6, features: [] },
    { name: "Shopee Food", logo: "/brands/shopee-food.svg", order: 7, features: [] },
    { name: "VPBank", logo: "/brands/vpbank.svg", order: 8, features: [] },
    { name: "FPT", logo: "/brands/fpt.svg", order: 9, features: [] },
  ]);
  console.log("  ✓ Brands (6)");

  // ─── Users ────────────────────────────────────────────────────────────────
  // Use create() (not insertMany) so bcrypt pre-save hook fires on each document
  await Promise.all([
    User.create({
      name: "Hoan Nguyen",
      role: { en: "Creative Director", vi: "Giám Đốc Sáng Tạo" },
      photo: "/images/user1.webp",
      quote: {
        en: "Every frame is a chance to tell a story that moves people. At BeeZ, we don't just make videos – we create experiences that resonate.",
        vi: "Mỗi khung hình là cơ hội kể một câu chuyện chạm đến lòng người. Tại BeeZ, chúng tôi không chỉ làm video – chúng tôi tạo ra những trải nghiệm khó quên.",
      },
      bio: {
        en: "With over five years of experience in video production, Hoan approaches each project with a deep passion for visual storytelling and a strong commitment to detail. His work at BeeZ Agency reflects a careful balance between cinematic craft and modern digital sensibility, resulting in content that resonates with audiences and has collectively reached over one billion views across platforms.",
        vi: "Với hơn năm năm kinh nghiệm sản xuất video, Hoan tiếp cận mỗi dự án với niềm đam mê sâu sắc về kể chuyện bằng hình ảnh và cam kết chặt chẽ với từng chi tiết. Công việc của anh tại BeeZ phản ánh sự cân bằng tinh tế giữa kỹ thuật điện ảnh và cảm quan kỹ thuật số hiện đại.",
      },
      skills: ["Cinematic Direction", "Brand Storytelling", "Commercial Production"],
      featured: true,
      email: "hoan@beezvn.com",
      password: "changeme123",
      accountRole: "admin",
    }),

    User.create({
      name: "Huy Le",
      role: { en: "Scriptwriter", vi: "Biên Kịch" },
      quote: {
        en: "A good script is the blueprint of emotion.",
        vi: "Kịch bản tốt là bản thiết kế của cảm xúc.",
      },
      skills: ["Screenwriting", "Brand Storytelling", "Content Strategy"],
      featured: false,
      email: "huy@beezvn.com",
      password: "changeme123",
      accountRole: "editor",
    }),
  ]);
  console.log("  ✓ Users (2)");

  console.log("✅ Seed complete");
  await disconnectDB();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
