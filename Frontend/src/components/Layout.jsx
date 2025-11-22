import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

/**
 * Layout chung cho tất cả các role
 * @param {ReactNode} children - nội dung page
 * @param {string} role - role hiện tại: "guest" | "admin" | "manager" | "user" | "public"
 */
export function RoleLayout({ children, role }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar role={role} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Export layout riêng cho từng role
export const GuestLayout = ({ children }) => (
  <RoleLayout role="guest">{children}</RoleLayout>
);

export const AdminLayout = ({ children }) => (
  <RoleLayout role="admin">{children}</RoleLayout>
);

export const ManagerLayout = ({ children }) => (
  <RoleLayout role="manager">{children}</RoleLayout>
);

export const UserLayout = ({ children }) => (
  <RoleLayout role="volunteer">{children}</RoleLayout>
);

export const PublicLayout = ({ children }) => (
  <RoleLayout role="public">{children}</RoleLayout>
);

export default AdminLayout;
