# Sao lưu & phục hồi beezvn.com

Toàn bộ dữ liệu của web đang nằm trong Docker volume trên **đúng một máy chủ**.
Ổ hỏng, gõ nhầm một lệnh, hoặc nhà cung cấp xoá máy là mất sạch và không có
bản nào ở nơi khác để lấy lại. Tài liệu này mô tả cách bật sao lưu tự động và
cách lấy lại dữ liệu khi cần.

> Người thực hiện: bạn dev quản máy chủ. Toàn bộ việc dưới đây làm trên máy chủ,
> không đụng gì tới mã nguồn.

---

## 1. Sao lưu những gì

| Thứ                     | Nằm ở đâu                              | Có trong bản sao lưu |
| ----------------------- | -------------------------------------- | -------------------- |
| Cơ sở dữ liệu `beez_db` | volume `mongodb_data`                  | ✅ kết xuất hằng ngày |
| Ảnh khách tải lên       | volume `backend_uploads`               | ✅ đồng bộ tăng dần   |
| Video                   | volume `backend_videos`                | ✅ đồng bộ tăng dần   |
| Mã nguồn                | GitHub                                 | ✅ đã có sẵn ở GitHub |
| `.env` (mật khẩu, khoá) | `/home/studio-project/.env` + `back-end/.env` | ❌ **xem mục 5** |

Cơ sở dữ liệu được kết xuất mỗi ngày một bản và giữ 14 ngày. Ảnh/video KHÔNG nén
lại mỗi ngày (video có thể vài GB) mà chỉ chép thêm phần mới — nhanh và không
làm đầy ổ.

---

## 2. Cài đặt (làm một lần)

### Bước 1 — Tạo chỗ chứa

```bash
sudo mkdir -p /var/backups/beezvn
sudo chown "$USER" /var/backups/beezvn
```

### Bước 2 — Chạy thử chế độ kiểm tra

Chế độ `--check` chỉ kiểm tra điều kiện, **không ghi gì cả**:

```bash
cd /home/studio-project
./scripts/backup.sh --check
```

Nếu báo lỗi, xem mục 6 (Xử lý sự cố). Nếu qua hết, chạy thật một lần:

```bash
./scripts/backup.sh
ls -lh /var/backups/beezvn
```

Phải thấy một file `beezvn-<ngày>-db.archive.gz` và thư mục `files/` có ảnh.

### Bước 3 — Nối Google Drive (quan trọng)

Sao lưu nằm trên chính máy chủ chỉ cứu được lỗi gõ nhầm. Ổ hỏng là mất cả bản
gốc lẫn bản sao. Cần một bản ở nơi khác:

```bash
# Cài rclone
curl https://rclone.org/install.sh | sudo bash

# Cấu hình — chọn "n" (new remote), đặt tên `gdrive`, chọn Google Drive,
# để mặc định các mục còn lại, rồi làm theo hướng dẫn đăng nhập.
rclone config

# Kiểm tra
rclone lsd gdrive:
```

Máy chủ thường không có trình duyệt, nên khi rclone hỏi đăng nhập hãy chọn
**"n" cho auto config** rồi chạy `rclone authorize "drive"` trên máy tính cá
nhân và dán chuỗi kết quả về.

Tạo sẵn thư mục đích:

```bash
rclone mkdir gdrive:beezvn-backup
BACKUP_REMOTE=gdrive:beezvn-backup ./scripts/backup.sh --check
```

### Bước 4 — Hẹn giờ chạy hằng ngày

```bash
crontab -e
```

Thêm vào (3h30 sáng, giờ máy chủ):

```cron
# cron chạy với PATH rất hẹp — phải khai báo, nếu không sẽ báo "không tìm thấy docker"
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
30 3 * * * BACKUP_REMOTE=gdrive:beezvn-backup /home/studio-project/scripts/backup.sh >> /var/log/beezvn-backup.log 2>&1
```

Hôm sau kiểm tra:

```bash
tail -30 /var/log/beezvn-backup.log
rclone ls gdrive:beezvn-backup/db
```

---

## 3. Phục hồi

> **Trước khi phục hồi, luôn kết xuất một bản của tình trạng hiện tại**
> (`./scripts/backup.sh`). Phục hồi nhầm bản mà không có đường lùi là hỏng kép.

### Mất/hỏng dữ liệu trong cơ sở dữ liệu

```bash
cd /home/studio-project

# 1. Dừng backend để không ai ghi thêm trong lúc nạp lại
docker compose stop backend

# 2. Nạp lại. --drop xoá các bảng CÓ TRONG BẢN SAO LƯU rồi mới nạp;
#    bảng phát sinh sau đó mà bản sao lưu không có sẽ được giữ nguyên.
docker exec -i beez-mongodb sh -c '
  mongorestore --archive --gzip --drop \
    -u "$MONGO_INITDB_ROOT_USERNAME" \
    -p "$MONGO_INITDB_ROOT_PASSWORD" \
    --authenticationDatabase admin
' < /var/backups/beezvn/beezvn-20260731-0330-db.archive.gz

# 3. Bật lại
docker compose start backend
```

