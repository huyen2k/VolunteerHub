// Registration Service - Kết nối với Backend API
import apiService from "./api";

export const registrationService = {
  // Cập nhật trạng thái đăng ký
  async updateRegistrationStatus(registrationId, status) {
    try {
      return await apiService.put(`/registrations/${registrationId}/status`, { status });
    } catch (error) {
      console.error("Error updating registration status:", error);
      throw error;
    }
  },

  // Lấy danh sách đăng ký theo event
  async getRegistrationsByEvent(eventId) {
    try {
      return await apiService.get(`/registrations/event/${eventId}`);
    } catch (error) {
      console.error("Error fetching registrations by event:", error);
      throw error;
    }
  },

  // Lấy danh sách đăng ký theo user
  async getRegistrationsByUser(userId) {
    try {
      return await apiService.get(`/registrations/user/${userId}`);
    } catch (error) {
      console.error("Error fetching registrations by user:", error);
      throw error;
    }
  },
};

export default registrationService;

