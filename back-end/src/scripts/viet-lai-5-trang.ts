/**
 * Viết lại mô tả + dòng phụ của 5 trang dịch vụ (trừ TVC đã viết hôm 19/08).
 * Hoàn: "Câu từ đừng AI quá, rà lại toàn bộ text đi".
 *
 * NGUYÊN TẮC: chỉ dùng dữ kiện ĐÃ CÓ SẴN trong FAQ / thẻ điểm mạnh của chính
 * trang đó. Không thêm một cam kết nào Bee Z chưa từng công bố. Mọi câu ở đây
 * đều truy được về một câu trả lời đang hiển thị trên cùng trang.
 *
 * VÌ SAO PHẢI VIẾT LẠI: chữ cũ là brochure tổng hợp — "Đánh thức mọi giác
 * quan", "tôn vinh trọn vẹn phom dáng, chất liệu và tinh thần thiết kế", "biến
 * câu chuyện tình yêu của bạn thành tuyệt tác điện ảnh". Bỏ hai chữ chỉ ngành
 * ra là dán được sang bất kỳ công ty nào — đó là dấu hiệu chắc nhất của văn
 * máy. Đổi lại bằng thứ khách thật sự cần biết: quay ở đâu, mất mấy ngày, nhận
 * về những gì.
 *
 * Sao lưu: Marketing/backup/6-dich-vu-truoc-xung-ho.json
 *
 *   npx tsx src/scripts/viet-lai-5-trang.ts --thu   # xem trước, không ghi
 *   npx tsx src/scripts/viet-lai-5-trang.ts         # ghi thật
 */
import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Service } from "../models/Service.ts";

const CHI_XEM = process.argv.includes("--thu");

type Sua = {
  moTa?: string;
  dongPhu?: string;
  /** Thẻ điểm mạnh sửa theo vị trí (đếm từ 1). */
  the?: Record<number, { title?: string; desc?: string }>;
  /** Câu hỏi sửa theo vị trí (đếm từ 1) — chỉ sửa phần trả lời. */
  dap?: Record<number, string>;
};

const BAN: Record<string, Sua> = {
  "F&B": {
    // Nguồn: FAQ 1 (stylist nội bộ), FAQ 2 (quay tại quán, thiết bị gọn),
    // FAQ 3 (một ngày quay, bàn giao 5–7 ngày).
    moTa: "Bee Z quay đồ ăn, đồ uống và không gian cho nhà hàng, quán và chuỗi F&B. Quay ngay tại quán, thiết bị gọn nên không làm gián đoạn khách đang ngồi. Có stylist món ăn làm trực tiếp với món của bạn trước mỗi buổi quay. Hầu hết buổi quay gọn trong một ngày, bàn giao sau 5–7 ngày làm việc.",
    dongPhu: "Quay sao cho người xem thấy đói.",
    the: {
      4: {
        title: "Quay ngay tại quán",
        desc: "Thiết bị gọn nên dựng nhanh và không chiếm chỗ. Quán vẫn đón khách bình thường trong lúc team bấm máy.",
      },
    },
  },
  LOOKBOOK: {
    // Nguồn: FAQ 2 (hai cách báo giá), FAQ 3 (mạng lưới model/stylist/makeup).
    moTa: "Bee Z chụp lookbook và quay campaign cho local brand và nhãn hàng thời trang. Báo giá theo hai cách: trọn gói theo số lượng trang phục, hoặc theo buổi bấm máy cố định. Cần model, stylist hay makeup artist thì Bee Z giới thiệu theo tinh thần bộ sưu tập.",
    dongPhu: "Chụp lookbook, quay campaign, lo được cả model và stylist.",
    dap: {
      // Bỏ dấu chấm than và chữ "toàn diện" — giọng chatbot.
      1: "Có. Bạn gửi brief của mình cũng được, hoặc để Bee Z đề xuất concept, địa điểm và hướng styling rồi bạn duyệt trước khi bấm máy.",
    },
  },
  SHORT: {
    // Nguồn: FAQ 1 (4 nền tảng), FAQ 2 (4–30+ video/tháng), FAQ 3 (kịch bản
    // tới dựng), FAQ 4 (cuốn chiếu 3–5 video/tuần).
    moTa: "Bee Z làm video ngắn cho TikTok, Instagram Reels, YouTube Shorts và Facebook. Nghiên cứu, viết kịch bản, quay và dựng đều do một team làm. Tuỳ gói, mỗi tháng ra từ 4 đến hơn 30 video, bàn giao cuốn chiếu 3–5 video mỗi tuần.",
    dongPhu: "Làm đều tay, không làm theo đợt.",
  },
  EVENT: {
    // Nguồn: ô số liệu (ảnh nóng 2h), FAQ 1 (ảnh 3–5 ngày, video 1–2 tuần),
    // FAQ 3 (dresscode), FAQ 4 (hai thẻ nhớ + backup).
    moTa: "Bee Z quay phim và chụp ảnh hội nghị, lễ kỷ niệm, tiệc công ty và sự kiện thương hiệu. Ảnh nóng gửi ngay trong sự kiện để bên truyền thông đăng kịp, trọn bộ ảnh chỉnh kỹ sau 3–5 ngày, video sau 1–2 tuần. Máy ghi song song hai thẻ nhớ, dữ liệu backup ngay lên ổ cứng và đám mây.",
    dongPhu: "Đúng giờ, đúng dresscode, không làm phiền khách mời.",
  },
  WEDDING: {
    // Nguồn: FAQ 1 (pre-wedding + phóng sự), FAQ 2 (candid, không ép tạo
    // dáng), FAQ 3 (ảnh gốc + 100–200 ảnh + Highlight 3–5 phút), FAQ 4 (2–4
    // tháng).
    moTa: "Bee Z chụp và quay cưới: pre-wedding ở studio hoặc ngoại cảnh, và phóng sự toàn thời gian cho lễ gia tiên với tiệc nhà hàng. Bàn giao toàn bộ ảnh gốc, 100–200 ảnh chỉnh kỹ và một video Highlight dài 3–5 phút. Mùa cao điểm nên giữ lịch trước 2–4 tháng.",
    dongPhu: "Bắt khoảnh khắc, hạn chế bắt tạo dáng.",
    the: {
      // Tiêu đề đang là tiếng Anh giữa ba thẻ tiếng Việt.
      1: { title: "Ảnh tự nhiên, ít sắp đặt" },
      4: {
        title: "Đỡ áp lực cho dâu rể",
        desc: "Ngày cưới lúc nào cũng có đoạn rối. Team giữ nhịp và trò chuyện cho hai bạn thoải mái, không bắt dâu rể diễn lại cho đủ cảnh.",
      },
    },
  },
};

