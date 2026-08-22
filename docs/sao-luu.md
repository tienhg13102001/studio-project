# Sao lưu và phục hồi beezvn.com

> Viết ngày 22/08/2026, sau khi kiểm máy chủ và phát hiện `scripts/backup.sh` đã
> nằm sẵn từ 31/07 nhưng **không có cron nào gọi nó** — thư mục sao lưu rỗng
> hoàn toàn. Nay đã chạy lần đầu, đã thử phục hồi, và đã đặt lịch.

## Đang có gì

| | |
| --- | --- |
| Cơ sở dữ liệu | `/var/backups/beezvn/beezvn-<ngày>-db.archive.gz` — giữ **14 ngày** |
| Ảnh & video | `/var/backups/beezvn/files/{uploads,videos}` — chép tăng dần, không xoá |
| Lịch chạy | mỗi ngày **20:00 giờ máy chủ** *(≈ 2–3 giờ sáng giờ Việt Nam)* |
| Nhật ký | `/var/log/beez-sao-luu.log` |
| Cảnh báo | email nếu bản mới nhất quá **2 ngày** tuổi, quá nhỏ, hoặc không có file nào |

## ⚠️ Điều CHƯA an toàn

**Bản sao lưu đang nằm trên CHÍNH ổ đĩa của máy chủ.**

Nó cứu được: xoá nhầm, sửa hỏng dữ liệu, gõ nhầm một lệnh — những tai nạn hay
xảy ra nhất.

Nó **không** cứu được: ổ hỏng, máy chủ bị nhà cung cấp xoá, hoặc ai đó chiếm
được quyền root rồi xoá cả hai.

Muốn kín thì phải đặt `BACKUP_REMOTE` trỏ ra ngoài *(Google Drive, S3…)*, script
đã hỗ trợ sẵn qua `rclone` — chỉ thiếu tài khoản. Xem mục cuối.

---

## Phục hồi khi có sự cố

### A · Mất/hỏng dữ liệu, máy chủ vẫn sống

**Bước 1 — xem có những bản nào**

```bash
ls -lt /var/backups/beezvn/beezvn-*-db.archive.gz
```

**Bước 2 — LUÔN thử vào cơ sở dữ liệu tạm TRƯỚC**

Đừng đổ thẳng vào bản đang chạy. Đổ vào tên khác rồi đếm, thấy đúng mới làm thật:

```bash
BAN=/var/backups/beezvn/beezvn-20260822-0945-db.archive.gz

docker exec -i beez-mongodb sh -c 'mongorestore --quiet --archive --gzip \
  --nsFrom="beez_db.*" --nsTo="beez_db_thu.*" --drop \
  -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin' < "$BAN"

docker exec beez-mongodb sh -c 'mongosh --quiet \
  -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin beez_db_thu \
  --eval "db.getCollectionNames().sort().forEach(c => print(c + \" \" + db.getCollection(c).countDocuments()))"'
```

Số liệu đúng phải xấp xỉ *(đo ngày 22/08/2026)*: `projects 67` · `brands 30` ·
`services 6` · `testimonials 8` · `users 4`.

**Bước 3 — đổ thật**

```bash
docker exec -i beez-mongodb sh -c 'mongorestore --quiet --archive --gzip --drop \
  -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin' < "$BAN"

docker restart beez-backend
```

> `--drop` xoá từng bảng ngay trước khi ghi đè bảng đó. Nghĩa là **mọi thay đổi
> sau thời điểm sao lưu sẽ mất**. Nếu chỉ hỏng một phần, phục hồi vào tên tạm
> rồi chép sang bằng tay sẽ an toàn hơn nhiều.

**Bước 4 — dọn bản tạm**

```bash
docker exec beez-mongodb sh -c 'mongosh --quiet \
  -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin --eval "db.getSiblingDB(\"beez_db_thu\").dropDatabase()"'
```

### B · Ảnh và video

```bash
docker run --rm --volumes-from beez-backend \
  -v /var/backups/beezvn/files:/mirror alpine:3 sh -c '
    cp -a /mirror/uploads/. /app/public/uploads/
    cp -a /mirror/videos/.  /app/public/videos/'
```

### C · Mất cả máy chủ

Chỉ làm được **nếu đã có bản ngoài máy chủ** — nay chưa có. Thứ tự:
dựng máy mới → `git clone` kho mã → `docker compose up -d --build` →
lấy bản sao lưu về → làm mục A và B.

---

## Kiểm tra định kỳ

**Mỗi tháng một lần**, đăng nhập máy chủ chạy đúng một dòng:

```bash
tail -20 /var/log/beez-sao-luu.log
```

Phải thấy dòng `── xong ──` của ngày gần nhất. Không thấy là có chuyện.

**Nửa năm một lần**, làm lại Bước 2 ở mục A *(phục hồi vào tên tạm rồi đếm)*.
Bản sao lưu chưa từng đọc lại được thì chưa tính là bản sao lưu — và cách duy
nhất để biết là thử.

---

## Việc còn thiếu: đưa bản sao ra ngoài máy chủ

```bash
apt install rclone && rclone config          # chọn Google Drive hoặc S3
echo 'BACKUP_REMOTE=gdrive:beezvn-backup' >> /etc/environment
```

Rồi thêm `BACKUP_REMOTE` vào dòng cron. Script tự đẩy bản kết xuất và đồng bộ
ảnh/video, tự dọn bản cũ ở xa theo đúng số ngày như dưới máy.

Lần đầu sẽ tải lên **~5,3 GB**, các lần sau chỉ phần mới.

---

## Đã thử phục hồi lần nào chưa

| Ngày | Kết quả |
| --- | --- |
| 22/08/2026 | Phục hồi vào `beez_db_thuphuchoi`: **15/15 bảng khớp số**, nội dung `projects` so chuỗi JSON **giống hệt từng ký tự**, 3 file ảnh/video so mã băm md5 đều khớp, **510/510 file**. Đã xoá bản tạm. |
