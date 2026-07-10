import type { PortalUser } from "#lib/portal.types";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

/**
 * Auth gate for standalone full-screen tools (/bao-gia, /hop-dong) that require
 * a portal login but render WITHOUT the portal sidebar/header shell.
 * Redirects to /portal when no valid session exists in localStorage.
 */
const RequirePortalAuth = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("portal_user");
    if (!raw) {
      navigate("/portal", { replace: true });
      return;
    }
    try {
      JSON.parse(raw) as PortalUser;
      setAuthed(true);
    } catch {
      localStorage.removeItem("portal_user");
      navigate("/portal", { replace: true });
    }
  }, [navigate]);

  if (!authed) return null;
  return <Outlet />;
};

export default RequirePortalAuth;
