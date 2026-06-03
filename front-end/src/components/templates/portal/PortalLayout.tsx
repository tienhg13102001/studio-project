import PortalHeader from "#components/molecules/portal/PortalHeader";
import PortalSidebar from "#components/organisms/portal/PortalSidebar";
import type { PortalUser } from "#lib/portal.types";
import { cn } from "#lib/utils";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

/**
 * Protected shell for all /portal/* routes (except /portal login itself).
 * Handles auth, then renders sidebar + header around the child route via <Outlet>.
 */
const PortalLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const raw = localStorage.getItem("portal_user");
    if (!raw) {
      navigate("/portal", { replace: true });
      return;
    }
    try {
      setUser(JSON.parse(raw) as PortalUser);
    } catch {
      localStorage.removeItem("portal_user");
      navigate("/portal", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("portal_user");
    navigate("/portal", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Backdrop — only when the mobile drawer is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar: off-canvas drawer on mobile, static column on desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <PortalSidebar
          user={user}
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <main className="flex-1 overflow-y-auto">
        <PortalHeader userName={user.name} onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
