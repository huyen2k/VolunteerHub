# Requirements Specification Document (RSD) - Hệ thống Quản lý Tình nguyện viên

## 1. Giới thiệu

Tài liệu này mô tả các yêu cầu chức năng (Functional Requirements) và phi chức năng (Non-Functional Requirements) cho Hệ thống Quản lý Tình nguyện viên. Mục đích là cung cấp một nền tảng hiệu quả để quản lý các sự kiện tình nguyện, cho phép tình nguyện viên dễ dàng tìm kiếm và đăng ký tham gia, đồng thời hỗ trợ quản lý sự kiện trong việc tổ chức và điều phối hoạt động.

## 2. Các Vai trò Người dùng

Hệ thống có ba vai trò người dùng chính với các quyền hạn khác nhau:

| Vai trò | Mô tả |
| :--- | :--- |
| **Tình nguyện viên (Volunteer)** | Tham gia, tìm kiếm, đăng ký các sự kiện tình nguyện. |
| **Quản lý sự kiện (Event Manager)** | Tạo, quản lý, điều phối và duyệt/hủy đăng ký sự kiện. |
| **Admin (Administrator)** | Quản lý chung hệ thống, duyệt/xóa sự kiện, quản lý người dùng và xuất dữ liệu. |

## 3. Yêu cầu Chức năng (Functional Requirements)

Yêu cầu chức năng được phân loại theo từng vai trò người dùng.

### 3.1. Yêu cầu chung (Áp dụng cho tất cả các vai trò)

| Chức năng | Mô tả | Vai trò |
| :--- | :--- | :--- |
| Đăng ký tài khoản | Cho phép người dùng tạo tài khoản mới. | Tất cả |
| Đăng nhập | Cho phép người dùng đăng nhập bằng email và mật khẩu. | Tất cả |

### 3.2. Yêu cầu cho Tình nguyện viên (Volunteer)

| Chức năng | Mô tả |
| :--- | :--- |
| Xem danh sách sự kiện | Hiển thị danh sách các sự kiện công khai, bao gồm: tên, ngày, địa điểm, và mô tả. |
| Lọc sự kiện | Cho phép lọc danh sách sự kiện theo thời gian và danh mục. |
| Đăng ký sự kiện | Cho phép tình nguyện viên đăng ký tham gia một sự kiện cụ thể. Sau khi đăng ký, hệ thống gửi thông báo xác nhận. |
| Hủy đăng ký (Thoái đăng) | Cho phép tình nguyện viên hủy đăng ký tham gia sự kiện trước khi sự kiện diễn ra. |
| Xem lịch sử tham gia | Hiển thị danh sách các sự kiện đã tham gia, bao gồm trạng thái hoàn thành. |
| Nhận thông báo | Nhận các thông báo về trạng thái đăng ký (đã duyệt/bị hủy) và trạng thái hoàn thành sự kiện (Sử dụng Web Push API). |
| Truy cập kênh trao đổi | Sau khi sự kiện được duyệt, tình nguyện viên được tham gia kênh trao đổi riêng của sự kiện để: Post bài, comment, like (tương tự wall Facebook). |
| Xem Dashboard | Hiển thị tổng hợp các sự kiện liên quan (mới công bố, có tin bài mới) và các sự kiện thu hút (tăng thành viên/trao đổi/like nhanh). |

### 3.3. Yêu cầu cho Quản lý sự kiện (Event Manager)

