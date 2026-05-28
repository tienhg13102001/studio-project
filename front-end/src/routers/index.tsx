import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/templates/MainLayout";
import PortalLayout from "../components/templates/portal/PortalLayout";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const ServicePage = lazy(() => import("../pages/ServicePage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const TeamPage = lazy(() => import("../pages/TeamPage"));
const ScriptPage = lazy(() => import("../pages/ScriptPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const PortalPage = lazy(() => import("../pages/portal/PortalPage"));
const DashboardPage = lazy(() => import("../pages/portal/DashboardPage"));

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
  // Protected portal routes
  {
    element: <PortalLayout />,
    children: [{ path: "/portal/dashboard", element: withSuspense(DashboardPage) }],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(LandingPage) },
      { path: "service/:id", element: withSuspense(ServicePage) },
      { path: "contact", element: withSuspense(ContactPage) },
      { path: "team", element: withSuspense(TeamPage) },
    ],
  },
  {
    path: "/scripts",
    element: withSuspense(ScriptPage),
  },
  {
    path: "*",
    element: withSuspense(NotFoundPage),
  },
]);
