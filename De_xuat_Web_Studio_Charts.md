# SO SÁNH 3 PHƯƠNG ÁN — VISUALIZED

> Dựa trên tài liệu `De_xuat_Web_Studio_3_Options.md`

---

## 1. Vị trí các phương án: Chi phí vs Độ phức tạp

```mermaid
quadrantChart
    title Chi phí vs Độ phức tạp
    x-axis "Đơn giản" --> "Phức tạp cao"
    y-axis "Chi phí thấp" --> "Chi phí cao"
    quadrant-1 Toàn diện & Đầu tư lớn
    quadrant-2 Phức tạp nhưng rẻ
    quadrant-3 Nhanh gọn & Tiết kiệm
    quadrant-4 Đơn giản nhưng đắt
    Phương án 1 - Portfolio Tĩnh: [0.15, 0.08]
    Phương án 2 - Portfolio Động: [0.45, 0.22]
    Phương án 3 - Hệ thống Toàn diện: [0.88, 0.82]
```

---

## 2. So sánh Ngân sách (triệu VNĐ — giá trị trung bình)

```mermaid
xychart-beta
    title "Ngân sách ước tính (triệu VNĐ)"
    x-axis ["PA1 - Tĩnh", "PA2 - CMS", "PA3 - ERP"]
    y-axis "Triệu VNĐ" 0 --> 70
    bar [6.5, 15, 57.5]
```

---

## 3. So sánh Thời gian hoàn thành (ngày — giá trị trung bình)

```mermaid
xychart-beta
    title "Thời gian hoàn thành ước tính (ngày)"
    x-axis ["PA1 - Tĩnh", "PA2 - CMS", "PA3 - ERP"]
    y-axis "Số ngày" 0 --> 65
    bar [8.5, 17.5, 52.5]
```

---

## 4. Bản đồ tính năng theo từng phương án

```mermaid
mindmap
  root((Website Studio))
    PA1 - Portfolio Tĩnh
      Giao diện front-end đẹp
      Nhúng video YouTube/Vimeo
      Form liên hệ gửi Email
      Nút Zalo / Messenger / Hotline
      Cần code để cập nhật nội dung
    PA2 - Portfolio Động
      Kế thừa toàn bộ PA1
      Dữ liệu tải động từ Database
      Lọc dự án theo thể loại TVC/MV
      Admin Dashboard đăng nhập bảo mật
      Thêm/sửa/xóa Portfolio & Dịch vụ
      Quản lý lead khách hàng tư vấn
    PA3 - Hệ thống Toàn diện
      Kế thừa toàn bộ PA2
      Phân quyền Admin/Sales/Quay/Dựng
      Bảng Kanban kéo thả task
      Phân công người phụ trách & Deadline
      Kho lưu trữ link Source Raw & Final
      Lịch sử phản hồi của khách hàng
```

---

## 5. Workflow sản xuất (Option 3 — Kanban)

```mermaid
flowchart LR
    A([Nhận Booking]) --> B([Đi Quay])
    B --> C([Đang Dựng])
    C --> D([Chờ Duyệt])
    D --> E{Khách duyệt?}
    E -->|Yêu cầu chỉnh sửa| C
    E -->|Đồng ý| F([Hoàn thành])

    style A fill:#4A90D9,color:#fff
    style B fill:#7B68EE,color:#fff
    style C fill:#F5A623,color:#fff
    style D fill:#9B59B6,color:#fff
    style E fill:#E74C3C,color:#fff
    style F fill:#27AE60,color:#fff
```

---

## 6. Sơ đồ phân quyền nhân sự (Option 3)

```mermaid
flowchart TD
    Admin["Quản trị viên\n(Toàn quyền)"]
    Sales["Kinh doanh\n(Quản lý Lead & Booking)"]
    Camera["Quay phim\n(Xem & cập nhật task quay)"]
    Editor["Dựng phim\n(Xem & cập nhật task dựng)"]

    Admin --> Sales
    Admin --> Camera
    Admin --> Editor

    style Admin fill:#E74C3C,color:#fff
    style Sales fill:#3498DB,color:#fff
    style Camera fill:#8E44AD,color:#fff
    style Editor fill:#27AE60,color:#fff
```

---

## 7. Bảng tóm tắt so sánh

| Tiêu chí | Option 1 | Option 2 | Option 3 |
| :--- | :---: | :---: | :---: |
| Thời gian hoàn thành | 7–10 ngày | 14–21 ngày | 45–60 ngày |
| Ngân sách | 5–8 triệu | 12–18 triệu | 45–70 triệu |
| Hosting / Server | Miễn phí | VPS ~2.5–4tr/năm | VPS ~2.5–4tr/năm |
| Tự cập nhật nội dung | ❌ | ✅ | ✅ |
| Quản lý Lead khách hàng | ❌ | ✅ | ✅ |
| Phân quyền nhân sự | ❌ | ❌ | ✅ |
| Kanban & Workflow | ❌ | ❌ | ✅ |
| Kho lưu trữ file dự án | ❌ | ❌ | ✅ |
<!-- | Phù hợp khi | Mới bắt đầu | Cần marketing | Vận hành chuyên nghiệp | -->
