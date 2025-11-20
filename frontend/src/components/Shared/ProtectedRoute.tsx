import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

interface Props {
  children: ReactNode;
  redirectTo?: string;
  requireActiveSubscription?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  redirectTo = "/login",
  requireActiveSubscription = false,
  requireAdmin = false,
}: Props) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night text-gray-400">
        Initializing...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireActiveSubscription && user?.subscription_status !== "active") {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;