async function chay(): Promise<void> {
  await connectDB();
  let doi = 0;

  for (const [tag, ban] of Object.entries(BAN)) {
    const sv = await Service.findOne({ tag });
    if (!sv) {
      console.log(`  ? khong thay dich vu ${tag}`);
      continue;
    }
    console.log(`\n${CHI_XEM ? "»" : "+"} ${tag}`);

    if (ban.moTa) {
      console.log(`      mô tả   : ${sv.description.vi?.length} -> ${ban.moTa.length} ký tự`);
      if (!CHI_XEM) sv.description.vi = ban.moTa;
      doi++;
    }
    if (ban.dongPhu) {
      console.log(`      dòng phụ: "${ban.dongPhu}"`);
      if (!CHI_XEM) {
        if (sv.heroTagline) sv.heroTagline.vi = ban.dongPhu;
        else sv.heroTagline = { vi: ban.dongPhu } as never;
      }
      doi++;
    }
    for (const [i, t] of Object.entries(ban.the ?? {})) {
      const h = sv.highlights[Number(i) - 1];
      if (!h) continue;
      if (t.title) {
        console.log(`      thẻ ${i} tiêu đề: "${h.title.vi}" -> "${t.title}"`);
        if (!CHI_XEM) h.title.vi = t.title;
        doi++;
      }
      if (t.desc) {
        console.log(`      thẻ ${i} nội dung: viết lại`);
        if (!CHI_XEM) h.desc.vi = t.desc;
        doi++;
      }
    }
    for (const [i, a] of Object.entries(ban.dap ?? {})) {
      const f = sv.faqs[Number(i) - 1];
      if (!f) continue;
      console.log(`      câu ${i} trả lời: viết lại`);
      if (!CHI_XEM) f.answer.vi = a;
      doi++;
    }

    if (!CHI_XEM) {
      sv.markModified("description");
      sv.markModified("heroTagline");
      sv.markModified("highlights");
      sv.markModified("faqs");
      await sv.save();
    }
  }

  console.log(`\n${CHI_XEM ? "[CHI XEM] " : ""}Tong cong ${doi} cho.`);
  await disconnectDB();
}

chay().catch((e: unknown) => {
  console.error("Loi:", e);
  process.exit(1);
});
