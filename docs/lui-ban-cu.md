# Lùi web về bản trước khi có sự cố

*Dùng khi vừa đẩy lên và web hỏng. Mục tiêu: web sống lại trong vài giây, sửa lỗi
tính sau.*

---

## Vì sao trước đây không lùi được

Lệnh dọn rác sau mỗi lần deploy là `docker image prune -f` — nó xoá **mọi** ảnh
không còn container nào dùng, kể cả bản vừa bị thay ra vài phút trước. Muốn quay
về chỉ còn cách dựng lại từ mã nguồn: vài phút web hỏng, và còn phụ thuộc lúc đó
GitHub với kho thư viện có sống không.

Nay lệnh đó đổi thành `docker image prune -f --filter "until=24h"` — chỉ dọn ảnh
cũ quá một ngày, nên **bản trước luôn còn nằm trên máy chủ trong 24 giờ**.

> Nghĩa là: cửa sổ lùi nhanh chỉ có **24 giờ**. Phát hiện lỗi sau hai ngày thì
> vẫn phải dựng lại từ mã nguồn như cũ.

---

## Cách lùi (chạy trên máy chủ, qua SSH)

### Bước 1 — Xem còn những ảnh nào

```bash
docker images --format "table {{.ID}}\t{{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}"
```

Tìm ảnh của phần bị hỏng (`…-frontend` hoặc `…-backend`). Cái đang chạy có thẻ
`latest`; **bản trước là ảnh cùng tên nhưng thẻ `<none>`, thời gian tạo cũ hơn**.

Ghi lại `IMAGE ID` của bản cũ đó.

### Bước 2 — Gắn lại thẻ cho bản cũ

```bash
# Thay <ID_CU> và <TEN_ANH> bằng giá trị đọc được ở bước 1
docker tag <ID_CU> <TEN_ANH>:latest
```

### Bước 3 — Khởi động lại, KHÔNG dựng lại

```bash
cd /home/studio-project
docker compose up -d --no-build
```

`--no-build` là chỗ quan trọng nhất: thiếu nó thì Docker dựng lại từ mã nguồn
đang hỏng, và mọi việc trên thành vô ích.

### Bước 4 — Kiểm

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.beezvn.com/
docker compose ps
```

Ra `200` là xong. Sau đó mới bình tĩnh sửa lỗi trong mã nguồn rồi đẩy lại.

---

## Lưu ý

- **Chỉ lùi phần bị hỏng.** Hỏng giao diện thì chỉ gắn thẻ lại cho ảnh
  `…-frontend`, đừng đụng `…-backend` và tuyệt đối đừng đụng container MongoDB.
- **Lùi mã nguồn KHÔNG lùi dữ liệu.** Dữ liệu nằm trong MongoDB, không nằm trong
  ảnh Docker. Lùi bản cũ không làm mất dự án hay liên hệ khách nào.
- **Đừng `docker system prune`.** Lệnh đó xoá sạch mọi thứ không dùng, kể cả
  volume — tức là có thể xoá luôn cơ sở dữ liệu. Không bao giờ chạy nó trên máy
  chủ này.

---

## Kiểm thử trước khi cần dùng thật

Đọc hướng dẫn lúc đang hỏng là quá muộn. Nên thử một lần lúc rảnh:

1. Đẩy một thay đổi vô hại (đổi một dòng chữ)
2. Chờ deploy xong
3. Làm theo bốn bước trên để lùi về bản trước
4. Xác nhận dòng chữ quay lại như cũ
5. Đẩy lại bản mới

Mất 10 phút, đổi lại là biết chắc quy trình chạy được khi thật sự cần.
