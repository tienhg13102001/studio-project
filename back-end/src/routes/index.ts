import { Router, type Request, type Response, type NextFunction } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import requireAuth from "../middleware/requireAuth.ts";
import { User } from "../models/User.ts";

import authRouter from "./auth.ts";
import brandsRouter from "./brands.ts";
import contactRouter from "./contact.ts";
import landingRouter from "./landing.ts";
import portfolioRouter from "./portfolio.ts";
import projectsRouter from "./projects.ts";
import reorderRouter from "./reorder.ts";
import servicesRouter from "./services.ts";
import settingsRouter from "./settings.ts";
import sitemapRouter from "./sitemap.ts";
import teamContentRouter from "./team-content.ts";
import testimonialsRouter from "./testimonials.ts";
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
const PUBLIC_WRITES = new Set([
  "/auth/login",
  "/contact/inquiry",
  "/visitors",
  // Ghi nhận lượt xem trang. So khớp là so CHÍNH XÁC cả đường dẫn, nên
  // "/visitors" ở trên KHÔNG tự mở cho "/visitors/page" — thiếu dòng này thì mọi
  // lượt xem của khách chưa đăng nhập đều bị chặn, tức là không đếm được gì.
  "/visitors/page",
]);

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// ─── Phân quyền theo vai trò ─────────────────────────────────────────────────
/**
 * Hai mức: `admin` làm được mọi thứ, `member` (nhân viên) chỉ đăng và sửa dự án
 * cùng hồ sơ của chính mình.
 *
 * VÌ SAO CHẶN Ở MÁY CHỦ chứ không chỉ ẩn nút trong Portal: ẩn nút là giấu đường
 * đi, không phải khoá cửa. Mối lo không phải nhân viên cố tình phá — mà là tài
 * khoản bị dùng chung, hoặc còn sống sau khi người đó nghỉ việc. Thứ nằm sau
 * cánh cửa này là danh sách liên hệ khách: tên, số điện thoại, email của từng
 * người đã hỏi mua.
 */

/** Đọc dữ liệu nhạy cảm — chỉ quản trị. */
const ADMIN_ONLY_READS = [
  /^\/contact\/inquiries(\/|$)/, // liên hệ khách hàng
  /^\/visitors(\/|$)/, // số liệu truy cập
  /^\/trash(\/|$)/, // thùng rác
  // Danh sách nhận xét ĐẦY ĐỦ, gồm cả bản đã tắt. Bản bị tắt thường là bản
  // khách xin gỡ xuống — để lọt ra đường công khai thì tắt cũng như không.
  // Đường công khai `/testimonials` (chỉ bản đang bật) KHÔNG bị chặn.
  /^\/testimonials\/all$/,
];

/**
 * Nhân viên được ghi ở ĐÚNG những chỗ này, ngoài ra cấm hết.
 *
 * KHÔNG có DELETE nào trong danh sách — Hoàn chốt: nhân viên chỉ thêm và sửa,
 * xoá phải là người có thẩm quyền. Sửa nhầm còn cứu được, xoá nhầm thì không.
 */
const MEMBER_WRITES: { method: string; re: RegExp }[] = [
  { method: "POST", re: /^\/projects$/ }, // thêm dự án
  { method: "PUT", re: /^\/projects\/[^/]+$/ }, // sửa dự án (mọi dự án — Hoàn chốt)
  { method: "POST", re: /^\/upload(\/|$)/ }, // tải ảnh & video lên
  { method: "PUT", re: /^\/users\/[^/]+$/ }, // sửa hồ sơ — chỉ của mình, kiểm thêm ở dưới
  { method: "PUT", re: /^\/users\/[^/]+\/password$/ }, // đổi mật khẩu của chính mình
];

/** Lấy id người dùng từ đường dẫn dạng /users/<id> hoặc /users/<id>/password. */
const idTrongDuongDan = (p: string): string | null =>
  /^\/users\/([^/]+)/.exec(p)?.[1] ?? null;

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
  // Bỏ dấu gạch chéo cuối để "/visitors/" không lách qua được phép so khớp.
  const path = req.path.length > 1 ? req.path.replace(/\/+$/, "") : req.path;
  const laDoc = READ_METHODS.has(req.method);
  const docNhayCam = laDoc && ADMIN_ONLY_READS.some((re) => re.test(path));

  // Đọc dữ liệu công khai: đi thẳng, không tra cứu gì cho nhanh.
  if (laDoc && !docNhayCam) return next();
  if (!laDoc && PUBLIC_WRITES.has(path)) return next();

  requireAuth(req, res, () => {
    void kiemTraVaiTro(req, res, next, path, laDoc);
  });
});

/**
 * Kiểm vai trò, ĐỌC TỪ CƠ SỞ DỮ LIỆU chứ không đọc từ token.
 *
 * Token có sẵn `accountRole`, dùng nó thì nhanh hơn — nhưng nó được đóng dấu lúc
 * đăng nhập và sống 7 ngày. Nghĩa là hạ quyền một người xong họ vẫn giữ quyền cũ
 * suốt một tuần, và tài khoản đã xoá vẫn dùng được tới lúc token hết hạn. Với
 * một cánh cửa bảo mật thì như vậy là không chấp nhận được.
 *
 * Cái giá là một truy vấn nhỏ mỗi lần gọi — không đáng kể với một portal ba
 * người, và chỉ chạy cho thao tác ghi hoặc đọc dữ liệu nhạy cảm.
 */
async function kiemTraVaiTro(
  req: Request,
  res: Response,
  next: NextFunction,
  path: string,
  laDoc: boolean,
): Promise<void> {
  try {
    const nguoi = await User.findById(req.user?.sub).select("accountRole").lean();

    // Token hợp lệ nhưng người dùng đã bị xoá → cắt quyền ngay.
    if (!nguoi) {
      sendError(res, "Tài khoản không còn tồn tại", 401);
      return;
    }
    if (nguoi.accountRole === "admin") return next();

    if (laDoc) {
      sendError(res, "Bạn không có quyền xem mục này", 403);
      return;
    }

    const duocGhi = MEMBER_WRITES.some((r) => r.method === req.method && r.re.test(path));
    if (!duocGhi) {
      sendError(res, "Bạn không có quyền thực hiện thao tác này", 403);
      return;
    }

    // Sửa hồ sơ thì CHỈ được sửa của chính mình. Thiếu kiểm này thì nhân viên
    // sửa được hồ sơ người khác — kể cả tự nâng mình lên quản trị.
    if (path.startsWith("/users/")) {
      const id = idTrongDuongDan(path);
      if (!id || id !== req.user?.sub) {
        sendError(res, "Bạn chỉ sửa được hồ sơ của chính mình", 403);
        return;
      }
    }

    next();
  } catch (e) {
    next(e);
  }
}

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
router.use("/testimonials", testimonialsRouter);
router.use("/settings", settingsRouter);
router.use("/visitors", visitorsRouter);
router.use("/trash", trashRouter);
router.use("/reorder", reorderRouter);
// nginx trỏ /sitemap.xml về đây để sitemap luôn khớp dữ liệu thật.
router.use("/sitemap.xml", sitemapRouter);

export default router;
