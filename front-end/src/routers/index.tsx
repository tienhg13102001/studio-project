import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../components/templates/MainLayout";
import PortalLayout from "../components/templates/portal/PortalLayout";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const ServicesPage = lazy(() => import("../pages/ServicesPage"));
const ServicePage = lazy(() => import("../pages/ServicePage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const TeamPage = lazy(() => import("../pages/TeamPage"));
const PortfolioPage = lazy(() => import("../pages/PortfolioPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const PortalPage = lazy(() => import("../pages/portal/PortalPage"));

const PortalOverviewPage = lazy(() => import("../pages/portal/OverviewPage"));
const PortalAnalyticsPage = lazy(() => import("../pages/portal/AnalyticsPage"));
const PortalTeamPage = lazy(() => import("../pages/portal/TeamPage"));
const PortalBrandsPage = lazy(() => import("../pages/portal/BrandsPage"));
const PortalServicesPage = lazy(() => import("../pages/portal/ServicesPage"));
const PortalProjectsPage = lazy(() => import("../pages/portal/ProjectsPage"));
const PortalInquiriesPage = lazy(() => import("../pages/portal/InquiriesPage"));
const PortalTestimonialsPage = lazy(() => import("../pages/portal/TestimonialsPage"));
const PortalSettingsPage = lazy(() => import("../pages/portal/SettingsPage"));
const PortalTrashPage = lazy(() => import("../pages/portal/TrashPage"));

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="border-muted border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
  </div>
);

const withSuspense = (Component: LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<PageFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(LandingPage) },
      { path: "service", element: withSuspense(ServicesPage) },
      { path: "service/:id", element: withSuspense(ServicePage) },
      // Địa chỉ chính thức của một dự án: phẳng và đọc được — /du-an/vf9-teaser.
      { path: "du-an/:projectSlug", element: withSuspense(ServicePage) },
      // Dạng cũ theo mã máy. GIỮ LẠI vĩnh viễn: link đã chia sẻ ra ngoài không
      // được phép chết. Vào đây sẽ tự đổi sang địa chỉ mới ở trên.
      { path: "service/:id/:projectId", element: withSuspense(ServicePage) },
      { path: "contact", element: withSuspense(ContactPage) },
      { path: "team", element: withSuspense(TeamPage) },
      { path: "portfolio", element: withSuspense(PortfolioPage) },
    ],
  },
  // Public portal login
  {
    path: "/portal",
    element: withSuspense(PortalPage),
  },
  // Protected portal shell + nested tab routes
  {
    element: <PortalLayout />,
    children: [
      { path: "/portal/dashboard", element: withSuspense(PortalOverviewPage) },
      { path: "/portal/analytics", element: withSuspense(PortalAnalyticsPage) },
      { path: "/portal/team", element: withSuspense(PortalTeamPage) },
      { path: "/portal/brands", element: withSuspense(PortalBrandsPage) },
      { path: "/portal/services", element: withSuspense(PortalServicesPage) },
      { path: "/portal/projects", element: withSuspense(PortalProjectsPage) },
      { path: "/portal/inquiries", element: withSuspense(PortalInquiriesPage) },
      { path: "/portal/testimonials", element: withSuspense(PortalTestimonialsPage) },
      { path: "/portal/settings", element: withSuspense(PortalSettingsPage) },
      { path: "/portal/trash", element: withSuspense(PortalTrashPage) },
      // Any unknown /portal/* (other than /portal itself) → dashboard
      { path: "/portal/*", element: <Navigate to="/portal/dashboard" replace /> },
    ],
  },

  // Hai công cụ /bao-gia và /hop-dong đã gỡ hẳn theo yêu cầu của Hoàn — kèm
  // toàn bộ mã nguồn của chúng. Giờ hai đường đó rơi vào trang 404 bên dưới.
  {
    path: "*",
    element: withSuspense(NotFoundPage),
  },
]);
