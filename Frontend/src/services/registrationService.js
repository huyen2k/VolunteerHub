// Registration Service - Kết nối với Backend API
import apiService from "./api";

export const registrationService = {
  // Cập nhật trạng thái đăng ký (Duyệt/Từ chối/Hoàn thành)
  async updateRegistrationStatus(registrationId, status) {
    try {
      return await apiService.put(`/registrations/${registrationId}/status`, { status });
    } catch (error) {
      console.error("Error updating registration status:", error);
      throw error;
    }
  },

  // Lấy danh sách đăng ký theo event (Cho Manager xem ai đã đăng ký)
  async getRegistrationsByEvent(eventId) {
    try {
      return await apiService.get(`/registrations/event/${eventId}`);
    } catch (error) {
      console.error("Error fetching registrations by event:", error);
      throw error;
    }
  },

  // Lấy danh sách đăng ký theo user (Cho User xem lịch sử)
  async getRegistrationsByUser(userId) {
    try {
      return await apiService.get(`/registrations/user/${userId}`);
    } catch (error) {
      console.error("Error fetching registrations by user:", error);
      throw error;
    }
  },

  // Hủy đăng ký (User tự hủy hoặc Manager xóa)
  async deleteRegistration(registrationId) {
    try {
      return await apiService.delete(`/registrations/${registrationId}`);
    } catch (error) {
      console.error("Error deleting registration:", error);
      throw error;
    }
  },
};

export default registrationService;