import Seo from "#components/Seo";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/icons/Logo";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="text-foreground relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 font-sans">
      <Seo title="404 — Không tìm thấy trang" description="Trang bạn tìm không tồn tại." noindex />
      {/* Chữ 404 nền mờ */}
      <span className="pointer-events-none absolute text-[20rem] leading-none font-bold text-white/3 select-none">
        404
      </span>

      {/* Logo */}
      <Logo className="mb-10 h-10 w-10 opacity-60" />

      {/* Nội dung chính */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="mb-2 flex items-center gap-3">
          <div className="bg-primary h-px w-10" />
          <span className="text-primary text-xs font-medium tracking-[0.3em] uppercase">
            Page not found
          </span>
          <div className="bg-primary h-px w-10" />
        </div>

        <h1 className="text-5xl leading-none font-bold text-white md:text-7xl">
          Lost in frame
        </h1>

        <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed md:text-base">
          Trang bạn tìm không tồn tại hoặc đã bị xoá.
          <br />
          Hãy quay lại trang chủ.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground mt-6 rounded-full px-8 py-3 text-sm font-semibold tracking-wide transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          Về trang chủ
        </button>
      </div>

      {/* Đường kẻ trang trí góc dưới */}
      <div className="via-primary/40 absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent to-transparent" />
    </div>
  );
};

export default NotFoundPage;
