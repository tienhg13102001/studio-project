# Nâng cấp UX Portal — Gói 2

> Nhánh: `claude/portal-ux-pack-2` · 6 commit · 23 file
> Nguyên tắc xuyên suốt: **chỉ cộng thêm, không đổi hành vi đang chạy**. Mọi prop mới đều tùy chọn và mặc định giữ nguyên cách hoạt động cũ.

## Vì sao làm gói này

Portal là nơi chủ studio dùng hằng ngày, nhưng đang thiếu những phản hồi cơ bản: lưu xong không biết đã lưu chưa, có khách mới không biết, bảng dài thì mất tên cột, form dài lỡ tay là mất trắng, và giao diện lẫn Anh–Việt.

---

## 1. Toast "Đã lưu / Đã xoá / Lỗi" dùng chung

**Trước:** lưu hoặc xoá thành công thì modal đóng im lặng, không có phản hồi gì → dễ bấm Lưu hai lần. Lỗi thì hiện một dòng chữ đỏ ở đáy modal (chỗ hay bị cuộn khỏi tầm mắt ở form dài).

**Sau:** toast xếp chồng ở góc trên phải, tự tắt sau 3,6 giây (6 giây nếu có nút hành động).

- File mới: `front-end/src/components/organisms/portal/PortalToast.tsx` — provider + hook `usePortalToast()`.
- Đã nối: Đội ngũ, Thương hiệu, Liên hệ (xoá), Nội dung trang chủ.
- Đặt góc **trên phải** vì tab Nội dung trang chủ có thanh lưu cố định ở đáy (`sticky bottom-0`) — toast ở đáy sẽ bị che.
- `z-130` để luôn nằm trên modal (`z-50`) và nền sidebar (`z-40`).

**Quyết định kỹ thuật:** giá trị context được `useMemo`, các hàm `useCallback`, và `children` được render nguyên văn. Nhờ vậy khi toast xuất hiện/tắt, **cây portal không re-render** — nếu không làm vậy thì đang gõ giữa form sẽ bị mất con trỏ. Timer được dọn cả khi toast tự tắt lẫn khi rời khỏi portal.

**Chưa làm:** phần báo lỗi inline cũ và dấu "Đã lưu" cũ vẫn giữ nguyên. Toast là bổ sung — nếu cần lùi lại thì không mất kênh báo lỗi nào.

## 2. Badge "Liên hệ" + block "Liên hệ mới nhất"

**Trước:** có khách gửi form thì không có dấu hiệu gì trong portal; phải tự mở tab Liên hệ mới biết.

**Sau:**
- Sidebar hiện **số liên hệ chưa xem** cạnh mục "Liên hệ" (trên 9 thì hiện `9+`).
- Trang **Tổng quan** có khối "Liên hệ mới nhất" — 5 dòng gần nhất, dòng chưa xem gắn nhãn **Mới**; bấm một dòng là sang trang Liên hệ.

**Quyết định kỹ thuật:** backend không có cờ "đã đọc" (`Customer` chỉ có `createdAt`, không có route cập nhật trạng thái), nên mốc "đã xem" lưu ở `localStorage` (`portal_inquiries_seen_at`). Vào trang Liên hệ là ghi mốc → badge về 0.

**Giới hạn cần biết:** mốc này **riêng theo từng máy/trình duyệt**. Xem ở máy A thì máy B vẫn thấy badge. Muốn dùng chung nhiều máy/nhiều người thì phải thêm field vào database — nằm ngoài gói này.

Xoá một liên hệ sẽ bắn tín hiệu (`beez:inquiries-changed`) để số badge cập nhật theo, vì badge và bảng dùng hai bản hook khác nhau.

## 3. Header bảng dính khi cuộn

**Trước:** cuộn danh sách dài là mất tên cột, phải nhớ cột nào là cột nào.

**Sau:** tên cột dính ở trên khi cuộn, áp dụng cho 4 bảng: Đội ngũ, Dự án, Dịch vụ, Liên hệ.

**Cạm bẫy đã tránh** (ghi lại để sau khỏi mắc):
- Chỉ thêm `sticky top-0` là **không có tác dụng gì và cũng không báo lỗi** — vì `overflow-x-auto` khiến chính div bọc bảng thành vùng cuộn, mà nó không bị giới hạn chiều cao. Phải cấp `max-h` cho div đó, nên `Table` có thêm prop `containerClassName`.
- Nền cũ của thead chỉ đục 3% → khi cuộn, các dòng bên dưới **hiện xuyên qua** tên cột. Đã chuyển nền thead sang đục hẳn, và dời tint + đường kẻ xuống `<th>` (đường kẻ khai trên thead dính hay bị bỏ vẽ do `border-collapse`).
- Bản preview 4–5 dòng ở trang Tổng quan **không** cấp `max-h` (không cần dính).

