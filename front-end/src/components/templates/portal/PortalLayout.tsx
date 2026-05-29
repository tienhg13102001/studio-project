import PortalHeader from "#components/molecules/portal/PortalHeader";
import PortalSidebar from "#components/organisms/portal/PortalSidebar";
import type { PortalUser } from "#lib/portal.types";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

/**
 * Protected shell for all /portal/* routes (except /portal login itself).
 * Handles auth, then renders sidebar + header around the child route via <Outlet>.
 */
const PortalLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<PortalUser | null>(null);

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
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d] text-white">
      <PortalSidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <PortalHeader userName={user.name} />
        <div className="flex flex-col gap-8 px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
