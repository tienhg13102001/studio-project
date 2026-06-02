# ── Stage 1: Build Vite/React app ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Empty string → axios uses relative URLs → nginx proxies /api to backend
ENV VITE_API_URL=""
# Upload video đi qua subdomain DNS-only để bỏ qua giới hạn 100MB của Cloudflare.
# Để trống nếu không dùng bypass (upload sẽ đi relative qua Cloudflare).
ENV VITE_UPLOAD_URL="https://upload.beezvn.com"
RUN npm run build

# ── Stage 2: Serve with nginx ───────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