## 4. Ô tìm nhanh (Đội ngũ, Dự án)

Lọc ngay trên máy, không gọi thêm API. **Gõ không dấu vẫn ra**: `hoan` → Hoàn, `dat` → Đỗ Đạt, `quang cao` → Quảng Cáo.

- Đội ngũ: tìm theo tên, email, vai trò (cả EN và VI), quyền, kỹ năng.
- Dự án: tìm theo tên, phụ đề, tag.
- Lọc không ra gì thì hiện "Không tìm thấy… khớp «…»" để phân biệt với trường hợp chưa có dữ liệu.

Trạng thái ô tìm đặt ở **tab**, không đặt trong component bảng — vì bảng Đội ngũ còn được trang Tổng quan dùng lại, đặt sai chỗ sẽ mọc thêm ô tìm ở Tổng quan.

Dọn luôn `console.log(data)` sót trong tab Dự án (đang in dữ liệu ra console ở bản chạy thật).

## 5. Modal: Escape / bấm nền / hỏi lại khi chưa lưu

**Trước:** chỉ đóng được bằng đúng hai nút; form dài (Dịch vụ, Dự án) lỡ tay là mất trắng.

**Sau:**
- **Escape** đóng modal — nhưng bỏ qua khi đang mở Select/Popover/chọn ngày/chọn icon, để một lần bấm không đóng luôn cả modal.
- **Bấm ra nền** đóng modal. Dùng `mousedown` và chỉ khi bấm đúng lớp nền, nên bấm-giữ trong form rồi nhả chuột ra ngoài **không** làm mất form.
- Đang **Đang lưu…/Đang xoá…** thì không cho đóng.
- Form có thay đổi chưa lưu → hỏi **"Bỏ các thay đổi chưa lưu?"**.

Lưu thành công hoặc xoá thì tab tự đóng modal, **không** bị hỏi lại.

**Cách nhận biết "đã sửa" — hai mức:**

| Tab | Cách nhận biết | Ghi chú |
|---|---|---|
| **Dự án**, **Dịch vụ** | **Chính xác** — chụp lại form lúc mới mở rồi so sánh | Sửa rồi sửa lại đúng như cũ thì **không** bị hỏi |
| Đội ngũ, Thương hiệu, Portfolio | Tự đoán — nghe thay đổi của các ô bên trong | Sửa rồi sửa lại như cũ **vẫn** bị hỏi (chấp nhận được, vì hỏi thừa an toàn hơn mất dữ liệu) |

Lý do hai mức: kiểm tra kỹ phát hiện **3 thao tác sửa thật mà cách tự đoán không thấy** — đổi **ngày quay**, đổi **icon**, và thêm/xoá **người thực hiện** (chúng gọi hàm nội bộ chứ không phát sự kiện DOM). Nếu để nguyên thì đóng modal sẽ mất dữ liệu mà không hỏi gì — đúng cái tính năng này định ngăn. Hai tab chứa các control đó đã được nối cách chính xác; ba tab còn lại chỉ có ô nhập/checkbox thường nên không bị lọt.

## 6. Thanh tiến trình upload

**Trước:** chỉ có con số % nhảy cạnh spinner. Video tới 5GB thì không biết còn bao lâu, và giai đoạn server xử lý nhìn như bị treo.

**Sau:** thêm thanh tiến trình mảnh, phân biệt hai pha:
- **Đang tải lên… N%** — tiến độ thật.
- **Đang xử lý trên server…** — thanh chạy vô định (ảnh: resize + chuyển WebP; video: ghép mảnh + transcode).

Suy ra pha từ dữ liệu **sẵn có**, không thêm state, không sửa `lib/api.ts`, không đổi props của 3 component upload (10 chỗ đang dùng không phải sửa gì). Spinner cũ giữ nguyên.

## 7. Thống nhất tiếng Việt

Sidebar, header (kèm định dạng ngày `vi-VN`), nút của modal, tiêu đề/nút/tên cột/hộp thoại xác nhận của các tab.

**Chỉ đổi chữ hiển thị.** Không dịch dữ liệu người dùng nhập (`role.en`, tag, tên dự án) và không đổi giá trị logic (`admin`/`editor`/`member`, `vertical`/`horizontal`, id route) — quyền tài khoản chỉ được *hiển thị* qua bảng nhãn, còn giá trị gốc giữ nguyên để phân quyền và tra màu vẫn đúng.

---

## Cách kiểm tra sau khi merge

Đăng nhập `beezvn.com/portal`, rồi đi theo thứ tự:

