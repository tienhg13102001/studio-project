import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../organisms/Footer";
import Navbar from "../organisms/Navbar";
import ScrollToTop from "../atoms/ScrollToTop";
import FloatingZalo from "#components/molecules/FloatingZalo";
import { useSettings } from "#hooks/useSettings";

type Props = {};

const DEFAULT_BG_URL = "/bg-main.webp";

const MainLayout: React.FC<Props> = () => {
  const { backgroundImage } = useSettings();
  const bgUrl = backgroundImage || DEFAULT_BG_URL;
  const { pathname } = useLocation();

  return (
    // `site` khoanh vùng phần dành cho khách: font tiêu đề serif, cỡ chữ lớn hơn
    // và bảng màu tối cố định chỉ áp trong đây — portal và hai công cụ báo giá/
    // hợp đồng giữ nguyên như cũ.
    <div className="site relative min-h-screen">
      <ScrollToTop />
      <Navbar />
      {/*
        Chuyển cảnh khi đổi trang: trước đây bấm sang trang khác là nội dung cắt
        phụt, cảm giác như trang bị giật. `key` đổi theo đường dẫn nên React dựng
        lại nhánh này và hiệu ứng chạy đúng một lần mỗi lần điều hướng.

        `motion-reduce:animate-none` để ai bật giảm chuyển động trong hệ điều
        hành thì không thấy hiệu ứng nào — giống các phần còn lại của web.
      */}
      <div key={pathname} className="animate-in fade-in duration-300 motion-reduce:animate-none">
        <Outlet />
      </div>
      <Footer />
      <FloatingZalo />

      {/*
        Ảnh nền chung cho mọi trang khách, lấy từ mục Cài đặt trong portal.

        Lớp này TỪNG KHÔNG BAO GIỜ hiện, dù mọi thứ ở đây đều đúng: nền của
        `body` đè lên nó (xem lời giải thích dài ở `index.css`). Chỉnh độ mờ bao
        nhiêu cũng vô nghĩa vì nó nằm sau một bức tường đục.

        Sau khi gỡ bức tường đó thì 35% hiện quá rõ, Hoàn chốt xuống 15% — đủ
        thấy có một tấm ảnh phía sau, không tranh chỗ với nội dung.
      */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        {/*
          Tối dần về phía mép, giữ chữ ở giữa dễ đọc.

          Con số này quan trọng hơn vẻ ngoài của nó. Bán kính của gradient tính
          theo góc màn hình, nên trên màn 16:9 thì "trong suốt tới 40%" chỉ chừa
          sạch một elip cao bằng 57% màn hình — phần lớn nội dung rơi vào vùng
          đã bị bôi đen, cộng thêm lớp mờ nữa thì ảnh coi như biến mất. Nới lên
          60% để vùng sạch phủ 85% chiều cao, vẫn còn viền tối ở bốn mép.
        */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 60%, black 120%)" }}
        />
      </div>
    </div>
  );
};

export default MainLayout;
