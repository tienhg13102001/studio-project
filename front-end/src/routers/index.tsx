import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/templates/MainLayout";
import LandingPage from "../pages/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Dùng Template làm Layout bọc ngoài
    children: [
      {
        index: true, // Route mặc định khi vào '/'
        element: <LandingPage />,
      },
      // {
      //   path: 'about', // Domain.com/about
      //   element: <AboutPage />,
      // },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
