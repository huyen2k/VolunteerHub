// User Service - Kết nối với Backend API
import apiService from "./api";

export const userService = {
  // Lấy danh sách tất cả users (Admin only)
  async getUsers() {
    try {
      return await apiService.get("/users");
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Lấy thông tin user theo ID
  async getUserById(id) {
    try {
      return await apiService.get(`/users/${id}`);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Tạo user mới (Register)
  async createUser(userData) {
    try {
      return await apiService.post("/users", userData);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Cập nhật thông tin user
  async updateUser(id, userData) {
    try {
      return await apiService.put(`/users/${id}`, userData);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái user (Admin)
  async updateUserStatus(id, status) {
    try {
      return await apiService.put(`/users/${id}/status`, { is_active: status });
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  // Xóa user (Admin)
  async deleteUser(id) {
    try {
      return await apiService.delete(`/users/${id}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};

export default userService;

