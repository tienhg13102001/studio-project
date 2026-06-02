FROM node:20-alpine
WORKDIR /app

# ffmpeg: transcode video upload sang WebM + resize
RUN apk add --no-cache ffmpeg

COPY package.json ./
RUN npm install

COPY . .

# Tạo thư mục uploads/videos phòng khi volume chưa được mount
RUN mkdir -p /app/public/uploads /app/public/videos /app/public/images

ENV NODE_ENV=production
EXPOSE 5002

CMD ["npm", "start"]
