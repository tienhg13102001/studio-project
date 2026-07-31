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

      {/* Global background image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        {/* Vignette: black edges → transparent center */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 10%, black 80%)" }}
        />
      </div>
    </div>
  );
};

export default MainLayout;
