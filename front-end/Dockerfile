# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder
WORKDIR /app

# Build-time API URL — empty means same-origin (served behind reverse proxy)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
