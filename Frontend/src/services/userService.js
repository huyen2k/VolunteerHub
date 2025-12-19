import apiService from "./api";
import axios from "axios";

export const userService = {

  // Lấy danh sách tất cả users (Admin only)
  async getUsers() {
    try {
      const response = await apiService.get("/users");
      // Tùy vào interceptor của bạn, nếu response trả về trực tiếp data thì return response
      // Nếu response là axios object thì return response.data.result
      return response.data?.result || response.result || response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Lấy thông tin user theo ID
  async getUserById(id) {
    try {
      const response = await apiService.get(`/users/${id}`);
      return response.data?.result || response.result || response;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Tạo user mới (Register)
  async createUser(userData) {
    try {
      const response = await apiService.post("/users", userData);
      return response.data?.result || response.result || response;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Cập nhật thông tin user (Admin sửa user khác)
  async updateUser(id, userData) {
    try {
      const response = await apiService.put(`/users/${id}`, userData);
      return response.data?.result || response.result || response;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái user (Admin)
  async updateUserStatus(userId, status) {
    try {
      console.log("Sending status update:", status);
      const payload = { isActive: status };
      const response = await apiService.put(`/users/${userId}/status`, payload);
      return response.data?.result || response.result || response;
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

  // Lấy thống kê user
  async getUserStats(id) {
    try {
      const response = await apiService.get(`/users/${id}/stats`);
      return response.data?.result || response.result || response;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  },


  getMyProfile: async () => {
    try {
      const response = await apiService.get("/users/my-profile");
      return response.data?.result || response.result || response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tự cập nhật hồ sơ (My Profile)
  updateMyProfile: async (userData) => {
    try {
      const response = await apiService.put("/users/my-profile", userData);
      return response.data?.result || response.result || response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post("http://localhost:8080/api/v1/file-service/upload-image", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // Trả về response.data.result (là cái object {url: '...'})
      return response.data.result;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;