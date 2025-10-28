import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({
  children,
  requiredRole = null,
  requiredPermission = null,
}) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu cần role cụ thể
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu cần permission cụ thể
  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();

  // Nếu đã đăng nhập, chuyển hướng đến dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
