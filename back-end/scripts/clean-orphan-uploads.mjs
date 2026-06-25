// Dọn file upload "mồ côi" — ảnh/video nằm trong public/uploads & public/videos
// nhưng KHÔNG còn được bất kỳ document nào trong MongoDB tham chiếu.
//
// An toàn theo thiết kế:
//   - Quét TOÀN BỘ collection, stringify mỗi document rồi trích mọi tên file
//     được nhắc tới (bắt cả field lồng nhau / mảng như Project.photos[]).
//   - Mặc định CHỈ liệt kê (dry-run). Phải thêm cờ --delete mới thực sự xóa.
//
// Cách chạy trên VPS (trong container backend, đã có MONGODB_URI + mount volume):
//   docker compose cp back-end/scripts/clean-orphan-uploads.mjs backend:/app/clean-orphan-uploads.mjs
//   docker compose exec backend node clean-orphan-uploads.mjs            # xem trước
//   docker compose exec backend node clean-orphan-uploads.mjs --delete   # xóa thật
//
// Có thể đổi thư mục quét qua biến môi trường:
//   UPLOAD_DIRS=/app/public/uploads,/app/public/videos

import mongoose from "mongoose";
import { readdir, stat, unlink } from "node:fs/promises";
import { join, basename } from "node:path";

const DELETE = process.argv.includes("--delete");
const DIRS = (process.env.UPLOAD_DIRS ??
  "/app/public/uploads,/app/public/videos")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean);

// Đuôi file media được coi là "asset có thể mồ côi".
const MEDIA_RE = /[\w.\-]+\.(?:webp|jpe?g|png|gif|svg|mp4|webm|mov|m4v)/gi;

const fmt = (n) => {
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) (n /= 1024), i++;
  return `${n.toFixed(1)} ${u[i]}`;
};

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("✗ Thiếu MONGODB_URI trong môi trường.");
  process.exit(1);
}

await mongoose.connect(uri);
const db = mongoose.connection.db;
console.log(`✓ Đã kết nối DB: ${db.databaseName}`);

// 1) Gom mọi basename được DB tham chiếu.
const referenced = new Set();
const collections = await db.listCollections().toArray();
for (const { name } of collections) {
  const docs = await db.collection(name).find({}).toArray();
  for (const doc of docs) {
    const json = JSON.stringify(doc);
    const matches = json.match(MEDIA_RE);
    if (matches) for (const m of matches) referenced.add(basename(m));
  }
}
console.log(`✓ Tìm thấy ${referenced.size} file được tham chiếu trong DB.\n`);

// 2) Quét đĩa, đối chiếu, gom file mồ côi.
let totalFreed = 0;
let orphanCount = 0;
for (const dir of DIRS) {
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    console.log(`⚠ Bỏ qua (không đọc được): ${dir}`);
    continue;
  }
  console.log(`── ${dir} ──`);
  for (const file of entries) {
    if (file.startsWith(".")) continue; // .DS_Store, .gitkeep…
    if (referenced.has(file)) continue; // còn được dùng → giữ
    const full = join(dir, file);
    let info;
    try {
      info = await stat(full);
    } catch {
      continue;
    }
    if (!info.isFile()) continue;

    orphanCount++;
    totalFreed += info.size;
    console.log(`  ${DELETE ? "XÓA " : "mồ côi"}  ${file}  (${fmt(info.size)})`);
    if (DELETE) await unlink(full);
  }
}

console.log(
  `\n${DELETE ? "Đã xóa" : "Sẽ xóa"} ${orphanCount} file, ` +
    `giải phóng ${fmt(totalFreed)}.`,
);
if (!DELETE && orphanCount > 0) {
  console.log("→ Chạy lại với cờ --delete để xóa thật.");
}

await mongoose.disconnect();
