import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

export default function ProtectedRoute({
  roles,
  children,
}: {
  roles: string[];
  children: ReactNode;
}) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (roles.length && (!role || !roles.includes(role)))
    return <Navigate to="/" replace />;
  return <>{children}</>;
}
