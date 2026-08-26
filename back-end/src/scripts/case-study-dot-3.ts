import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Project } from "../models/Project.ts";

/**
 * Ba case study đợt 3 — Hoàn trả lời dữ kiện ngày 26/08/2026, duyệt từng bài.
 *
 * VÌ SAO LÀM: Search Console báo 21 địa chỉ ở diện "Đã thu thập dữ liệu – hiện
 * chưa được lập chỉ mục" — tức là Google ĐÃ ĐỌC rồi quyết định không lưu, vì
 * trang chỉ có ảnh, cái tên và một dòng phụ đề. 48/66 dự án đang như vậy.
 * Không có cách kỹ thuật nào chữa, chỉ có thêm chữ thật.
 *
 * NGUYÊN TẮC VIẾT — giữ đúng như hai đợt trước:
 *
 *  · Chỉ dùng dữ kiện Hoàn kể, rồi suy ra hệ quả nghề nghiệp từ chính dữ kiện
 *    đó. KHÔNG bịa số máy, số người, tên thiết bị, con số kết quả. Hoàn có bảo
 *    "tự vẽ vời thêm cho dài" nhưng chỗ nới ra là phần lý lẽ nghề, không phải
 *    phần dữ kiện — khách đọc thấy sai một con số là mất tin cả bài.
 *
 *  · Ba bài CỐ Ý khác hình dạng nhau. Bài Masterise mở bằng bản đồ khu vực,
 *    Tspace mở bằng khâu dựng, Thanh Xà mở bằng mâu thuẫn giữa yêu cầu và
 *    không gian. Bộ tám bài đợt 1 từng bị soi là đúc cùng một khuôn.
 *
 *  · Không câu triết lý chốt đoạn, không bộ ba song song, không dấu hai chấm
 *    dẫn một lời giải thích gọn ghẽ. Đó là ba thứ Hoàn chê "AI quá" hồi 21/08.
 *
 * MỘT ĐOẠN ĐÃ BỊ HOÀN BÁC VÀ ĐÃ SỬA: bản đầu bài Masterise có câu "booth nhỏ
 * thường chỉ đông vài phút rồi vãn, vãn rồi thì có quay cũng thành hình một cái
 * bàn trống" — đó là Claude tự suy, không phải Hoàn kể. Đã thay bằng phép tính
 * thật: sáu khu vực, ba máy, cùng một khoảng thời gian.
 *
 * KHÔNG BÀI NÀO CÓ KHỐI KẾT QUẢ: Hoàn chưa đưa chỉ số nào. Khối rỗng tự ẩn.
 *
 *   npx tsx src/scripts/case-study-dot-3.ts --thu   # xem trước, không ghi
 *   npx tsx src/scripts/case-study-dot-3.ts         # ghi thật
 */

const CHI_XEM = process.argv.includes("--thu");

type Bai = { slug: string; ten: string; challenge: string; approach: string };

