# TÀI LIỆU CHI TIẾT - PHƯƠNG ÁN 1: WEBSITE PORTFOLIO TĨNH (STATIC PORTFOLIO)

> **Phiên bản:** 1.0 | **Ngày soạn:** 16/05/2026
> *Tài liệu mô tả chi tiết yêu cầu kỹ thuật, tính năng và kế hoạch triển khai cho Phương án 1.*

---

## 1. Tổng quan giải pháp

Website Portfolio Tĩnh đóng vai trò như một **"Card visit điện tử" cao cấp** — giới thiệu thương hiệu, trưng bày tác phẩm nổi bật và dẫn dắt khách hàng tiềm năng liên hệ trực tiếp. Đây là lựa chọn tối ưu khi cần **triển khai nhanh, chi phí thấp và không có nhu cầu thay đổi nội dung thường xuyên.**

**Ưu điểm nổi bật:**
- Tốc độ tải trang rất nhanh (không phụ thuộc server xử lý dữ liệu).
- Chi phí hosting = **0 đồng** (triển khai miễn phí trên Vercel hoặc Netlify).
- Bảo mật cao — không có database, không có API endpoint bị tấn công.
- Dễ bàn giao, dễ duy trì về lâu dài.

**Hạn chế cần lưu ý:**
- Mọi thay đổi nội dung (thêm video, cập nhật giá, đổi thông tin) đều yêu cầu can thiệp vào code.
- Không có trang quản trị (Admin Panel).

---

## 2. Sơ đồ trang (Sitemap)

```
/                      → Trang chủ (Homepage)
/portfolio             → Trang trưng bày tác phẩm
/services              → Trang dịch vụ & bảng giá
/about                 → Giới thiệu về Studio
/contact               → Liên hệ
```

---

## 3. Mô tả chi tiết từng trang

### 3.1. Trang chủ (`/`)

Đây là trang quan trọng nhất — tạo ấn tượng đầu tiên với khách hàng.

#### Các section trên trang chủ:

| # | Tên Section | Nội dung |
|---|---|---|
| 1 | **Hero Banner** | Video nền hoặc ảnh full-màn-hình, tagline ngắn gọn, nút CTA "Xem tác phẩm" / "Liên hệ ngay" |
| 2 | **Giới thiệu ngắn** | 2-3 câu mô tả Studio, số liệu nổi bật (số dự án, năm kinh nghiệm, khách hàng) |
| 3 | **Tác phẩm nổi bật** | Hiển thị 6 - 9 video/ảnh tiêu biểu nhất (thumbnail + nhúng YouTube/Vimeo) |
| 4 | **Dịch vụ** | Tóm tắt 3-4 dịch vụ chính, mỗi dịch vụ có icon và mô tả 1-2 dòng |
| 5 | **Khách hàng đối tác** | Logo các thương hiệu đã hợp tác (dạng thanh cuộn ngang) |
| 6 | **Testimonials** | 2-3 đánh giá của khách hàng thực tế (ảnh + tên + lời nhận xét) |
| 7 | **CTA cuối trang** | Banner kêu gọi liên hệ — "Bạn có dự án muốn thực hiện? Liên hệ ngay!" |

---

### 3.2. Trang Portfolio (`/portfolio`)

Trưng bày toàn bộ tác phẩm đã thực hiện.

- **Bộ lọc (Filter):** Các nút lọc theo danh mục (TVC, MV, Wedding, Event, Corporate…). Bộ lọc hoạt động bằng JavaScript thuần — không cần tải lại trang.
- **Dạng hiển thị:** Lưới ảnh (Grid Layout), mỗi ô là thumbnail video.
- **Khi click vào:** Mở popup (lightbox) phát video YouTube/Vimeo nhúng trực tiếp.
- **Thông tin mỗi dự án:** Tên dự án, danh mục, khách hàng/thương hiệu, năm thực hiện.

