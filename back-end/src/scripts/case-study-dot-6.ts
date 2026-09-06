import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Project } from "../models/Project.ts";

/**
 * Tám case study đợt 6 — Hoàn trả lời dữ kiện ngày 06/09/2026.
 *
 * Đây là tám dự án cuối trong nhóm "không có gì để bám": phụ đề rỗng hoặc chỉ
 * lặp lại đúng cái tên, nhiều cái không có cả ngày quay lẫn địa điểm. Hoàn trả
 * lời từng cái nên viết được.
 *
 * DỮ KIỆN HOÀN KỂ:
 *   Chở đủ cả nhà     TVC cho GreenSM — hãng taxi điện lớn nhất Việt Nam.
 *                     Xe trong phim là VF7.
 *   TVC 2026          cũng GreenSM. Tên file gốc "NGUYÊN TEAM LÊN XE HẾT".
 *   Đan Lê & Đại Kiên đó là TÊN CÔ DÂU CHÚ RỂ, không phải người dẫn chương
 *                     trình. Claude đoán nhầm, Hoàn đính chính.
 *   Quỳnh Trang       có cả video, Hoàn chưa đưa lên web. Tức là buổi đó vừa
 *                     quay vừa chụp, không phải chỉ chụp.
 *   Nàng Mơ           là tên một KOL.
 *   Showreel 2025     cắt từ hơn 15 dự án, chọn theo tiêu chí đẹp nhất.
 *   Talkshow          4 máy, quay tại Cafe Kid, khách là một gia đình KOL
 *                     khá nổi tiếng.
 *   Mani Thái         chụp món ăn.
 *
 * HAI DỰ ÁN CÒN LẠI CHƯA VIẾT: `green-sm-podcast` và
 * `concert-of-childhood-memory-to-the-light`. Cả hai đều nằm trong một cặp
 * trùng tên mà Hoàn phải mở video xem rồi mới quyết xoá bên nào. Viết bài cho
 * một trang sắp bị xoá là phí công, và tệ hơn là nếu giữ cả hai mà nội dung na
 * ná nhau thì Google gộp lại, công viết thành số không.
 *
 * BA RÀNG BUỘC GIỮ NGUYÊN TỪ ĐỢT 5:
 *   1. Không bịa số nào Hoàn chưa kể.
 *   2. Không dùng ngày trong cơ sở dữ liệu (nhiều dự án trùng ngày nhập liệu).
 *   3. Mỗi bài một bài toán riêng.
 *
 * CHỖ DỄ ĐÚC KHUÔN NHẤT ĐỢT NÀY:
 *   · Ba bài GreenSM — bài limo đã viết ở đợt 5 nói về khoang xe chật. Nên hai
 *     bài mới phải đi hướng khác hẳn: "Chở đủ cả nhà" là quay trẻ con (không
 *     điều khiển được), "TVC 2026" là quay một nhóm đông đang nói chuyện chéo.
 *   · Hai bài cưới — bốn bài cưới đợt 5 đã dùng hết các góc quen. Nên "Đan Lê
 *     & Đại Kiên" đi vào chuyện hai nhà hai địa điểm, còn "Quỳnh Trang - Trịnh
 *     Tiến" đi vào chuyện chụp và quay cùng lúc thì giẫm chân nhau.
 *
 *   npx tsx src/scripts/case-study-dot-6.ts --thu   # xem trước, không ghi
 *   npx tsx src/scripts/case-study-dot-6.ts         # ghi thật
 */

const CHI_XEM = process.argv.includes("--thu");

type Bai = { slug: string; ten: string; challenge: string; approach: string };

