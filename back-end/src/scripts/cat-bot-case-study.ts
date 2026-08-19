/**
 * Cắt bớt câu thừa trong 8 bài câu chuyện dự án. Hoàn duyệt 19/08/2026.
 *
 * CHỈ CẮT VÀ ĐỔI DẤU CÂU. Không thêm một câu nào, không đổi một con số nào,
 * không đổi ý nào — mọi thay đổi ở đây đều là bỏ bớt chữ hoặc thay dấu gạch
 * ngang bằng dấu chấm / dấu phẩy.
 *
 * BA BỆNH CẦN CẮT:
 *
 * 1. CÂU CHỐT TRIẾT LÝ. Sáu trên tám bài kết bằng một câu đảo vế nghe sâu sắc
 *    mà KHÔNG thêm thông tin nào so với đoạn trên — "Với sản phẩm thường, ánh
 *    sáng để người xem nhìn thấy hình dáng. Với trang sức, ánh sáng chính là
 *    thứ người xem nhìn thấy." Bỏ đi thì bài kết ở hậu quả cụ thể, mạnh hơn.
 *    GIỮ LẠI ĐÚNG MỘT CÂU kiểu này ở bài VF9 ("Trong studio thì mọi chiếc xe
 *    đều bằng nhau") — một câu là nhấn, sáu câu là nhịp máy.
 *
 * 2. TRÙNG CÂU GIỮA HAI BÀI. OWEN viết "Thứ quyết định lúc đó không phải thiết
 *    bị mà là chuẩn bị", FPT Camera viết "Thứ quyết định không phải máy quay mà
 *    là thứ tự quay". Bỏ câu ở FPT — bài OWEN Hoàn đã duyệt từ 18/08, bài FPT
 *    mới viết 19/08 nên bài mới nhường.
 *
 * 3. DẤU GẠCH NGANG DÀI. 19 dấu trong 8 bài, bài nào cũng 2–3 cái, phần lớn
 *    dùng để chêm một mệnh đề giải thích ở cuối câu. Từng câu thì ổn, tám bài
 *    liền nhau cùng một nhịp thì thành máy.
 *
 * Sao lưu: Marketing/backup/case-study-truoc-cat-19082026.json
 *
 *   npx tsx src/scripts/cat-bot-case-study.ts --thu   # xem trước, không ghi
 *   npx tsx src/scripts/cat-bot-case-study.ts         # ghi thật
 */
import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Project } from "../models/Project.ts";

const CHI_XEM = process.argv.includes("--thu");

type Cat = { o: "challenge" | "approach" | "result"; bo: string; thay?: string; vi_sao: string };

