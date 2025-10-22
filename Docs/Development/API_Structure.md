# Cấu trúc API

## 1. API Xác thực người dùng (`/api/v1/auth`)

### POST (`/register`)
- **Mô tả:** Đăng ký tài khoản người dùng mới.
- **Xác thực:** Không yêu cầu.
- **Vai trò:** Tất cả.

### POST (`/login`)
- **Mô tả:** Đăng nhập bằng email và mật khẩu.
- **Xác thực:** Không yêu cầu.
- **Vai trò:** Tất cả.

### POST (`/logout`)
- **Mô tả:** Đăng xuất khỏi phiên hiện tại.
- **Xác thực:** Bắt buộc.
- **Vai trò:** Tất cả.

### GET (`/me`)
- **Mô tả:** Lấy thông tin người dùng hiện tại đang đăng nhập.
- **Xác thực:** Bắt buộc.
- **Vai trò:** Tất cả.

---

## 2. API Người dùng (`/api/v1/users`)

### GET (`/`)
- **Mô tả**: Lấy danh sách tất cả người dùng trong hệ thống.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản trị viên.

### GET (`/:id`)
- **Mô tả**: Lấy thông tin chi tiết người dùng theo ID.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Tất cả.

### PUT (`/:id`)
- **Mô tả**: Cập nhật thông tin hồ sơ người dùng (chính họ hoặc quản trị viên).
- **Xác thực**: Bắt buộc.
- **Vai trò**: Tình nguyện viên (self) hoặc Quản trị viên.

### DELETE (`/:id`)
- **Mô tả**: Xóa tài khoản người dùng.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản trị viên.

### GET (`/:id/stats`)
- **Mô tả**: Lấy thống kê hoạt động tình nguyện của người dùng.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Tình nguyện viên (self) hoặc Quản trị viên.

---

## 3. API Sự kiện (`/api/v1/events`)

### GET (`/`)
- **Mô tả**: Lấy danh sách sự kiện, có thể lọc theo ngày hoặc danh mục.
- **Xác thực**: Không bắt buộc.
- **Vai trò**: Tất cả.

### GET (`/:id`)
- **Mô tả**: Lấy thông tin chi tiết của một sự kiện.
- **Xác thực**: Không bắt buộc.
- **Vai trò**: Tất cả.

### POST (`/`)
- **Mô tả:** Tạo sự kiện mới.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản lý sự kiện hoặc Quản trị viên.

### PUT (`/:id`)
- **Mô tả**: Cập nhật thông tin sự kiện.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản lý sự kiện (người tạo) hoặc Quản trị viên.

### DELETE (`/:id`)
- **Mô tả**: Xóa sự kiện.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản trị viên.

### GET (`/manager/:id`)
- **Mô tả**: Lấy danh sách sự kiện do một quản lý cụ thể tạo.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản lý sự kiện hoặc Quản trị viên.

---

## 4. API Đăng ký sự kiện (`/api/v1/registrations`)

### POST (`/`)
- **Mô tả**: Tình nguyện viên đăng ký tham gia sự kiện.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Tình nguyện viên.

### GET (`/user/:id`)
- **Mô tả**: Lấy danh sách sự kiện mà người dùng đã đăng ký.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Tình nguyện viên (self) hoặc Quản trị viên.

### GET (`/event/:id`)
- **Mô tả**: Lấy danh sách tình nguyện viên đã đăng ký tham gia sự kiện.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản lý sự kiện hoặc Quản trị viên.

### PUT (`/:id/status`)
- **Mô tả**: Duyệt hoặc hủy đăng ký của tình nguyện viên.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản lý sự kiện hoặc Quản trị viên.

### DELETE (`/:id`)
- **Mô tả**: Hủy đăng ký của tình nguyện viên trước khi sự kiện diễn ra.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Tình nguyện viên (self) hoặc Quản trị viên.

---

## 5. API Thông báo (`/api/v1/notifications`)

### GET (`/`)
- **Mô tả**: Lấy danh sách thông báo của người dùng.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Tất cả.

### PUT (`/:id/read`)
- **Mô tả**: Đánh dấu thông báo là đã đọc.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Tất cả.

### POST (`/`)
- **Mô tả**: Gửi thông báo đến người dùng hoặc nhóm người dùng.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản lý sự kiện hoặc Quản trị viên.

---

## 6. API Thống kê & Bảng điều khiển (`/api/v1/statistics`)

### GET (`/users`)
- **Mô tả**: Lấy thống kê về người dùng.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản trị viên.

### GET (`/events`)
- **Mô tả**: Lấy thống kê về sự kiện (số lượng đăng ký, hoàn thành...).
- **Xác thực**: Bắt buộc.
- **Vai trò**: Quản lý sự kiện hoặc Quản trị viên.

### GET (`/overview`)
- **Mô tả**: Lấy tổng quan toàn hệ thống: sự kiện mới, nổi bật, người tham gia.
- **Xác thực**: Bắt buộc.
- **Vai trò**: Tất cả.
