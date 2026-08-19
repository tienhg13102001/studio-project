/**
 * Nạp bộ nội dung dài cho trang "Sản Xuất TVC" — Hoàn duyệt 19/08/2026.
 * Nguồn chữ: Marketing/noi-dung-trang-tvc.md
 *
 * VĂN XUÔI LIỀN, KHÔNG MARKDOWN — cố ý. Trang dịch vụ render cả ba ô này trong
 * thẻ <p> trơn, KHÔNG có `whitespace-pre-line`: xuống dòng bị nuốt thành dấu
 * cách, còn dấu sao của markdown thì hiện nguyên ra màn hình. Muốn có gạch đầu
 * dòng thì phải sửa ServicePage.tsx trước, không phải sửa chữ ở đây.
 *
 * CHỈ GHI TIẾNG VIỆT. Bỏ trống `en` thì `localized()` tự lùi về `vi`
 * (front-end/src/lib/localized.ts) — khách xem tiếng Anh đọc bản tiếng Việt.
 * Viết sẵn bản dịch ở đây thì lần sau Hoàn sửa tiếng Việt trong Portal, bản
 * tiếng Anh nằm lại và hai thứ tiếng nói hai đằng.
 * NGOẠI LỆ: `description.en` đang có sẵn bản tiếng Anh tử tế nên GIỮ NGUYÊN.
 *
 * Sao lưu trước khi ghi: Marketing/backup/tvc-service-truoc-19082026.json
 *
 *   npx tsx src/scripts/nap-noi-dung-tvc.ts --thu   # xem trước, không ghi
 *   npx tsx src/scripts/nap-noi-dung-tvc.ts         # ghi thật
 */
import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Service } from "../models/Service.ts";

const CHI_XEM = process.argv.includes("--thu");
const vi = (s: string) => ({ vi: s });

const MO_TA =
  "Bee Z Production sản xuất TVC và phim quảng cáo cho thương hiệu — từ phim ra mắt sản phẩm, phim thương hiệu, tới nội dung quảng cáo chạy trên truyền hình và nền tảng số. Trọn gói từ ý tưởng, kịch bản, tổ chức sản xuất, quay, dựng, chỉnh màu tới bàn giao: một đầu mối duy nhất thay vì ghép nhiều bên rồi tự chịu rủi ro ở các điểm nối. Mỗi gói ghi rõ số ngày quay, sản phẩm bàn giao và mức giá khởi điểm ngay từ buổi trao đổi đầu tiên.";

const DIEM_MANH = [
  {
    icon: "ReceiptIcon",
    title: "Giá công khai từ đầu",
    desc: "Ba bậc TVC đều có mức giá khởi điểm công bố sẵn, kèm số ngày quay và danh sách sản phẩm bàn giao. Bạn không phải gửi brief rồi chờ vài ngày mới biết dự án của mình có nằm trong tầm ngân sách hay không.",
  },
  {
    icon: "UsersThreeIcon",
    title: "Một đầu mối từ ý tưởng tới file cuối",
    desc: "Kịch bản, casting, bối cảnh, lịch quay, hiện trường, dựng, màu, âm thanh — cùng một team. Không có khoảng trống trách nhiệm giữa bên nghĩ ý tưởng và bên bấm máy, cũng không có cảnh hai nhà thầu đổ lỗi cho nhau khi lệch tiến độ.",
  },
  {
    icon: "VideoCameraIcon",
    title: "Máy quay điện ảnh, không phải máy quay sự kiện",
    desc: "Quay trên hệ RED, ARRI và Sony FX cùng bộ đèn và âm thanh đồng bộ. Khác biệt không nằm ở tên máy mà ở dải sáng: cảnh ngược sáng, nội thất tối, đèn sân khấu đổi màu — những chỗ máy phổ thông cháy trắng hoặc chìm đen thì máy điện ảnh vẫn giữ được chi tiết để chỉnh màu về sau.",
  },
  {
    icon: "ArrowsClockwiseIcon",
    title: "Hai vòng sửa nằm trong giá",
    desc: "Bản dựng đầu gửi để bạn góp ý, sửa hai vòng miễn phí trước khi chốt. Ghi rõ ngay từ đầu để không phát sinh tranh cãi ở khâu cuối — khâu mà tiến độ đã căng nhất.",
  },
  {
    icon: "FolderOpenIcon",
    title: "Giao file gốc cho khách",
    desc: "Kết thúc dự án, bản phim thành phẩm thuộc về bạn. Không giữ file để ràng buộc hợp tác tiếp.",
  },
  {
    icon: "DeviceMobileIcon",
    title: "Một buổi quay, hai định dạng",
    desc: "Cùng một buổi quay có thể ra bản TVC dài cho truyền hình và bản dọc cắt ngắn cho mạng xã hội. Tận dụng lại chi phí sản xuất đã bỏ ra thay vì tổ chức hai buổi.",
  },
];

