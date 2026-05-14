import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";

interface ProtectedRouteProps {
  children?: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, redirectTo = "/login" }: ProtectedRouteProps) => {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${redirectTo}?redirect=${redirect}`} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
