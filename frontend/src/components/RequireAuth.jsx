import { Navigate, Outlet, useLocation } from "react-router-dom";

export const RequireAuth = ({ children }) => {
  const location = useLocation();
  const authenticated = Boolean(sessionStorage.getItem("dcsqbank_auth_session"));

  if (!authenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children || <Outlet />;
};
