import apiService from "./api";

export const authService = {
  // Login user
  async login(email, password) {
    return apiService.post("/auth/login", { email, password });
  },

  // Register user
  async register(userData) {
    return apiService.post("/auth/register", userData);
  },

  // Logout user
  async logout() {
    return apiService.post("/auth/logout");
  },

  // Get current user profile
  async getProfile() {
    return apiService.get("/auth/profile");
  },

  // Update user profile
  async updateProfile(userData) {
    return apiService.put("/auth/profile", userData);
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    return apiService.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  // Forgot password
  async forgotPassword(email) {
    return apiService.post("/auth/forgot-password", { email });
  },

  // Reset password
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