**Cấu trúc dữ liệu tác phẩm (lưu trong file `data/portfolio.js`):**
```js
{
  id: 1,
  title: "TVC Xuân 2025 - Thương hiệu X",
  category: "TVC",
  client: "Thương hiệu X",
  year: 2025,
  thumbnail: "/images/portfolio/tvc-xuan-2025.jpg",
  videoUrl: "https://www.youtube.com/embed/VIDEO_ID"
}
```

---

### 3.3. Trang Dịch vụ & Bảng giá (`/services`)

Trình bày rõ ràng các gói dịch vụ Studio cung cấp.

**Các gói dịch vụ gợi ý (điều chỉnh theo thực tế):**

| Gói | Mô tả | Khoảng giá |
|---|---|---|
| **Wedding Film** | Quay phim phóng sự cưới, highlight, pre-wedding | Liên hệ |
| **TVC / Quảng cáo** | Sản xuất video quảng cáo thương hiệu | Liên hệ |
| **MV Ca nhạc** | Quay & dựng MV chuyên nghiệp | Liên hệ |
| **Event / Sự kiện** | Ghi hình hội nghị, lễ khai trương, sự kiện | Liên hệ |
| **Corporate Video** | Video giới thiệu doanh nghiệp, nội bộ | Liên hệ |

> *Giá được để "Liên hệ" để linh hoạt đàm phán. Có thể hiển thị giá cố định nếu Studio muốn.*

Mỗi gói dịch vụ bao gồm:
- Icon minh họa.
- Danh sách những gì bao gồm trong gói.
- Nút "Nhận báo giá" → dẫn đến trang Liên hệ.

---

### 3.4. Trang Giới thiệu (`/about`)

Xây dựng sự tin tưởng và kết nối cảm xúc với khách hàng.

**Nội dung bao gồm:**
- Câu chuyện thành lập Studio (Brand Story).
- Sứ mệnh & giá trị cốt lõi.
- Đội ngũ (ảnh + tên + vai trò từng thành viên).
- Thành tựu nổi bật, giải thưởng (nếu có).
- Số liệu ấn tượng: tổng số dự án, năm hoạt động, khách hàng tin tưởng.

---

### 3.5. Trang Liên hệ (`/contact`)

Điểm chuyển đổi (Conversion) — nơi khách hàng để lại thông tin hoặc liên hệ trực tiếp.

**Form liên hệ:**

| Trường | Kiểu dữ liệu | Bắt buộc |
|---|---|---|
| Họ và tên | Text | ✅ |
| Số điện thoại | Tel | ✅ |
| Email | Email | ❌ |
| Loại dịch vụ quan tâm | Dropdown | ❌ |
| Nội dung tin nhắn | Textarea | ❌ |

