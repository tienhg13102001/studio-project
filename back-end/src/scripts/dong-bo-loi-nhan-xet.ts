import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Testimonial } from "../models/Testimonial.ts";
import { DANH_SACH } from "./du-lieu-nhan-xet.ts";

/**
 * Ép LỜI nhận xét trong cơ sở dữ liệu về đúng bản trong `du-lieu-nhan-xet.ts`.
 *
 * KHÁC `seed-testimonials.ts` ở đúng một điểm, và đó là điểm quan trọng:
 *   seed    — thêm bản còn thiếu, KHÔNG BAO GIỜ đụng bản đã có
 *   lệnh này — GHI ĐÈ lời của bản đã có
 *
 * Dùng khi câu chữ đổi: Hoàn đổi cách xưng hô, hoặc chính khách duyệt lại lời
 * của họ. Không có lệnh này thì phải vào Portal sửa tay từng cái, và bản trong
 * mã nguồn sẽ lệch dần khỏi bản đang chạy.
 *
 * CHỈ ĐỘNG VÀO Ô LỜI. Thứ tự hiển thị, nổi bật, bật/tắt, mảng dịch vụ — những
 * thứ Hoàn chỉnh trong Portal — giữ nguyên hết.
 *
 *   docker exec beez-backend npx tsx src/scripts/dong-bo-loi-nhan-xet.ts
 *   ... dong-bo-loi-nhan-xet.ts --thu    # chỉ xem sẽ đổi gì, không ghi
 */

const CHI_XEM = process.argv.includes("--thu");

async function chay(): Promise<void> {
  await connectDB();

  let doi = 0;
  let nguyen = 0;
  let khongThay = 0;

  for (const n of DANH_SACH) {
    // Tìm theo tên khi có; ẩn danh thì đành so lời (chỉ khớp khi lời chưa đổi).
    const ban = await Testimonial.findOne(
      n.ten ? { authorName: n.ten } : { "quote.vi": n.vi },
    );

    if (!ban) {
      khongThay++;
      console.log(`  ? không thấy trong CSDL: ${n.ten || "(ẩn danh)"} — chạy seed trước`);
      continue;
    }

    if (ban.quote?.vi === n.vi && ban.quote?.en === n.en) {
      nguyen++;
      continue;
    }

    console.log(`\n  ▸ ${n.ten || "(ẩn danh)"}`);
    console.log(`    cũ : ${(ban.quote?.vi ?? "").slice(0, 110)}…`);
    console.log(`    mới: ${n.vi.slice(0, 110)}…`);

    if (!CHI_XEM) {
      await Testimonial.updateOne(
        { _id: ban._id },
        { $set: { "quote.vi": n.vi, "quote.en": n.en } },
      );
    }
    doi++;
  }

  console.log(
    `\n${CHI_XEM ? "[CHỈ XEM] " : ""}Xong: đổi ${doi}, giữ nguyên ${nguyen}` +
      (khongThay ? `, không thấy ${khongThay}` : ""),
  );
  await disconnectDB();
}

chay().catch((e: unknown) => {
  console.error("Đồng bộ lời nhận xét thất bại:", e);
  process.exit(1);
});