const VIEC: Record<string, Cat[]> = {
  "fresh-garden-mooncake-tron-vi-thu-tron-tinh": [
    {
      o: "challenge",
      bo: " Một thước phim chỉ đẹp thôi thì chìm nghỉm giữa hàng chục thước phim cũng đẹp.",
      vi_sao: "câu đối xứng, không thêm thông tin",
    },
    {
      o: "challenge",
      bo: "mặt hàng thời vụ — cả năm",
      thay: "mặt hàng thời vụ, cả năm",
      vi_sao: "gạch ngang",
    },
    {
      o: "approach",
      bo: " Ai cũng quay được bánh đẹp; cảm giác đoàn viên thì phải dựng.",
      vi_sao: "câu chốt triết lý",
    },
  ],
  "cheese-coffe": [
    {
      o: "challenge",
      bo: " Chính cái ngưỡng đó quyết định nhịp của buổi quay, chứ không phải kịch bản.",
      vi_sao: "câu chốt triết lý",
    },
    {
      o: "challenge",
      bo: "cùng một nhà — cùng tông màu, cùng nhịp — trong khi",
      thay: "cùng một nhà, cùng tông màu và cùng nhịp, trong khi",
      vi_sao: "hai gạch ngang trong một câu",
    },
    {
      o: "approach",
      bo: " Bộ hình nhờ vậy bán được cả đồ uống lẫn lý do bước vào quán.",
      vi_sao: "chữ marketing thuần, 'bán được lý do'",
    },
  ],
  "dinh-tu-x-pnj": [
    {
      o: "approach",
      bo: "\n\nVới sản phẩm thường, ánh sáng để người xem nhìn thấy hình dáng. Với trang sức, ánh sáng chính là thứ người xem nhìn thấy.",
      vi_sao: "câu AI rõ nhất cả bộ — đối xứng hoàn hảo, không thêm thông tin",
    },
    {
      o: "approach",
      bo: "phải lo — thiếu một nguồn",
      thay: "phải lo. Thiếu một nguồn",
      vi_sao: "gạch ngang",
    },
  ],
  owen: [
    {
      o: "challenge",
      bo: "hai việc cùng lúc — dựng được",
      thay: "hai việc cùng lúc: dựng được",
      vi_sao: "gạch ngang",
    },
  ],
  "dinh-tu-ngoc-huyen-the-movie-of-us": [
    {
      o: "approach",
      bo: " Chọn cách này là đặt cược vào khả năng đọc trước diễn biến, chứ không vào số lượng thiết bị.",
      vi_sao: "câu chốt tự khen",
    },
    {
      o: "approach",
      bo: "không ai chắn tầm nhìn của khách mời, ",
      vi_sao: "bộ ba song song — cắt còn hai vế",
    },
    {
      o: "approach",
      bo: "một người di chuyển —",
      thay: "một người di chuyển:",
      vi_sao: "gạch ngang",
    },
    {
      o: "challenge",
      bo: "đáng giá — cảm giác",
      thay: "đáng giá: cảm giác",
      vi_sao: "gạch ngang",
    },
  ],
  "vf9-teaser-the-mark-of-leadership": [
    {
      o: "challenge",
      bo: "ngay từ khung hình đầu tiên — bằng hình ảnh, không bằng lời thuyết minh.",
      thay: "ngay từ khung hình đầu tiên.",
      vi_sao: "vế chêm lặp lại ý đã nói ở trên",
    },
    {
      o: "challenge",
      bo: "SUV điện cỡ lớn — nơi người mua",
      thay: "SUV điện cỡ lớn, nơi người mua",
      vi_sao: "gạch ngang",
    },
    {
      o: "approach",
      bo: " thước đo kích thước: người xem cảm được độ bề thế thay vì được nói cho biết.",
      thay: " thước đo kích thước.",
      vi_sao: '"show, don\'t tell" dịch thẳng',
    },
    {
      o: "approach",
      bo: "đường nét của thân xe — quay cả ngày",
      thay: "đường nét của thân xe. Quay cả ngày",
      vi_sao: "gạch ngang",
    },
  ],
  "fpt-camera-2": [
    {
      o: "challenge",
      bo: "là món khó quay nhất trong nhóm hàng công nghệ gia dụng:",
      thay: "là món khó quay:",
      vi_sao: "tự phong 'khó nhất'",
    },
    {
      o: "challenge",
      bo: "đứng yên suốt — thứ phải đổi",
      thay: "đứng yên suốt. Thứ phải đổi",
      vi_sao: "gạch ngang",
    },
    {
      o: "approach",
      bo: "Thứ quyết định không phải máy quay mà là thứ tự quay. Buổi quay",
      thay: "Buổi quay",
      vi_sao: "TRÙNG câu với bài OWEN",
    },
    {
      o: "approach",
      bo: " Camera chỉ cần có mặt đúng chỗ mà một người thật sẽ lắp nó.",
      vi_sao: "câu chốt triết lý",
    },
  ],
  "80-nam-an-ninh-nhan-dan": [
    {
      o: "challenge",
      bo: "đứng sai chỗ — mà vẫn phải",
      thay: "đứng sai chỗ, mà vẫn phải",
      vi_sao: "gạch ngang",
    },
    {
      o: "approach",
      bo: "nghi thức đang diễn ra — di chuyển",
      thay: "nghi thức đang diễn ra. Di chuyển",
      vi_sao: "gạch ngang",
    },
    {
      o: "approach",
      bo: "hơn một góc ghi lại — phòng khi",
      thay: "hơn một góc ghi lại, phòng khi",
      vi_sao: "gạch ngang",
    },
  ],
};

async function chay(): Promise<void> {
  await connectDB();
  let cat = 0;
  let hut = 0;

  for (const [slug, ds] of Object.entries(VIEC)) {
    const p = await Project.findOne({ slug });
    if (!p?.caseStudy) {
      console.log(`  ? khong thay du an ${slug}`);
      continue;
    }
    console.log(`\n${CHI_XEM ? "»" : "+"} ${slug}`);
    for (const v of ds) {
      const truong = p.caseStudy[v.o] as { vi?: string } | undefined;
      const cu = truong?.vi;
      if (!cu || !cu.includes(v.bo)) {
        console.log(`      ✗ KHONG THAY [${v.o}]: "${v.bo.trim().slice(0, 45)}..."`);
        hut++;
        continue;
      }
      console.log(`      - [${v.o}] ${v.vi_sao}`);
      if (!CHI_XEM && truong) truong.vi = cu.replace(v.bo, v.thay ?? "");
      cat++;
    }
    if (!CHI_XEM) {
      p.markModified("caseStudy");
      await p.save();
    }
  }

  const con = await (async () => {
    const ps = await Project.find({ slug: { $in: Object.keys(VIEC) } });
    return ps.reduce((n, p) => {
      const cs = p.caseStudy ?? {};
      const t = (["challenge", "approach", "result"] as const)
        .map((k) => (cs[k] as { vi?: string } | undefined)?.vi ?? "")
        .join(" ");
      return n + (t.match(/—/g) ?? []).length;
    }, 0);
  })();

  console.log(`\n${CHI_XEM ? "[CHI XEM] " : ""}Cat ${cat} cho, hut ${hut}.`);
  console.log(`Gach ngang dai con lai trong 8 bai: ${con} (truoc do 19)`);
  await disconnectDB();
}

chay().catch((e: unknown) => {
  console.error("Loi:", e);
  process.exit(1);
});
