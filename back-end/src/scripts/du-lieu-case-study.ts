/**
 * NGUỒN của 6 case study đầu tiên — Hoàn duyệt từng bài ngày 18/08/2026.
 *
 * CHỈ TIẾNG VIỆT, cố ý. Ô nhập trong Portal (Dự án → sửa → Bài toán / Cách làm /
 * Kết quả) chỉ có tiếng Việt; web tự hiện bản tiếng Việt cho cả khách xem tiếng
 * Anh khi chưa có bản dịch. Viết sẵn bản tiếng Anh ở đây thì lần sau Hoàn sửa
 * tiếng Việt trong Portal, bản tiếng Anh nằm lại và hai thứ tiếng nói hai đằng —
 * tệ hơn hẳn việc hiện tiếng Việt.
 *
 * KHÔNG phải dự án nào cũng có đủ ba phần. Bỏ trống là đúng, không phải thiếu
 * sót: khối trên web tự ẩn phần rỗng và đánh số lại theo phần thực sự có.
 */

export type BaiCaseStudy = {
  /** Khớp theo `slug` của dự án — bền hơn so tên. */
  slug: string;
  /** Tên đọc cho người, chỉ để in ra lúc chạy lệnh. */
  ten: string;
  challenge: string;
  approach: string;
  /** Bỏ trống khi không có số đo được. Thà thiếu còn hơn nhồi cho đủ ba khối. */
  result?: string;
};

