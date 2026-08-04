import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { apiPost } from "#lib/api";

/**
 * Ghi nhận lượt xem trang mỗi khi khách chuyển sang trang khác.
 *
 * VÌ SAO CẦN: bộ đếm cũ chỉ biết CÓ BAO NHIÊU KHÁCH, không biết họ xem gì. Nên
 * không trả lời được mấy câu đáng tiền nhất: trang Portfolio có ai vào không, dự
 * án nào được xem nhiều, bao nhiêu người đi tới trang Liên hệ.
 *
 * VÌ SAO PHẢI BÁM THEO ĐỔI TRANG chứ không gọi một lần lúc tải: đây là ứng dụng
 * một trang — bấm sang trang khác thì trình duyệt KHÔNG tải lại, chỉ đổi địa chỉ.
 * Gọi một lần lúc tải thì mọi lượt xem sau lần đầu đều mất trắng.
 *
 * ĐẶT Ở LỚP BỌC CỦA KHÁCH, không đặt ở lớp bọc Portal — số liệu này là về khách,
 * đếm cả lượt nhân viên vào sửa nội dung thì nó vô nghĩa. (Máy chủ cũng loại
 * đường dẫn nội bộ một lần nữa, phòng khi có ai đặt nhầm chỗ sau này.)
 *
 * Hỏng thì im lặng: đây là việc phụ, không đáng để hiện lỗi lên mặt khách.
 */
export function usePageView() {
  const { pathname } = useLocation();
  // Chặn gửi trùng khi React dựng lại thành phần hai lần ở chế độ nghiêm ngặt,
  // và khi chỉ có tham số truy vấn đổi chứ đường dẫn thì không.
  const daGui = useRef<string | null>(null);

  useEffect(() => {
    if (daGui.current === pathname) return;
    daGui.current = pathname;
    void apiPost("/api/visitors/page", { path: pathname }).catch(() => {});
  }, [pathname]);
}
