/**
 * NGUỒN DUY NHẤT của 8 nhận xét khách đã chốt.
 *
 * VÌ SAO TÁCH RA: lời nhận xét còn sửa nữa — 5 bản có tên thật đang chờ chính
 * khách đó duyệt, và Hoàn cũng đã đổi cách xưng hô một lần. Nếu chép cùng một
 * đoạn chữ ở hai file thì sớm muộn hai bản lệch nhau, và không ai biết bản nào
 * đúng.
 *
 * Hai lệnh dùng file này, CỐ Ý khác nhau:
 *   seed-testimonials.ts   — thêm bản còn thiếu, KHÔNG đụng bản đã có
 *   dong-bo-loi-nhan-xet.ts — ép lời trong cơ sở dữ liệu về đúng bản ở đây
 */

export type Nap = {
  vi: string;
  en: string;
  ten: string;
  chucDanh: string;
  /** Tag của mảng dịch vụ, hoặc null nếu không gắn mảng nào. */
  tag: string | null;
  /** Hiện ở trang chủ. Hoàn chốt: đúng 3 cái. */
  trangChu: boolean;
};

export const DANH_SACH: Nap[] = [
  {
    vi: "Sự kiện kiểu này chạy một lần, sai là hết, nên thứ bọn tôi cần không phải quay đẹp mà là chắc chắn không hỏng. Bee Z đi khảo sát trước, chốt vị trí máy theo kịch bản chương trình, hôm đó không ai phải chạy loạn tìm chỗ đứng. Điều tôi đánh giá cao nhất lại là thứ chẳng ai để ý: team không lọt vào khung của bên truyền hình lần nào.",
    en: "An event like this runs once. Get it wrong and it is gone — so what we needed was not beautiful footage, it was the certainty that nothing would fail. Bee Z scouted the venue beforehand and locked every camera position against the run-of-show, so nobody was scrambling for a spot on the day. What I valued most was the thing nobody notices: their crew never once walked into the broadcast team's frame.",
    ten: "Trang",
    chucDanh: "Hòa Quang Event, tổ chức sự kiện",
    tag: "EVENT",
    trangChu: true,
  },
  {
    vi: "Lần đầu bên chị làm thử một bộ thôi, xong thấy dùng được cho cả sàn thương mại điện tử lẫn ảnh treo cửa hàng nên gọi lại. Từ đó tới giờ bên chị quay với Bee Z bốn lần. Lookbook thì nhiều bên chụp đẹp, nhưng đẹp mà nhìn không ra chất vải thì bên bán hàng của chị không dùng được. Chỗ đó Bee Z làm được.",
    en: "The first time we only tried one set. It ended up working for both the e-commerce listings and the in-store prints, so we called them back. We have shot with Bee Z four times since. Plenty of studios shoot a beautiful lookbook — but if you cannot read the fabric, my sales team cannot use it. That is the part Bee Z gets right.",
    ten: "Như Quỳnh",
    chucDanh: "Giám đốc Marketing, OWEN",
    tag: "LOOKBOOK",
    trangChu: false,
  },
  {
    vi: "Hàng mùa vụ nên bên anh sợ nhất là trễ lịch — trễ một tuần là mất cả mùa, không có mùa thứ hai để sửa. Bee Z giao đúng hẹn. Cái anh không ngờ là bạn ấy không quay chiếc bánh theo kiểu chụp sản phẩm, mà quay cả không khí nhà cửa xung quanh. Khách bình luận về cái đó còn nhiều hơn về bánh.",
    en: "Seasonal products, so our biggest fear was slipping the schedule — a week late and you lose the whole season, and there is no second season to fix it in. Bee Z delivered on time. What I did not expect was that they did not shoot the cake like a product shot; they shot the whole feeling of the room around it. People commented on that more than on the cake.",
    ten: "Thanh Long",
    chucDanh: "Lạc Lạc Studio",
    tag: "F&B",
    trangChu: false,
  },
  {
    vi: "Bọn mình quay theo đợt, mỗi đợt một nội dung khác nhau, nên thứ mệt nhất là phải giải thích lại từ đầu mỗi lần đổi team. Với Bee Z thì từ đợt hai trở đi gần như chỉ cần gửi brief là chạy. Riêng khoản đó đã tiết kiệm cho bọn mình khá nhiều thời gian họp.",
    en: "We shoot in batches, each one a different piece of content, so the exhausting part is re-explaining everything from scratch every time the crew changes. With Bee Z, from the second batch on we basically just send the brief and it runs. That alone saved us a lot of meeting time.",
    ten: "Thúy An",
    chucDanh: "Forart Film Production",
    tag: null,
    trangChu: true,
  },
  {
    vi: "Bọn em xem showreel thì thích lắm, nhưng vẫn lo hôm đó team đông quá sẽ mệt và mất tự nhiên. Thực tế thì gần như không thấy các bạn ấy đâu, mà lúc xem phim lại có đủ những đoạn em không hề biết là có người đang quay. Đoạn mẹ em lau nước mắt lúc chưa vào lễ — cả nhà xem đi xem lại.",
    en: "We loved the showreel, but we still worried that having a big crew around would be tiring and make everything feel staged. In the end we barely noticed they were there — and yet the film had all these moments we had no idea anyone was filming. The shot of my mum wiping her eyes before the ceremony: the whole family has watched it over and over.",
    ten: "Hoàng Linh & Bình Dương",
    chucDanh: "",
    tag: "WEDDING",
    trangChu: false,
  },
  {
    vi: "Ngân sách bọn mình không lớn nên đã xác định làm gọn thôi. Lúc trao đổi, Bee Z không đẩy lên gói to hơn mà còn cắt bớt mấy hạng mục, bảo là với mục tiêu này thì không cần. Cái đó làm mình tin hơn là mấy lời chào.",
    en: "Our budget was not big, so we had already decided to keep it small. In the conversation, Bee Z did not push us up to a bigger package — they actually cut a few line items and said we did not need them for this goal. That earned more trust than any pitch would have.",
    ten: "",
    chucDanh: "",
    tag: null,
    trangChu: true,
  },
  {
    // Hoàn chốt: để ẩn danh, không thêm dòng ngành. Chưa gắn mảng nào và cũng
    // không lên trang chủ, nên bản này CHƯA HIỆN Ở ĐÂU — Portal sẽ gắn nhãn
    // cảnh báo để thấy ngay, chờ Hoàn quyết định đưa vào đâu.
    vi: "Sản phẩm của bọn mình là không gian, mà quay không gian rất dễ ra kiểu video giới thiệu dự án nhà nào cũng giống nhà nào. Bọn mình cần thứ nhìn ra được đẳng cấp mà không phải nói ra bằng chữ chạy trên màn hình. Bản cuối dùng được cho cả nhà mẫu lẫn quảng cáo.",
    en: "What we sell is space, and shooting space very easily turns into the kind of project video where every development looks like every other one. We needed something where you could see the standard without having to spell it out in captions. The final cut worked for both the show unit and the ad campaign.",
    ten: "",
    chucDanh: "",
    tag: null,
    trangChu: false,
  },
  {
    vi: "Sân khấu đổi ánh sáng liên tục nên nhiều đội quay ra hình lúc cháy lúc tối thui. Bee Z xử lý được chỗ đó. Với lại bọn mình cần hình để đăng ngay trong đêm chứ không đợi hậu kỳ cả tuần — cái này bạn ấy giao kịp.",
    en: "The stage lighting changes constantly, so a lot of crews come back with footage that is either blown out or pitch black. Bee Z handled that. We also needed footage to post the same night rather than waiting a week for post — and they made that deadline.",
    ten: "",
    chucDanh: "",
    tag: "EVENT",
    trangChu: false,
  },
];
