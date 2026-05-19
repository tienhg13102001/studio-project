# BÁO CÁO ĐỀ XUẤT GIẢI PHÁP HỆ THỐNG WEBSITE & VẬN HÀNH STUDIO

## 1. Tổng quan dự án
Báo cáo này đưa ra ba phương án phát triển hệ thống dựa trên quy mô, ngân sách và nhu cầu hiện tại của Studio. Các phương án được thiết kế theo hướng có thể nâng cấp mở rộng trong tương lai.

---

## 2. Các phương án triển khai

### PHƯƠNG ÁN 1: WEBSITE PORTFOLIO TĨNH (STATIC PORTFOLIO)
*Giải pháp nhanh gọn, tiết kiệm chi phí, đóng vai trò như một "Card visit điện tử" cao cấp.*

#### A. Tính năng chính
- **Giao diện hiển thị (Front-end):** Trang chủ thiết kế đẹp mắt, giới thiệu dịch vụ và hiển thị các sản phẩm nổi bật (chèn trực tiếp từ link YouTube/Vimeo hoặc ảnh cố định).
- **Liên hệ:** Form liên hệ cơ bản (gửi thẳng về email) hoặc các nút bấm chuyển hướng nhanh sang Zalo, Messenger, Hotline.
- **Lưu ý:** Không có trang quản trị (Admin). Khi muốn cập nhật video mới, thay đổi giá hay nội dung, cần phải can thiệp trực tiếp vào mã nguồn (Code).

#### B. Thông số & Chi phí
- **Công nghệ:** HTML/CSS/JS tĩnh hoặc Next.js (Static Export). Không cần Database.
- **Thời gian hoàn thành:** 7 - 10 ngày.
- **Ngân sách dự kiến:** **5.000.000 - 8.000.000 VNĐ**.

---

### PHƯƠNG ÁN 2: WEBSITE PORTFOLIO ĐỘNG (CÓ HỆ THỐNG QUẢN TRỊ - CMS)
*Tập trung vào Marketing, nhận diện thương hiệu và cho phép Studio tự chủ cập nhật nội dung.*

#### A. Tính năng chính
- **Giao diện Khách hàng (Front-end):** Kế thừa Option 1 nhưng dữ liệu được tải động. Tích hợp chức năng lọc dự án (Ví dụ: xem riêng TVC, MV, Wedding...).
- **Trang Quản trị (Admin Dashboard):**
    - Đăng nhập bảo mật cho quản trị viên.
    - Chức năng thêm/sửa/xóa Dự án (Portfolio), Khách hàng đối tác, Gói dịch vụ.
    - Quản lý danh sách khách hàng để lại thông tin tư vấn (Lưu trực tiếp vào Database để không bị trôi như gửi qua Email).

#### B. Thông số & Chi phí
- **Công nghệ:** ReactJS (Frontend), Node.js/Express (Backend API), MongoDB (Database).
- **Thời gian hoàn thành:** 14 - 21 ngày.
- **Ngân sách dự kiến:** **12.000.000 - 18.000.000 VNĐ**.

---

### PHƯƠNG ÁN 3: HỆ THỐNG TOÀN DIỆN (WEB PORTFOLIO + MINI ERP VẬN HÀNH)
*Chuyển đổi số toàn bộ quy trình từ lúc đón khách đến lúc trả file sản phẩm.*

#### A. Tính năng chính
- **Tính năng Front-end & CMS:** Bao gồm toàn bộ tính năng của Option 2.
- **Quản lý Nhân sự & Phân quyền:**
    - Tạo tài khoản và phân quyền: Admin, Sales, Cameraman, Editor.
- **Quản lý Task & Quy trình (Workflow):**
    - Hệ thống bảng Kanban (Kéo thả task) theo luồng: *Nhận booking -> Đi quay -> Đang dựng (Edit) -> Chờ duyệt -> Hoàn thành*.
    - Phân công công việc (Assignee) cho từng Editor/Cameraman, đính kèm deadline.
- **Quản lý Tài nguyên (Kho dữ liệu):**
    - Khu vực lưu trữ link Source Raw và Link Final gắn liền với từng Task/Dự án.
    - Tích hợp lịch sử phản hồi (Feedback) của khách hàng để Editor dễ theo dõi.

#### B. Thông số & Chi phí
- **Công nghệ:** Frontend ReactJS, Backend Node.js, Database MongoDB. Hệ thống được đóng gói bằng Docker và triển khai qua Nginx để đảm bảo hiệu năng cao.
- **Thời gian hoàn thành:** 45 - 60 ngày.
- **Ngân sách dự kiến:** **45.000.000 - 70.000.000 VNĐ**.

---

## 3. Chi phí vận hành & Hạ tầng (Hàng năm)

| Hạng mục | Option 1 | Option 2 & 3 |
| :--- | :--- | :--- |
| **Tên miền (.com/.vn)** | ~ 300k - 800k | ~ 300k - 800k |
| **Hosting / Server** | Miễn phí (Vercel/Netlify) | VPS Linux (2.5tr - 4tr) |
| **Bảo trì / Backup** | Không đáng kể | 1tr - 2tr |

---
*Tài liệu được soạn thảo bởi Developer nhằm hỗ trợ đàm phán với khách hàng. Các tính năng ở Option 3 có thể cắt giảm hoặc bổ sung tùy theo quy trình thực tế của Studio.*
