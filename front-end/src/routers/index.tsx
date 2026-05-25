import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/templates/MainLayout";
import LandingPage from "../pages/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";
import ServicePage from "../pages/ServicePage";
import ContactPage from "../pages/ContactPage";
import TeamPage from "../pages/TeamPage";
import PortalPage from "../pages/portal/PortalPage";
import PortalLayout from "../components/templates/portal/PortalLayout";
import DashboardPage from "../pages/portal/DashboardPage";
import ProjectDetail from "#components/organisms/ProjectDetail";

export const router = createBrowserRouter([
  // Public portal login
  {
    path: "/portal",
    element: <PortalPage />,
  },
  // Protected portal routes
  {
    element: <PortalLayout />,
    children: [{ path: "/portal/dashboard", element: <DashboardPage /> }],
  },
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