export const CASE_STUDY: BaiCaseStudy[] = [
  {
    slug: "80-nam-an-ninh-nhan-dan",
    ten: "80 Năm An Ninh Nhân Dân",
    challenge:
      "Một sự kiện cấp quốc gia diễn ra đúng một lần, theo kịch bản cứng, và không có khái niệm \"quay lại lần nữa\". Team quay không được phép làm gián đoạn nghi thức, cũng không được đứng sai chỗ — mà vẫn phải bắt trọn những khoảnh khắc chỉ xảy ra trong vài giây. Hỏng một cảnh là mất vĩnh viễn, hậu kỳ không chữa được.",
    approach:
      "Bee Z khảo sát hiện trường trước ngày quay và chốt sẵn vị trí từng máy theo kịch bản chương trình. Hôm đó không ai phải đi tìm chỗ đứng giữa lúc nghi thức đang diễn ra — di chuyển vào lúc ấy vừa dễ lỡ cảnh, vừa dễ lọt vào khung của các đơn vị ghi hình khác.\n\nBốn máy, sáu người. Nhiều hơn một buổi quay thường, và có lý do: sự kiện không quay lại được thì mỗi khoảnh khắc quan trọng phải có hơn một góc ghi lại — phòng khi một máy lỡ nhịp hoặc bị người che.",
    result: "Bàn giao toàn bộ phim sau 4 ngày kể từ khi sự kiện kết thúc.",
  },
  {
    slug: "vf9-teaser-the-mark-of-leadership",
    ten: "VF9 Teaser",
    challenge:
      "VF9 nằm ở phân khúc SUV điện cỡ lớn — nơi người mua chốt bằng cảm giác \"xứng tầm\" nhiều hơn bằng bảng thông số. Nhưng gần như cả phân khúc đang quay giống nhau: studio nền trắng, xe xoay vòng, chữ chạy thông số. Một teaser chỉ có vài giây trước khi người xem lướt qua, nên nó phải dựng được cảm giác bề thế ngay từ khung hình đầu tiên — bằng hình ảnh, không bằng lời thuyết minh.",
    approach:
      "Đưa xe ra bối cảnh đô thị thật thay vì dựng trong studio. Chính đường phố và khối nhà xung quanh trở thành thước đo kích thước: người xem cảm được độ bề thế thay vì được nói cho biết. Trong studio thì mọi chiếc xe đều bằng nhau.\n\nQuay trọn một ngày. Với xe đặt ngoài trời, ánh sáng đổi theo giờ là thứ quyết định khối và đường nét của thân xe — quay cả ngày cho phép chọn đúng khoảnh khắc sáng cho từng cảnh, thay vì phải chấp nhận thứ ánh sáng sẵn có trong một khung giờ hẹp.",
    result: "400.000 lượt xem trên Facebook.",
  },
  {
    slug: "dinh-tu-x-pnj",
    ten: "Đình Tú x PNJ",
    challenge:
      "Trang sức là mặt hàng mà giá trị nằm ở chi tiết cỡ milimet. Nhưng nội dung dạng ngắn thì người xem cầm điện thoại và quyết định lướt tiếp hay không trong hai giây đầu.\n\nHai đòi hỏi này kéo ngược nhau: quay cận để thấy chi tiết thì mất bối cảnh và mất người xem ngay giây đầu; quay rộng cho hấp dẫn thì món trang sức biến mất trên màn hình sáu inch.",
    approach:
      "Bốn đèn cho một món đồ nằm gọn trong lòng bàn tay. Kim loại và đá chỉ phản chiếu thứ đặt quanh chúng, nên mỗi bề mặt nghiêng theo một hướng lại cần một nguồn sáng riêng để bắt đúng góc phản chiếu của nó. Sản phẩm càng nhiều chi tiết thì càng nhiều mặt phải lo — thiếu một nguồn là một mảng chi tiết chìm vào tối, hoặc cháy trắng mất nét.\n\nVới sản phẩm thường, ánh sáng để người xem nhìn thấy hình dáng. Với trang sức, ánh sáng chính là thứ người xem nhìn thấy.",
    result: "3 triệu lượt xem trên tất cả nền tảng.",
  },
  {
    slug: "owen",
    ten: "OWEN",
    challenge:
      "Lookbook thời trang có một cái bẫy: ảnh đẹp nhưng không bán được hàng. Người xem khen bộ ảnh rồi không nhớ nổi cái áo. Với một thương hiệu thời trang nam, hình ảnh phải làm được hai việc cùng lúc — dựng được hình ảnh thương hiệu, mà vẫn cho người mua thấy rõ dáng áo, chất vải, cách phối.",
    approach:
      "OWEN đã quay với Bee Z bốn lần. Riêng buổi này là ba mươi look, quay trong studio.\n\nBa mươi look và studio gắn với nhau: ngoài trời thì ánh sáng đổi theo giờ, ba mươi look sẽ ra ba mươi tông màu khác nhau và cả bộ không ghép chung được vào một chiến dịch. Studio giữ ánh sáng giống hệt nhau từ look đầu tới look cuối.\n\nBa mươi look trong một buổi cũng có nghĩa mỗi bộ chỉ chiếm một khoảng thời gian rất ngắn. Thứ quyết định lúc đó không phải thiết bị mà là chuẩn bị: hệ đèn dựng một lần dùng cho cả ba mươi bộ, để thời gian dồn vào chụp thay vì căn lại từ đầu mỗi lần thay đồ.",
    // Hoàn chốt bỏ: "dùng cho chiến dịch" là mô tả công dụng, không phải kết quả đo được.
  },
  {
    slug: "fresh-garden-mooncake-tron-vi-thu-tron-tinh",
    ten: "Fresh Garden Mooncake",
    challenge:
      "Bánh trung thu là mặt hàng thời vụ — cả năm gói gọn trong vài tuần bán hàng. Phim phải lên đúng lúc thị trường bắt đầu mua: sớm hơn thì nguội, muộn hơn thì mất mùa, và không có mùa thứ hai để sửa.\n\nKhó hơn nữa: đúng mùa đó mọi thương hiệu đều tung ảnh bánh đẹp. Một thước phim chỉ đẹp thôi thì chìm nghỉm giữa hàng chục thước phim cũng đẹp.",
    approach:
      "Không dựng phim quanh chiếc bánh, mà dựng quanh lý do người ta mua bánh trung thu — mang về cho gia đình. Ánh sáng ấm, nhịp chậm, để chiếc bánh xuất hiện như một phần của khung cảnh sum họp chứ không phải nhân vật chính đứng giữa nền trơn. Ai cũng quay được bánh đẹp; cảm giác đoàn viên thì phải dựng.\n\nPhần không ai nhìn thấy trên phim: bánh trung thu dưới đèn không giữ được lâu — mặt bánh bóng dầu và xỉn đi sau vài phút. Nên buổi quay chạy theo nhịp thay bánh liên tục, mỗi lần vào khung là một chiếc mới còn nguyên mặt. Đó là lý do một cảnh dài vài giây trên phim tốn nhiều bánh hơn người xem tưởng.",
    // Hoàn xác nhận không có chỉ số nào.
  },
  {
    slug: "dinh-tu-ngoc-huyen-the-movie-of-us",
    ten: "Đình Tú & Ngọc Huyền",
    challenge:
      "Chụp cưới cho người của công chúng có một áp lực mà đám cưới thường không có: hình ảnh sẽ được hàng trăm nghìn người xem và bị đem so với mọi bộ ảnh cưới đã ra trước đó. Nhưng chạy theo việc \"làm cho hoành tráng\" thì mất đúng thứ khiến ảnh cưới đáng giá — cảm giác đây là ngày của hai người thật, không phải một buổi chụp quảng cáo.\n\nThêm nữa, ngày cưới không có lịch quay. Không ai được yêu cầu cô dâu khóc lại lần nữa cho đúng góc.",
    approach:
      "Một máy. Không pre-wedding, không buổi dựng cảnh trước.\n\nVới đám cưới của người nổi tiếng, số người của bên chụp là thứ khách mời cảm nhận rõ nhất: càng đông càng giống một buổi sản xuất, càng ít càng giống một ngày cưới thật. Một máy nghĩa là một người di chuyển — không có tiếng gọi nhau chỉnh vị trí, không ai chắn tầm nhìn của khách mời, không ai lọt vào khung điện thoại của gia đình.\n\nĐổi lại, người cầm máy không có phương án hai: mỗi khoảnh khắc chỉ có một cơ hội và một góc duy nhất. Chọn cách này là đặt cược vào khả năng đọc trước diễn biến, chứ không vào số lượng thiết bị.",
    result: "Bài đăng ảnh đạt 100.000 lượt xem.",
  },
];