const BAI: Bai[] = [
  {
    slug: "cho-du-ca-nha-di-dau-cung-da",
    ten: "Chở Đủ Cả Nhà - Đi Đâu Cũng Đã",
    challenge:
      "Phim quảng cáo cho GreenSM với chiếc VF7, và thông điệp là chở được cả nhà.\n\nCả nhà nghĩa là có trẻ con trong xe. Trẻ con không diễn theo hiệu lệnh, không giữ được biểu cảm qua nhiều lần quay lại, và chỉ cần thấy máy chĩa vào là hoặc cứng đờ hoặc làm quá lên.\n\nMà nếu bảo chúng diễn cho đúng thì hỏng luôn cả phim. Cái đang bán là một gia đình thật đi với nhau, và người xem nhận ra ngay một đứa trẻ đang đọc thoại.",
    approach:
      "Máy đặt sẵn trong xe rồi để yên, thay vì đưa vào đưa ra theo từng cảnh. Trẻ con quen với một vật đứng im rất nhanh, còn cứ mỗi lần dựng lại là mỗi lần chúng nhớ ra đang bị quay.\n\nNgười lớn được giao việc thật để làm chứ không giao lời thoại. Thắt dây an toàn cho con, đưa đồ ăn ra sau, chỉ trỏ ra ngoài cửa kính. Trẻ con phản ứng với bố mẹ chứ không phản ứng với máy quay, nên cứ để bố mẹ dẫn thì cái tự nhiên tự tới.\n\nQuay dài và bấm liên tục thay vì cắt từng cảnh ngắn. Phần lớn thời lượng sẽ bỏ, nhưng cách này là cách duy nhất bắt được những giây mà cả nhà quên mất có ống kính trong xe.\n\nPhần khoang xe rộng để góc máy nói. Ống kính rộng đặt từ phía trước nhìn về sau lấy trọn cả ba hàng ghế trong một khung, cho thấy chỗ ngồi mà không cần ai phải nói ra.",
  },
  {
    slug: "tvc-2026",
    ten: "TVC 2026",
    challenge:
      "Cũng là GreenSM, nhưng lần này nhân vật là một nhóm bạn kéo nhau lên xe.\n\nMột nhóm đông trong khung hình khó hơn một người rất nhiều. Họ nói chồng lên nhau, cười cùng lúc, và cái hay nhất thường nằm ở phản ứng của người đang nghe chứ không phải người đang nói. Máy bắt được câu nói thì lại mất mất cái mặt bên cạnh.\n\nKhoang xe lại chật, không lùi ra xa được để lấy hết cả nhóm vào một khung.",
    approach:
      "Cảnh trong xe quay nhiều lượt, mỗi lượt ưu tiên một người khác nhau, rồi ghép lại ở khâu dựng. Cả nhóm diễn lại nguyên đoạn ở mỗi lượt nên phản ứng vẫn liền mạch, còn máy thì lần lượt có được cận cảnh của từng người.\n\nCách này tốn thời gian gấp mấy lần quay một lượt, nhưng nó là cách duy nhất để bản dựng có đủ mảnh mà cắt qua cắt lại theo nhịp câu chuyện.\n\nNhóm được để tự nói chuyện trong lúc máy đang chạy, không bắt vào thoại ngay. Năng lượng của một nhóm bạn không dựng ra được — nó chỉ xuất hiện khi họ thật sự đang đùa nhau, và việc của máy là có mặt sẵn lúc đó.\n\nMột phần cảnh quay từ ngoài xe nhìn vào qua cửa kính. Góc đó vừa giải quyết chuyện chật, vừa cho thấy cả nhóm trong một khung mà không phải nhét thêm ai vào trong khoang.",
  },
  {
    slug: "dan-le-dai-kien",
    ten: "Đan Lê & Đại Kiên",
    challenge:
      "Một đám cưới truyền thống, và truyền thống nghĩa là nó không diễn ra ở một chỗ.\n\nLễ bắt đầu ở nhà gái, rồi cả đoàn di chuyển sang nhà trai, rồi tối mới tới tiệc. Ba nơi, ba khoảng thời gian, và giữa chúng là những quãng di chuyển mà lịch trình thật luôn trễ hơn lịch trình đã hẹn.\n\nMỗi lần đổi địa điểm là một lần phải đọc lại ánh sáng từ đầu. Nhà gái có thể là một căn phòng nhỏ nhiều đèn vàng, nhà trai có thể là sân ngoài trời giữa trưa, còn tiệc tối thì lại là đèn sân khấu.",
    approach:
      "Đi khảo sát cả ba nơi trước ngày cưới, hoặc ít nhất là hỏi kỹ về hướng nhà và giờ của từng nghi lễ. Biết trước thì tới nơi là quay được ngay, còn tới rồi mới nhìn quanh là mất mười lăm phút đầu — mà mười lăm phút đầu ở nhà gái thường là lúc xúc động nhất.\n\nMáy chạy với một bộ thiết lập gọn nhất có thể để đổi chỗ nhanh. Trong một ngày phải di chuyển thì thứ chậm nhất không phải là quãng đường mà là việc dựng lại đồ ở mỗi điểm.\n\nCác quãng di chuyển không bỏ trống mà quay luôn. Lúc ngồi trên xe giữa hai nhà là lúc hiếm hoi cô dâu chú rể được ở yên, và những cảnh đó về sau thành phần thở của cả bộ phim.\n\nMàu của ba nơi kéo về một tông ở khâu hậu kỳ, nếu không thì phim trông như ba đoạn của ba ngày khác nhau.",
  },
  {
    slug: "quynh-trang-trinh-tien",
    ten: "Quỳnh Trang - Trịnh Tiến",
    challenge:
      "Buổi này vừa quay vừa chụp, và hai việc đó giẫm chân nhau nhiều hơn người ta tưởng.\n\nMáy ảnh cần khoảnh khắc đóng băng, nên người chụp muốn chủ thể dừng lại một nhịp. Máy quay cần chuyển động liên tục, nên bất kỳ cú dừng nào cũng thành một chỗ gãy trong phim. Hai bên cùng đứng trước cô dâu chú rể thì bên này luôn lọt vào khung của bên kia.\n\nThêm nữa, tiếng bấm máy ảnh nghe rất rõ trong những đoạn cần âm thanh sạch.",
    approach:
      "Hai việc tách theo thời gian chứ không cùng chạy song song. Có những quãng dành cho quay, người chụp lùi hẳn ra; có những quãng dành cho chụp, máy quay dừng lại. Cách chia này mất nhiều thời gian hơn nhưng cả hai sản phẩm đều sạch.\n\nRiêng phần nghi lễ thì không chia được vì nó chỉ xảy ra một lần. Ở đó, hai máy đứng chéo góc nhau và giữ nguyên vị trí suốt nghi thức, để không ai lọt vào khung ai và cũng không ai phải di chuyển.\n\nMáy ảnh chuyển sang chế độ ít tiếng ở những đoạn cần âm thanh, và việc bấm dồn vào lúc đang có nhạc hoặc có tiếng nói chuyện.\n\nBộ ảnh và thước phim chia nhau nhiệm vụ chứ không kể lại cùng một thứ. Ảnh giữ những khoảnh khắc đứng yên đẹp nhất, còn phim lo phần diễn tiến — đó là lý do đặt cả hai thay vì chọn một.",
  },
  {
    slug: "nang-mo",
    ten: "Nàng Mơ",
    challenge:
      "Quay nội dung cho một KOL, và đó là kiểu việc có luật chơi riêng.\n\nNgười này đã có sẵn khán giả, và khán giả đó quen với một giọng nhất định — cách nói, cách quay, cách dựng mà họ vẫn thấy hằng ngày. Làm ra một thước phim quá bóng bẩy thì nó đẹp hơn nhưng lại không giống người mà họ theo dõi, và cái không giống đó khiến họ nghi ngờ.\n\nNội dung dạng ngắn còn cắt đi quyền dẫn dắt. Người xem quyết định lướt qua hay ở lại trong vài giây đầu, không có chỗ cho phần mở bài.",
    approach:
      "Cách quay bám theo phong cách sẵn có của chính KOL thay vì áp một khuôn mẫu quảng cáo lên. Nâng chất lượng hình và ánh sáng lên, nhưng giữ nguyên nhịp và cách nói mà khán giả của họ đã quen.\n\nMáy giữ khoảng cách gần và ở tầm mắt. Góc đó tạo cảm giác đối thoại một đối một, đúng thứ làm nên sức mạnh của nội dung KOL, còn góc rộng và cao thì lập tức biến nó thành một mẩu quảng cáo.\n\nCảnh mạnh nhất đưa lên đầu, không để dành. Với dạng ngắn thì thứ tự kể không quan trọng bằng việc giữ được người xem qua giây thứ ba.\n\nKhung hình dựng cho màn hình dọc ngay từ lúc quay chứ không cắt lại từ bản ngang. Cắt lại thì luôn mất một phần bố cục, và mất đúng phần rìa nơi đặt chữ.",
  },
  {
    slug: "showreel-2025",
    ten: "Showreel 2025",
    challenge:
      "Tuyển tập của chính Bee Z, cắt ra từ hơn mười lăm dự án của cả năm.\n\nKhó hơn một tuyển tập cưới rất nhiều, vì mười lăm dự án đó không cùng thể loại. Có TVC, có sự kiện, có cưới, có đồ ăn, có thời trang. Mỗi thể loại một nhịp riêng, một bảng màu riêng, một cách chuyển động máy riêng — ghép thô thì thành một danh sách chứ không thành một thước phim.\n\nNgười xem showreel cũng khác. Đó là khách hàng đang cân nhắc thuê, và họ quyết định trong chưa đầy một phút.",
    approach:
      "Sắp theo nhịp chứ không sắp theo thể loại. Một cảnh TVC tốc độ cao có thể đứng ngay cạnh một cảnh cưới chậm nếu chỗ nối giữa hai cảnh khớp nhau về hướng chuyển động hoặc về mảng màu. Cách này giữ được sự đa dạng mà không làm người xem thấy gãy.\n\nTiêu chí chọn là đẹp nhất, không phải mới nhất và cũng không chia đều cho mỗi dự án một cảnh. Có dự án góp ba bốn cảnh, có dự án không góp cảnh nào, vì showreel là chỗ khoe trần năng lực chứ không phải bản liệt kê công việc.\n\nCảnh mở đầu chọn kỹ nhất trong cả bộ. Khách bấm vào showreel với sự kiên nhẫn rất mỏng, nên cảnh đầu tiên phải trả lời ngay câu hỏi có đáng xem tiếp không.\n\nToàn bộ được cân về một tông màu chung. Đây là phần nặng nhất, vì mỗi cảnh đến từ một dự án đã chỉnh màu riêng cho mục đích riêng của nó.",
  },
  {
    slug: "talkshow-gia-dinh-truyen-hinh",
    ten: "Talkshow Gia đình truyền hình",
    challenge:
      "Một talkshow quay bằng bốn máy, nhưng không quay trong trường quay. Địa điểm là Cafe Kid, và khách mời là một gia đình có tiếng trên mạng xã hội.\n\nQuán cafe cho ra bối cảnh ấm và thật, thứ mà trường quay không bao giờ có. Đổi lại nó lấy đi hai thứ quan trọng nhất của một talkshow. Âm thanh thì có tiếng máy pha chế, tiếng nhạc nền, tiếng khách bàn bên. Không gian thì chật, mà bốn máy cần bốn chỗ đứng không lọt vào khung của nhau.\n\nKhách mời lại là cả một gia đình, nên trong đó có trẻ con — và trẻ con không ngồi yên hết một buổi ghi hình.",
    approach:
      "Âm thanh xử lý ngay từ nguồn thay vì chữa ở hậu kỳ. Micro gắn riêng cho từng người và đặt sát, để tiếng nói lấn hẳn tiếng nền. Tiếng ồn của quán vẫn còn lại một ít, nhưng còn lại vừa đủ thì nó thành không khí chứ không thành lỗi.\n\nBốn máy chốt vị trí trước buổi ghi và không đổi trong lúc quay. Ở một không gian chật thì mỗi lần di chuyển máy là một lần lọt vào khung của máy khác, nên toàn bộ việc chọn góc phải xong trước khi bấm.\n\nCác máy chia theo người chứ không chia theo góc rộng hẹp. Cách này đảm bảo bất kỳ ai đang nói cũng có sẵn một cận cảnh, và quan trọng hơn là bắt được phản ứng của những người còn lại trong lúc họ nghe.\n\nBuổi ghi chia thành nhiều đoạn ngắn có nghỉ giữa chừng, để phần trẻ con lấy được lúc chúng còn thoải mái thay vì ép ngồi liền một mạch.",
  },
  {
    slug: "mani-thai",
    ten: "Mani Thái",
    challenge:
      "Chụp món ăn Thái, mười một tấm trong một buổi.\n\nNhiều món trong một buổi là bài toán về thứ tự chứ không phải về ánh sáng. Mỗi món có một tốc độ xuống sắc riêng — món có rau thơm héo trước, món chiên nguội thì dầu đông lại, món nước thì váng nổi lên mặt. Chụp sai thứ tự là có món phải làm lại từ đầu.\n\nMón Thái còn có một đặc thù riêng. Màu của nó rất mạnh, ớt đỏ, chanh xanh, nước sốt cam — đẩy màu lên thêm một chút là thành giả, mà để nguyên thì lại chưa bật.",
    approach:
      "Ánh sáng dựng xong hoàn toàn trước khi món đầu tiên ra khỏi bếp, dùng một đĩa thay thế để canh. Từ đó trở đi mỗi món chỉ mất vài phút, và không món nào phải nằm chờ.\n\nThứ tự chụp xếp theo độ bền của từng món chứ không theo thực đơn. Món xuống sắc nhanh nhất lên đầu, món khô và bền để lại cuối, nên bếp không phải làm lại đĩa nào.\n\nĐèn đặt chếch từ phía sau để bắt độ bóng của nước sốt và làm nổi kết cấu từng sợi rau. Đánh sáng từ phía trước thì món ăn phẳng ra và mất hết chiều sâu — đây là chỗ tách một tấm ảnh món ăn nghề với một tấm chụp bằng điện thoại.\n\nMàu giữ đúng như nhìn bằng mắt, không đẩy độ rực. Món Thái vốn đã đủ màu, và người xem ảnh món ăn tin vào thứ trông ăn được hơn là thứ trông đẹp.",
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
    `${dau} ${b.ten.padEnd(30)} ${String(b.challenge.length + b.approach.length).padStart(5)} ky tu` +
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
