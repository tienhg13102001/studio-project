# Deploy beezvn.com

Stack: **Caddy (reverse proxy + auto HTTPS) → Frontend (Nginx SPA) + Backend (Express/TSX) + MongoDB**.

Server IP: `103.72.57.10` — DNS đã trỏ tại Cloudflare cho `beezvn.com` và `www.beezvn.com` (proxied).

---

## 1. Chuẩn bị Cloudflare

Vì bản ghi A đang ở chế độ **proxied** (`cf-proxied:true`), Cloudflare sẽ đứng trước origin. Trong dashboard Cloudflare → **SSL/TLS**:

- Encryption mode: **Full (strict)** — Caddy sẽ tự xin Let's Encrypt cert hợp lệ trên origin.
- Bật **Always Use HTTPS**.
- (Tuỳ chọn) Bật **Automatic HTTPS Rewrites**.

> Lần đầu Caddy xin cert qua HTTP-01 challenge, Cloudflare proxy vẫn forward `/.well-known/acme-challenge/*` về origin nên hoạt động bình thường. Nếu gặp lỗi, tạm chuyển DNS sang "DNS only" (mây xám) đến khi cert được cấp rồi bật lại proxy.

## 2. Mở firewall trên host

Cần mở **80** và **443** (Cloudflare chỉ kết nối origin qua các port này khi proxied):

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 3. Cài Docker & Docker Compose plugin

Ubuntu/Debian:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# logout/login lại để áp dụng group
```

Verify:

```bash
docker --version
docker compose version
```

## 4. Clone repo (lần đầu)

```bash
cd /opt
sudo mkdir -p beezvn && sudo chown $USER:$USER beezvn
cd beezvn
git clone <REPO_URL> .
```

## 5. Tạo file `.env`

Ở **thư mục gốc** repo:

```bash
cp .env.example .env
nano .env
```

Sửa giá trị `MONGO_ROOT_USER`, `MONGO_ROOT_PASS` (đặt mật khẩu mạnh).

Ở **`back-end/.env`** (có thể chỉ cần file rỗng vì compose đã set env, nhưng tạo cho chắc):

```bash
cp back-end/.env.example back-end/.env
```

> Compose tự override `MONGODB_URI`, `FRONTEND_URL`, `NODE_ENV`, `PORT` — bạn không cần sửa.

## 6. Khởi chạy lần đầu

```bash
chmod +x deploy.sh
docker compose up --build -d
docker compose logs -f caddy   # xem cert được cấp
```

Truy cập: https://beezvn.com

## 7. (Tuỳ chọn) Seed dữ liệu Mongo

```bash
docker compose exec backend npm run seed
```

## 8. Cập nhật code các lần sau

```bash
cd /opt/beezvn
./deploy.sh
```

Tương đương:

```bash
git pull
docker compose up --build -d
```

## 9. Lệnh hữu ích

```bash
docker compose ps                 # trạng thái
docker compose logs -f backend    # log backend
docker compose logs -f frontend   # log nginx SPA
docker compose logs -f caddy      # log reverse proxy
docker compose restart backend    # restart 1 service
docker compose down               # dừng (giữ volume)
docker compose down -v            # dừng + xoá db (cẩn thận!)
```

## 10. Kiến trúc request

```
Cloudflare ──HTTPS──▶ Caddy:443
                        │
                        ├─ /api/*     ─▶ backend:4000  (Express)
                        ├─ /images/*  ─▶ backend:4000  (static)
                        ├─ /videos/*  ─▶ backend:4000  (static)
                        └─ /*         ─▶ frontend:80   (Nginx SPA)
                                              │
backend ── mongodb://mongo:27017 ──▶ mongo:7
```

Frontend được build với `VITE_API_URL=""` → axios gọi đường dẫn tương đối `/api/...` cùng origin, không cần CORS phức tạp.

## 11. Backup MongoDB (gợi ý)

```bash
docker compose exec -T mongo \
  mongodump --username "$MONGO_ROOT_USER" --password "$MONGO_ROOT_PASS" \
  --authenticationDatabase admin --archive --gzip > backup_$(date +%F).gz
```
