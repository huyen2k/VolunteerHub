import React, { Children } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

// Layout for guest
export function GuestLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar role="guest" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Bản chất là bọn này giống nhau --> Khác navbar để phân quyền người dùng
export function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function ManagerLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function UserLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default AdminLayout;


// Note: Đây là định hương layout tổng có phân quyền ae nhé
