// Notification Service - Kết nối với Backend API
import apiService from "./api";

export const notificationService = {
  // Lấy danh sách tất cả thông báo của user hiện tại
  async getNotifications() {
    try {
      return await apiService.get("/notifications");
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // Lấy danh sách thông báo chưa đọc
  async getUnreadNotifications() {
    try {
      return await apiService.get("/notifications/unread");
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw error;
    }
  },

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount() {
    try {
      const response = await apiService.get("/notifications/unread/count");
      return response || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  // Đánh dấu thông báo là đã đọc
  async markAsRead(notificationId) {
    try {
      return await apiService.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Tạo thông báo mới (manager/admin only)
  async createNotification(notificationData) {
    try {
      return await apiService.post("/notifications", notificationData);
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },
};

export default notificationService;
