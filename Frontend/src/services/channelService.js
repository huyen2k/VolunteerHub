// Channel Service - Kết nối với Backend API
import apiService from "./api";

export const channelService = {
  // Lấy danh sách tất cả channels
  async getChannels() {
    try {
      return await apiService.get("/channels");
    } catch (error) {
      console.error("Error fetching channels:", error);
      throw error;
    }
  },
  // Lấy channel theo ID
  async getChannel(channelId) {
    try {
      return await apiService.get(`/channels/${channelId}`);
    } catch (error) {
      console.error("Error fetching channel:", error);
      throw error;
    }
  },

  // Lấy channel theo eventId
  async getChannelByEventId(eventId) {
    try {
      return await apiService.get(`/channels/event/${eventId}`);
    } catch (error) {
      // Graceful fallback: nếu 404 CHANNEL_NOT_EXISTED thì trả null thay vì throw
      if (error && (error.status === 404 || (error.code === 1015))) {
        return null;
      }
      console.error("Error fetching channel by eventId:", error);
      throw error;
    }
  },

  // Tạo channel mới
  async createChannel(channelData) {
    try {
      return await apiService.post("/channels", channelData);
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  },

  // Cập nhật channel
  async updateChannel(channelId, channelData) {
    try {
      return await apiService.put(`/channels/${channelId}`, channelData);
    } catch (error) {
      console.error("Error updating channel:", error);
      throw error;
    }
  },

  // Xóa channel
  async deleteChannel(channelId) {
    try {
      return await apiService.delete(`/channels/${channelId}`);
    } catch (error) {
      console.error("Error deleting channel:", error);
      throw error;
    }
  },
};

export default channelService;