Nếu bản sao lưu nằm trên Drive:

```bash
rclone copy gdrive:beezvn-backup/db/beezvn-20260731-0330-db.archive.gz /var/backups/beezvn/
```

### Mất ảnh/video

```bash
docker run --rm \
  --volumes-from beez-backend \
  -v /var/backups/beezvn/files:/mirror:ro \
  alpine:3 sh -c '
    cp -a /mirror/uploads/. /app/public/uploads/
    cp -a /mirror/videos/.  /app/public/videos/
  '
```

### Dựng lại từ đầu trên máy chủ mới

1. Cài Docker + Docker Compose.
2. `git clone` repo về `/home/studio-project`.
3. Đặt lại `.env` ở gốc và `back-end/.env` (xem mục 5).
4. `docker compose up -d --build`
5. `rclone copy gdrive:beezvn-backup /var/backups/beezvn`
6. Chạy hai lệnh phục hồi ở trên.

---

## 4. Diễn tập phục hồi (nên làm 3 tháng một lần)

Bản sao lưu chưa từng phục hồi thử thì chưa chắc dùng được. Cách thử **không
đụng vào dữ liệu thật** — nạp vào một tên cơ sở dữ liệu khác rồi xoá đi:

```bash
# Nạp bản sao lưu vào beez_thu (không phải beez_db)
docker exec -i beez-mongodb sh -c '
  mongorestore --archive --gzip \
    --nsFrom "beez_db.*" --nsTo "beez_thu.*" \
    -u "$MONGO_INITDB_ROOT_USERNAME" \
    -p "$MONGO_INITDB_ROOT_PASSWORD" \
    --authenticationDatabase admin
' < /var/backups/beezvn/beezvn-20260731-0330-db.archive.gz

# Đếm thử vài bảng — số phải khớp với dữ liệu thật
docker exec beez-mongodb sh -c '
  mongosh --quiet -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
    --authenticationDatabase admin beez_thu \
    --eval "[\"projects\",\"services\",\"customers\"].forEach(c => print(c, db[c].countDocuments()))"
'

# Dọn sạch
docker exec beez-mongodb sh -c '
  mongosh --quiet -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
    --authenticationDatabase admin beez_thu --eval "db.dropDatabase()"
'
```

---

## 5. Hai file `.env` — phải cất tay

`/home/studio-project/.env` (mật khẩu MongoDB) và `back-end/.env` (khoá ký phiên
đăng nhập, mật khẩu gửi mail) **cố ý không nằm trong bản sao lưu tự động**: đẩy
mật khẩu lên Google Drive là chuyện phải do chủ sở hữu quyết định, không phải do
một script tự làm.

Mất hai file này thì dữ liệu vẫn còn nhưng không mở được cơ sở dữ liệu và mọi
người đang đăng nhập bị đăng xuất. Hãy chép nội dung của chúng vào một trình
quản lý mật khẩu (1Password, Bitwarden…) và cập nhật lại mỗi khi đổi.

---

## 6. Xử lý sự cố

**`container 'beez-mongodb' không chạy`**
`docker compose ps` xem tình trạng, `docker compose up -d` để bật lại.

**`container MongoDB không có mongodump`**
Ảnh mongo chính thức có sẵn công cụ này; nếu bản đang dùng không có, kết xuất
bằng một container tạm:

```bash
cd /home/studio-project
set -a; . ./.env; set +a          # nạp MONGO_ROOT_USER / MONGO_ROOT_PASS

docker run --rm --network studio-project_beez-net mongo:7 \
  mongodump --quiet --archive --gzip --db beez_db \
  --host beez-mongodb -u "$MONGO_ROOT_USER" -p "$MONGO_ROOT_PASS" \
  --authenticationDatabase admin > /var/backups/beezvn/thu-cong.archive.gz
```

(Tên mạng lấy từ `docker network ls`. Cách này để mật khẩu lộ trong `ps` nên
chỉ dùng khi cần chữa cháy, không đưa vào cron.)

**`rclone không kết nối được`**
Token Google hết hạn — chạy lại `rclone config`, chọn remote `gdrive`, mục
`Edit` rồi đăng nhập lại.

**`chỉ còn ...MB trống`**
`du -sh /var/backups/beezvn/*` xem chỗ nào phình. Giảm số ngày giữ bằng
`BACKUP_KEEP_DAYS=7`, hoặc gắn thêm ổ.

**Cron không chạy**
`grep CRON /var/log/syslog | tail` và kiểm tra dòng `PATH=` đã có trong crontab
chưa — đây là nguyên nhân phổ biến nhất.
