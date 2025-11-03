# 🗂️ Data Model Design (MongoDB)

## 1. Tổng quan

Hệ thống sử dụng **MongoDB** để lưu trữ dữ liệu phi quan hệ (NoSQL), tập trung vào:

- Linh hoạt trong quản lý sự kiện và người dùng.
- Hỗ trợ dữ liệu có cấu trúc động như bài viết, bình luận, lượt thích.
- Tối ưu cho các chức năng đọc/ghi song song cao (Dashboard, Kênh trao đổi).

---

## 2. Sơ đồ quan hệ logic (ERD conceptual)

```
User ─────┬────> EventRegistration <──── Event
           │
           ├────> Notification
           │
           └────> Post ─────> Comment ─────> Like
Event ─────┬────> Channel (auto-create after approval)
           └────> Report (for managers/admin)
```

---

## 3️. Thiết kế chi tiết các collection

### 3.1. `users`

Lưu thông tin người dùng gồm 3 vai trò: **volunteer**, **event_manager**, **admin**

```js
{
  _id: ObjectId,
  email: String, // unique
  password_hash: String,
  role: String, // enum: ['volunteer', 'event_manager', 'admin']
  profile: {
    full_name: String,
    avatar_url: String,
    phone: String,
    address: String,
    bio: String
  },
  is_active: Boolean,
  last_login: Date,
  created_at: Date,
  updated_at: Date
}
```

---

### 3.2. `events`

Quản lý thông tin sự kiện và trạng thái duyệt.

```js
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  location: String,
  status: String, // 'pending', 'approved', 'rejected', 'completed'
  createdBy: ObjectId, // Ref -> users (role: event_manager)
  approvedBy: ObjectId, // Ref -> users (role: admin)
  createdAt: Date,
  updatedAt: Date
}
```

---

### 3.3. `event_registrations`

Quản lý việc đăng ký, thoái đăng ký và hoàn thành sự kiện của tình nguyện viên.

```js
{
  _id: ObjectId,
  eventId: ObjectId, // Ref -> events
  userId: ObjectId,  // Ref -> users
  status: String, // 'pending', 'approved', 'canceled', 'completed'
  registeredAt: Date,
  updatedAt: Date,
  note: String
}
```

**Ràng buộc logic**

- Một `userId` chỉ có thể đăng ký 1 lần duy nhất cho cùng `eventId`.

---

### 3.4. `channels`

Mỗi sự kiện sau khi được duyệt sẽ có một kênh trao đổi riêng (tương tự “tường Facebook”).

```js
{
  _id: ObjectId,
  eventId: ObjectId, // Ref -> events
  createdAt: Date,
  postCount: Number
}
```

---

### 3.5. `posts`

Bài viết trên kênh sự kiện, được đăng bởi quản lý hoặc tình nguyện viên đã được duyệt.

```js
{
  _id: ObjectId,
  channelId: ObjectId, // Ref -> channels
  authorId: ObjectId,  // Ref -> users
  content: String,
  images: {
    urlImg: String.
  },
  likesCount: Number,
  commentsCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 3.6. `comments`

Bình luận thuộc về một bài viết trong kênh.

```js
{
  _id: ObjectId,
  postId: ObjectId,   // Ref -> posts
  authorId: ObjectId, // Ref -> users
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 3.7. `likes`

Lượt thích cho bài viết hoặc bình luận.

```js
{
  _id: ObjectId,
  userId: ObjectId,     // Ref -> users
  targetType: String,   // 'post' | 'comment'
  targetId: ObjectId,   // Ref -> posts hoặc comments
  createdAt: Date
}
```

---

### 3.8. `notifications`

Thông báo cho người dùng (khi được duyệt, hủy, hoàn thành sự kiện, hoặc có tương tác mới).

```js
{
  _id: ObjectId,
  userId: ObjectId, // Ref -> users
  type: String,     // 'event_status', 'post_activity', 'comment_activity', 'system'
  message: String,
  isRead: Boolean,
  createdAt: Date
}
```

---

### 3.9. `reports`

Dữ liệu cho trang Dashboard hoặc xuất báo cáo cho quản lý và admin.

```js
{
  _id: ObjectId,
  eventId: ObjectId, // Ref -> events
  totalVolunteers: Number,
  completedVolunteers: Number,
  postsCount: Number,
  likesCount: Number,
  commentsCount: Number,
  generatedAt: Date
}
```

---

## 4. Ghi chú triển khai

- Tất cả `createdAt` / `updatedAt` sử dụng `timestamps` tự động.
- Khi **Admin duyệt sự kiện**, backend trigger:
  - Cập nhật `status = "approved"`
  - Tạo `channel` tương ứng.
- Các hành động “like” hoặc “comment” cần cập nhật đếm cache (`likesCount`, `commentsCount`) trong `posts`.
- Tất cả dữ liệu nhạy cảm (`password_hash`) cần mã hóa bằng **bcrypt**.
- Cần thêm cơ chế phân quyền API theo `role`.
