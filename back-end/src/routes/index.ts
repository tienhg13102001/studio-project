import { Router } from "express";
import { sendSuccess } from "../lib/response.ts";

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
