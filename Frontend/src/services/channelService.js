import apiService from "./api";

export const channelService = {
  // Lấy danh sách tất cả channels
  async getChannels() {
    return apiService.get("/channels");
  },

  // Lấy channel theo ID
  async getChannel(channelId) {
    return apiService.get(`/channels/${channelId}`);
  },


  async getChannelByEventId(eventId) {
    try {
      return await apiService.get(`/channels/event/${eventId}`);
    } catch (error) {
      // Bắt tất cả các thể loại lỗi báo hiệu "Không tìm thấy"
      if (error?.status === 404 || error?.code === 1015 || error?.response?.status === 404) {
        return null;
      }
      // Nếu là lỗi khác (ví dụ 500, mất mạng) thì mới ném ra
      throw error;
    }
  },

  // Tạo channel mới
  async createChannel(channelData) {
    return apiService.post("/channels", channelData);
  },

  // Cập nhật channel
  async updateChannel(channelId, channelData) {
    return apiService.put(`/channels/${channelId}`, channelData);
  },

  // Xóa channel
  async deleteChannel(channelId) {
    return apiService.delete(`/channels/${channelId}`);
  },
};

export default channelService;