**Toast**
1. Vào **Đội ngũ** → Sửa một người → **Lưu thay đổi** → phải thấy toast "Đã lưu thay đổi" góc trên phải, tự tắt sau ~3,6 giây.
2. Xoá một thương hiệu (tab **Thương hiệu**) → toast "Đã xoá thương hiệu".
3. Trong lúc toast đang hiện, gõ vào một ô bất kỳ → **con trỏ không được nhảy ra khỏi ô**.
4. Bấm nút ✕ trên toast → tắt ngay.

**Badge + Liên hệ mới**
5. Vào **Tổng quan** → thấy khối "Liên hệ mới nhất"; sidebar có số cạnh "Liên hệ".
6. Bấm một dòng liên hệ → sang trang Liên hệ, **badge về 0**.
7. Xoá một liên hệ → toast hiện, số trong tiêu đề giảm.

**Header bảng dính**
8. Vào **Dự án** (cần >15 dòng để thấy rõ) → cuộn bảng → **tên cột dính ở trên và chữ không xuyên qua**.
9. Kiểm tra cả 4 bảng: Đội ngũ, Dự án, Dịch vụ, Liên hệ.
10. Bật **giao diện sáng** (nút chuyển sáng/tối) rồi cuộn lại — nền tên cột vẫn đục, còn thấy đường kẻ.
11. Xem trên **điện thoại**: bảng vẫn vuốt ngang được, không bị kẹt hai tầng cuộn khó chịu.

**Ô tìm nhanh**
12. Tab **Đội ngũ** → gõ `hoan` (không dấu) → phải ra người tên "Hoàn".
13. Gõ chuỗi vô nghĩa → hiện "Không tìm thấy thành viên nào khớp…".
14. Đang lọc → bấm **Sửa** ở một dòng → phải mở đúng người đó.
15. Vào **Tổng quan** → khối Đội ngũ **không** có ô tìm kiếm (đúng ý đồ).

**Modal**
16. Mở Sửa một dịch vụ → **không sửa gì** → bấm Escape → đóng ngay, không hỏi.
17. Mở lại → sửa một ô → bấm Escape (hoặc bấm ra nền) → phải hỏi **"Bỏ các thay đổi chưa lưu?"** → chọn "Tiếp tục sửa" thì form còn nguyên.
18. Mở dropdown **Dịch vụ** hoặc **chọn ngày** rồi bấm Escape → chỉ đóng dropdown, **modal vẫn mở**.
19. Bấm **Lưu thay đổi** → modal đóng, **không** bị hỏi "chưa lưu".
20. Bấm giữ chuột trong form rồi nhả ra ngoài nền → modal **không** đóng.
20b. Tab **Dự án** → Sửa → chỉ **đổi ngày quay** (không sửa gì khác) → Escape → **phải hỏi** "chưa lưu". Làm tương tự với **thêm/xoá người thực hiện**, và với **đổi icon** ở tab Dịch vụ.
20c. Tab **Dự án** → sửa một ô rồi **sửa lại đúng như cũ** → Escape → đóng luôn, **không** hỏi (vì đúng ra là chưa đổi gì).

**Upload**
21. Tab **Dự án** → Sửa → tải một ảnh lớn (>20MB) → thấy thanh chạy theo %, khi đạt 100% chuyển thành "Đang xử lý ảnh trên server…".
22. Tải một video → sau khi tải xong thấy "Đang xử lý (transcode)…" với thanh chạy vô định.

**Tiếng Việt**
23. Sidebar: Tổng quan / Thống kê / Đội ngũ / Thương hiệu / Dịch vụ / Dự án / Liên hệ / Cài đặt.
24. Header chào theo giờ bằng tiếng Việt, ngày hiện kiểu Việt Nam.
25. Nút trong modal: **Huỷ** / **Lưu thay đổi** / **Xoá**.

**Giảm chuyển động** (tùy chọn)
26. Bật "giảm chuyển động" trong hệ điều hành → toast và thanh tiến trình không còn hiệu ứng, nhưng vẫn hiện đủ nội dung.

---

## Điều cần biết thêm

- **Không sửa backend** trong gói này: không migration, không endpoint mới.
- **Không chạy prettier** trên các file cũ vì bản gốc chưa đúng chuẩn prettier — format lại sẽ churn toàn file và không thể review. Vì vậy vài khối JSX mới có thụt lề chưa hoàn hảo, đổi lại diff nhỏ và đọc được.
- **Lỗi TypeScript sẵn có, không do gói này**: `ProjectsTab.tsx` báo `TS2352` (chuyển `ApiServiceTag` → `string`). Đã kiểm tra tồn tại trên `main` sạch. `tsc -b` thông thường bị cache che nên không thấy; chạy `tsc -b --force` mới hiện. Nên vá riêng để build từ đầu không có nguy cơ fail.
