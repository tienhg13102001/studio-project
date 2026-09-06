import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Project } from "../models/Project.ts";

/**
 * Hai mươi lăm case study đợt 5 — viết ngày 06/09/2026.
 *
 * VÌ SAO LÀM: sau đợt 4 còn 35/66 dự án chưa có bài. Trong đó 10 dự án có phụ
 * đề rỗng hoặc chỉ lặp lại đúng cái tên — không bám vào đâu được, đã tách ra
 * thành phiếu hỏi riêng. 25 dự án ở đây có phụ đề thật, đủ để suy ra bài toán
 * nghề mà buổi làm việc đó phải giải.
 *
 * HOÀN CHO PHÉP TỰ VIẾT: "các dự án khác cũng thế nhé, tự làm đi" (06/09/2026),
 * sau khi đã duyệt cách làm ở đợt 4. Ông đọc trên web rồi báo chỗ nào lệch.
 *
 * BA RÀNG BUỘC TỰ ĐẶT, ĐỪNG GỠ:
 *
 *  1. KHÔNG BỊA SỐ. Không số máy, không số ngày, không số người, không tên
 *     thiết bị, không con số kết quả. Chỗ nào Hoàn chưa kể thì viết về bài toán
 *     nghề chứ không viết về việc đã làm. Khách đọc thấy sai một con số là mất
 *     tin cả bài.
 *
 *  2. KHÔNG DÙNG NGÀY TRONG DỮ LIỆU. Sáu dự án cùng ghi 25/06/2026 và hai dự
 *     án cùng ghi 06/07/2026 — gần như chắc chắn là ngày nhập liệu chứ không
 *     phải ngày quay. Nhắc ngày trong bài là nhắc một con số có thể sai.
 *
 *  3. MỖI NHÓM PHẢI KHÁC HÌNH DẠNG. Bốn bài cưới và sáu bài nội dung dạng ngắn
 *     rất dễ đúc cùng một khuôn — bộ tám bài đợt 1 từng bị Hoàn soi đúng lỗi
 *     đó. Nên mỗi bài mở bằng một bài toán riêng:
 *       · cưới      — phóng sự (không diễn lại) / quay sự tĩnh / pre-wedding
 *                     được dàn dựng / dựng theo giọng hồi tưởng
 *       · ngắn      — xúc giác / thứ trừu tượng không có hình / thao tác bếp /
 *                     thiếu sáng / bề mặt kim loại / quay màn hình
 *
 *   npx tsx src/scripts/case-study-dot-5.ts --thu   # xem trước, không ghi
 *   npx tsx src/scripts/case-study-dot-5.ts         # ghi thật
 */

const CHI_XEM = process.argv.includes("--thu");

type Bai = { slug: string; ten: string; challenge: string; approach: string };

