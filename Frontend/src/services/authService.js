import apiService from "./api";

export const authService = {
  // 1. Đăng nhập
  async login(email, password) {
    // Backend trả về: { code: 1000, result: { token: "...", authenticated: true } }
    const response = await apiService.post("/auth/login", { email, password });

    // Kiểm tra cấu trúc trả về để lấy token đúng chỗ
    const token = response.result?.token || response.token;

    if (token) {
      localStorage.setItem("token", token);
    }
    return response; // Trả về toàn bộ response để component xử lý tiếp
  },

  // 2. Đăng ký
  async register(userData) {
    return apiService.post("/users", userData);
  },

  // 3. Đăng xuất
  async logout() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await apiService.post("/auth/logout", { token });
      } catch (error) {
        console.error("Logout error (server side):", error);
      }
    }
    localStorage.removeItem("token");
    // Không cần remove "user" nếu bạn không lưu user object vào localStorage (chỉ lưu token)
  },

  // 4. Lấy thông tin user hiện tại
  async getProfile() {
    // SỬA: Đổi từ /users/info -> /users/my-profile
    const response = await apiService.get("/users/my-profile");

    // Backend trả về ApiResponse, ta chỉ cần lấy phần result (User Object)
    return response.result || response;
  },

  // 5. Cập nhật profile (Dành cho user tự sửa)
  async updateProfile(userData) {
    // SỬA: Dùng API tự cập nhật, không cần truyền ID
    const response = await apiService.put("/users/my-profile", userData);
    return response.result || response;
  },

  // 6. Introspect & Refresh Token (Giữ nguyên)
  async introspect(token) {
    return apiService.post("/auth/introspect", { token });
  },

  async refreshToken(token) {
    return apiService.post("/auth/refresh", { token });
  },
};