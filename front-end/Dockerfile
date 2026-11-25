# ── Stage 1: Build Vite/React app ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Empty string → axios uses relative URLs → nginx proxies /api to backend
ENV VITE_API_URL=""
RUN npm run build

# VÌ SAO TẢI MẤY API NÀY Ở ĐÂY: bước prerender bên dưới đọc dữ liệu Portal đang chạy,
# nhưng Docker chỉ dựng lại một lớp khi tệp nguồn đổi. Sửa hỏi–đáp, xoá dự án hay
# thay video trên Portal mà không đổi code thì Docker dùng lại lớp cũ, và HTML cho
# bot vẫn là nội dung cũ (gặp 25/11/2026: 2 dự án đã xoá vẫn trả 200, VideoObject
# trỏ video đã thay). ADD một URL buộc Docker so nội dung tải về với lần trước:
# dữ liệu Portal đổi thì prerender chạy lại, không đổi thì vẫn dùng lớp cũ.
ADD https://www.beezvn.com/api/services?limit=100 /tmp/lam-moi/services.json
ADD https://www.beezvn.com/api/projects /tmp/lam-moi/projects.json
ADD https://www.beezvn.com/api/landing?lang=vi /tmp/lam-moi/landing.json
ADD https://www.beezvn.com/api/bai-viet /tmp/lam-moi/bai-viet.json

# Sinh thêm thẻ mô tả riêng cho từng trang (xem scripts/prerender-meta.mjs).
# Không có bước này thì mọi đường dẫn đều trả về thẻ của trang chủ với máy tìm kiếm.
RUN node scripts/prerender-meta.mjs

# ── Stage 2: Serve with nginx ───────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
