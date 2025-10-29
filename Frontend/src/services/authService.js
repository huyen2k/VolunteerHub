import apiService from "./api";

export const authService = {
  // Đăng nhập cho người dùng --> Đẩy email + password lên
  async login(email, pass) {
    return apiService.post("/auth/login", { email, pass });
  },

  // Register user
  async register(userData) {
    return apiService.post("/auth/register", userData);
  },

  // Logout user
  async logout() {
    return apiService.post("/auth/logout");
  },

  // Lấy thông tin người dùng
  async getProfile() {
    return apiService.get("/auth/profile");
  },

  // Cập nhật
  async updateProfile(userData) {
    return apiService.put("/auth/profile", userData);
  },

  // Thay đổi mật khẩu
  async changePassword(currentPass, newPass) {
    return apiService.post("/auth/change-password", {
      currentPass,
      newPass,
    });
  },

  //demo
  async forgotPassword(email) {
    return apiService.post("/auth/forgot-password", { email });
  },

  async resetPassword(token, newPassword) {
    return apiService.post("/auth/reset-password", { token, newPassword });
  },

  // Verify email
  async verifyEmail(token) {
    return apiService.post("/auth/verify-email", { token });
  },

  // Resend verification email
  async resendVerificationEmail() {
    return apiService.post("/auth/resend-verification");
  },
};
