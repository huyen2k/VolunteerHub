// Event Service - Kết nối với Backend API
import apiService from "./api";

export const eventService = {
  // Lấy danh sách tất cả sự kiện
  async getEvents(filters = {}) {
    try {
      // Backend endpoint: GET /events
      const events = await apiService.get("/events");
      return events || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  // Lấy chi tiết sự kiện theo ID
  async getEventById(id) {
    try {
      return await apiService.get(`/events/${id}`);
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },

  // Tạo sự kiện mới
  async createEvent(eventData) {
    try {
      return await apiService.post("/events", eventData);
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  // Cập nhật sự kiện
  async updateEvent(id, eventData) {
    try {
      return await apiService.put(`/events/${id}`, eventData);
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  // Xóa sự kiện
  async deleteEvent(id) {
    try {
      return await apiService.delete(`/events/${id}`);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  // Duyệt sự kiện (Admin)
  async approveEvent(id, status, reason) {
    try {
      return await apiService.put(`/events/${id}/approve`, { status, reason });
    } catch (error) {
      console.error("Error approving event:", error);
      throw error;
    }
  },

  // Đăng ký tham gia sự kiện
  async registerForEvent(eventId) {
    try {
      return await apiService.post("/registrations", { eventId });
    } catch (error) {
      console.error("Error registering for event:", error);
      throw error;
    }
  },

  // Hủy đăng ký sự kiện
  async cancelEventRegistration(registrationId) {
    try {
      return await apiService.delete(`/registrations/${registrationId}`);
    } catch (error) {
      console.error("Error canceling event registration:", error);
      throw error;
    }
  },

  // Lấy danh sách sự kiện của user
  async getUserEvents(userId) {
    try {
      return await apiService.get(`/registrations/user/${userId}`);
    } catch (error) {
      console.error("Error fetching user events:", error);
      throw error;
    }
  },

  // Lấy danh sách tình nguyện viên đã đăng ký sự kiện
  async getEventRegistrations(eventId) {
    try {
      return await apiService.get(`/registrations/event/${eventId}`);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      throw error;
    }
  },

  // Lấy danh sách sự kiện của manager
  async getEventsByManager(managerId) {
    try {
      return await apiService.get(`/events/manager/${managerId}`);
    } catch (error) {
      console.error("Error fetching events by manager:", error);
      throw error;
    }
  },

  // Reject event (admin)
  async rejectEvent(id, reason) {
    try {
      return await apiService.put(`/events/${id}/reject`, { status: "rejected", reason });
    } catch (error) {
      console.error("Error rejecting event:", error);
      throw error;
    }
  },
};

export default eventService;
