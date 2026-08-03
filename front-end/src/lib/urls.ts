/**
 * Một chỗ duy nhất dựng địa chỉ cho dịch vụ và dự án.
 *
 * VÌ SAO GOM VỀ ĐÂY: địa chỉ được dựng ở năm sáu chỗ khác nhau (menu, thẻ dịch
 * vụ, trang dịch vụ, kịch bản sinh thẻ mô tả lúc đóng gói…). Sửa cách đặt địa
 * chỉ mà bỏ sót một chỗ là chỗ đó lặng lẽ sinh ra link kiểu cũ — không lỗi,
 * không cảnh báo, chỉ là hai địa chỉ cho cùng một trang và máy tìm kiếm phải
 * đoán xem cái nào là thật.
 *
 * NHẬN CẢ MÃ CŨ: dữ liệu tạo trước khi có tính năng này được điền tên lúc máy
 * chủ khởi động, nhưng nếu vì lý do nào đó chưa kịp điền thì vẫn phải ra được
 * một địa chỉ chạy được, chứ không phải link gãy.
 */

type CoTen = { id: string; slug?: string };

/** `/service/san-xuat-tvc` — lùi về mã máy khi chưa có tên. */
export const duongDanDichVu = (s: CoTen): string => `/service/${s.slug || s.id}`;

/**
 * `/du-an/vf9-teaser` — phẳng và ngắn.
 *
 * Không mang mã dịch vụ: dự án chỉ thuộc về đúng một dịch vụ, nhắc lại trong
 * địa chỉ chỉ làm link dài thêm mà không thêm thông tin gì cho người đọc.
 * Chưa có tên thì lùi về đường dẫn lồng kiểu cũ — vẫn mở đúng.
 */
export const duongDanDuAn = (p: CoTen, dichVu: CoTen): string =>
  p.slug ? `/du-an/${p.slug}` : `/service/${dichVu.slug || dichVu.id}/${p.id}`;
