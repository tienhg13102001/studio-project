import { Router } from "express";
import { sendSuccess } from "../lib/response.ts";
import requireAuth from "../middleware/requireAuth.ts";

import authRouter from "./auth.ts";
import brandsRouter from "./brands.ts";
import contactRouter from "./contact.ts";
import landingRouter from "./landing.ts";
import portfolioRouter from "./portfolio.ts";
import projectsRouter from "./projects.ts";
import servicesRouter from "./services.ts";
import settingsRouter from "./settings.ts";
import sitemapRouter from "./sitemap.ts";
import teamContentRouter from "./team-content.ts";
import trashRouter from "./trash.ts";
import uploadRouter from "./upload.ts";
import usersRouter from "./users.ts";
import visitorsRouter from "./visitors.ts";

/**
 * Gom toàn bộ route của API vào một chỗ. `app.ts` chỉ việc mount router này
 * dưới tiền tố `/api`, nên thêm route mới chỉ phải sửa đúng file này.
 *
 * Đường dẫn ở đây là đường dẫn *tương đối* so với `/api` — ví dụ `/landing`
 * bên dưới chính là `/api/landing` khi chạy thật.
 */
const router = Router();

router.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok", timestamp: new Date().toISOString() });
});

// ─── Khoá mọi thao tác ghi ───────────────────────────────────────────────────
/**
 * Ba đường dẫn duy nhất cho phép ghi mà không cần đăng nhập. Đều là việc của
 * khách vãng lai: đăng nhập, gửi form liên hệ, và ghi nhận một lượt truy cập.
 *
 * So khớp chính xác cả chuỗi, không dùng tiền tố — để `/contact/inquiry` mở
 * không kéo theo `/contact/inquiries/<id>` (xoá liên hệ) cũng mở.
 */
const PUBLIC_WRITES = new Set(["/auth/login", "/contact/inquiry", "/visitors"]);

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Mặc định là KHOÁ: mọi POST/PUT/PATCH/DELETE đều phải kèm token đăng nhập.
 *
 * VÌ SAO đặt tập trung ở đây thay vì gắn `requireAuth` vào từng route: trước
 * đây 25 route ghi/xoá không hề kiểm gì, tức là bất kỳ ai trên mạng cũng xoá
 * được sạch dự án, dịch vụ, thương hiệu. Gắn tay từng chỗ thì chỉ cần sót một
 * route, hoặc người sau thêm route mới mà quên, là lỗ hổng quay lại. Cách này
 * an toàn theo mặc định: route mới tự động được bảo vệ, muốn mở phải cố ý ghi
 * tên vào danh sách trên và nhìn thấy ngay khi review.
 */
router.use((req, res, next) => {
  if (READ_METHODS.has(req.method)) return next();

  // Bỏ dấu gạch chéo cuối để "/visitors/" không lách qua được phép so khớp.
  const path = req.path.length > 1 ? req.path.replace(/\/+$/, "") : req.path;
  if (PUBLIC_WRITES.has(path)) return next();

  requireAuth(req, res, next);
});

router.use("/landing", landingRouter);
router.use("/services", servicesRouter);
router.use("/projects", projectsRouter);
router.use("/contact", contactRouter);
router.use("/users", usersRouter);
router.use("/brands", brandsRouter);
router.use("/portfolio", portfolioRouter);
router.use("/auth", authRouter);
router.use("/upload", uploadRouter);
router.use("/team-content", teamContentRouter);
router.use("/settings", settingsRouter);
router.use("/visitors", visitorsRouter);
router.use("/trash", trashRouter);
// nginx trỏ /sitemap.xml về đây để sitemap luôn khớp dữ liệu thật.
router.use("/sitemap.xml", sitemapRouter);

export default router;
