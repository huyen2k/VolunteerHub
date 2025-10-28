import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // quản lý trạng thái đóng mở menu mobile

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  V
                </span>
              </div>
              <span className="text-xl font-bold">VolunteerHub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/events"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Sự kiện
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Giới thiệu
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Liên hệ
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/register">Đăng ký</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && ( // Hiển thị khi mobileMenuOpen = true --> nghĩa là menu đang mở
          <div className="border-t border-border py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <Link
                to="/events"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sự kiện
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Giới thiệu
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liên hệ
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
