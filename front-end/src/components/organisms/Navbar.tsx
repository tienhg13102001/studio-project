import { useState, useEffect } from "react";
import { ListIcon, PhoneIcon } from "@phosphor-icons/react";
import { useLanding } from "#hooks/useLanding";
import LogoYellow from "../../assets/icons/LogoYellow";
import { Button } from "#components/ui/button";
import NavLinks from "#components/molecules/NavLinks";
import MobileMenu from "#components/molecules/MobileMenu";
import { useLanguage, useTranslation } from "#i18n";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UKFlag from "../../assets/icons/UKFlag";
import VietNamFlag from "../../assets/icons/VietNamFlag";

type Props = {};

const Navbar: React.FC<Props> = () => {
  const { lang, setLang } = useLanguage();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const t = useTranslation();
  const { data: landing } = useLanding(lang);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/*
        Bố cục LƯỚI 3 cột `1fr auto 1fr` chứ không phải `justify-between`.

        VÌ SAO: với `justify-between`, cụm menu giữa chỉ nằm đúng tâm màn hình
        khi hai bên rộng bằng nhau. Bên trái chỉ có logo nhỏ, bên phải có số điện
        thoại + đổi ngôn ngữ + đăng nhập + nút Kết Nối — nên menu bị đẩy lệch hẳn
        sang trái. Lưới với hai cột biên bằng nhau (1fr) thì cột giữa luôn nằm
        đúng tâm, bất kể hai bên rộng bao nhiêu.

        Trên điện thoại cụm menu bị ẩn (`hidden lg:flex`), mà phần tử
        `display: none` thì KHÔNG chiếm ô lưới nào — nhóm nút bên phải tự rơi vào
        cột giữa và nằm lửng ở tâm màn hình, bên phải trống ~120px (đo 23/11/2026).
        Nên nhóm nút được ghim cứng vào cột 3 bằng `col-start-3`.
      */}
      <nav
        className={`fixed top-0 left-0 z-20 grid w-full grid-cols-[1fr_auto_1fr] items-center px-6 py-4 transition-all duration-700 md:px-12 ${scrolled && pathname === "/" ? "bg-background/50 shadow-sm backdrop-blur-sm" : pathname !== "/" ? "bg-background/50 shadow-sm backdrop-blur-sm" : "bg-transparent"}`}
      >
        {/*
          THẺ <Link> CHỨ KHÔNG PHẢI <div onClick>.

          Bấm chuột thì bản cũ cũng về được trang chủ, nên nhìn qua tưởng không
          sao. Nhưng một cái <div> bắt sự kiện bấm thì KHÔNG phải là đường dẫn:

            · bàn phím không tới được, Enter không ăn — người không dùng chuột
              mất hẳn nút về trang chủ
            · trình đọc màn hình không đọc ra đây là link, cũng không có tên gọi
            · bấm giữa / Ctrl+bấm không mở được tab mới, cách quen của nhiều người
            · máy tìm kiếm không thấy đường dẫn nào — đúng thứ vừa mất công chữa
              hồi tháng 8 khi 48 trang không được lập chỉ mục vì thiếu link nội bộ

          Chân trang đã dùng <Link to="/"> từ trước; nay thanh đầu làm giống.
        */}
        <Link
          to="/"
          aria-label="Về trang chủ Bee Z Production"
          className="focus-visible:ring-primary flex items-center justify-self-start rounded-md focus-visible:ring-2 focus-visible:outline-none"
        >
          <LogoYellow className="h-8 w-8 text-white" />
        </Link>

        {/* Center Navigation */}
        <NavLinks scrolled={scrolled} />

        {/* Right Actions */}
        <div className="col-start-3 flex items-center gap-2 justify-self-end">
          {/* Hotline — khách gọi trực tiếp, 1 chạm. Chỗ hẹp trên mobile nên chỉ
              hiện từ desktop; bản mobile nằm trong menu trượt. */}
          {landing?.phone && (
            <a
              href={`tel:${landing.phone}`}
              className="text-foreground hover:text-primary focus-visible:ring-primary mr-1 ml-4 hidden items-center gap-1.5 rounded-md px-1 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none lg:inline-flex"
            >
              <PhoneIcon size={16} weight="fill" className="text-primary" />
              {landing.phone}
            </a>
          )}

          {/* Language */}
          <Button
            variant="outline"
            className="h-11 lg:h-9"
            aria-label={lang === "en" ? "Chuyển sang tiếng Việt" : "Switch to English"}
            onClick={() => setLang(lang === "en" ? "vi" : "en")}
          >
            {lang === "en" ? (
              <>
                <UKFlag /> EN
              </>
            ) : (
              <>
                <VietNamFlag /> VI
              </>
            )}
          </Button>

          {/* Nút đăng nhập nội bộ đã chuyển xuống chân trang (24/11/2026): khách
              không cần nó, mà trên điện thoại nó chiếm chỗ của nút menu. Team
              vào thẳng /portal hoặc bấm "Đăng nhập nội bộ" ở cuối trang. */}

          {/* Let's Talk CTA */}
          <Button
            variant="outline"
            className="hidden lg:inline-flex"
            onClick={() => navigate("/contact")}
          >
            {t.nav.letsTalk}
          </Button>

          {/* Mobile Menu */}
          <Button
            variant="outline"
            size="icon-lg"
            className="h-11 w-11 lg:hidden"
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <ListIcon size={20} />
          </Button>
        </div>

        {/* Mobile Drawer */}
        <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </nav>

      {/* Nút "quay lại" nổi cố định đã bỏ (24/11/2026): trên điện thoại nó đè
          lên chữ, thẻ video và ô nhập ở mọi trang con, mà việc nó làm (về trang
          chủ) logo bên trái đã làm, còn "quay lại" thì trình duyệt sẵn có. */}
    </>
  );
};

export default Navbar;
