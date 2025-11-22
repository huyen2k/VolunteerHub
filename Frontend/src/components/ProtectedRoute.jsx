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

  // Nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ returnTo: location.pathname }} replace />
    );
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
  const { user, isAuthenticated } = useAuth();

  // Nếu đã đăng nhập, chuyển hướng đến dashboard phù hợp với role
  if (isAuthenticated && user) {
    let dashboardPath = "/dashboard";

    if (user.role === "admin") {
      dashboardPath = "/admin/dashboard";
    } else if (user.role === "manager") {
      dashboardPath = "/manager/dashboard";
    }

    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}
