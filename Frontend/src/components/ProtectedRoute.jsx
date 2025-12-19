import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Kiểm tra đường dẫn này
import LoadingSpinner from "./LoadingSpinner"; // Đảm bảo file này tồn tại

// Component bảo vệ Route
export function ProtectedRoute({ children, requiredRole = null }) {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

// Component bảo vệ trang Login/Register
export function GuestRoute({ children }) {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (isAuthenticated && user) {
        let path = "/dashboard";
        if (user.role === "admin") path = "/admin/dashboard";
        else if (user.role === "manager") path = "/manager/dashboard";

        return <Navigate to={path} replace />;
    }

    return children;
}