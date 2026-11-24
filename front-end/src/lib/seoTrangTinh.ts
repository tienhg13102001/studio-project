import duLieu from "../data/seo-trang-tinh.json";

/**
 * Tiêu đề + mô tả của các trang tĩnh, đọc từ src/data/seo-trang-tinh.json — cùng
 * tệp mà scripts/prerender-meta.mjs dùng khi dựng sẵn HTML. Một nguồn cho cả hai
 * nên chữ máy tìm kiếm thấy ở lượt quét đầu khớp với chữ sau khi JavaScript chạy.
 */
type Muc = { title: string; description: string };
export type DuongDanTinh = "/service" | "/portfolio" | "/team" | "/contact" | "/chinh-sach-bao-mat";

export function seoTrangTinh(path: DuongDanTinh): Muc {
  return (duLieu as unknown as Record<DuongDanTinh, Muc>)[path];
}

/** Nhãn ngắn của mảng dịch vụ để gắn vào tiêu đề trang dự án. Không có thì trả "". */
export function nhanMang(slugDichVu?: string): string {
  const m = (duLieu as unknown as { _nhanMang: Record<string, string> })._nhanMang;
  return (slugDichVu && m[slugDichVu]) || "";
}

/**
 * Ngày đăng video, đọc từ TÊN TỆP: máy chủ đặt tên video theo giờ tải lên
 * (…-20260612_111328.mp4). Đây đúng là "ngày đăng lên web" mà Google hỏi trong
 * dữ liệu VideoObject. Không đọc được thì trả null và KHÔNG khai video — không
 * bịa ngày. (Ngày quay `shootDate` không dùng: nhiều dự án mang ngày nhập liệu.)
 */
export function ngayDangVideo(url?: string): string | null {
  // Chỉ lấy NGÀY: giờ trong tên tệp theo đồng hồ máy chủ (chưa rõ giờ quốc tế hay
  // giờ VN), khai cả giờ thì có thể lệch 7 tiếng. Google nhận ngày không kèm giờ.
  const m = url?.match(/(20\d{2})(\d{2})(\d{2})_\d{6}/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}
