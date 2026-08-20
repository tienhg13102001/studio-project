// API response shapes — mirrors back-end types

export type LocalizedString = { en: string; vi: string };

export type ApiLanding = {
  heroLine1: LocalizedString;
  heroLine2: LocalizedString;
  subheading: LocalizedString;
  videoBackground: string;
  /** Reference to the linked Contact document (contact info is sourced from there). */
  contactId?: string;
  phone?: string;
  email?: string;
  address?: LocalizedString;
  socials?: {
    zalo?: string;
    facebook?: string;
    instagram?: string;
  };
  /** QR code PNG data-URLs generated per social URL (portal only). */
  socialQrs?: {
    zalo?: string;
    facebook?: string;
    instagram?: string;
  };
};

export type ApiFaqItem = {
  question: LocalizedString;
  answer:   LocalizedString;
};

export type ApiServiceTag = {
  id:          string;
  tag:         string;
  title:       LocalizedString;
  description: LocalizedString;
};

export type ApiProject = {
  id:             string;
  /** Tên đường dẫn đọc được — xem `lib/urls.ts`. Dữ liệu rất cũ có thể chưa có. */
  slug?:          string;
  layout:         "vertical" | "horizontal";
  service:        ApiServiceTag; // populated
  thumbnailImage: string;
  title:          string;
  subtitle:       LocalizedString;
  prominent:      boolean;
  video?: string; // optional, path to video file
  photos?: string[]; // optional, list of product photo paths
  shootDate?: string; // optional, ISO date string
  shootLocation?: string; // optional, VN province/city
  members?: ApiProjectMember[]; // optional, populated team members who worked on the project
  caseStudy?: ApiCaseStudy;
};

/**
 * Câu chuyện dự án. Cả ba phần đều không bắt buộc — chỉ vài dự án mạnh nhất mới
 * đáng viết đầy đủ, số còn lại phần này tự ẩn.
 */
export type ApiCaseStudy = {
  challenge?: LocalizedString;
  approach?: LocalizedString;
  result?: LocalizedString;
};

export type ApiProjectMember = {
  id:    string;
  name:  string;
  photo?: string;
};

export type ApiHighlight = {
  icon:  string; // phosphor icon key (see lib/serviceIcons)
  title: LocalizedString;
  desc:  LocalizedString;
};

export type ApiStat = {
  value: string; // e.g. "1000+", "1B+"
  label: LocalizedString;
};

export type ApiService = {
  /**
   * Chữ dành riêng cho máy tìm kiếm — KHÔNG hiện trên trang.
   * Trống thì lùi về `title` / `description`. Sửa ở Portal → Dịch vụ.
   */
  seoTitle?:       LocalizedString;
  seoDescription?: LocalizedString;
  id:             string;
  /** Tên đường dẫn đọc được — xem `lib/urls.ts`. Dữ liệu rất cũ có thể chưa có. */
  slug?:          string;
  tag:            string;
  thumbnailImage: string;
  title:          LocalizedString;
  description:    LocalizedString;
  heroTagline?:   LocalizedString; // accent line under the hero description
  faqs:           ApiFaqItem[];
  highlights:     ApiHighlight[];
  stats:          ApiStat[];
  order:          number; // sort order — lower shows first (gallery tabs, lists)
  projects:       ApiProject[]; // populated from Project collection
};

/** A tag-grouped set of product photos — powers the landing-page gallery. */
export type ApiPhotoGroup = {
  tag:    string;
  title:  LocalizedString;
  photos: string[];
};

export type ApiProjectsContent = {
  verticalCards:   ApiProject[];
  horizontalCards: ApiProject[];
};

export type ApiPaginatedServices = {
  items: ApiService[];
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
};

export type ApiContact = {
  heading:    LocalizedString;
  subheading: LocalizedString;
  phone:      string;
  email:      string;
  address:    LocalizedString;
  mapUrl:     string;
  workingHours: Array<{ label: LocalizedString; hours: LocalizedString }>;
  socials: {
    zalo?:      string;
    facebook?:  string;
    youtube?:   string;
    tiktok?:    string;
    instagram?: string;
  };
};

/**
 * Một thành viên đội ngũ.
 *
 * `email` và `accountRole` chỉ có khi người gọi ĐÃ ĐĂNG NHẬP. Trang Đội ngũ
 * công khai không nhận hai trường này — server cắt đi để không công bố sẵn địa
 * chỉ email cả nhóm kèm thông tin ai là quản trị.
 */
export type ApiUser = {
  id:       string;
  name:     string;
  email?:   string;
  role:     LocalizedString;
  photo?:   string;
  quote?:   LocalizedString;
  bio?:     LocalizedString;
  skills:   string[];
  featured: boolean;
  accountRole?: "admin" | "member" | "editor";
};

export type ApiBrand = {
  id:       string;
  name:     string;
  logo:     string;
  features: ApiProject[];
  order:    number;
};

/**
 * Nhận xét của khách hàng — quản trong Portal, hiện ở trang chủ và trang dịch vụ.
 *
 * `service` là MÃ dịch vụ dạng chuỗi chứ không phải cả bản ghi: máy chủ cố ý
 * không populate vì nơi hiển thị đã có sẵn dịch vụ đang mở, chỉ cần so mã.
 */
export type ApiTestimonial = {
  id:          string;
  quote:       LocalizedString;
  /** Rỗng = nhận xét ẩn danh, không hiện dòng tên. */
  authorName:  string;
  authorTitle: string;
  service:     string | null;
  featured:    boolean;
  order:       number;
  active:      boolean;
};

/** A single portfolio image — managed in the portal, shown on /portfolio. */
export type ApiPortfolioItem = {
  id:    string;
  image: string;
  title: string; // optional caption / alt text
  order: number;
};

export type ApiTeamContent = {
  // All optional — a freshly-created doc may contain only { pageType, id }.
  aboutBadge?:       LocalizedString;
  aboutHeading?:     LocalizedString;
  aboutDescription?: LocalizedString;
  aboutImage?:       string;
};

/** Global/shared site settings (e.g. background image used across pages). */
export type ApiSettings = { id?: string; backgroundImage: string };

/** A contact-form submission stored from the public Contact page. */
export type ApiInquiry = {
  id:           string;
  name:         string;
  email:        string;
  phone?:       string;
  service?:     string; // raw Service id as submitted
  serviceName?: string; // resolved service title (EN), "" if none/unknown
  message:      string;
  createdAt:    string;
};

/** Một mục đang nằm trong thùng rác của portal. */
export type ApiTrashItem = {
  /** Khoá loại dữ liệu — cũng là đoạn đường dẫn khi khôi phục/xoá hẳn. */
  type:      string;
  typeLabel: string;
  id:        string;
  title:     string;
  subtitle:  string;
  image:     string;
  deletedAt: string;
  /** Mốc cơ sở dữ liệu tự xoá hẳn, dạng ISO. */
  purgeAt:   string;
};

export type ApiTrash = { items: ApiTrashItem[]; ttlDays: number };
