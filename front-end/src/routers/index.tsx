import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../components/templates/MainLayout";
import PortalLayout from "../components/templates/portal/PortalLayout";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const ServicesPage = lazy(() => import("../pages/ServicesPage"));
const ServicePage = lazy(() => import("../pages/ServicePage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const TeamPage = lazy(() => import("../pages/TeamPage"));
const ScriptPage = lazy(() => import("../pages/ScriptPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const PortalPage = lazy(() => import("../pages/portal/PortalPage"));

const PortalOverviewPage = lazy(() => import("../pages/portal/OverviewPage"));
const PortalTeamPage = lazy(() => import("../pages/portal/TeamPage"));
const PortalBrandsPage = lazy(() => import("../pages/portal/BrandsPage"));
const PortalServicesPage = lazy(() => import("../pages/portal/ServicesPage"));
const PortalProjectsPage = lazy(() => import("../pages/portal/ProjectsPage"));
const PortalInquiriesPage = lazy(() => import("../pages/portal/InquiriesPage"));
const PortalSettingsPage = lazy(() => import("../pages/portal/SettingsPage"));

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
      { path: "/portal/team", element: withSuspense(PortalTeamPage) },
      { path: "/portal/brands", element: withSuspense(PortalBrandsPage) },
      { path: "/portal/services", element: withSuspense(PortalServicesPage) },
      { path: "/portal/projects", element: withSuspense(PortalProjectsPage) },
      { path: "/portal/inquiries", element: withSuspense(PortalInquiriesPage) },
      { path: "/portal/settings", element: withSuspense(PortalSettingsPage) },
      // Any unknown /portal/* (other than /portal itself) → dashboard
      { path: "/portal/*", element: <Navigate to="/portal/dashboard" replace /> },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(LandingPage) },
      { path: "service", element: withSuspense(ServicesPage) },
      { path: "service/:id", element: withSuspense(ServicePage) },
      { path: "contact", element: withSuspense(ContactPage) },
      { path: "team", element: withSuspense(TeamPage) },
    ],
  },
  {
    path: "/bao-gia",
    element: withSuspense(ScriptPage),
  },
  {
    path: "*",
    element: withSuspense(NotFoundPage),
  },
]);
