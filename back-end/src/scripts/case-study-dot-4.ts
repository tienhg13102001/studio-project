import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Project } from "../models/Project.ts";

/**
 * Mười case study đợt 4 — Hoàn trả lời dữ kiện ngày 06/09/2026.
 *
 * VÌ SAO LÀM: Search Console ngày 05/09 báo 89 địa chỉ chưa lập chỉ mục. Phần
 * lớn trang dự án chỉ có ảnh, cái tên và một dòng phụ đề — Google đọc rồi quyết
 * định không lưu. Không có mẹo kỹ thuật nào thay được chữ thật.
 *
 * DỮ KIỆN HOÀN KỂ (chỉ chừng này, phần còn lại là suy ra hệ quả nghề):
 *   FPT Camera 08/05  2 máy · không chụp · 2 ngày · 2 bối cảnh · giao sau 4 ngày
 *                     khó: quay camera ngoài trời qua nhiều điều kiện thời tiết
 *   Genfest           1 máy · giao trong 3 ngày · VEC Đông Anh
 *   Sync Fest         6 máy · giao 2-3 ngày · sự kiện lớn, timeline dài
 *   Dương Domic       7 máy · giao 2-3 ngày
 *   Bông Hoa Ánh Thép 6 máy · giao 2-3 ngày
 *   Glossy            dùng rất nhiều đèn và cờ
 *   Wedding Showreel  tổng hợp từ 8 đám cưới, chọn theo tiêu chí đẹp nhất
 *   Cardina + OWEN    Hoàn bảo tự viết thêm cho dài, ông duyệt sau
 *
 * BA BÀI SỰ KIỆN CỐ Ý KHÁC HÌNH DẠNG NHAU. Sync Fest, Dương Domic và Bông Hoa
 * Ánh Thép đều là "sự kiện lớn, nhiều máy, giao 2-3 ngày" nên rất dễ đúc cùng
 * một khuôn — bộ tám bài đợt 1 từng bị soi đúng lỗi đó. Nên mỗi bài mở bằng một
 * bài toán khác: Sync Fest là đồng bộ nhiều nguồn hình, Dương Domic là hai đầu
 * của một khoảnh khắc, Bông Hoa Ánh Thép là sức bền qua một chương trình dài.
 *
 * CHỖ PHẢI CẨN THẬN — CARDINA VÀ OWEN: Hoàn bảo "viết thêm thông tin dựa trên
 * video cho dài". Claude KHÔNG xem được video, nên hai bài đó viết về bài toán
 * nghề mà loại sản phẩm ấy đặt ra (chất liệu thô gió chỉ lộ khi chuyển động;
 * tỷ lệ vai rất dễ bị góc máy nói dối), KHÔNG mô tả cảnh cụ thể trong phim và
 * KHÔNG bịa số máy, số ngày, tên thiết bị. Bịa một con số là mất tin cả bài.
 *
 * KHÔNG BÀI NÀO CÓ KHỐI KẾT QUẢ: Hoàn chưa đưa chỉ số nào. Khối rỗng tự ẩn.
 *
 *   npx tsx src/scripts/case-study-dot-4.ts --thu   # xem trước, không ghi
 *   npx tsx src/scripts/case-study-dot-4.ts         # ghi thật
 */

const CHI_XEM = process.argv.includes("--thu");

type Bai = { slug: string; ten: string; challenge: string; approach: string };

