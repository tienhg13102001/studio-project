import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// CỐ Ý KHÔNG in MONGODB_URI ra log: chuỗi đó chứa cả tên đăng nhập và mật khẩu
// cơ sở dữ liệu. Trước đây nó được in mỗi lần backend khởi động, nên ai xem được
// log container (hoặc log của lệnh deploy) là đọc được mật khẩu.
//
// Cần biết đã nối đúng cơ sở dữ liệu nào thì in tên cơ sở dữ liệu thôi — đủ để
// gỡ lỗi mà không lộ gì.
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

/** Tên cơ sở dữ liệu bóc từ chuỗi kết nối, bỏ hết phần tài khoản/mật khẩu. */
const tenCoSoDuLieu = (() => {
  try {
    const duong = new URL(MONGODB_URI).pathname.replace(/^\//, "");
    return duong || "(mặc định)";
  } catch {
    return "(không đọc được)";
  }
})();

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log(`✅ MongoDB connected — cơ sở dữ liệu: ${tenCoSoDuLieu}`);
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;

  await mongoose.disconnect();
  isConnected = false;
  console.log("MongoDB disconnected");
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});
