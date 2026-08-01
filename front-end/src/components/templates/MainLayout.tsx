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

        Trước để `opacity-10` và vignette đen từ 10% bán kính — cộng lại thì chỉ
        còn một elip bé tí giữa màn hình hiện ảnh ở 10%, tức là không ai nhìn
        thấy gì và ô "Ảnh nền" trong portal thành nút bấm vô nghĩa. Nay để 30%
        và nới vùng trong suốt ra 40% để ảnh hiện thật, vẫn đủ chìm cho chữ nổi.
      */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        {/* Tối dần về phía mép, giữ chữ ở giữa dễ đọc. */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, black 100%)" }}
        />
      </div>
    </div>
  );
};

export default MainLayout;