const BAI: Bai[] = [
  {
    slug: "fpt-camera",
    ten: "FPT Camera",
    challenge:
      "Camera an ninh phải được quay ở đúng nơi nó sống. Gắn ngoài hiên, ngoài cổng, ngoài sân — tức là ngoài trời, mà ngoài trời thì không ai đặt được ánh sáng.\n\nHai ngày quay, hai bối cảnh. Thời tiết đổi trong lúc đang quay chứ không đợi ai. Nắng gắt buổi trưa và trời mây buổi chiều cho ra hai chất hình khác hẳn nhau, trong khi cùng một chiếc camera xuất hiện ở cả hai chỗ thì người xem phải nhận ra đó là một sản phẩm.\n\nThêm phần AI nhận diện thú cưng. Chức năng đó chỉ có sức thuyết phục khi thấy con vật thật đi vào khung, mà con vật thì không diễn theo hiệu lệnh.",
    approach:
      "Hai máy chạy song song thay vì quay lần lượt. Một máy bám sản phẩm, một máy lấy bối cảnh và những gì đang diễn ra quanh nó, nên mỗi lần trời cho một khoảng sáng đẹp là thu được hai lớp hình cùng lúc.\n\nThứ tự quay để trời quyết chứ không để kịch bản quyết. Cảnh nào cần nắng thì chờ nắng, trời chuyển mây thì nhảy sang nhóm cảnh hợp với ánh sáng dịu. Cách này lấy được nhiều hình dùng được hơn, đổi lại phần hậu kỳ phải gánh việc cân màu giữa những cảnh quay cách nhau hàng giờ.\n\nPhần thú cưng không đặt kịch bản. Máy để sẵn ở khung đã canh rồi đợi con vật tự đi qua. Chờ lâu hơn nhưng ra hình thật, mà cả cái chức năng đang quảng cáo nằm đúng ở chỗ nó bắt được chuyện thật.\n\nBốn ngày sau buổi cuối là phải có phim, nên việc chọn cảnh làm ngay trong lúc còn đang quay.",
  },
  {
    slug: "genfest",
    ten: "Genfest",
    challenge:
      "Một lễ hội âm nhạc ở Trung tâm Triển lãm VEC Đông Anh, quay bằng một máy.\n\nMột máy nghĩa là mỗi thời điểm chỉ có mặt được ở một chỗ. Sân khấu đang cháy thì đám đông phía dưới cũng đang cháy, chọn bên này là mất bên kia, và không có gì diễn lại lần hai.\n\nĐịa điểm lại rộng. Đi từ khu vực này sang khu vực khác mất vài phút, mà vài phút ở một lễ hội đủ để hết cả một bài hát.",
    approach:
      "Trước buổi quay phải nắm mạch chương trình, biết bài nào là cao trào để có mặt sẵn ở đó chứ không chạy theo sau.\n\nTrong buổi, máy đi theo một nguyên tắc duy nhất: chỉ rời sân khấu vào các quãng chuyển, và rời đi thì phải về kịp trước cao trào tiếp theo. Những đoạn đám đông, hậu trường và không khí bên ngoài đều nhặt trong các quãng đó.\n\nMột máy cũng có cái được. Không phải khớp màu và khớp giờ giữa nhiều nguồn hình, nên khâu dựng nhẹ đi hẳn — đó là lý do phim giao được trong ba ngày.",
  },
  {
    slug: "sync-fest",
    ten: "Sync Fest",
    challenge:
      "Sáu máy trong một lễ hội chạy suốt nhiều giờ liền.\n\nNhiều máy giải quyết được chuyện thiếu hình, nhưng đẻ ra một vấn đề khác. Sáu người cùng đứng trước một sân khấu đẹp rất dễ mang về sáu góc na ná nhau — nhiều dữ liệu mà ít lựa chọn thật khi vào dựng.\n\nSáu nguồn hình còn phải khớp được với nhau. Lệch màu giữa các máy, lệch giờ trong từng máy, tới lúc cắt qua lại là lộ ngay.",
    approach:
      "Chia vai từng máy trước khi chương trình bắt đầu, thay vì để ai thấy gì hay thì quay nấy. Có máy giữ toàn cảnh không rời, có máy chỉ ăn cận, có máy chuyên đi tìm phản ứng dưới khán đài.\n\nCách chia này nghe cứng nhưng nó tạo ra thứ mà một đám máy tự do không tạo được. Mỗi khoảnh khắc đều có sẵn ít nhất một góc rộng để đặt nền và một góc gần để đẩy cảm xúc, nên khâu dựng lúc nào cũng có đường cắt.\n\nSáu máy được cân màu và đồng bộ giờ ngay từ đầu buổi. Việc đó tốn thời gian lúc chuẩn bị nhưng là lý do phim ra được trong hai tới ba ngày, thay vì ngồi gỡ từng chỗ lệch ở hậu kỳ.",
  },
  {
    slug: "fan-meeting-duong-domic",
    ten: "Fan Meeting - Dương Domic",
    challenge:
      "Buổi gặp gỡ giữa Dương Domic và người hâm mộ, quay bằng bảy máy.\n\nThứ đáng giá nhất của một buổi fan meeting không nằm trên sân khấu. Nó nằm ở khoảnh khắc một người dưới khán đài vỡ oà, và ở cái nhìn của nghệ sĩ đáp lại đúng lúc đó.\n\nHai thứ ấy xảy ra cùng lúc ở hai đầu khán phòng, kéo dài vài giây, và không hề báo trước.",
    approach:
      "Bảy máy chia về hai phía. Một nhóm bám nghệ sĩ, một nhóm quay ngược lại xuống khán đài, để hai đầu của cùng một khoảnh khắc đều có hình.\n\nNhóm quay khán giả không đi tìm đám đông mà đi tìm từng người. Máy chọn sẵn vài gương mặt rồi ở lại với họ, vì một khuôn mặt được theo đủ lâu mới thấy được cảm xúc chuyển, còn lia qua cả hàng ghế thì chỉ ra một biển người.\n\nVới số máy này thì phần lớn khoảnh khắc bất chợt đều có ít nhất hai góc nhìn. Đó chính là thứ cho phép bản dựng cắt qua lại giữa sân khấu và khán đài mà mạch cảm xúc không đứt.",
  },
  {
    slug: "bong-hoa-anh-thep",
    ten: "Bông Hoa Ánh Thép",
    challenge:
      "Chương trình chạy dài, sáu máy phải bám từ đầu tới cuối.\n\nVới một buổi kéo dài như vậy thì vấn đề không còn nằm ở kỹ thuật mà nằm ở sức bền. Máy hết pin, thẻ nhớ đầy, người cầm máy mỏi — và mấy chuyện đó luôn rơi đúng vào đoạn quan trọng, vì đoạn quan trọng thường nằm ở cuối chương trình.\n\nBỏ lỡ một cảnh ở phút thứ mười thì còn cứu được bằng cảnh khác. Bỏ lỡ ở phút cuối là mất luôn phần kết của phim.",
    approach:
      "Lịch thay pin và thẻ đặt theo mạch chương trình chứ không theo đồng hồ. Mỗi máy thay vào đúng quãng chùng của riêng nó, và không bao giờ để hai máy cùng thay một lúc.\n\nSáu máy đủ để lúc nào cũng dư ra một góc. Đó mới là ý nghĩa thật của số lượng máy ở một chương trình dài — không phải để có nhiều góc đẹp, mà để một máy trục trặc thì phim vẫn liền mạch.\n\nPhần kết được chuẩn bị từ trước khi nó tới. Máy vào vị trí cho đoạn cuối sớm hơn mức cần thiết, chấp nhận mất vài cảnh ở đoạn trước đó, vì phần khán giả nhớ nhất luôn là phần cuối cùng họ nhìn thấy.",
  },
  {
    slug: "glossy-product-shoot-the-perfect-glow",
    ten: "Glossy Product Shoot - The Perfect Glow",
    challenge:
      "Chụp một dòng sản phẩm có vỏ bóng.\n\nBề mặt bóng không nhận ánh sáng như bề mặt thường. Nó phản chiếu. Thứ hiện lên trên thân sản phẩm không phải là ánh sáng, mà là hình của mọi vật đang đứng quanh nó — cả đèn, cả trần, cả người cầm máy.\n\nNên với món này, câu hỏi không phải là đánh sáng thế nào cho đủ. Đủ sáng thì dễ. Câu hỏi là làm sao để thứ được phản chiếu lên vỏ sản phẩm đúng là thứ mình muốn người xem nhìn thấy.",
    approach:
      "Buổi chụp dùng rất nhiều đèn, và đi cùng với đó là rất nhiều cờ chắn. Cờ ở đây quan trọng ngang đèn. Đèn quyết định chỗ nào sáng, cờ quyết định chỗ nào tối, mà trên một bề mặt bóng thì chính những vệt tối mới vẽ ra hình khối của sản phẩm.\n\nCách làm là dựng cả một môi trường quanh sản phẩm rồi mới chụp, chứ không chiếu đèn thẳng vào nó. Mỗi mảng sáng và mỗi mảng chắn được đặt vào đúng chỗ mà nó sẽ hiện lên trên vỏ.\n\nĐổi lại là chậm. Mỗi lần xoay sản phẩm hay đổi góc máy là toàn bộ phản chiếu đổi theo, phải dựng lại gần như từ đầu. Sáu tấm ảnh cuối cùng là kết quả của sáu lần dựng riêng.",
  },
  {
    slug: "wedding-showreel-2026-love-in-motion",
    ten: "Wedding Showreel 2026 - Love in Motion",
    challenge:
      "Một tuyển tập cắt ra từ tám đám cưới khác nhau.\n\nTám đám là tám ngày, tám nơi, tám thứ ánh sáng. Có đám ngoài trời giữa trưa, có đám trong nhà hàng đèn vàng, có đám quay lúc chiều muộn. Đặt cạnh nhau mà không xử lý gì thì trông như tám đoạn phim rời bị ghép cho đủ độ dài.\n\nViệc khó không phải là chọn cảnh đẹp, vì đám nào cũng có cảnh đẹp. Khó ở chỗ tám mạch cảm xúc riêng phải chảy thành một mạch.",
    approach:
      "Cảnh được chọn theo tiêu chí đẹp nhất, không theo thứ tự đám và cũng không chia đều số lượng. Có đám góp nhiều cảnh, có đám chỉ góp một, và như thế là đúng — người xem không biết cảnh nào của ai, mà cũng không cần biết.\n\nChọn xong thì cân màu kéo tất cả về cùng một tông. Đây là phần nặng nhất của cả bản dựng, vì mỗi cảnh xuất phát từ một điều kiện sáng khác nhau nên phải chỉnh riêng từng cảnh để cuối cùng chúng trông như quay bằng cùng một máy trong cùng một ngày.\n\nMạch phim sắp theo cung bậc cảm xúc chứ không theo trình tự một đám cưới. Nước mắt của cô dâu đám này nối thẳng vào nụ cười của đám khác, và chính chỗ nối đó làm tuyển tập khác hẳn một cuốn băng tổng hợp.",
  },
  {
    slug: "cardina",
    ten: "Cardina",
    challenge:
      "Phim quảng cáo cho dòng sản phẩm dành cho mẹ và cho vợ.\n\nNhóm hàng này có một cái bẫy quen thuộc. Nói về sự chăm sóc rất dễ trượt sang giọng ngọt, mà giọng ngọt thì người xem đã nghe quá nhiều lần nên không còn tin nữa.\n\nThứ khách hàng muốn là sự thấu hiểu. Mà thấu hiểu là thứ không tuyên bố được — nói thẳng ra câu đó là mất ngay.",
    approach:
      "Cách làm là để hành động nói thay lời. Phim dựng quanh những việc nhỏ mà người ta thật sự làm cho nhau trong một gia đình, thay vì để nhân vật đứng ra giải thích tình cảm của mình.\n\nÁnh sáng giữ mềm và tự nhiên, đúng chất sáng trong một căn nhà chứ không phải chất sáng của phim trường. Một khuôn mặt được đánh sáng quá đẹp sẽ tự tố cáo rằng đây là quảng cáo, mà cái phim này cần đúng điều ngược lại.\n\nSản phẩm xuất hiện ở nơi nó thuộc về trong đời sống thật, không dựng thành trung tâm khung hình. Với dòng hàng này thì đặt nó cạnh người dùng đáng tin hơn nhiều so với đẩy nó lên bục.",
  },
  {
    slug: "cardina-2",
    ten: "Cardina",
    challenge:
      "Bộ sưu tập thể thao, làm theo hướng đường phố.\n\nChất liệu ở đây là thứ khó thể hiện nhất. Vải thô gió siêu nhẹ chỉ lộ ra cái nhẹ của nó khi đang chuyển động — đứng yên thì nó trông như mọi loại vải khác, và một khung hình tĩnh không nói được gì về trọng lượng.\n\nPhong cách đường phố lại càng không chịu được sự sắp đặt. Nhìn ra dàn dựng là mất luôn cái chất mà cả bộ sưu tập đang bán.",
    approach:
      "Toàn bộ buổi làm việc xoay quanh chuyển động. Người mẫu không được yêu cầu vào tư thế rồi giữ nguyên, mà được cho chạy, xoay, bật nhảy, còn máy thì bắt ở giữa những động tác đó. Vải bay lên là lúc duy nhất người xem thấy được nó nhẹ tới đâu.\n\nCách này tốn nhiều lần bấm máy hơn hẳn kiểu tạo dáng, vì phần lớn khung hình rơi vào những nhịp không đẹp. Nhưng những khung ăn được thì mang theo thứ mà cách kia không bao giờ cho: một dáng người đang thật sự vận động.\n\nPhần phom dáng để góc máy lo. Máy hạ thấp và lấy hơi ngược lên kéo dài đường chân, đúng thứ mà một bộ đồ thể thao cần khoe.",
  },
  {
    slug: "owen-2",
    ten: "OWEN",
    challenge:
      "Bộ ảnh cho dòng áo polo mà điểm bán nằm ở kỹ thuật cắt may phần vai.\n\nĐây là loại yêu cầu khó trong chụp thời trang nam. Cái áo không có màu lạ, không hoạ tiết, không chi tiết nào bắt mắt từ xa. Giá trị của nó nằm ở tỷ lệ, ở cách đường vai làm người mặc trông cân đối hơn.\n\nMà tỷ lệ thì máy ảnh rất dễ nói dối. Chỉ cần đặt máy cao hơn hay thấp hơn một chút, hoặc đổi tiêu cự, là vai rộng ra hay hẹp lại. Chụp sai thì hoặc mất luôn điểm bán, hoặc thổi phồng nó tới mức khách mua về thấy không giống.",
    approach:
      "Máy đặt ngang tầm ngực và giữ nguyên tiêu cự qua cả bộ ảnh. Nghe đơn giản nhưng đây là quyết định quan trọng nhất của buổi chụp, vì chỉ khi khoảng cách và độ cao không đổi thì đường vai trong ảnh mới đúng đường vai ngoài đời.\n\nÁnh sáng đánh chếch từ một bên để tạo một vệt đổ bóng dọc sườn áo. Vệt đó là thứ vẽ ra khối vai. Đánh sáng bẹt từ chính diện thì cái áo phẳng lì và toàn bộ kỹ thuật cắt may biến mất khỏi ảnh.\n\nNgười mẫu giữ vai mở và cằm hơi đưa tới trước. Tư thế này khó chịu khi đứng nhưng lên hình thì đúng dáng, và nó là phần việc không góc máy nào làm thay được.",
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
  console.log(`     truoc: ${cu ? cu.length + " ky tu" : "CHUA CO"}`);
  console.log(`     sau  : ${b.challenge.length + b.approach.length} ky tu`);

  if (!CHI_XEM) {
    // Ghi cùng một nội dung tiếng Việt cho cả hai ngôn ngữ là sai; để trống bản
    // tiếng Anh thì lớp hiển thị tự lùi về tiếng Việt, đúng như các đợt trước.
    p.set("caseStudy.challenge", { en: "", vi: b.challenge });
    p.set("caseStudy.approach", { en: "", vi: b.approach });
    p.markModified("caseStudy");
    await p.save();
    xong++;
  }
}

console.log(`\n${CHI_XEM ? "[CHI XEM] " : ""}Xong ${CHI_XEM ? BAI.length : xong}/${BAI.length} bai.`);
await disconnectDB();
