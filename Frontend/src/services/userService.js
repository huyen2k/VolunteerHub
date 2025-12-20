import apiService from "./api";
import axios from "axios";

// Lấy URL gốc từ biến môi trường (để dùng cho uploadImage)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const userService = {

  // ✅ CẬP NHẬT: Hỗ trợ phân trang và tìm kiếm
  async getUsers(keyword = "", page = 0, size = 10) {
    try {
      // Tạo query string: /users?keyword=...&page=...&size=...
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      params.append("page", page);
      params.append("size", size);

      // apiService đã tự lấy .result ra rồi, nên ở đây nhận được Page object luôn
      return await apiService.get(`/users?${params.toString()}`);
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

  // Tạo user mới
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

  // Cập nhật trạng thái user
  async updateUserStatus(userId, status) {
    try {
      // Backend mong đợi body: { isActive: true/false }
      const payload = { isActive: status };
      return await apiService.put(`/users/${userId}/status`, payload);
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  // Xóa user
  async deleteUser(id) {
    try {
      return await apiService.delete(`/users/${id}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Lấy thống kê user
  async getUserStats(id) {
    try {
      return await apiService.get(`/users/${id}/stats`);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  },

  // Lấy hồ sơ cá nhân
  getMyProfile: async () => {
    try {
      return await apiService.get("/users/my-profile");
    } catch (error) {
      throw error;
    }
  },

  // Tự cập nhật hồ sơ
  updateMyProfile: async (userData) => {
    try {
      return await apiService.put("/users/my-profile", userData);
    } catch (error) {
      throw error;
    }
  },

  // Upload ảnh (Dùng axios riêng vì cần config multipart/form-data)
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      // Sử dụng API_BASE_URL thay vì hardcode localhost
      const response = await axios.post(`${API_BASE_URL}/file-service/upload-image`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // Backend trả về: { code: 1000, result: "url..." }
      return response.data.result;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;