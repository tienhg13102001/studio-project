import { useNavigate } from "react-router-dom";
import Logo from "../assets/icons/Logo";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* Chữ 404 nền mờ */}
      <span className="absolute text-[20rem] font-bold text-white/3 select-none leading-none pointer-events-none">404</span>

      {/* Logo */}
      <Logo className="w-10 h-10 mb-10 opacity-60" />

      {/* Nội dung chính */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-10 bg-primary" />
          <span className="text-primary text-xs tracking-[0.3em] uppercase font-medium">Page not found</span>
          <div className="h-px w-10 bg-primary" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-none">Lost in frame</h1>

        <p className="text-muted-foreground text-sm md:text-base max-w-sm leading-relaxed mt-2">
          Trang bạn tìm không tồn tại hoặc đã bị xoá.
          <br />
          Hãy quay lại trang chủ.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 px-8 py-3 bg-primary text-primary-foreground font-semibold text-sm tracking-wide rounded-full hover:brightness-110 transition-all hover:-translate-y-0.5"
        >
          Về trang chủ
        </button>
      </div>

      {/* Đường kẻ trang trí góc dưới */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
};

export default NotFoundPage;
