import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Project } from "../models/Project.ts";
import { CASE_STUDY } from "./du-lieu-case-study.ts";

/**
 * Nạp câu chuyện dự án (Bài toán / Cách làm / Kết quả) cho 6 dự án đầu tiên.
 *
 * MẶC ĐỊNH KHÔNG ĐÈ. Dự án nào đã có chữ trong ô case study thì bỏ qua — Hoàn
 * sửa trong Portal xong mà lệnh này ghi đè lại thì mất công sửa, và người chạy
 * lệnh sẽ không biết là vừa xoá mất cái gì.
 *
 * Sửa nội dung sau này thì sửa trong Portal (Dự án → sửa → Bài toán / Cách làm /
 * Kết quả). File `du-lieu-case-study.ts` chỉ là bản nạp lần đầu.
 *
 *   docker exec beez-backend npx tsx src/scripts/nap-case-study.ts
 *   ... nap-case-study.ts --thu       # chỉ xem sẽ làm gì
 *   ... nap-case-study.ts --ghi-de    # ép ghi đè cả dự án đã có chữ
 */

const THAM_SO = process.argv.slice(2);
const CHI_XEM = THAM_SO.includes("--thu");
const GHI_DE = THAM_SO.includes("--ghi-de");

/** Ô rỗng thì KHÔNG tạo, để dữ liệu không đầy chuỗi trống vô nghĩa. */
const oChu = (v?: string) => (v?.trim() ? { vi: v.trim(), en: "" } : undefined);

async function chay(): Promise<void> {
  await connectDB();

  let nap = 0;
  let boQua = 0;
  let khongThay = 0;

  for (const b of CASE_STUDY) {
    const duAn = await Project.findOne({ slug: b.slug });
    if (!duAn) {
      khongThay++;
      console.log(`  ✘ không thấy dự án có slug "${b.slug}" (${b.ten})`);
      continue;
    }

    const daCo =
      duAn.caseStudy?.challenge?.vi ||
      duAn.caseStudy?.approach?.vi ||
      duAn.caseStudy?.result?.vi;

    if (daCo && !GHI_DE) {
      boQua++;
      console.log(`  = ${b.ten} — đã có chữ, bỏ qua (dùng --ghi-de nếu muốn đè)`);
      continue;
    }

    const moi = {
      challenge: oChu(b.challenge),
      approach: oChu(b.approach),
      result: oChu(b.result),
    };
    const soPhan = Object.values(moi).filter(Boolean).length;

    console.log(
      `  ${CHI_XEM ? "»" : "+"} ${b.ten} — ${soPhan} phần` +
        (b.result ? "" : " (không có khối Kết quả)") +
        (daCo ? " [ĐÈ LÊN bản cũ]" : ""),
    );

    if (!CHI_XEM) {
      await Project.updateOne({ _id: duAn._id }, { $set: { caseStudy: moi } });
    }
    nap++;
  }

  console.log(
    `\n${CHI_XEM ? "[CHỈ XEM] " : ""}Xong: nạp ${nap}, bỏ qua ${boQua}` +
      (khongThay ? `, KHÔNG THẤY ${khongThay}` : ""),
  );
  await disconnectDB();
}

chay().catch((e: unknown) => {
  console.error("Nạp case study thất bại:", e);
  process.exit(1);
});
