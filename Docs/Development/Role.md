# Phân quyền theo vai trò

## 1, Quyền

- **AUTH_REGISTER**: Cho phép đăng ký tài khoản mới.

- **AUTH_LOGIN**: Cho phép đăng nhập vào hệ thống.

- **AUTH_LOGOUT**: Cho phép đăng xuất khỏi hệ thống.

- **AUTH_ME**: Cho phép lấy thông tin người dùng hiện tại.

- **USER_LIST**: Cho phép xem danh sách tất cả người dùng (dành cho quản trị viên).

- **USER_INFO**: Cho phép xem thông tin người dùng.

- **USER_UPDATE_INFO**: Cho phép chỉnh sửa thông tin người dùng. (Email, password, tên, v.v.)

- **USER_UPDATE_MANAGER**: Cho phép quản lý thông tin người dùng khác (dành cho quản trị viên).

- **EVENT_READ**: Cho phép xem thông tin sự kiện.

- **EVENT_CREATE**: Cho phép tạo sự kiện mới.

- **EVENT_UPDATE**: Cho phép chỉnh sửa thông tin sự kiện.

- **EVENT_APPROVE**: Cho phép duyệt sự kiện.

- **EVENT_LIST_APPROVED**: Cho phép xem danh sách sự kiện đã được duyệt.

- **EVENT_DELETE**: Cho phép xóa sự kiện.

- **EVENT_CHANGE_REGISTER**: Cho phép thay đổi trạng thái tham gia sự kiện.

- **EVENT_MANAGE_REGISTRATIONS**: Cho phép quản lý danh sách đăng ký tham gia sự kiện.

## 2. VOLUNTEER

Vai trò dành cho tình nguyện viên đã đăng ký và được xác thực.

- **AUTH_REGISTER**: Cho phép đăng ký tài khoản mới.

- **AUTH_LOGIN**: Cho phép đăng nhập vào hệ thống.
- **USER_INFO**: Cho phép xem thông tin người dùng.
- **USER_UPDATE_INFO**: Cho phép chỉnh sửa thông tin người dùng. (Email, password, tên, v.v.)
- **EVENT_READ**: Cho phép xem thông tin sự kiện.
- **EVENT_CHANGE_REGISTER**: Cho phép thay đổi trạng thái tham gia sự kiện.
- **EVENT_LIST_APPROVED**: Cho phép xem danh sách sự kiện đã được duyệt.

## 3. EVENT_MANAGER
Vai trò dành cho quản lý sự kiện, có thể tạo và quản lý sự kiện.
- Tất cả quyền của VOLUNTEER.
- **EVENT_CREATE**: Cho phép tạo sự kiện mới.
- **EVENT_UPDATE**: Cho phép chỉnh sửa thông tin sự kiện.
- **EVENT_MANAGE_REGISTRATIONS**: Cho phép quản lý danh sách đăng ký tham gia sự kiện.

## 4. ADMIN
Vai trò dành cho quản trị viên hệ thống, có toàn quyền trên hệ thống.
- Tất cả quyền của EVENT_MANAGER.
- **USER_UPDATE_MANAGER**: Cho phép quản lý thông tin người dùng khác (dành cho quản trị viên).
- **EVENT_APPROVE**: Cho phép duyệt sự kiện.
