# TÀI LIỆU CHI TIẾT - PHƯƠNG ÁN 2: WEBSITE PORTFOLIO ĐỘNG (CÓ HỆ THỐNG QUẢN TRỊ - CMS)

> **Phiên bản:** 1.0 | **Ngày soạn:** 16/05/2026
> *Tài liệu mô tả chi tiết yêu cầu kỹ thuật, tính năng và kế hoạch triển khai cho Phương án 2.*

---

## 1. Tổng quan giải pháp

Phương án 2 kế thừa toàn bộ giao diện đẹp của Option 1, đồng thời bổ sung **hệ thống quản trị nội dung (CMS)** cho phép Studio tự chủ cập nhật tác phẩm, dịch vụ và quản lý khách hàng tiềm năng mà **không cần động vào code**.

**Ưu điểm nổi bật:**
- Studio tự thêm/sửa/xóa tác phẩm, dịch vụ, thông tin qua giao diện Admin trực quan.
- Danh sách khách hàng để lại thông tin được lưu vào database — không bị trôi như email.
- Giao diện khách hàng tải dữ liệu động, luôn cập nhật theo thời gian thực.
- Nền tảng vững chắc để nâng cấp lên Option 3 trong tương lai.

**Hạn chế cần lưu ý:**
- Yêu cầu thuê VPS Linux (chi phí ~2.5tr - 4tr/năm).
- Phức tạp hơn Option 1 về mặt hạ tầng (cần quản lý server, backup database).

---

## 2. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                   NGƯỜI DÙNG / KHÁCH                │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
                        ▼
              ┌─────────────────┐
              │   Nginx (Proxy) │  ← Reverse proxy + SSL
              └────────┬────────┘
              ┌────────┴────────┐
              ▼                 ▼
    ┌──────────────┐   ┌──────────────────┐
    │  ReactJS     │   │  Node.js/Express │
    │  (Frontend)  │   │  (Backend API)   │
    │  Port 3000   │   │  Port 5000       │
    └──────────────┘   └────────┬─────────┘
                                │
                       ┌────────▼─────────┐
                       │    MongoDB       │
                       │   (Database)     │
                       └──────────────────┘