const CAU_HOI = [
  {
    q: "Chi phí sản xuất một TVC là bao nhiêu?",
    a: "Bee Z có ba bậc với giá khởi điểm công khai. Essential từ 50.000.000đ, đã bao gồm chỉnh màu và nhạc nền. Signature từ 120.000.000đ cho một ngày quay, thêm ngày quay thứ hai cộng 46.500.000đ. Cinematic từ 200.000.000đ cho hai ngày quay, từ ngày thứ ba trở đi cộng 46.500.000đ mỗi ngày. Giá cuối phụ thuộc độ phức tạp của ý tưởng, quy mô đội ngũ và số ngày quay — gửi brief để nhận báo giá chi tiết từng hạng mục.",
  },
  {
    q: "Mức giá đó đã bao gồm những gì?",
    a: "Đã bao gồm phát triển ý tưởng và kịch bản, tổ chức sản xuất, ngày quay theo gói, đạo cụ, set design và trang phục, dựng phim, chỉnh màu, xử lý âm thanh, và giấy phép bay flycam/FPV. Chưa bao gồm và sẽ báo giá riêng: diễn viên, người mẫu hoặc KOL, và bối cảnh — địa điểm — studio, gồm cả phí thuê lẫn giấy phép quay tại địa điểm đó. Hai khoản này để riêng vì chúng dao động rất mạnh theo từng dự án: một gương mặt đại diện có thể tốn hơn cả phần sản xuất, gộp vào giá gói thì con số công bố sẽ mất ý nghĩa.",
  },
  {
    q: "Từ lúc gửi brief tới khi nhận phim mất bao lâu?",
    a: "Một TVC tiêu chuẩn mất 3–6 tuần. Nhận brief trong 24 giờ kể từ khi bạn liên hệ. Đề xuất và báo giá 2–3 ngày làm việc, gồm ý tưởng, moodboard, kịch bản khung và bảng giá từng hạng mục. Tiền kỳ 3–7 ngày để chốt kịch bản, casting, bối cảnh và lịch quay. Quay 1–3 ngày tuỳ gói. Hậu kỳ và bàn giao 5–10 ngày, gồm dựng, chỉnh màu, âm thanh và hai vòng sửa. Có deadline gấp thì nói ngay từ buổi đầu — một số khâu rút ngắn được, nhưng phải biết trước để bố trí, không phải lúc đã vào việc.",
  },
  {
    q: "Quy trình làm việc diễn ra thế nào?",
    a: "Năm bước, và bạn duyệt ở từng bước trước khi sang bước sau: nhận brief, đề xuất và báo giá, tiền kỳ, quay, hậu kỳ và bàn giao. Không có bước nào Bee Z tự quyết rồi báo sau. Kịch bản chốt xong mới casting, casting xong mới lên lịch quay, và bạn có thể có mặt tại hiện trường hoặc theo dõi từ xa trong ngày quay.",
  },
  {
    q: "Được sửa mấy vòng?",
    a: "Hai vòng sửa miễn phí sau bản dựng đầu. Đây là con số ghi trong gói chứ không phải thoả thuận miệng — để không ai phải tranh cãi ở khâu cuối, khi tiến độ đã căng nhất.",
  },
  {
    q: "Bee Z quay bằng thiết bị gì?",
    a: "Máy quay điện ảnh RED, ARRI và Sony FX, kèm hệ thống ánh sáng và âm thanh chuyên dụng. Điều đáng nói không phải tên máy mà là thứ nó giải quyết: dải sáng rộng cho phép giữ chi tiết ở cả vùng sáng nhất và tối nhất trong khung hình — cảnh ngược sáng, nội thất thiếu đèn, sân khấu đổi màu liên tục. Đó cũng là thứ quyết định phim có chỉnh màu được về sau hay không.",
  },
  {
    q: "Ai lo diễn viên, người mẫu hay KOL?",
    a: "Bee Z hỗ trợ tìm và làm việc với talent, nhưng chi phí talent báo giá riêng chứ không nằm trong gói. Nếu bên bạn đã có gương mặt đại diện thì Bee Z làm việc trực tiếp với quản lý của họ để chốt lịch. Lịch talent thường là thứ chặt nhất trong cả dự án, nên chốt càng sớm càng đỡ rủi ro.",
  },
  {
    q: "Bối cảnh và giấy phép quay ai lo?",
    a: "Bee Z khảo sát và đề xuất bối cảnh phù hợp với kịch bản. Phí thuê địa điểm và giấy phép quay tại địa điểm đó do bên bạn chi trả, báo giá riêng — vì mỗi nơi một mức, từ miễn phí tới vài chục triệu một ngày. Riêng giấy phép bay flycam và FPV đã nằm trong gói TVC, không tính thêm.",
  },
  {
    q: "Đặt cọc bao nhiêu?",
    a: "20% giá trị hợp đồng. Khoản cọc dùng để giữ lịch team quay và thiết bị cho ngày quay của bạn — đó cũng là lý do nó không hoàn lại nếu huỷ sát ngày, vì lúc đó team đã từ chối các lịch khác.",
  },
  {
    q: "Nếu trời mưa hoặc có việc bất khả kháng thì sao?",
    a: "Đổi lịch miễn phí một lần. Các chi phí đã phát sinh trước đó — thuê thiết bị, đạo cụ, di chuyển — bên bạn chịu.",
  },
  {
    q: "Bee Z đã làm TVC cho những ai?",
    a: "Một số dự án đã thực hiện: VinFast (teaser VF9), GreenSM, FPT Camera, Vinwonder, Bảo Tín Mạnh Hải, Cheese Coffee, Parasola, ZH Bike, và TVC có talent như Jun Phạm x Shinkai Impact. Teaser VF9 đạt 400.000 lượt xem trên Facebook. Toàn bộ dự án xem tại mục Portfolio, mỗi dự án có phim và ảnh thật, một số có kèm câu chuyện dự án ghi rõ bài toán và cách xử lý.",
  },
  {
    q: "Cùng một buổi quay có ra được nhiều định dạng không?",
    a: "Có, và nên làm vậy. Chi phí lớn nhất của một buổi quay nằm ở khâu chuẩn bị và huy động team — đã dựng cảnh, đã set đèn, đã có talent tại chỗ thì quay thêm các cỡ khung cho bản dọc mạng xã hội tốn rất ít thêm. Nói nhu cầu này ngay từ khâu brief, vì nó ảnh hưởng tới cách chọn cỡ khung và bố cục khi quay. Quay xong mới cắt dọc thì hoặc mất bố cục, hoặc mất chủ thể.",
  },
];

