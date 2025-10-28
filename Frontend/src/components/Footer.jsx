// Đây là component footer cho trang web --> Mình sẽ hardcode và tái sử dụng cho toàn bộ trang web
// Update thêm links nếu cần thiết :VVV

import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  V
                </span>
              </div>
              <span className="text-xl font-bold">VolunteerHub</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Kết nối tình nguyện viên với các sự kiện cộng đồng ý nghĩa
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Về chúng tôi</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/mission"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Sứ mệnh
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Đội ngũ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Tình nguyện viên</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  to="/events"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Tìm sự kiện
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Cách hoạt động
                </Link>
              </li>
              <li>
                <Link
                  to="/benefits"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Lợi ích
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Tổ chức sự kiện</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  to="/create-event"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Tạo sự kiện
                </Link>
              </li>
              <li>
                <Link
                  to="/manage-events"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Quản lý sự kiện
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Tài nguyên
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Hỗ trợ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 VolunteerHub. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
