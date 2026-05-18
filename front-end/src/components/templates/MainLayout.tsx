import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../organisms/Navbar";

type Props = {};

const MainLayout: React.FC<Props> = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;