const BAI: Bai[] = [
  // ─────────────────────────────── Đồ ăn & Sản phẩm ───────────────────────────
  {
    slug: "parasola-cosmetics-radiant-sun-protection",
    ten: "PARASOLA Cosmetics",
    challenge:
      "Kem chống nắng khó chụp vì thứ cần khoe lại gần như vô hình. Điểm bán nằm ở chỗ nó mỏng, thấm nhanh, không để lại vệt trắng — toàn những đặc tính người ta nhận ra bằng tay chứ không bằng mắt.\n\nVỏ hộp thì ngược lại, bóng và phản chiếu mọi thứ. Đèn, trần nhà, người cầm máy đều in lên nhãn nếu không chặn.\n\nTám tấm ảnh phải vừa cho thấy sản phẩm, vừa cho thấy nó làm gì với làn da.",
    approach:
      "Bộ ảnh chia thành hai lớp việc. Một lớp chụp sản phẩm nguyên vẹn để nhận diện, một lớp chụp chất kem đã lấy ra khỏi hộp.\n\nChất kem là phần khó hơn và cũng quan trọng hơn. Nó được đánh sáng chếch để bắt độ trong và cách nó trải ra, vì một lớp kem mỏng chỉ lộ ra cái mỏng khi ánh sáng đi xuyên qua rìa, còn chiếu thẳng vào thì nó đục lại thành một mảng trắng.\n\nMàu giữ trung tính suốt buổi, không thêm bộ lọc ấm nào. Sản phẩm này bán lớp finish nâng tông, mà tông chỉ đáng tin khi màu nền của tấm ảnh không bị can thiệp.\n\nVỏ hộp bóng xử lý bằng các mảng chắn dựng quanh khung, để thứ phản chiếu lên nhãn là thứ đã chọn trước.",
  },
  {
    slug: "laboong",
    ten: "LaBoong",
    challenge:
      "Chụp đồ uống đá xay có một cái hẹn giờ chạy ngầm. Từ lúc ly được bưng ra, đá bắt đầu tan, hơi nước bám lên thành ly rồi chảy thành vệt, và lớp bọt trên mặt xẹp dần.\n\nCó vài phút để lấy được tấm ảnh đúng lúc — đủ lâu để hơi nước kịp bám cho ly trông mát, nhưng chưa đủ lâu để đá tan làm loãng màu.\n\nMón này còn bán bằng màu. Gạo đào hồng có ba lớp màu khác nhau trong cùng một ly, và ba lớp đó phải đọc được ở tấm ảnh.",
    approach:
      "Ánh sáng và bố cục dựng xong hoàn toàn trước khi ly thật xuất hiện. Trong lúc canh thì dùng một ly thay thế, để khi ly thật ra là bấm được ngay.\n\nĐèn đặt phía sau và chếch, hắt xuyên qua thân ly. Đồ uống trong hoặc bán trong chỉ lên màu khi có ánh sáng đi qua nó; đánh đèn từ phía trước thì cả ly chỉ còn một khối tối và ba lớp màu dính vào làm một.\n\nMỗi ly chỉ chụp một lượt rồi thay ly mới, không cố cứu bằng cách chụp thêm. Ly thứ hai bao giờ cũng nhanh hơn ly đầu vì đèn đã đứng sẵn.",
  },
  {
    slug: "fresh-garden",
    ten: "Fresh Garden",
    challenge:
      "Một mùa trung thu, ba dòng sản phẩm, và mỗi dòng mang một tinh thần riêng — Khu Vườn thơ mộng, Khung Cửa bình yên, Mùa Thu Phiêu Lưu nhiều nhịp hơn.\n\nBa tinh thần đó phải khác nhau đủ để người xem phân biệt được, nhưng vẫn phải nằm chung trong một thước phim của cùng một thương hiệu. Làm khác quá thì rời, làm giống quá thì cả ba thành một.\n\nBánh trung thu lại là món ít chuyển động. Nó nằm yên, không bốc khói, không chảy, không có gì tự diễn ra trước ống kính.",
    approach:
      "Ba dòng được tách bằng ánh sáng và bối cảnh chứ không bằng cách quay khác đi. Cùng một ngôn ngữ hình ảnh, chỉ đổi chất sáng và vật liệu nền, nên khi ghép lại người xem thấy ba chương của một câu chuyện.\n\nPhần thiếu chuyển động bù bằng chính bàn tay người. Việc mở hộp, nhấc bánh, bẻ đôi để lộ nhân — những thao tác đó vừa tạo nhịp cho phim vừa cho thấy kết cấu bên trong, thứ mà quay tĩnh không bao giờ cho thấy được.\n\nMáy giữ chuyển động chậm và đều xuyên suốt. Với món quà tặng thì nhịp máy chính là thứ nói lên giá của nó, và một cú lia vội làm hộp bánh đắt tiền trông như hàng bày sạp.",
  },

  // ─────────────────────────────────── Sự kiện ────────────────────────────────
  {
    slug: "a-choen-yep",
    ten: "A Choén - YEP",
    challenge:
      "Tiệc tất niên của một công ty, quay lại cả một năm đã qua trong một đêm.\n\nCái khó của tiệc nội bộ là người trước ống kính không phải diễn viên. Họ là nhân viên, và phần lớn sẽ cứng lại ngay khi thấy máy chĩa vào mình. Nhưng chính họ mới là nội dung — một cuốn phim tất niên không có gương mặt người trong công ty thì chẳng khác gì phim quảng cáo cho cái nhà hàng.\n\nÁnh sáng tiệc lại là thứ tệ nhất để quay. Đèn màu, đèn nháy, sân khấu sáng còn bàn tiệc thì tối.",
    approach:
      "Máy vào sớm và ở lì trong phòng từ lúc mọi người còn đang tới. Nửa tiếng đầu gần như không dùng được gì, nhưng nó làm cho sự có mặt của máy trở thành bình thường, và từ đó trở đi người ta thôi để ý.\n\nQuay từ xa với tiêu cự dài thay vì lại gần. Khoảng cách giữ cho người trong khung không biết mình đang được quay, đó là cách duy nhất lấy được phản ứng thật ở một buổi mà ai cũng biết có máy.\n\nPhần ánh sáng thì không chống lại mà dùng luôn. Đèn màu của tiệc được để nguyên làm chất phim, chỉ thêm nguồn sáng vừa đủ cho khuôn mặt đọc được, vì gỡ hết đèn tiệc đi là gỡ mất luôn không khí của đêm đó.",
  },
  {
    slug: "concert-of-childhood-memory",
    ten: "Concert of Childhood Memory",
    challenge:
      "Một đêm nhạc giao hưởng. Loại chương trình này đặt ra một ràng buộc mà những buổi diễn khác không có — khán phòng phải im.\n\nMọi tiếng động của việc quay đều thành tiếng ồn trong một bản nhạc không có tiếng bass che lấp. Bước chân trên sàn, tiếng khớp chân máy, tiếng người quay đổi chỗ, tất cả đều nghe thấy được từ hàng ghế bên cạnh.\n\nMà đúng lúc âm nhạc lên cao nhất lại là lúc cần đổi góc nhất.",
    approach:
      "Vị trí máy chốt trước và gần như không đổi trong lúc dàn nhạc đang chơi. Việc di chuyển dồn hết vào các quãng nghỉ giữa các bản, kể cả khi điều đó có nghĩa là bỏ qua vài góc đẹp.\n\nĐổi lại bằng tiêu cự. Máy đứng yên nhưng đi từ toàn cảnh dàn nhạc vào cận một cây đàn, nên phim vẫn có sự thay đổi mà không ai phải bước một bước nào.\n\nCách này bắt phải chọn vị trí thật kỹ từ đầu, vì chọn sai là chịu suốt cả bản. Bù lại nó cho một thứ quan trọng hơn mọi góc máy — buổi diễn không bị làm phiền, và người mua vé nghe được đúng thứ họ tới nghe.",
  },
  {
    slug: "voc-american-roadstar",
    ten: "VOC - American Roadstar",
    challenge:
      "Một chặng đua off-road. Địa hình là bùn, dốc và đá, và đó cũng chính là nội dung — xe càng vào chỗ khó thì hình càng đáng giá.\n\nNhưng chỗ khó cho xe cũng là chỗ khó cho người cầm máy. Muốn có góc đắt thì phải đứng gần đường xe chạy, mà xe off-road không phanh gấp được và bùn văng xa hơn nhiều so với người ta tưởng.\n\nCả ngày ở ngoài trời, thiết bị dính bùn và nước, không có chỗ nào để lau khô tử tế.",
    approach:
      "Chọn điểm đứng trước khi cuộc đua bắt đầu, đi bộ dọc đường đua để tìm những khúc cua và những đoạn dốc nơi xe buộc phải chậm lại. Đó là chỗ vừa an toàn vừa cho hình đẹp nhất, vì xe đang gắng sức thì trông máu lửa hơn xe đang chạy nhanh trên đường thẳng.\n\nMáy quay ở tốc độ cửa trập cao để bùn và đá văng lên vẫn giữ được hình khối thay vì nhoè thành vệt. Chi tiết đó là thứ làm người xem cảm được cái xóc.\n\nThiết bị bọc kín và chỉ mở ra khi bấm. Đổi ống kính giữa đường đua là cách nhanh nhất để bụi vào cảm biến và hỏng phần còn lại của ngày quay.",
  },
  {
    slug: "kosmos-event",
    ten: "Kosmos Event",
    challenge:
      "Quay cho một công ty tổ chức sự kiện. Khách hàng ở đây là dân trong nghề, nên họ nhìn ra ngay những thứ khách thường không để ý.\n\nSản phẩm cần bán cũng khác. Với một sự kiện thông thường thì phim kể lại đêm đó vui thế nào. Với đơn vị tổ chức thì phim phải cho thấy năng lực — không gian dựng lên bề thế ra sao, mọi thứ chạy trơn tru thế nào.\n\nHai thứ đó nằm ở hai đầu đối lập. Cảm xúc nằm ở khuôn mặt người dự, còn năng lực tổ chức nằm ở toàn cảnh và ở những chi tiết dựng.",
    approach:
      "Phim lấy cả hai nhưng phân vai rõ. Những cú toàn cảnh rộng đặt ở đầu và ở các đoạn chuyển, làm nhiệm vụ khai ra quy mô. Cảm xúc dồn vào phần giữa và phần cuối.\n\nSân khấu, ánh sáng và cách bài trí được quay riêng trước giờ khách vào. Đó là lúc duy nhất không gian còn nguyên vẹn và sạch người, mà một đơn vị tổ chức thì cần đúng những khung hình đó để chào khách sau này.\n\nMáy giữ chuyển động chậm và ổn định xuyên suốt. Với loại phim bán năng lực thì độ mượt của cú máy tự nó đã là một lời chứng, còn hình rung thì dù nội dung đúng vẫn khiến người xem nghi ngờ.",
  },
  {
    slug: "l-officel",
    ten: "L'Officiel",
    challenge:
      "Sự kiện giới thiệu một dòng sản phẩm chống nắng, tổ chức ở quy mô lớn.\n\nSự kiện ra mắt khó hơn sự kiện thông thường ở chỗ nó có hai nhiệm vụ chồng lên nhau. Vừa phải ghi lại một buổi tối đông vui, vừa phải làm nổi được sản phẩm và thông điệp — mà sản phẩm ở đây là một tuýp kem nhỏ nằm trong một khán phòng lớn.\n\nQuay đám đông thì mất sản phẩm. Quay sản phẩm thì thành phim quảng cáo, không còn là phim sự kiện.",
    approach:
      "Sản phẩm được quay ở khu trưng bày, không quay trên sân khấu. Chỗ đó có ánh sáng đặt sẵn cho việc nhìn ngắm và có người thật đang cầm sản phẩm lên xem, nên hình vừa rõ vừa không tách khỏi không khí buổi tối.\n\nPhần đám đông và phần sân khấu quay theo lối sự kiện bình thường, rồi khi dựng thì cài các cảnh sản phẩm vào những quãng chuyển. Cách này giữ được mạch của đêm đó mà thông điệp vẫn xuất hiện đủ số lần.\n\nMàu giữ trung thực cho các cảnh có sản phẩm và có da người, vì đây là dòng hàng bán bằng cảm giác trên da — đẩy màu lên cho lung linh là làm hỏng đúng thứ đang giới thiệu.",
  },

  // ──────────────────────────────────── Cưới ──────────────────────────────────
  {
    slug: "hai-hang",
    ten: "Hải & Hằng",
    challenge:
      "Một ngày cưới không diễn lại được. Nghi lễ chạy theo giờ đã xem, khách tới theo giờ của khách, và mọi khoảnh khắc đáng giá đều chỉ xảy ra đúng một lần.\n\nKhó nhất không phải là quay đẹp mà là có mặt đúng chỗ. Lúc mẹ cô dâu quay đi lau nước mắt thì ở phòng bên chú rể cũng đang có một khoảnh khắc, và không ai báo trước cả hai.\n\nMột ngày cưới còn dài hơn người ta tưởng. Bắt đầu từ sáng sớm lúc trang điểm và kết thúc khi tiệc tan.",
    approach:
      "Trước ngày cưới phải nắm được trình tự nghi lễ và biết ai là người quan trọng trong nhà. Biết trước thì mới đứng sẵn ở chỗ sắp có chuyện, thay vì quay đầu lại khi đã nghe thấy tiếng.\n\nTrong ngày thì ưu tiên bám người chứ không bám nghi thức. Nghi thức nào cũng giống nhau ở mọi đám cưới và ai cũng đoán được nó diễn ra thế nào, còn phản ứng của người trong nhà thì mỗi đám một khác — đó mới là phần khiến gia đình xem lại nhiều lần.\n\nMáy giữ khoảng cách trong các nghi lễ. Đứng gần thì hình đẹp hơn nhưng người ta ý thức được sự có mặt của mình, và một đám cưới bị ống kính làm cho ngượng thì không còn gì để quay.",
  },
  {
    slug: "wed-vinh-trang",
    ten: "WED_VINH & TRANG",
    challenge:
      "Cặp đôi này muốn một thước phim nói về sự bình yên chứ không phải sự bùng nổ.\n\nĐó là yêu cầu khó hơn nghe qua. Phim cưới có sẵn một bộ công cụ để đẩy cảm xúc lên — nhạc dồn, cắt nhanh, cận cảnh nước mắt — và bỏ hết chúng đi thì phải tìm thứ khác thay vào, nếu không phim sẽ chỉ còn là chậm và nhạt.\n\nSự bình yên lại không có khoảnh khắc cao trào để bám vào. Nó nằm rải khắp trong những giây rất bình thường.",
    approach:
      "Máy chuyển động ít và mỗi cảnh giữ lâu hơn bình thường. Một cảnh dài buộc người xem ở lại với nó, và những chuyện nhỏ chỉ hiện ra khi ống kính chịu ở lại — bàn tay siết chặt hơn một chút, ánh mắt đưa sang rồi quay về.\n\nCắt theo hơi thở chứ không theo nhịp nhạc. Điểm cắt đặt vào cuối một hành động thay vì giữa hành động, nên mạch phim đi tới mà không bị giật.\n\nÁnh sáng dùng nguồn sẵn có nhiều nhất có thể. Đèn dựng lên bao giờ cũng đẹp hơn nhưng nó mang theo cảm giác dàn dựng, mà cái phim này bán đúng thứ ngược lại.",
  },
  {
    slug: "pre-vinh-trang",
    ten: "PRE Vinh & Trang",
    challenge:
      "Pre-wedding là loại phim cưới duy nhất được phép dàn dựng. Không có nghi lễ nào phải bám, không có khách nào phải chờ, chọn được cả bối cảnh lẫn giờ quay.\n\nTự do đó lại chính là cái bẫy. Được dàn dựng mọi thứ thì rất dễ ra một bộ phim mà mọi khung hình đều đẹp và không khung hình nào thật, và người xem nhận ra ngay dù không gọi được tên.\n\nThêm nữa, hai người trước ống kính không phải diễn viên. Bảo họ diễn tình cảm thì cái ngượng hiện lên mặt trước cả cảm xúc.",
    approach:
      "Thay vì đưa tư thế, buổi quay đưa việc để làm. Đi bộ, chỉnh lại cổ áo cho nhau, nói chuyện — máy bắt ở giữa những việc đó. Người ta thả lỏng khi đang bận làm gì đó, và đấy là lúc lấy được nét mặt thật.\n\nGiờ quay chọn theo ánh sáng chứ không theo lịch cho tiện. Khoảng sáng ngắn đầu và cuối ngày cho chất ảnh mà giữa trưa không bao giờ có, và bù lại thì phải chờ, phải dậy sớm.\n\nBối cảnh chọn ít mà làm kỹ. Chạy nhiều nơi trong một ngày thì mỗi nơi chỉ kịp lấy vài cảnh mặt tiền, còn ở lại lâu một chỗ thì có thời gian cho hai người quen với nó.",
  },
  {
    slug: "hoang-linh-binh-duong",
    ten: "Hoàng Linh & Bình Dương",
    challenge:
      "Cặp đôi muốn thước phim mang giọng của một cuốn nhật ký hoài niệm.\n\nGiọng đó không nằm ở khâu quay mà nằm ở khâu dựng. Cùng một tập tư liệu, cắt kiểu này thì ra một ngày cưới rộn ràng, cắt kiểu khác thì ra một hồi tưởng. Cái khó là phải quay sao cho khâu dựng sau này có đủ thứ để làm ra giọng ấy.\n\nMà giọng hoài niệm cần những cảnh mà phim cưới thông thường hay bỏ. Bàn tay đang chờ, căn phòng lúc chưa ai bước vào, một khoảng lặng giữa hai nghi thức.",
    approach:
      "Ngoài các mốc bắt buộc, buổi quay dành hẳn một phần thời gian cho những cảnh không có sự kiện gì xảy ra. Đồ vật, không gian, những quãng trống. Lúc quay thì chúng có vẻ vô ích, nhưng đó chính là chất liệu để dựng ra khoảng thở sau này.\n\nBản dựng sắp theo dòng ký ức chứ không theo trình tự thời gian. Một cảnh ở tiệc tối có thể đứng ngay sau cảnh buổi sáng nếu hai cảnh đó nối được vào nhau bằng cảm xúc.\n\nMàu kéo về tông trầm và ấm hơn thực tế một chút. Đây là can thiệp có chủ ý, vì trí nhớ của con người không giữ lại màu đúng như nó vốn có.",
  },

  // ────────────────────────────── Nội dung dạng ngắn ──────────────────────────
  {
    slug: "naris-spa",
    ten: "Naris Spa",
    challenge:
      "Spa bán một thứ mà máy quay không ghi được. Giá trị của nó nằm ở cảm giác trên da và ở trạng thái dễ chịu sau buổi trị liệu, toàn những thứ thuộc về xúc giác.\n\nPhim phải làm cho người xem cảm được cái chạm bằng mắt.\n\nCòn một ràng buộc nữa. Không gian spa vốn tối và tĩnh, đó là điều kiện cần cho việc thư giãn nhưng lại là điều kiện tệ cho việc quay.",
    approach:
      "Máy chuyển động chậm và liên tục, gần như không có cú cắt nào gãy. Nhịp của phim chính là thứ truyền được trạng thái — mắt người xem đi chậm thì nhịp thở đi theo, và đó là cách gần nhất để một hình ảnh chạm được vào cảm giác.\n\nCảnh quay tập trung vào chỗ tiếp xúc. Bàn tay trên vai, nước chảy qua da, khăn ấm đặt xuống. Cận cảnh ở khoảng cách đó cho người xem một điểm tựa quen thuộc, vì ai cũng đã từng cảm thấy những thứ ấy.\n\nÁnh sáng giữ nguyên độ tối của không gian, chỉ thêm những nguồn rất nhẹ ở đúng chỗ cần thấy. Đánh sáng lên cho đủ thì hình rõ hơn nhưng mất luôn cái tĩnh, mà cái tĩnh mới là thứ spa đang bán.",
  },
  {
    slug: "yootek",
    ten: "Yootek",
    challenge:
      "Một hệ sinh thái công nghệ không có hình dạng nào để quay.\n\nĐây là loại đề bài khó nhất trong phim ngắn thương hiệu. Sản phẩm là thứ vô hình, không cầm được, không đặt lên bàn được, và cũng không có một khoảnh khắc nào để bắt.\n\nCách làm quen thuộc là đổ đầy phim bằng đồ hoạ và màn hình giao diện. Nhưng đồ hoạ thì công ty công nghệ nào cũng có, và một thước phim toàn đồ hoạ thì đổi tên thương hiệu vào là vẫn dùng được cho bên khác.",
    approach:
      "Phim bám vào nhịp thay vì bám vào vật. Cắt theo tiết tấu đều, mỗi cảnh giữ đúng một khoảng ngắn bằng nhau, để cái mạch liên tục ấy tự nói lên rằng có một hệ thống đang chạy trơn tru.\n\nNhững gì hữu hình thì lấy ở phía con người. Bàn tay trên thiết bị, ánh màn hình hắt lên mặt, một cử chỉ dứt khoát. Người xem không hiểu được một hệ sinh thái, nhưng họ hiểu ngay một người đang làm việc gọn gàng.\n\nBảng màu và kiểu chuyển cảnh giữ nhất quán từ đầu tới cuối. Với thứ không có hình dạng thì sự nhất quán chính là hình dạng, và đó cũng là thứ khiến phim không lẫn với phim của bên khác.",
  },
  {
    slug: "meiwei",
    ten: "MeiWei",
    challenge:
      "Nhà hàng Á Đông, phim ngắn phải chạy được cả hai phía — thao tác trong bếp và không khí ngoài phòng ăn.\n\nBếp là nơi khó quay nhất trong một nhà hàng. Chật, nóng, ánh sáng vàng gắt, và đầu bếp thì đang làm việc thật chứ không đợi máy.\n\nMón ăn lại có tuổi thọ rất ngắn trước ống kính. Đĩa vừa ra là đẹp nhất, để thêm vài phút thì hơi tắt, dầu đông lại, rau xuống màu.",
    approach:
      "Quay bếp trước, quay bàn ăn sau, và mỗi đĩa lên hình đều là đĩa vừa làm xong. Trình tự này bắt phải chờ nhiều hơn nhưng không có cách nào khác để món ăn còn nguyên trạng thái.\n\nTrong bếp thì máy đi theo thao tác chứ không cắt ngang nó. Một động tác đảo chảo hay một nhát dao được giữ trọn từ đầu tới cuối, vì chính sự dứt khoát trong tay nghề là thứ khách nhìn ra được, còn cắt vụn ra thì chỉ còn chuyển động.\n\nHai không gian nối bằng nhịp cắt chứ không bằng lời. Nhịp trong bếp nhanh và gấp, nhịp ngoài phòng ăn chậm lại — chỗ chuyển giữa hai nhịp đó chính là điều phim muốn nói.",
  },
  {
    slug: "vuvuzela",
    ten: "Vuvuzela",
    challenge:
      "Quán bia buổi tối. Cái phim cần bán là không khí — chỗ ngồi ấm, bạn bè, một buổi tối thả lỏng sau giờ làm.\n\nMà không khí đó được tạo ra bằng đèn mờ, và đèn mờ là kẻ thù của máy quay. Đẩy sáng lên cho đủ thì mất luôn thứ đang cần quay, vì một quán bia sáng trưng thì không còn là quán bia buổi tối nữa.\n\nKhách trong quán cũng là khách thật, không phải người mẫu.",
    approach:
      "Chọn quay vào khung giờ mà quán đã đủ đông nhưng chưa quá tải. Đủ đông thì có không khí thật, chưa quá tải thì còn di chuyển được và còn xin phép được người ngồi trong khung.\n\nÁnh sáng của quán giữ nguyên làm nền, chỉ thêm nguồn rất nhẹ vào chỗ cần đọc được mặt người hoặc thấy được ly bia. Cách này giữ được sắc vàng và những mảng tối vốn có, tức là giữ được đúng cảm giác mà khách nhớ về quán.\n\nMáy quay ở khẩu mở lớn nên hậu cảnh nhoè thành những vệt sáng tròn. Đó vừa là giải pháp cho chuyện thiếu sáng, vừa cho ra đúng cái nhìn của một người đang ngồi trong quán vào cuối một ngày dài.",
  },
  {
    slug: "atom",
    ten: "ATOM",
    challenge:
      "Một chiếc Mercedes-AMG độ mâm rèn. Toàn bộ giá trị nằm ở hai bề mặt khó quay nhất — sơn xe bóng như gương và kim loại đánh bóng của bộ mâm.\n\nCả hai đều không nhận ánh sáng mà phản chiếu nó. Thứ hiện lên trên thân xe là hình của trần nhà, của đèn, của người đứng quanh. Đưa đèn vào là thấy đèn nằm chềnh ềnh trên cửa xe.\n\nBộ mâm còn khó hơn nữa. Nó nằm trong hốc bánh, chỗ tối nhất của cả chiếc xe, mà lại là chi tiết cần rõ nhất.",
    approach:
      "Ánh sáng dựng thành mảng lớn thay vì đèn điểm. Một nguồn sáng rộng phản chiếu lên thân xe thành một dải mềm chạy dọc thân, và chính dải đó vẽ ra đường nét của chiếc xe. Đèn nhỏ thì chỉ ra một chấm sáng chói và phần còn lại vẫn tối.\n\nMáy đi chậm dọc thân xe để dải sáng ấy trượt theo. Xe đứng yên nhưng ánh sáng chuyển động trên bề mặt, và đó là cách duy nhất cho thấy độ sâu của lớp sơn.\n\nBộ mâm quay riêng với nguồn sáng đưa hẳn vào trong hốc bánh, đủ để thấy các cạnh cắt của mâm rèn mà không làm hốc bánh sáng bằng thân xe.",
  },
  {
    slug: "msi",
    ten: "MSI",
    challenge:
      "Quay một chiếc màn hình máy tính là quay một nguồn sáng đang nhấp nháy rất nhanh.\n\nMàn hình có tần số quét riêng, máy quay có tốc độ cửa trập riêng, và khi hai con số đó không ăn khớp thì trên phim hiện ra những vạch tối chạy ngang. Sản phẩm này lại bán chính bằng tần số quét, nên một khung hình dính vạch là phản lại thông điệp.\n\nĐiểm bán thứ hai là độ chuẩn màu — thứ mà đưa qua máy quay rồi qua hậu kỳ thì rất dễ sai lệch.",
    approach:
      "Tốc độ cửa trập được dò khớp với tần số quét của màn hình ngay từ đầu buổi, và chốt cứng ở đó suốt cả buổi quay. Đây là việc phải làm trước tiên, vì mọi cảnh quay được trước khi khớp đều bỏ đi.\n\nMàu thì để màn hình tự nói. Đèn trong phòng giữ trung tính và không đẩy màu ở khâu hậu kỳ cho các cảnh có màn hình, vì chỉnh màu một sản phẩm đang quảng cáo độ chuẩn màu là tự phá luôn cái đang bán.\n\nPhần nội dung trên màn hình chọn theo đúng công việc mà người mua sẽ làm với nó. Dựng phim, dàn trang, xử lý ảnh — thấy chính công việc của mình chạy mượt trên đó thì thuyết phục hơn mọi con số thông số.",
  },

  // ─────────────────────────────── Lookbook & Thời trang ──────────────────────
  {
    slug: "super-girl",
    ten: "Super girl",
    challenge:
      "Bộ sưu tập đứng giữa hai tính cách — vừa ngọt vừa cá tính. Đó là hai hướng kéo ngược nhau trong cách quay.\n\nNgọt thì cần ánh sáng mềm, chuyển động chậm, tông màu nhạt. Cá tính thì cần tương phản mạnh, nhịp gấp, dứt khoát. Chọn hẳn một bên là mất nửa bộ sưu tập, mà trộn đều thì ra một thứ nhạt nhoà không rõ là gì.\n\nPhim ngắn lại không có nhiều thời gian để giải thích. Người xem quyết định ở lại hay lướt qua trong vài giây đầu.",
    approach:
      "Hai tính cách được tách theo từng đoạn chứ không hoà vào nhau. Phim chia thành các mảng, mảng này giữ giọng ngọt trọn vẹn, mảng kia chuyển hẳn sang gấp và mạnh, và chỗ chuyển giữa hai mảng chính là điểm nhấn.\n\nCách này giữ được cả hai đầu tính cách ở đúng độ đậm của nó, thứ mà việc pha trộn không bao giờ làm được.\n\nMấy giây đầu dành cho đoạn mạnh nhất, không phải cho cảnh giới thiệu. Với nội dung dạng ngắn thì phần dẫn dắt là thứ xa xỉ, còn đoạn nào giữ chân được người xem thì phải đưa lên trước.",
  },
  {
    slug: "pom-peche",
    ten: "Pom peche",
    challenge:
      "Đồ thể thao cho pickleball, chụp thành bộ ảnh mười tấm.\n\nĐồ thể thao có một mâu thuẫn cố hữu. Nó được thiết kế cho vận động, nhưng ảnh thì đứng yên — mà một bộ đồ thể thao chụp trong tư thế đứng im thì trông không khác gì đồ mặc ở nhà.\n\nPhom dáng cũng là điểm bán ở đây, và phom chỉ đúng khi cơ thể đang ở đúng tư thế chơi thật chứ không phải tư thế tạo dáng.",
    approach:
      "Buổi chụp đặt trong bối cảnh sân đấu và người mẫu chơi thật chứ không giả vờ. Máy bấm liên tục trong lúc bóng đang qua lại, rồi chọn ra những khung có dáng đẹp nhất.\n\nCách này bỏ đi rất nhiều khung hình so với cách chụp tạo dáng, nhưng những khung ăn được thì mang theo thứ không dựng lại được — cơ thể đang thật sự dồn lực, vạt áo đang thật sự bay theo cú vung tay.\n\nMáy hạ thấp hơn tầm mắt ở phần lớn các tấm. Góc đó kéo dài đường chân và làm người trong ảnh trông vững hơn, đúng thứ một bộ đồ thể thao cần khoe.",
  },
  {
    slug: "viet-anh-x-vinfast",
    ten: "Việt Anh x Vinfast",
    challenge:
      "Một diễn viên và một chiếc xe cỡ lớn trong cùng khung hình, và cả hai đều phải là nhân vật chính.\n\nĐây là bài toán về cân bằng. Chiếc xe to hơn con người rất nhiều, nên đặt cạnh nhau một cách tự nhiên thì xe nuốt mất người. Đẩy người lên trước cho nổi thì xe thành cái phông.\n\nBộ ảnh lại chọn hướng tương phản cao, mà tương phản mạnh trên khuôn mặt người là con dao hai lưỡi — nó tạc ra khí chất, nhưng quá tay một chút là thành thô.",
    approach:
      "Nguồn sáng chính đặt chếch một bên và giữ chung cho cả người lẫn xe, để hai chủ thể nằm trong cùng một hệ ánh sáng thay vì mỗi bên một kiểu. Sự thống nhất đó là thứ khiến người xem đọc ra một hình ảnh chứ không phải hai vật ghép lại.\n\nĐộ tương phản đẩy mạnh ở phần thân xe và giữ lại ở phần mặt. Kim loại chịu được mảng tối sâu và càng đẹp hơn khi có nó, còn da người thì cần một chút sáng dội lại để không mất khối.\n\nBố cục để người đứng ở tiền cảnh và xe lùi lại phía sau nhưng vẫn vào khung trọn vẹn. Khoảng cách đó bù lại chênh lệch kích thước mà không phải cắt bớt chiếc xe.",
  },

  // ──────────────────────────────────── TVC ───────────────────────────────────
  {
    slug: "greensm",
    ten: "GreenSM",
    challenge:
      "Phim quảng cáo cho dịch vụ xe limousine. Phần lớn nội dung diễn ra bên trong khoang xe, và khoang xe là một trong những bối cảnh chật nhất để quay.\n\nKhông lùi máy ra xa được, không dựng đèn ở đâu được, và mỗi lần đổi góc là cả người lẫn thiết bị phải ra ngoài rồi vào lại.\n\nThứ cần bán lại là sự thoải mái và rộng rãi. Quay trong một không gian chật để cho ra cảm giác rộng là đi ngược với chính điều kiện đang có.",
    approach:
      "Ống kính góc rộng đặt sát các góc khoang xe. Đặt đúng chỗ thì góc rộng kéo giãn chiều sâu và khoang xe trên phim trông thoáng hơn ngoài đời, đặt sai thì nó bẻ cong đường nét và làm nội thất trông rẻ đi.\n\nÁnh sáng dùng chính cửa kính xe. Nguồn sáng ngoài trời đi qua kính cho ra chất sáng mềm và tự nhiên, mà quan trọng hơn là nó không chiếm mất chỗ ngồi nào trong xe.\n\nCảnh nội thất quay khi xe đứng yên và cảnh chuyển động quay riêng từ ngoài, rồi ghép lại ở khâu dựng. Cách này cho hình ổn định hơn hẳn so với cố quay mọi thứ trong lúc xe đang chạy.",
  },
  {
    slug: "go-kart",
    ten: "Go Kart",
    challenge:
      "Xe kart chạy nhanh, bám sát mặt đường, và đường đua thì kín — nó vòng qua vòng lại trong một khu vực hẹp.\n\nCái nhanh mới là phần khó. Máy đặt xa thì xe thành một chấm nhỏ và mất hết cảm giác tốc độ, đặt gần thì xe lướt qua khung trong chớp mắt, không kịp thấy gì.\n\nTốc độ trên phim còn là một ảo giác. Một chiếc xe chạy rất nhanh quay bằng góc máy sai thì trên màn hình trông chậm hơn thực tế nhiều.",
    approach:
      "Máy hạ thấp gần sát mặt đường. Ở độ cao đó thì mặt đường trôi qua khung rất nhanh, và chính cái nền đang lao vụt kia mới là thứ người xem đọc ra tốc độ, chứ không phải bản thân chiếc xe.\n\nCác khúc cua được chọn làm điểm đặt máy chính. Xe vào cua thì thân nghiêng, bánh trượt, tay lái đánh gấp — cùng một tốc độ nhưng ở khúc cua trông máu lửa hơn hẳn đoạn thẳng.\n\nMột phần cảnh quay ở tốc độ khung hình cao để làm chậm lại lúc dựng. Đoạn chậm đặt xen giữa các đoạn nhanh làm cho nhịp phim có chỗ nhấn, và nó cũng là lúc duy nhất người xem kịp nhìn rõ chiếc xe.",
  },
  {
    slug: "cho-tinh-sapa",
    ten: "Chợ tình Sapa",
    challenge:
      "Một nhà hàng dựng theo kiến trúc Tây Bắc, và phim phải nói được cả ba thứ — không gian, món ăn, và cái chất văn hoá nằm sau chúng.\n\nBa thứ đó cần ba cách quay khác nhau. Kiến trúc cần góc rộng và ánh sáng đều, món ăn cần cận cảnh và ánh sáng đặt riêng, còn không khí giao lưu thì cần người thật đang ngồi trong đó.\n\nNhà hàng dạng này lại thường dùng nhiều gỗ tối và đèn vàng, đẹp khi ngồi nhưng thiếu sáng khi quay.",
    approach:
      "Không gian quay vào lúc còn ánh sáng ngoài trời lọt vào, khi ánh sáng tự nhiên và đèn vàng của nhà hàng còn cân được với nhau. Quay muộn hơn thì chỉ còn đèn vàng và toàn bộ phần gỗ chìm hết vào tối.\n\nMón ăn tách ra quay riêng với nguồn sáng đặt cho từng đĩa. Đây là phần duy nhất trong phim không dùng ánh sáng sẵn có, vì kết cấu món ăn cần thứ ánh sáng mà một nhà hàng không bao giờ có.\n\nChi tiết kiến trúc và hoa văn được quay cận, xen vào giữa các cảnh rộng. Chính những cận cảnh đó mang phần văn hoá vào phim, thứ mà một cú toàn cảnh chỉ cho thấy là căn phòng đẹp.",
  },
  {
    slug: "parasola",
    ten: "Parasola",
    challenge:
      "Phim quảng cáo cho kem chống nắng. Sản phẩm bán ba thứ cùng lúc — mỏng nhẹ, nâng tông, và chống tia UV.\n\nCả ba đều khó đưa lên hình. Cái mỏng chỉ cảm được bằng tay, cái nâng tông là một khác biệt rất nhỏ trên da, còn màng lọc UV thì hoàn toàn vô hình.\n\nĐây cũng là nhóm hàng mà người xem đã quen với cách quảng cáo phóng đại, nên mọi thứ trông quá hoàn hảo đều bị họ trừ điểm ngay.",
    approach:
      "Phim bám vào lúc sản phẩm được thoa lên da. Đó là khoảnh khắc duy nhất cả ba điểm bán cùng nhìn thấy được — kem trải ra rồi biến mất là cái mỏng, sắc da sáng lên một chút là phần nâng tông.\n\nMáy quay cận ở khoảng cách rất gần và ánh sáng đánh chếch để bắt được kết cấu bề mặt da. Chiếu sáng thẳng thì da phẳng lì và không còn gì để so sánh trước với sau.\n\nMàu giữ trung thực và không làm mịn da ở hậu kỳ. Đây là lựa chọn trái với thói quen của ngành hàng này, nhưng một làn da còn giữ được lỗ chân lông thì đáng tin hơn nhiều so với một bề mặt hoàn hảo mà ai cũng biết là đã chỉnh.",
  },
];

await connectDB();

const dau = CHI_XEM ? "»" : "+";
let xong = 0;
let khongThay = 0;

for (const b of BAI) {
  const p = await Project.findOne({ slug: b.slug });
  if (!p) {
    console.log(`  ? KHONG THAY "${b.slug}" — bo qua`);
    khongThay++;
    continue;
  }

  const cu = (p as { caseStudy?: { challenge?: { vi?: string } } }).caseStudy?.challenge?.vi ?? "";
  console.log(
    `${dau} ${b.ten.padEnd(28)} ${String(b.challenge.length + b.approach.length).padStart(5)} ky tu` +
      `${cu ? "   (GHI DE ban cu " + cu.length + " ky tu)" : ""}`,
  );

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

console.log(
  `\n${CHI_XEM ? "[CHI XEM] " : ""}Xong ${CHI_XEM ? BAI.length - khongThay : xong}/${BAI.length} bai.` +
    (khongThay ? `  KHONG THAY ${khongThay} du an.` : ""),
);
await disconnectDB();
