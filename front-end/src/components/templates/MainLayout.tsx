import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../organisms/Navbar";

type Props = {};

const BG_URL = "/bg-main.webp";

const MainLayout: React.FC<Props> = () => {
  return (
    <div className="relative min-h-screen">
      {/* Global background image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${BG_URL})` }}
      >
        {/* Vignette: black edges → transparent center */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 10%, black 80%)" }}
        />
      </div>
      <Navbar />
      <Outlet />
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;
