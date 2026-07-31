# ── Stage 1: Build Vite/React app ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Empty string → axios uses relative URLs → nginx proxies /api to backend
ENV VITE_API_URL=""
# Sinh thêm thẻ mô tả riêng cho từng trang (xem scripts/prerender-meta.mjs).
# Không có bước này thì mọi đường dẫn đều trả về thẻ của trang chủ với máy tìm kiếm.
RUN npm run build && node scripts/prerender-meta.mjs

# ── Stage 2: Serve with nginx ───────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
