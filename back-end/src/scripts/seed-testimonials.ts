import "dotenv/config";
import { Types } from "mongoose";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Service } from "../models/Service.ts";
import { Testimonial } from "../models/Testimonial.ts";
import { DANH_SACH } from "./du-lieu-nhan-xet.ts";

/**
 * Nạp 8 nhận xét khách đã chốt.
 *
 * CHẠY LẠI ĐƯỢC NHIỀU LẦN: nhận diện theo chính lời tiếng Việt, đã có thì bỏ
 * qua. Cần vậy vì lệnh này chạy trên máy chủ thật, và một lần lỡ tay chạy hai
 * lần sẽ nhân đôi nhận xét trên trang chủ — thứ trông rất giống hàng bịa.
 *
 * KHÔNG BAO GIỜ sửa hay xoá bản đã có: Hoàn chỉnh chữ trong Portal rồi mà chạy
 * lại lệnh này thì công chỉnh sửa đó phải còn nguyên.
 *
 *   docker exec beez-backend npx tsx src/scripts/seed-testimonials.ts
 */



async function chay(): Promise<void> {
  await connectDB();

  const dichVu = await Service.find().select("tag").lean();
  const theoTag = new Map(dichVu.map((s) => [s.tag, new Types.ObjectId(String(s._id))]));

  let them = 0;
  let boQua = 0;

  for (const [i, n] of DANH_SACH.entries()) {
    // Nhận diện theo TÊN người nói khi có, chỉ lùi về so lời khi ẩn danh.
    //
    // VÌ SAO KHÔNG so lời như trước: lời nhận xét còn sửa nữa (đổi cách xưng hô,
    // khách duyệt lại chữ). So theo lời thì mỗi lần sửa chữ là lệnh này không
    // nhận ra bản cũ và nạp thêm một bản trùng — nhân đôi nhận xét trên trang
    // chủ, thứ trông rất giống hàng bịa.
    const daCo = await Testimonial.findOne(
      n.ten ? { authorName: n.ten } : { "quote.vi": n.vi },
    );
    if (daCo) {
      boQua++;
      console.log(`  = đã có, bỏ qua: ${n.ten || "(ẩn danh)"}`);
      continue;
    }

    const maDichVu = n.tag ? (theoTag.get(n.tag) ?? null) : null;
    if (n.tag && !maDichVu) {
      // Không dừng cả lệnh vì một mảng thiếu — nạp được bao nhiêu hay bấy nhiêu,
      // rồi báo rõ cái nào chưa gắn được để gắn tay trong Portal.
      console.log(`  ! không tìm thấy mảng "${n.tag}" — nạp nhưng chưa gắn mảng`);
    }

    await Testimonial.create({
      quote: { vi: n.vi, en: n.en },
      authorName: n.ten,
      authorTitle: n.chucDanh,
      service: maDichVu,
      featured: n.trangChu,
      order: i,
      active: true,
    });
    them++;
    console.log(
      `  + ${n.ten || "(ẩn danh)"}${n.trangChu ? " [trang chủ]" : ""}${n.tag ? ` [${n.tag}]` : ""}`,
    );
  }

  console.log(`\nXong: thêm ${them}, bỏ qua ${boQua} (đã có sẵn).`);
  await disconnectDB();
}

chay().catch((e: unknown) => {
  console.error("Nạp nhận xét thất bại:", e);
  process.exit(1);
});
