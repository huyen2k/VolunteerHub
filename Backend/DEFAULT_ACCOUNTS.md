# Default Accounts

Hệ thống tự động tạo các tài khoản mặc định khi khởi động lần đầu.

## Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin`
- **Role:** `ADMIN`
- **Full Name:** Admin User

## Manager Account
- **Email:** `manager@example.com`
- **Password:** `manager`
- **Role:** `EVEN_MANAGER`
- **Full Name:** Event Manager

## Lưu ý
- Các tài khoản này chỉ được tạo tự động nếu chưa tồn tại trong database
- Nên đổi mật khẩu sau lần đăng nhập đầu tiên
- Các tài khoản này được tạo với `is_active = true`

## Cách sử dụng
1. Khởi động backend application
2. Kiểm tra log để xác nhận tài khoản đã được tạo
3. Sử dụng thông tin đăng nhập ở trên để đăng nhập