const BAI: Bai[] = [
  {
    slug: "masterise",
    ten: "Masterise",
    challenge:
      "Một sự kiện nhưng sáu khu vực đều phải có hình: booth check-in ở lối vào, sân khấu chính, và bốn booth nhỏ nằm rải quanh. Chúng mở cùng lúc chứ không lần lượt, nên không có cách nào quay hết bằng cách đi tuần tự.\n\nSáu khu vực, ba máy, tất cả cùng chạy trong một khoảng thời gian. Bài toán không phải quay cho đẹp mà là chia máy sao cho không khu vực nào bị bỏ trắng.\n\nThêm nữa là hai hạn chót lệch nhau. Ảnh phải có ngay trong ngày, video recap trả sau hai ngày.",
    approach:
      "Ba máy chia theo khu vực chứ không cùng bám sân khấu. Sân khấu giữ một máy suốt buổi vì phần đó chạy theo kịch bản và không diễn lại. Hai máy còn lại đi vòng qua check-in và bốn booth nhỏ, bám theo chỗ nào đang có người thay vì theo thứ tự định sẵn.\n\nCách chia này đổi lấy một thứ: sân khấu chỉ có một góc thay vì hai ba góc để cắt qua lại. Bù lại không booth nào bị bỏ trắng, mà với sự kiện nhiều hạng mục thì thiếu hẳn một khu vực là lỗi nặng hơn nhiều so với ít góc máy.\n\nẢnh trả trong ngày nghĩa là không có buổi tối để ngồi lọc. Việc chọn và chỉnh làm ngay tại chỗ, xong khu vực nào gửi khu vực đó, nên bên truyền thông đăng được trong lúc sự kiện vẫn đang chạy.",
  },
  {
    slug: "tspace",
    ten: "Tspace",
    challenge:
      "Buổi ra mắt một loại gạch mới, tổ chức trong showroom nội thất lớn.\n\nPhần khó không nằm ở ngày quay mà ở chỗ tìm mạch cho phim. Gạch là vật phẳng và đứng yên, không có chuyển động nào để bám theo. Showroom thì rộng và đầy bề mặt trông na ná nhau, quay góc nào cũng ra hình gọn gàng.\n\nKết quả dễ đoán là một đống hình đẹp mà rời rạc — xem xong không đọng lại thứ gì, và cũng không phân biệt được với clip của bất kỳ showroom nào khác.",
    approach:
      "Ngày quay lo thu đủ chất liệu để phòng dựng có cái mà chọn. Cận cảnh bề mặt gạch, toàn cảnh không gian, và phản ứng của khách khi họ chạm tay vào sản phẩm.\n\nKhối lượng công việc thật nằm ở khâu dựng. Mạch phim được lắp ở đó chứ không bắt sẵn ngoài hiện trường, và đây là dự án mà thời gian dựng vượt xa thời gian quay.\n\nPhần khách chạm vào gạch là thứ giữ cả phim đứng được. Sản phẩm không tự chuyển động thì người xem cần thấy một người thật phản ứng với nó, nếu không thì cả clip chỉ còn là bề mặt nối tiếp bề mặt.",
  },
  {
    slug: "concept-art-film-thanh-xa-bach-xa",
    ten: "Concept Art Film: Thanh Xà — Bạch Xà",
    challenge:
      "Khách đặt yêu cầu rất cao về ánh sáng, mà studio thì nhỏ.\n\nHai thứ đó chống nhau. Ánh sáng đẹp phần lớn đến từ khoảng cách — đèn lùi được ra xa thì nguồn sáng mềm hơn, đổ lên người đều hơn, và hậu cảnh chìm xuống để nhân vật nổi lên. Studio nhỏ lấy mất đúng khoảng cách đó. Đèn phải kê sát, sáng gắt hơn, và phần hắt ra thì dội vào tường rồi quay ngược lại khung hình.\n\nCả phim quay gọn trong một buổi. Trang phục do chính các bạn sinh viên kiến trúc tự làm, nên hỏng một bộ là không có bộ thứ hai để thay.",
    approach:
      "Thời gian dồn vào canh đèn chứ không vào việc chạy cho hết danh sách cảnh. Trong phòng chật thì mỗi lần đổi góc máy là một lần phải kê lại đèn — hướng cũ vừa đẹp ở góc trước có thể lọt thẳng vào ống kính ở góc sau.\n\nBee Z quay ít cảnh hơn dự tính ban đầu và làm kỹ từng cảnh. Một buổi với trang phục độc bản thì không có lần hai, nên cảnh nào chưa đạt là bỏ hẳn khỏi phim chứ không giữ lại chờ sửa ở hậu kỳ.\n\nTường của studio nhỏ vừa là vấn đề vừa là công cụ. Không đẩy đèn ra xa được thì dùng chính tường làm mặt hắt, lấy ánh sáng dội lại để làm mềm phần đổ bóng trên mặt diễn viên.",
  },
];

await connectDB();

const dau = CHI_XEM ? "»" : "+";
let xong = 0;

for (const b of BAI) {
  const p = await Project.findOne({ slug: b.slug });
  if (!p) {
    console.log(`  ? KHONG THAY du an "${b.slug}" — bo qua`);
    continue;
  }

  const cu = (p as { caseStudy?: { challenge?: { vi?: string } } }).caseStudy?.challenge?.vi ?? "";
  console.log(`${dau} ${b.ten}  (/du-an/${b.slug})`);
  console.log(`     trước: ${cu ? cu.length + " ký tự" : "CHƯA CÓ"}`);
  console.log(`     sau  : ${b.challenge.length + b.approach.length} ký tự`);

  if (!CHI_XEM) {
    // Ghi cả hai ngôn ngữ cùng một nội dung tiếng Việt là sai; để trống bản
    // tiếng Anh thì lớp hiển thị tự lùi về tiếng Việt, đúng như các bài đợt trước.
    p.set("caseStudy.challenge", { en: "", vi: b.challenge });
    p.set("caseStudy.approach", { en: "", vi: b.approach });
    p.markModified("caseStudy");
    await p.save();
    xong++;
  }
}

console.log(`\n${CHI_XEM ? "[CHỈ XEM] " : ""}Xong ${CHI_XEM ? BAI.length : xong}/${BAI.length} bài.`);
await disconnectDB();
