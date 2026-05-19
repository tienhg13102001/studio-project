# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy installed deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source (tsx runs TS directly, no build step required)
COPY package.json tsconfig.json ./
COPY src ./src
COPY public ./public

EXPOSE 4000

# Healthcheck via /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1

CMD ["npm", "run", "start"]
