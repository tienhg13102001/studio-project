import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

/**
 * Protected layout for all /portal/* routes (except /portal login itself).
 * Redirects to /portal if no valid session is found in sessionStorage.
 */
const PortalLayout = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("portal_user");
    if (!raw) {
      navigate("/portal", { replace: true });
      return;
    }
    try {
      JSON.parse(raw);
      setReady(true);
    } catch {
      sessionStorage.removeItem("portal_user");
      navigate("/portal", { replace: true });
    }
  }, [navigate]);

  if (!ready) return null;

  return <Outlet />;
};

export default PortalLayout;
