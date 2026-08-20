/**
 * Nạp tiêu đề SEO và mô tả SEO cho 6 trang dịch vụ. Hoàn duyệt 20/08/2026.
 *
 * KHÔNG ĐỔI MỘT CHỮ NÀO HIỆN TRÊN TRANG. Hai trường này chỉ chui vào:
 *   · thẻ tiêu đề của tab trình duyệt
 *   · dòng xanh bấm được trong kết quả Google + hai dòng chữ xám dưới nó
 *   · thẻ xem trước khi dán link lên Zalo/Facebook
 * H1, dòng vàng và đoạn mở đầu trên trang giữ nguyên như cũ.
 *
 * VÌ SAO PHẢI CÓ: sáu trang dịch vụ — nội dung đáng tiền nhất của web — không
 * trang nào có chữ "Hà Nội" trong tiêu đề hay mô tả. Khách không gõ "sản xuất
 * TVC", khách gõ "quay TVC Hà Nội". Ngoài ra tiêu đề cũ chỉ dài 30–46 ký tự
 * trong khi Google cho tới 60, tức là bỏ trắng gần một nửa chỗ.
 *
 * TP.HCM là quyết định của Hoàn ngày 20/08. Lưu ý: nó giúp với tìm kiếm thường,
 * NHƯNG không đưa Bee Z lên phần bản đồ của TP.HCM — phần đó cần địa chỉ thật
 * trong thành phố.
 *
 * SAU KHI CHẠY PHẢI DỰNG LẠI GIAO DIỆN. Thẻ trong HTML thô được sinh lúc đóng
 * gói (`front-end/scripts/prerender-meta.mjs` hỏi API đang chạy), nên chạy
 * script này xong mà chưa deploy thì Google vẫn đọc thẻ cũ.
 *
 *   npx tsx src/scripts/nap-tieu-de-seo.ts --thu   # xem trước
 *   npx tsx src/scripts/nap-tieu-de-seo.ts         # ghi thật
 */
import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Service } from "../models/Service.ts";

const CHI_XEM = process.argv.includes("--thu");

const BAN: Record<string, { tieuDe: string; moTa: string }> = {
  TVC: {
    tieuDe: "Sản xuất TVC & phim quảng cáo — Hà Nội & TP.HCM | Bee Z",
    moTa: "Bee Z Production sản xuất TVC, phim quảng cáo và brand film tại Hà Nội và TP.HCM. Giá khởi điểm công khai từ 50 triệu, một đầu mối từ ý tưởng tới file cuối.",
  },
  EVENT: {
    tieuDe: "Quay phim, chụp ảnh sự kiện — Hà Nội & TP.HCM | Bee Z",
    moTa: "Quay phim chụp ảnh hội nghị, lễ kỷ niệm, concert và tiệc công ty tại Hà Nội và TP.HCM. Ảnh nóng gửi ngay trong sự kiện, trọn bộ ảnh sau 3–5 ngày.",
  },
  "F&B": {
    tieuDe: "Quay chụp món ăn, mỹ phẩm — Hà Nội & TP.HCM | Bee Z",
    moTa: "Chụp ảnh và quay video món ăn, đồ uống, mỹ phẩm, hàng tiêu dùng tại Hà Nội và TP.HCM. Quay ngay tại quán, có stylist, bàn giao sau 5–7 ngày.",
  },
  SHORT: {
    tieuDe: "Quay video TikTok, Reels — Hà Nội & TP.HCM | Bee Z",
    moTa: "Dịch vụ quay dựng video ngắn TikTok, Instagram Reels, YouTube Shorts cho thương hiệu tại Hà Nội và TP.HCM. Từ 4 đến hơn 30 video mỗi tháng.",
  },
  LOOKBOOK: {
    tieuDe: "Chụp lookbook, ảnh thời trang — Hà Nội & TP.HCM | Bee Z",
    moTa: "Chụp lookbook, quay campaign thời trang cho local brand và nhãn hàng tại Hà Nội và TP.HCM. Báo giá theo số lượng trang phục hoặc theo buổi bấm máy.",
  },
  WEDDING: {
    tieuDe: "Chụp ảnh, quay phóng sự cưới — Hà Nội & TP.HCM | Bee Z",
    moTa: "Chụp ảnh cưới, quay phóng sự ngày cưới và pre-wedding tại Hà Nội và TP.HCM. Trọn bộ ảnh gốc, 100–200 ảnh chỉnh kỹ, video highlight 3–5 phút.",
  },
};

async function chay(): Promise<void> {
  await connectDB();
  let doi = 0;
  let canh = 0;

  for (const [tag, b] of Object.entries(BAN)) {
    const sv = await Service.findOne({ tag });
    if (!sv) {
      console.log(`  ? khong thay dich vu ${tag}`);
      continue;
    }
    const dT = b.tieuDe.length;
    const dM = b.moTa.length;
    if (dT > 60) { console.log(`  ! ${tag}: tieu de ${dT} ky tu, Google se cat`); canh++; }
    if (dM > 165) { console.log(`  ! ${tag}: mo ta ${dM} ky tu, Google se cat`); canh++; }

    console.log(`\n${CHI_XEM ? "»" : "+"} ${tag}`);
    console.log(`    tieu de (${dT}): ${b.tieuDe}`);
    console.log(`    mo ta   (${dM}): ${b.moTa.slice(0, 78)}...`);
    console.log(`    tren trang GIU NGUYEN: H1 = "${sv.title.vi}"`);

    if (!CHI_XEM) {
      sv.seoTitle = { en: "", vi: b.tieuDe } as never;
      sv.seoDescription = { en: "", vi: b.moTa } as never;
      sv.markModified("seoTitle");
      sv.markModified("seoDescription");
      await sv.save();
    }
    doi++;
  }

  console.log(`\n${CHI_XEM ? "[CHI XEM] " : ""}Xong ${doi} dich vu, ${canh} canh bao.`);
  if (!CHI_XEM) {
    console.log("NHO: phai dung lai giao dien thi HTML tho moi mang the moi.");
  }
  await disconnectDB();
}

chay().catch((e: unknown) => {
  console.error("Loi:", e);
  process.exit(1);
});