| Chức năng | Mô tả |
| :--- | :--- |
| Tạo sự kiện | Cho phép tạo sự kiện mới, nhập các thông tin: tên, ngày, địa điểm, mô tả. |
| Sửa sự kiện | Cho phép chỉnh sửa thông tin của sự kiện đã tạo. |
| Xóa sự kiện | Cho phép xóa sự kiện đã tạo. |
| Validate Input | Hệ thống phải thực hiện validate dữ liệu đầu vào (input) cho việc tạo/sửa sự kiện (Sử dụng thư viện Joi/Yup hoặc tương đương). |
| Xác nhận đăng ký | Cho phép duyệt (chấp nhận) hoặc hủy (từ chối) đăng ký tham gia của tình nguyện viên cho sự kiện mình quản lý. |
| Đánh dấu hoàn thành | Cho phép cập nhật trạng thái hoàn thành sự kiện cho từng tình nguyện viên sau khi sự kiện kết thúc. |
| Xem báo cáo tình nguyện viên | Hiển thị danh sách chi tiết các tình nguyện viên đã đăng ký tham gia sự kiện. |
| Truy cập kênh trao đổi | Sau khi sự kiện được duyệt, quản lý sự kiện được tham gia kênh trao đổi riêng của sự kiện để: Post bài, comment, like (tương tự wall Facebook). |
| Xem Dashboard | Hiển thị tổng hợp các sự kiện liên quan (mới công bố, có tin bài mới) và các sự kiện thu hút (tăng thành viên/trao đổi/like nhanh) liên quan đến sự kiện mình quản lý. |

### 3.4. Yêu cầu cho Admin (Administrator)

| Chức năng | Mô tả |
| :--- | :--- |
| Duyệt sự kiện | Cho phép xem và duyệt (chấp thuận) các sự kiện do Quản lý sự kiện tạo ra. Sự kiện chỉ công khai và mở kênh trao đổi sau khi được Admin duyệt. |
| Xóa sự kiện (Toàn quyền) | Cho phép xóa bất kỳ sự kiện nào trong hệ thống. |
| Quản lý người dùng | Cho phép xem danh sách người dùng (Tình nguyện viên và Quản lý sự kiện). |
| Khóa/Mở tài khoản | Cho phép khóa hoặc mở lại tài khoản của Tình nguyện viên/Quản lý sự kiện. |
| Xuất dữ liệu | Cho phép xuất danh sách sự kiện và danh sách tình nguyện viên tham gia (dưới định dạng CSV/JSON). |
| Xem Dashboard | Hiển thị tổng hợp các sự kiện liên quan (mới công bố, có tin bài mới) và các sự kiện thu hút (tăng thành viên/trao đổi/like nhanh) trên toàn hệ thống. |

## 4. Ghi chú Quan trọng về Kênh Trao đổi

| Yêu cầu Kênh Trao đổi | Mô tả |
| :--- | :--- |
| Tạo kênh tự động | Với **mỗi sự kiện** sau khi được Admin **duyệt**, hệ thống phải tự động tạo một kênh trao đổi riêng biệt. |
| Tính năng tương tác | Kênh trao đổi có các tính năng tương tác cơ bản tương tự như tường (wall) của Facebook, bao gồm: **Post bài** (text/ảnh), **Comment** (bình luận), và **Like** (thích) bài viết/bình luận. |
| Quyền truy cập | Chỉ những người dùng liên quan đến sự kiện (Tình nguyện viên đã đăng ký được duyệt, Quản lý sự kiện, Admin) mới có quyền truy cập kênh trao đổi của sự kiện đó. |
| Điều kiện tham gia | Tình nguyện viên chỉ có thể truy cập kênh trao đổi **sau khi sự kiện được Admin duyệt**. |

## 5. Yêu cầu Phi chức năng (Non-Functional Requirements)

| Loại | Yêu cầu |
| :--- | :--- |
| **Hiệu năng** | Thời gian phản hồi tối đa 2 giây cho 90% các thao tác người dùng. |
| **Bảo mật** | Mật khẩu người dùng phải được mã hóa (hashing) trước khi lưu trữ. |
| **Bảo mật** | Phải sử dụng giao thức HTTPS để truyền dữ liệu. |
| **Độ tin cậy** | Hệ thống phải hoạt động ổn định 99.5% thời gian trong tháng. |
| **Khả năng mở rộng** | Hệ thống phải có khả năng mở rộng để hỗ trợ 10,000 người dùng đăng ký và 500 sự kiện hoạt động đồng thời. |
| **Khả năng sử dụng**| Giao diện người dùng phải trực quan và dễ sử dụng trên cả thiết bị di động và máy tính (Responsive Design). |