import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/templates/MainLayout";
import LandingPage from "../pages/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";
import ServicePage from "../pages/ServicePage";
import ContactPage from "../pages/ContactPage";
import TeamPage from "../pages/TeamPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "service/:id",
        element: <ServicePage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "team",
        element: <TeamPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
