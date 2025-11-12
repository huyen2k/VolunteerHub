# Kết quả Test API Backend VolunteerHub

## Trạng thái Backend

✅ **Backend đã khởi động thành công**

- Port: 8080
- Context Path: /api/v1
- MongoDB: Đã kết nối thành công với MongoDB Atlas
- Database: Hub

## Kết quả Test API

### ✅ 1. Authentication - Login

**Endpoint:** `POST /api/v1/auth/login`

- **Status:** ✅ Thành công
- **Request:**
  ```json
  {
    "email": "admin@example.com",
    "password": "admin"
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "result": {
      "token": "eyJhbGciOiJIUzUxMiJ9...",
      "authenticated": true
    }
  }
  ```

### ✅ 2. Get User Info

**Endpoint:** `GET /api/v1/users/info`

- **Status:** ✅ Thành công
- **Authentication:** Required (Bearer Token)
- **Response:** Trả về thông tin user hiện tại

### ✅ 3. Get All Events

**Endpoint:** `GET /api/v1/events`

- **Status:** ✅ Thành công
- **Authentication:** Required (Bearer Token)
- **Result:** Tìm thấy 8 events trong database

### ✅ 4. Create Event

**Endpoint:** `POST /api/v1/events`

- **Status:** ✅ Thành công
- **Authentication:** Required (Bearer Token với role ADMIN)
- **Request:**
  ```json
  {
    "title": "API Test Event",
    "description": "This is a test event created via API",
    "date": "2025-12-31",
    "location": "Test Location"
  }
  ```

### ✅ 5. Token Introspect

**Endpoint:** `POST /api/v1/auth/introspect`

- **Status:** ✅ Thành công
- **Response:** Token validation hoạt động đúng

### ⚠️ 6. Create User (Register)

**Endpoint:** `POST /api/v1/users`

- **Status:** ⚠️ Có lỗi
- **Error:** "No mapping metadata found for class java.lang.String"
- **Nguyên nhân:** Có vấn đề với UserMapper khi map UserCreationRequest sang User entity
- **Cần sửa:** Kiểm tra UserMapper và các field mapping

## Tổng kết

### ✅ Hoạt động tốt:

- Authentication (Login, Token Introspect)
- Get User Info
- Get/Create Events
- JWT Token validation
- MongoDB connection

### ⚠️ Cần sửa:

- Create User endpoint (lỗi mapping)

## Cách chạy Backend

```bash
cd Backend
export $(cat .env | xargs)
./mvnw spring-boot:run
```

## Cách test API

```bash
cd Backend
./test-api.sh
```

Hoặc sử dụng file `request.http` với REST Client extension trong VS Code.

## Thông tin kết nối Database

Thông tin được lưu trong file `.env`:

- MONGO_DATABASE: Hub
- MONGO_CLUSTER: cluster0.izdgthg.mongodb.net
- Connection: MongoDB Atlas (Cloud)
