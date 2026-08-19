/*
 * QUY ƯỚC XƯNG HÔ — Hoàn chốt 19/08/2026, áp cho CẢ WEB:
 *   · gọi khách là "bạn"        (KHÔNG "quý khách")
 *   · viết tên là "Bee Z"       (KHÔNG "BeeZ" liền)
 *   · nói "team"                (KHÔNG "ê-kíp" / "Ekip")
 * Trước đây trang chủ gọi "bạn", khối Quy trình lại gọi "quý khách", và tên
 * công ty viết hai kiểu trong cùng một trang — khách đọc như hai người viết.
 * Sửa ở đây thì sửa cả en.ts, và nhớ chữ trong CƠ SỞ DỮ LIỆU (Portal → Dịch vụ)
 * cũng theo quy ước này.
 */
const vi = {
  nav: {
    home: "Trang chủ",
    services: "Dịch vụ",
    rental: "Cho thuê",
    blog: "Blog",
    team: "Đội ngũ",
    portfolio: "Portfolio",
    pricing: "Bảng giá",
    contact: "Liên hệ",
    letsTalk: "Kết Nối",
  },
  portfolio: {
    subtitle: "Vài dự án và hình ảnh tiêu biểu.",
    empty: "Chưa có hình ảnh nào — vui lòng quay lại sau.",
    profileHeading: "Hồ sơ năng lực",
    profileHint: "Kéo ngang để xem · bấm vào một trang để đọc rõ",
    downloadProfile: "Tải hồ sơ năng lực",
    profilePage: "Trang",
    worksHeading: "Dự án đã thực hiện",
    worksHint: "Chọn một mảng để lọc",
    all: "Tất cả",
    projectCount: "dự án",
    emptyFilter: "Chưa có dự án nào trong mảng này.",
    closeReader: "Đóng trang đang xem",
    prevPage: "Trang trước",
    nextPage: "Trang sau",
  },
  cta: {
    contactBeez: "Liên hệ Bee Z",
    viewMyWorkss: "Xem dịch vụ",
  },
  services: {
    sectionTitle: "Lĩnh vực hoạt động",
    sectionSubtitle: "Từ TVC truyền hình đến video ngắn cho mạng xã hội",
  },
  featured: {
    sectionTitle: "Nổi bật",
  },
  gallery: {
    sectionTitle: "Hình ảnh sản phẩm",
    sectionSubtitle: "Hậu trường và thành phẩm từ các buổi quay",
  },
  project: {
    about: "Giới thiệu",
    members: "Người thực hiện",
    productImages: "Ảnh sản phẩm / hậu trường",
    watchMore: "Xem thêm",
    clickArrows: "Bấm mũi tên",
    // Câu chuyện dự án — chỉ hiện ở dự án nào đã viết. Xem `ICaseStudy` ở backend.
    caseStudy: {
      heading: "Câu chuyện dự án",
      challenge: "Bài toán",
      approach: "Cách làm",
      result: "Kết quả",
    },
  },
  stats: {
    items: [
      { value: "800+",  label: "Dự án",        icon: "UserIcon",       details: ["TVC & quảng cáo", "Nội dung ngắn", "Phỏng vấn – Brand film", "Nội dung mạng xã hội"] },
      { value: "400+",  label: "Khách hàng",    icon: "UsersThreeIcon", details: ["Thương hiệu F&B", "Ngân hàng", "Y tế", "Giải trí"] },
      { value: "1 tỷ+", label: "Lượt xem",    icon: "VideoIcon",      details: ["YouTube", "TikTok", "Instagram Reels", "Facebook"] },
    ],
  },
  brands: {
    badge: "Một số thương hiệu đã làm cùng Bee Z",
    heading: "Khách hàng của Bee Z",
  },
  // Câu chữ do Hoàn tự soạn — sửa ở đây và ở en.ts cho khớp nhau.
  process: {
    sectionTitle: "Từ cuộc gọi đầu tiên tới thành phẩm",
    sectionSubtitle: "Quy trình",
    stepLabel: "BƯỚC",
    steps: [
      {
        title: "Nhận brief",
        desc: "Gọi hoặc gặp 30 phút. Bạn nói mục tiêu, đối tượng và ngân sách, Bee Z xác nhận lại xem đã hiểu đúng chưa.",
        when: "Trong 24 giờ",
      },
      {
        title: "Đề xuất & báo giá",
        desc: "Ý tưởng, moodboard, kịch bản khung và bảng giá chi tiết từng hạng mục.",
        when: "2–3 ngày làm việc",
      },
      {
        title: "Tiền kỳ",
        desc: "Chốt kịch bản, casting, bối cảnh, lịch quay. Bạn duyệt trước khi máy chạy.",
        when: "3–7 ngày",
      },
      {
        title: "Quay",
        desc: "Team và thiết bị của Bee Z. Bạn có thể có mặt tại hiện trường hoặc xem trực tiếp từ xa.",
        when: "1–3 ngày quay",
      },
      {
        title: "Hậu kỳ & bàn giao",
        desc: "Dựng, chỉnh màu, âm thanh. Hai vòng sửa miễn phí. Giao file gốc lại cho bạn.",
        when: "5–10 ngày",
      },
    ],
  },
  // Chỉ có tiêu đề khối. Lời nhận xét nằm trong cơ sở dữ liệu (quản ở Portal →
  // Nhận xét), vì nó thay đổi theo thời gian và phải sửa được mà không cần
  // dựng lại web.
  testimonials: {
    sectionTitle: "Khách hàng nói gì",
    sectionSubtitle: "Nhận xét",
  },
  team: {
    heroLine1: "Những người đứng sau",
    heroLine2: "Bee Z Production",
    heroSubtitle: "Những người trực tiếp làm ra từng dự án",
    aboutBadge: "Về chúng tôi",
    aboutHeading: "Chúng tôi là ai",
    aboutDescription: "Bee Z làm TVC, phim ngắn và nội dung mạng xã hội cho thương hiệu. Ý tưởng, quay, dựng, chỉnh màu, âm thanh đều do một team làm, nên không có khoảng trống giữa bên nghĩ ra và bên bấm máy.",
    stats: [
      { value: "1 tỷ+", label: "Lượt xem" },
      { value: "800+", label: "Dự án" },
      { value: "400+", label: "Khách hàng" },
    ],
    meetBadge: "Đội ngũ",
    meetHeading: "Gặp team Bee Z",
  },
  footer: {
    tagline: "Studio sản xuất TVC, phim quảng cáo và nội dung cho thương hiệu.",
    quickLinks: "Liên kết nhanh",
    contact: "Liên hệ",
    hours: "Giờ làm việc",
    followUs: "Theo dõi",
    rights: "Bản quyền © {year} Bee Z Production.",
    visitors: "Lượt truy cập",
  },
  contact: {
    title: "Liên hệ",
    intro:
      "Cần hỏi về dịch vụ, báo giá hay bất cứ điều gì, cứ nhắn. Bee Z trả lời.",
    emailLabel: "Email",
    phoneLabel: "Điện thoại",
    locationLabel: "Địa điểm",
    workingHours: "Giờ làm việc",
    connectWithUs: "Theo dõi Bee Z",
    formTitle: "Gửi tin nhắn",
    sentTitle: "Đã gửi thành công!",
    sentDesc: "Chúng tôi sẽ phản hồi sớm nhất có thể.",
    sendAnother: "Gửi tin nhắn mới",
    nameLabel: "Họ và tên",
    namePlaceholder: "Tên của bạn",
    phoneFieldLabel: "Điện thoại",
    serviceLabel: "Dịch vụ quan tâm",
    servicePlaceholder: "Chọn dịch vụ",
    messageLabel: "Tin nhắn",
    messagePlaceholder: "Kể qua về dự án...",
    submit: "Gửi tin nhắn",
  },
  service: {
    // Bộ số Hoàn chốt 19/08/2026, dùng CHUNG cho cả web: 9 năm · 800+ dự án
    // · 400+ thương hiệu · 1 tỷ+ lượt xem. Trước đây trang dịch vụ ghi "5+ năm"
    // ngay trên khối thống kê ghi "10+ năm" — hai con số đá nhau cách nhau
    // chưa tới một màn hình. Đổi ở đây thì phải đổi cả `stats` của dịch vụ
    // trong Portal → Dịch vụ.
    experienceBadge: "9 năm kinh nghiệm đa nền tảng",
    // Dòng vàng dưới tên dịch vụ trong H1. Câu chung, chỉ dùng khi mảng nào đó
    // chưa có câu riêng ở `heroAccentByTag`.
    heroAccent: "Sản xuất video",
    /**
     * Câu riêng cho từng mảng, tra theo `tag` của dịch vụ.
     *
     * VÌ SAO PHẢI RIÊNG: H1 là tín hiệu mạnh nhất của một trang. Trước đây cả
     * sáu trang dịch vụ đều kết thúc H1 bằng đúng một câu "Sản xuất video", nên
     * một nửa H1 giống hệt nhau — làm loãng đúng thứ cần sắc nét. Riêng trang
     * cưới còn sai nghĩa: chụp ảnh cưới không phải "sản xuất video".
     *
     * Thêm mảng mới mà quên khai ở đây thì tự lùi về câu chung, không vỡ trang.
     */
    heroAccentByTag: {
      TVC: "Phim quảng cáo thương hiệu",
      "F&B": "Quay chụp món ăn & sản phẩm",
      LOOKBOOK: "Lookbook & chiến dịch thời trang",
      SHORT: "Video ngắn cho mạng xã hội",
      EVENT: "Sự kiện & concert, ghi hình đa máy",
      WEDDING: "Ảnh và phim ngày cưới",
    } as Record<string, string>,
    heroTagline:
      "Talking head, motion graphics, meme và video bắt trend, làm cho mọi ngành hàng.",
    startProject: "Bắt đầu dự án",
    viewWork: "Xem dự án",
    faqTitle: "Câu hỏi thường gặp",
    showcaseTitle: "Thư viện video",
    showcaseSubtitle: "Một số dự án nội dung dạng ngắn của chúng tôi",
    featuredBadge: "Nổi bật",
    ctaTitle: "Bắt đầu làm nội dung ngắn?",
    ctaSubtitle: "Nhắn cho Bee Z để bàn hướng làm",
    ctaButton: "Bắt đầu ngay",
    highlights: [
      {
        title: "Talking Head",
        desc: "Chuyên gia nói trước ống kính, kèm đồ hoạ chuyển động.",
      },
      {
        title: "Nội dung bắt trend",
        desc: "Meme, nhạc đang hot, format đang viral.",
      },
      {
        title: "Đa nền tảng",
        desc: "TikTok, YouTube Shorts, Facebook & Instagram Reels.",
      },
    ],
    stats: [
      { value: "800+", label: "Dự án" },
      { value: "9", label: "Năm kinh nghiệm" },
      { value: "1 tỷ+", label: "Lượt xem" },
      { value: "4", label: "Nền tảng" },
    ],
  },
} as const;

export default vi;