async function chay(): Promise<void> {
  await connectDB();
  const tvc = await Service.findOne({ tag: "TVC" });
  if (!tvc) throw new Error("Khong thay dich vu tag=TVC");

  const dau = CHI_XEM ? "»" : "+";
  console.log(`${dau} Mo ta      : ${(tvc.description.vi ?? "").length} -> ${MO_TA.length} ky tu`);
  console.log(`${dau} Diem manh  : ${tvc.highlights.length} -> ${DIEM_MANH.length}`);
  console.log(`${dau} Cau hoi    : ${tvc.faqs.length} -> ${CAU_HOI.length}`);
  const chu = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const tong =
    chu(MO_TA) +
    DIEM_MANH.reduce((n, h) => n + chu(h.title) + chu(h.desc), 0) +
    CAU_HOI.reduce((n, c) => n + chu(c.q) + chu(c.a), 0);
  console.log(`  tong chu nap len: ${tong}`);

  if (!CHI_XEM) {
    tvc.description = { en: tvc.description.en, vi: MO_TA } as never;
    tvc.highlights = DIEM_MANH.map((h) => ({
      icon: h.icon,
      title: vi(h.title),
      desc: vi(h.desc),
    })) as never;
    tvc.faqs = CAU_HOI.map((c) => ({ question: vi(c.q), answer: vi(c.a) })) as never;
    await tvc.save();
  }
  console.log(`\n${CHI_XEM ? "[CHI XEM] " : ""}Xong.`);
  await disconnectDB();
}

chay().catch((e: unknown) => {
  console.error("Loi:", e);
  process.exit(1);
});
