// Chat Service - Kết nối với Backend API
import apiService from "./api";

export const chatService = {
  // Lấy danh sách kênh chat
  async getChatChannels() {
    try {
      return await apiService.get("/channels");
    } catch (error) {
      console.error("Error fetching chat channels:", error);
      throw error;
    }
  },

  // Lấy tin nhắn trong kênh
  async getMessages(channelId, limit = 50, offset = 0) {
    try {
      return await apiService.get(`/channels/${channelId}/messages?limit=${limit}&offset=${offset}`);
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  // Gửi tin nhắn
  async sendMessage(channelId, content) {
    try {
      return await apiService.post(`/channels/${channelId}/messages`, { content });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Đánh dấu đã đọc
  async markAsRead(channelId) {
    try {
      return await apiService.put(`/channels/${channelId}/read`);
    } catch (error) {
      console.error("Error marking as read:", error);
      throw error;
    }
  },

  // Lấy số tin nhắn chưa đọc
  async getUnreadCount(channelId) {
    try {
      return await apiService.get(`/channels/${channelId}/unread-count`);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },
};

export default chatService;

