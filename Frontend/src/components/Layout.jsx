import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export function GuestLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar role="guest" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

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
