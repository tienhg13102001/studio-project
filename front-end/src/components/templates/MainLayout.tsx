import React from "react";
import { Outlet } from "react-router-dom";
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

  return (
    // `site` khoanh vùng phần dành cho khách: font tiêu đề serif, cỡ chữ lớn hơn
    // và bảng màu tối cố định chỉ áp trong đây — portal và hai công cụ báo giá/
    // hợp đồng giữ nguyên như cũ.
    <div className="site relative min-h-screen">
      <ScrollToTop />
      <Navbar />
      <Outlet />
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