**Cơ chế gửi form:**
- Sử dụng dịch vụ **[Formspree](https://formspree.io)** hoặc **[EmailJS](https://www.emailjs.com/)** — miễn phí, không cần backend server.
- Sau khi submit: email thông báo được gửi về hòm thư của Studio.
- Hiển thị thông báo thành công/thất bại ngay trên trang.

**Thông tin liên hệ nhanh:**
- Nút **Zalo** → mở chat Zalo OA.
- Nút **Messenger** → mở Facebook Messenger.
- Nút **Hotline** → gọi điện trực tiếp (tel:).
- Địa chỉ Studio + Google Maps nhúng.
- Các icon mạng xã hội: Facebook, Instagram, YouTube, TikTok.

---

## 4. Thiết kế & Giao diện (UI/UX)

### Phong cách thiết kế
- **Tông màu:** Tối (Dark theme) — đen, xám đậm làm nền; vàng gold hoặc trắng làm màu nhấn. Phù hợp với ngành sáng tạo/video production.
- **Font chữ:** Kết hợp font Sans-serif hiện đại (VD: Inter, DM Sans) cho nội dung và font Display (VD: Playfair Display) cho tiêu đề lớn.
- **Hiệu ứng chuyển động:** Subtle animations khi scroll (fade-in, slide-up) để tạo cảm giác cao cấp. Không lạm dụng animation gây rối mắt.
- **Responsive:** Tương thích hoàn toàn trên Mobile, Tablet, Desktop.

### Nguyên tắc UX
- **Nút CTA (Call to Action)** luôn hiển thị rõ ràng ở đầu và cuối mỗi trang.
- Tốc độ tải trang mục tiêu: **< 3 giây** trên mạng 4G.
- Hình ảnh và video thumbnail được tối ưu (lazy loading, WebP format).

---

## 5. Công nghệ sử dụng

| Hạng mục | Lựa chọn | Lý do |
|---|---|---|
| **Framework** | Next.js (Static Export) | SEO tốt, hiệu năng cao, miễn phí deploy |
| **Styling** | Tailwind CSS | Phát triển nhanh, responsive dễ dàng |
| **Animation** | Framer Motion | Hiệu ứng mượt, dễ tích hợp với React |
| **Form xử lý** | Formspree / EmailJS | Miễn phí, không cần backend |
| **Video nhúng** | YouTube / Vimeo iframe | Không tốn bandwidth hosting |
| **Hosting** | Vercel | Miễn phí, CDN toàn cầu, HTTPS tự động |
| **Tên miền** | Namecheap / Inet.vn | Kết nối dễ dàng với Vercel |

> **Lưu ý:** Dữ liệu tác phẩm, dịch vụ, thông tin liên hệ được lưu trong các file `.js` hoặc `.json` ngay trong source code. Khi cần cập nhật nội dung, sửa file dữ liệu → push lên Git → Vercel tự động build và deploy lại trong vài phút.

---

## 6. Cấu trúc thư mục dự án

```
studio-portfolio/
├── public/
│   ├── images/
│   │   ├── portfolio/       # Thumbnail của các dự án
│   │   ├── team/            # Ảnh thành viên
│   │   └── clients/         # Logo khách hàng
│   └── favicon.ico
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # Trang chủ
│   │   ├── portfolio/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx   # Navbar + Mobile menu
│   │   │   └── Footer.tsx
│   │   ├── sections/        # Các section của trang chủ
│   │   │   ├── Hero.tsx
│   │   │   ├── FeaturedWork.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Clients.tsx
│   │   │   └── Testimonials.tsx
│   │   └── ui/              # Component tái sử dụng
│   │       ├── VideoCard.tsx
│   │       ├── FilterBar.tsx
│   │       ├── ContactForm.tsx
│   │       └── Lightbox.tsx
│   └── data/
│       ├── portfolio.ts     # Dữ liệu tác phẩm
│       ├── services.ts      # Dữ liệu dịch vụ
│       ├── team.ts          # Dữ liệu đội ngũ
│       └── clients.ts       # Logo khách hàng
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 7. Kế hoạch triển khai (7 - 10 ngày)

| Giai đoạn | Thời gian | Công việc |
|---|---|---|
| **Giai đoạn 1: Chuẩn bị** | Ngày 1 | Thu thập nội dung từ Studio (video links, ảnh, text, logo…). Thiết lập môi trường dự án, Git repository. |
| **Giai đoạn 2: Xây dựng** | Ngày 2 - 6 | Phát triển giao diện các trang theo thứ tự: Layout → Trang chủ → Portfolio → Services → About → Contact. |
| **Giai đoạn 3: Tích hợp nội dung** | Ngày 7 | Nhập toàn bộ nội dung thực tế của Studio vào hệ thống. Test form liên hệ. |
| **Giai đoạn 4: Review & Fix** | Ngày 8 | Bàn giao bản demo cho Studio review. Sửa chữa theo phản hồi. |
| **Giai đoạn 5: Deploy** | Ngày 9 - 10 | Deploy lên Vercel. Kết nối tên miền. Kiểm tra cuối cùng trên các thiết bị. |

---

## 8. Bàn giao & Tài liệu sử dụng

Sau khi hoàn thành, Developer bàn giao cho Studio:

1. **Source code** toàn bộ dự án (qua GitHub repository riêng).
2. **Hướng dẫn cập nhật nội dung** — tài liệu hướng dẫn cách sửa file dữ liệu để thêm/bớt tác phẩm, dịch vụ mà không cần kiến thức lập trình sâu.
3. **Tài khoản Vercel & tên miền** — bàn giao quyền sở hữu cho Studio.
4. **Video hướng dẫn** (tuỳ chọn) — ghi lại quá trình cập nhật nội dung cơ bản.

---

## 9. Chi phí

### 9.1. Chi phí phát triển (một lần)

| Hạng mục | Chi phí |
|---|---|
| Thiết kế & Lập trình | **5.000.000 - 8.000.000 VNĐ** |

> *Mức giá cuối cùng phụ thuộc vào số lượng trang, độ phức tạp của animation và số vòng chỉnh sửa giao diện.*

### 9.2. Chi phí vận hành hàng năm

| Hạng mục | Chi phí / năm | Ghi chú |
|---|---|---|
| Tên miền `.com` | ~ 300.000 - 500.000 VNĐ | Gia hạn hàng năm |
| Tên miền `.vn` | ~ 500.000 - 800.000 VNĐ | Gia hạn hàng năm |
| Hosting (Vercel) | **Miễn phí** | Gói Free đủ dùng cho traffic vừa |
| Bảo trì | Không đáng kể | Chỉ phát sinh khi cần sửa nội dung lớn |

**Tổng chi phí vận hành hàng năm: ~ 300.000 - 800.000 VNĐ** (chỉ là phí tên miền).

---

## 10. Điều kiện & Yêu cầu từ phía Studio

Để dự án triển khai đúng tiến độ, Studio cần chuẩn bị và cung cấp:

- [ ] **Logo** Studio (file vector `.svg` hoặc `.png` nền trong).
- [ ] **Ảnh đại diện** Studio (ảnh không gian, thiết bị, đội ngũ) — tối thiểu 10 ảnh chất lượng cao.
- [ ] **Danh sách tác phẩm muốn hiển thị** kèm link YouTube/Vimeo tương ứng.
- [ ] **Nội dung text** cho phần Giới thiệu và Dịch vụ (Studio tự soạn hoặc yêu cầu Developer hỗ trợ).
- [ ] **Logo/tên các khách hàng đối tác** đã hợp tác.
- [ ] **Thông tin liên hệ chính thức:** số điện thoại, email, địa chỉ, link Zalo OA / Facebook / Instagram.
- [ ] **Đăng ký tên miền** (hoặc ủy quyền cho Developer đăng ký).

---

## 11. Câu hỏi thường gặp (FAQ)

**Q: Sau này muốn thêm video mới thì làm thế nào?**
A: Chỉ cần gửi link YouTube cho Developer, Developer sẽ cập nhật vào file dữ liệu và deploy lại trong vòng 15-30 phút. Hoặc Studio có thể tự làm sau khi được hướng dẫn — chỉ cần sửa 1-2 dòng trong file text.

**Q: Website có lên Google không?**
A: Có. Next.js Static Export có khả năng SEO tốt. Ngoài ra sẽ được cấu hình thêm: meta tags, Open Graph (ảnh preview khi chia sẻ lên mạng xã hội), sitemap.xml để Google index nhanh hơn.

**Q: Có thể nâng cấp lên Option 2 sau này không?**
A: Hoàn toàn có thể. Phần Front-end của Option 1 được xây dựng với cấu trúc chuẩn, có thể tái sử dụng và kết nối với hệ thống Backend/CMS trong tương lai mà không cần làm lại từ đầu.

**Q: Formspree miễn phí có giới hạn không?**
A: Gói miễn phí cho phép nhận tối đa **50 lượt gửi form/tháng**. Đối với Studio mới hoạt động, con số này thường đủ dùng. Nếu cần nhiều hơn, gói trả phí của Formspree là ~$8/tháng.

---

*Tài liệu được soạn thảo bởi Developer nhằm hỗ trợ đàm phán và triển khai dự án. Mọi tính năng đều có thể điều chỉnh theo yêu cầu thực tế của Studio.*