```

---

## 3. Sơ đồ trang (Sitemap)

### 3.1. Phía khách hàng (Public)
```
/                      → Trang chủ
/portfolio             → Trang trưng bày tác phẩm (lọc theo danh mục)
/services              → Trang dịch vụ & bảng giá
/about                 → Giới thiệu Studio
/contact               → Liên hệ
```

### 3.2. Phía quản trị (Admin — yêu cầu đăng nhập)
```
/admin/login           → Trang đăng nhập
/admin/dashboard       → Tổng quan (Dashboard)
/admin/portfolio       → Quản lý tác phẩm
/admin/services        → Quản lý dịch vụ
/admin/clients         → Quản lý đối tác/khách hàng
/admin/leads           → Danh sách khách hàng tiềm năng
/admin/settings        → Cài đặt thông tin Studio
```

---

## 4. Mô tả chi tiết — Giao diện Khách hàng (Frontend)

Kế thừa toàn bộ thiết kế và tính năng của Option 1, với điểm khác biệt là **dữ liệu được tải động từ API** thay vì lưu cứng trong file code.

### 4.1. Trang chủ (`/`)

| # | Section | Nội dung |
|---|---|---|
| 1 | **Hero Banner** | Video nền, tagline, nút CTA — dữ liệu lấy từ Admin Settings |
| 2 | **Giới thiệu ngắn** | Số liệu thống kê tự động (tổng dự án, năm hoạt động) |
| 3 | **Tác phẩm nổi bật** | 6-9 dự án được Admin đánh dấu "Featured" |
| 4 | **Dịch vụ** | Danh sách dịch vụ lấy từ Admin |
| 5 | **Khách hàng đối tác** | LogoYellow từ module Clients trong Admin |
| 6 | **Testimonials** | Đánh giá khách hàng do Admin thêm vào |
| 7 | **CTA cuối trang** | Dẫn đến trang liên hệ |

### 4.2. Trang Portfolio (`/portfolio`)

- **Bộ lọc động:** Danh mục lọc (TVC, MV, Wedding…) được lấy tự động từ database — Admin thêm danh mục mới thì giao diện tự cập nhật, không cần sửa code.
- **Phân trang (Pagination):** Hiển thị 12 dự án/trang, tải thêm khi scroll hoặc chuyển trang.
- **Lightbox:** Click vào thumbnail → mở popup phát video YouTube/Vimeo.
- **SEO:** Mỗi dự án có thể có URL riêng (`/portfolio/ten-du-an`) để Google index.

### 4.3. Trang Liên hệ (`/contact`)

- Form liên hệ gửi dữ liệu về **backend API** → lưu vào MongoDB (thay vì gửi email đơn giản như Option 1).
- Đồng thời gửi email thông báo tới Studio.
- Admin có thể xem toàn bộ danh sách leads trong trang `/admin/leads`.

---

## 5. Mô tả chi tiết — Trang Quản trị (Admin Dashboard)

### 5.1. Đăng nhập (`/admin/login`)

- Form đăng nhập với Email + Mật khẩu.
- Xác thực bằng **JWT (JSON Web Token)** — token lưu trong httpOnly cookie (bảo mật, chống XSS).
- Giới hạn số lần đăng nhập sai (Rate Limiting) để chống brute-force.
- Chức năng "Quên mật khẩu" gửi link reset về email.

### 5.2. Tổng quan (Dashboard)

Màn hình tổng quan hiển thị các số liệu nhanh:

| Widget | Nội dung |
|---|---|
| **Tổng dự án** | Số lượng dự án đang hiển thị / tổng số |
| **Leads mới** | Số khách hàng để lại thông tin trong 7 ngày qua |
| **Dịch vụ** | Số gói dịch vụ đang hiển thị |
| **Hoạt động gần đây** | Log 10 hành động cuối (thêm/sửa/xóa) |

### 5.3. Quản lý Tác phẩm (`/admin/portfolio`)

**Danh sách tác phẩm:**
- Bảng hiển thị tất cả dự án (thumbnail, tên, danh mục, trạng thái hiển thị, ngày tạo).
- Tìm kiếm theo tên, lọc theo danh mục.
- Bật/tắt hiển thị dự án chỉ bằng một cú click (Toggle).
- Đánh dấu "Nổi bật" (Featured) để hiển thị trên Trang chủ.
- Sắp xếp thứ tự hiển thị bằng kéo-thả (Drag & Drop).

**Form thêm/sửa dự án:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| Tên dự án | Text | VD: "TVC Tết 2026 - Vinamilk" |
| Danh mục | Dropdown (đa chọn) | TVC, MV, Wedding, Event… |
| Khách hàng / Thương hiệu | Text | Tên đối tác |
| Năm thực hiện | Number | |
| Link Video (YouTube/Vimeo) | URL | Tự động lấy thumbnail |
| Ảnh Thumbnail | Upload ảnh | Thay thế thumbnail tự động nếu muốn ảnh riêng |
| Mô tả ngắn | Textarea | Hiển thị khi hover hoặc trong trang chi tiết |
| Trạng thái | Toggle | Hiển thị / Ẩn |
| Nổi bật | Toggle | Hiển thị trên Trang chủ |

### 5.4. Quản lý Dịch vụ (`/admin/services`)

- Thêm/sửa/xóa các gói dịch vụ.
- Mỗi dịch vụ gồm: Tên, Icon, Mô tả, Danh sách bao gồm, Giá (hoặc "Liên hệ"), Trạng thái.
- Sắp xếp thứ tự hiển thị bằng kéo-thả.

### 5.5. Quản lý Đối tác (`/admin/clients`)

- Upload logo khách hàng/đối tác.
- Nhập tên công ty, link website (tuỳ chọn).
- Bật/tắt hiển thị từng logo.

### 5.6. Danh sách Leads (`/admin/leads`)

Đây là tính năng quan trọng — lưu trữ thông tin khách hàng tiềm năng, không bị thất lạc như email.

| Cột | Nội dung |
|---|---|
| **Họ tên** | |
| **Số điện thoại** | Click để gọi trực tiếp |
| **Email** | |
| **Dịch vụ quan tâm** | |
| **Nội dung** | Xem đầy đủ khi click |
| **Thời gian** | Ngày giờ gửi form |
| **Trạng thái** | Mới / Đã liên hệ / Đã chốt / Không tiềm năng |

Chức năng bổ sung:
- Lọc theo trạng thái, khoảng thời gian.
- Xuất danh sách ra file Excel (.xlsx).
- Ghi chú nội bộ cho từng lead.

### 5.7. Cài đặt Studio (`/admin/settings`)

- Thông tin cơ bản: Tên Studio, Slogan, Mô tả ngắn, LogoYellow.
- Thông tin liên hệ: SĐT, Email, Địa chỉ, Zalo, Facebook, Instagram, YouTube, TikTok.
- Nội dung Hero Banner: Tiêu đề, Phụ đề, Link video nền.
- Đổi mật khẩu Admin.

---

## 6. Thiết kế cơ sở dữ liệu (MongoDB)

### Collection: `projects` (Tác phẩm)
```json
{
  "_id": "ObjectId",
  "title": "TVC Tết 2026 - Vinamilk",
  "slug": "tvc-tet-2026-vinamilk",
  "categories": ["TVC"],
  "client": "Vinamilk",
  "year": 2026,
  "videoUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "thumbnail": "/uploads/thumbnails/tvc-tet-2026.jpg",
  "description": "...",
  "isFeatured": true,
  "isVisible": true,
  "order": 1,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### Collection: `services` (Dịch vụ)
```json
{
  "_id": "ObjectId",
  "name": "Wedding Film",
  "icon": "camera",
  "description": "Quay phim phóng sự cưới chuyên nghiệp",
  "features": ["Highlight 5-7 phút", "Phóng sự đầy đủ", "1 buổi chụp ảnh"],
  "price": "Liên hệ",
  "isVisible": true,
  "order": 1
}
```

### Collection: `leads` (Khách hàng tiềm năng)
```json
{
  "_id": "ObjectId",
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "example@email.com",
  "service": "Wedding Film",
  "message": "Tôi muốn hỏi về gói quay phim cưới...",
  "status": "new",
  "note": "",
  "createdAt": "ISODate"
}
```

### Collection: `clients` (Đối tác)
```json
{
  "_id": "ObjectId",
  "name": "Vinamilk",
  "logo": "/uploads/clients/vinamilk.png",
  "website": "https://vinamilk.com.vn",
  "isVisible": true,
  "order": 1
}
```

### Collection: `settings` (Cài đặt — 1 document duy nhất)
```json
{
  "_id": "ObjectId",
  "studioName": "Studio XYZ",
  "slogan": "Kể câu chuyện của bạn bằng hình ảnh",
  "logo": "/uploads/logo.svg",
  "phone": "0901234567",
  "email": "contact@studio.vn",
  "address": "123 Đường ABC, Q.1, TP.HCM",
  "socialLinks": {
    "facebook": "https://facebook.com/...",
    "instagram": "https://instagram.com/...",
    "youtube": "https://youtube.com/...",
    "zalo": "https://zalo.me/..."
  },
  "hero": {
    "title": "Chúng tôi kể câu chuyện bằng hình ảnh",
    "subtitle": "...",
    "videoUrl": "..."
  }
}
```

---

## 7. Thiết kế API (RESTful)

### API Public (không cần xác thực)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/projects` | Lấy danh sách dự án (hỗ trợ filter, phân trang) |
| GET | `/api/projects/:slug` | Lấy chi tiết 1 dự án |
| GET | `/api/services` | Lấy danh sách dịch vụ |
| GET | `/api/clients` | Lấy danh sách đối tác |
| GET | `/api/settings` | Lấy thông tin cài đặt Studio |
| POST | `/api/leads` | Gửi form liên hệ |

### API Admin (yêu cầu JWT token)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| GET/POST | `/api/admin/projects` | Lấy danh sách / Thêm dự án |
| PUT/DELETE | `/api/admin/projects/:id` | Sửa / Xóa dự án |
| PUT | `/api/admin/projects/reorder` | Sắp xếp lại thứ tự |
| GET/POST | `/api/admin/services` | Quản lý dịch vụ |
| PUT/DELETE | `/api/admin/services/:id` | |
| GET/POST | `/api/admin/clients` | Quản lý đối tác |
| PUT/DELETE | `/api/admin/clients/:id` | |
| GET | `/api/admin/leads` | Xem danh sách leads |
| PUT | `/api/admin/leads/:id` | Cập nhật trạng thái lead |
| GET | `/api/admin/leads/export` | Xuất Excel |
| GET/PUT | `/api/admin/settings` | Xem / Cập nhật cài đặt |
| POST | `/api/admin/upload` | Upload ảnh lên server |

---

## 8. Công nghệ sử dụng

| Hạng mục | Lựa chọn | Lý do |
|---|---|---|
| **Frontend Framework** | ReactJS (Vite) | Nhanh, phổ biến, dễ bảo trì |
| **Styling** | Tailwind CSS | Phát triển UI nhanh |
| **State Management** | React Query (TanStack) | Tối ưu fetching dữ liệu từ API |
| **Admin UI** | React + Tailwind (tự xây) / Ant Design | Giao diện quản trị chuyên nghiệp |
| **Backend Framework** | Node.js + Express | Nhẹ, linh hoạt, phù hợp API |
| **Database** | MongoDB + Mongoose | Linh hoạt schema, phù hợp dữ liệu media |
| **Xác thực** | JWT + httpOnly Cookie | Bảo mật, chống XSS |
| **Upload ảnh** | Multer + lưu local / Cloudinary | Xử lý file upload |
| **Gửi email** | Nodemailer + Gmail SMTP | Thông báo lead mới |
| **Hosting** | VPS Linux (Ubuntu 22.04) | Cần server riêng cho backend |
| **Web server** | Nginx | Reverse proxy, SSL termination |
| **SSL** | Let's Encrypt (Certbot) | Miễn phí, tự động gia hạn |
| **Process Manager** | PM2 | Giữ Node.js app chạy liên tục |

---

## 9. Cấu trúc thư mục dự án

```
studio-portfolio/
├── frontend/                    # ReactJS App
│   ├── src/
│   │   ├── pages/               # Trang public
│   │   │   ├── Home.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── About.jsx
│   │   │   └── Contact.jsx
│   │   ├── admin/               # Trang quản trị
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminPortfolio.jsx
│   │   │   ├── AdminServices.jsx
│   │   │   ├── AdminClients.jsx
│   │   │   ├── AdminLeads.jsx
│   │   │   └── AdminSettings.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── AdminLayout.jsx
│   │   │   └── ui/
│   │   │       ├── VideoCard.jsx
│   │   │       ├── FilterBar.jsx
│   │   │       ├── Lightbox.jsx
│   │   │       └── DataTable.jsx
│   │   ├── hooks/               # Custom hooks (useAuth, useProjects…)
│   │   ├── services/            # API call functions
│   │   └── utils/
│   └── vite.config.js
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── projectController.js
│   │   │   ├── serviceController.js
│   │   │   ├── leadController.js
│   │   │   ├── clientController.js
│   │   │   ├── settingsController.js
│   │   │   └── authController.js
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── Project.js
│   │   │   ├── Service.js
│   │   │   ├── Lead.js
│   │   │   ├── Client.js
│   │   │   ├── Settings.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification
│   │   │   ├── rateLimiter.js
│   │   │   └── upload.js        # Multer config
│   │   └── utils/
│   │       └── sendEmail.js
│   ├── uploads/                 # Ảnh upload (hoặc dùng Cloudinary)
│   └── server.js
│
└── nginx/
    └── studio.conf              # Nginx config
```

---

## 10. Kế hoạch triển khai (14 - 21 ngày)

| Giai đoạn | Thời gian | Công việc |
|---|---|---|
| **Giai đoạn 1: Chuẩn bị & Setup** | Ngày 1 - 2 | Thu thập nội dung từ Studio. Thiết lập VPS, cài Node.js, MongoDB, Nginx. Khởi tạo project (Frontend + Backend). |
| **Giai đoạn 2: Backend API** | Ngày 3 - 7 | Xây dựng toàn bộ API (CRUD Projects, Services, Leads, Clients, Settings). Viết middleware xác thực JWT. Cấu hình upload ảnh và gửi email. |
| **Giai đoạn 3: Frontend Public** | Ngày 8 - 12 | Xây dựng giao diện khách hàng (Trang chủ → Portfolio → Services → About → Contact). Kết nối API. |
| **Giai đoạn 4: Admin Dashboard** | Ngày 13 - 17 | Xây dựng giao diện Admin (Login, Dashboard, CRUD các module, trang Leads). |
| **Giai đoạn 5: Tích hợp nội dung** | Ngày 18 | Nhập nội dung thực tế của Studio qua trang Admin. |
| **Giai đoạn 6: Review & Fix** | Ngày 19 - 20 | Bàn giao demo để Studio review. Sửa chữa theo phản hồi. |
| **Giai đoạn 7: Deploy & Go-live** | Ngày 21 | Deploy production lên VPS. Kết nối tên miền. Cấu hình SSL. Kiểm tra toàn bộ luồng. |

---

## 11. Bảo mật

| Biện pháp | Chi tiết |
|---|---|
| **Xác thực JWT** | Token lưu trong httpOnly cookie — trình duyệt không thể đọc bằng JavaScript, chống XSS |
| **Rate Limiting** | Giới hạn 5 lần đăng nhập sai / 15 phút để chống brute-force |
| **Input Validation** | Validate toàn bộ dữ liệu đầu vào bằng `express-validator` trước khi lưu DB |
| **CORS** | Chỉ cho phép domain của Studio gọi API |
| **Helmet.js** | Tự động set các HTTP security headers |
| **MongoDB Injection** | Sử dụng Mongoose schema — không cho phép operator injection |
| **File Upload** | Chỉ chấp nhận đuôi `.jpg`, `.png`, `.webp`, `.svg`. Giới hạn dung lượng 5MB/file |
| **HTTPS** | Bắt buộc SSL qua Let's Encrypt, tự động redirect HTTP → HTTPS |
| **Mật khẩu** | Hash bằng `bcrypt` (cost factor 12) — không lưu plain text |

---

## 12. Chi phí

### 12.1. Chi phí phát triển (một lần)

| Hạng mục | Chi phí |
|---|---|
| Thiết kế & Lập trình toàn bộ hệ thống | **12.000.000 - 18.000.000 VNĐ** |

> *Mức giá phụ thuộc vào số lượng module Admin, độ phức tạp của giao diện và số vòng chỉnh sửa.*

### 12.2. Chi phí vận hành hàng năm

| Hạng mục | Chi phí / năm | Ghi chú |
|---|---|---|
| Tên miền `.com` / `.vn` | ~ 300.000 - 800.000 VNĐ | Gia hạn hàng năm |
| VPS Linux (2 vCPU, 2GB RAM) | ~ 2.500.000 - 4.000.000 VNĐ | DigitalOcean / Vultr / Akamai |
| Bảo trì & Backup định kỳ | ~ 1.000.000 - 2.000.000 VNĐ | Backup DB hàng tuần, cập nhật bảo mật |
| SSL (Let's Encrypt) | **Miễn phí** | Tự động gia hạn 90 ngày |

**Tổng chi phí vận hành hàng năm: ~ 3.800.000 - 6.800.000 VNĐ**

---

## 13. Bàn giao & Tài liệu sử dụng

Sau khi hoàn thành, Developer bàn giao:

1. **Source code** toàn bộ (Frontend + Backend) qua GitHub repository riêng của Studio.
2. **Hướng dẫn sử dụng Admin** — tài liệu (PDF/Markdown) và video hướng dẫn từng chức năng quản trị.
3. **Hướng dẫn vận hành VPS** — cách restart service, xem logs, restore backup khi cần.
4. **Tài khoản bàn giao:** VPS (SSH key), MongoDB (username/password), tên miền, tài khoản Admin đầu tiên.
5. **Quy trình backup:** Script backup database tự động hàng tuần, lưu ra file ngoài server.

---

## 14. Điều kiện & Yêu cầu từ phía Studio

- [ ] Toàn bộ nội dung của Option 1 (logo, ảnh, link video, text giới thiệu…).
- [ ] Email doanh nghiệp để nhận thông báo lead (hoặc dùng Gmail).
- [ ] Xác nhận tên miền muốn sử dụng.
- [ ] Tài khoản VPS đã đăng ký (hoặc ủy quyền Developer đăng ký và bàn giao lại).

---

## 15. So sánh Option 1 vs Option 2

| Tiêu chí | Option 1 | Option 2 |
|---|---|---|
| Tự cập nhật nội dung | ❌ Cần Developer | ✅ Tự làm qua Admin |
| Quản lý leads/khách hàng | ❌ Chỉ qua email | ✅ Lưu vào database |
| Chi phí hosting | Miễn phí | ~2.5tr - 4tr/năm |
| Tốc độ tải trang | Rất nhanh | Nhanh |
| Thời gian hoàn thành | 7-10 ngày | 14-21 ngày |
| Chi phí phát triển | 5-8 triệu | 12-18 triệu |
| Khả năng nâng cấp | Trung bình | Cao (nền tảng cho Option 3) |

---

## 16. Câu hỏi thường gặp (FAQ)

**Q: Admin có thể dùng trên điện thoại không?**
A: Có. Giao diện Admin được thiết kế responsive, dùng được trên cả điện thoại và máy tính bảng — Studio có thể thêm tác phẩm mới ngay khi đang đi quay.

**Q: Nếu VPS gặp sự cố, website có bị sập không?**
A: Sẽ bị ảnh hưởng. Tuy nhiên VPS của các nhà cung cấp uy tín (DigitalOcean, Vultr) có uptime 99.9%. Ngoài ra sẽ cấu hình PM2 để tự động restart nếu app bị lỗi.

**Q: Dữ liệu có bị mất không?**
A: Database được backup tự động định kỳ (hàng tuần hoặc hàng ngày tuỳ yêu cầu). File backup được lưu ở ít nhất 2 nơi (VPS + Google Drive/Dropbox).

**Q: Option 2 có thể nâng cấp lên Option 3 không?**
A: Hoàn toàn có. Frontend và Backend của Option 2 được xây dựng theo chuẩn mở rộng. Việc bổ sung module quản lý nhân sự, Kanban task, quản lý tài nguyên (Option 3) là thêm module mới — không cần làm lại từ đầu.

**Q: Có bao nhiêu tài khoản Admin?**
A: Mặc định 1 tài khoản Admin duy nhất. Nếu cần thêm tài khoản (VD: 1 người phụ trách upload video, 1 người quản lý leads), có thể mở rộng thêm khi nâng cấp lên Option 3 với hệ thống phân quyền đầy đủ.

---

*Tài liệu được soạn thảo bởi Developer nhằm hỗ trợ đàm phán và triển khai dự án. Mọi tính năng đều có thể điều chỉnh theo yêu cầu thực tế của Studio.*
