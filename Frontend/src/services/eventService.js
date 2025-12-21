import apiService from "./api";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const eventService = {
  // --- DASHBOARD ---
  async getDashboardStats() {
    try {
      const response = await apiService.get("/events/dashboard-stats");
      return (
        response || {
          totalEvents: 0,
          pendingEvents: 0,
          upcomingEvents: 0,
          happeningEvents: 0,
          completedEvents: 0,
          totalParticipants: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalEvents: 0,
        pendingEvents: 0,
        upcomingEvents: 0,
        happeningEvents: 0,
        completedEvents: 0,
        totalParticipants: 0,
      };
    }
  },

  async getManagerDashboardStats() {
    return await apiService.get("/events/manager/dashboard-stats");
  },

  async getAdminDashboardStats() {
    return await apiService.get("/events/admin/dashboard-stats");
  },

  async getEvents(keyword = "", page = 0, size = 10) {
    try {
      const params = new URLSearchParams();
      // Giờ biến keyword đã được định nghĩa, code này sẽ chạy đúng
      if (keyword) params.append("keyword", keyword);
      params.append("page", page);
      params.append("size", size);

      return await apiService.get(`/events?${params.toString()}`);
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  // Lấy sự kiện của cá nhân Manager (Vẫn trả về List theo Controller cũ)
  async getMyEvents() {
    try {
      const response = await apiService.get("/events/my-events");
      return response || [];
    } catch (error) {
      console.error("Error fetching my events:", error);
      throw error;
    }
  },

  async getEventById(id) {
    return await apiService.get(`/events/${id}`);
  },

  async getEventsForAdmin() {
    return await apiService.get("/events/admin");
  },

  async getPendingEvents() {
    return await apiService.get("/events/admin/pending");
  },

  async getTopAttractiveEvents() {
    return await apiService.get("/events/admin/top-attractive");
  },

  async getTopNewEvents() {
    return await apiService.get("/events/top-new");
  },

  async createEvent(eventData) {
    return await apiService.post("/events", eventData);
  },

  async updateEvent(id, eventData) {
    return await apiService.put(`/events/${id}`, eventData);
  },

  async deleteEvent(id) {
    return await apiService.delete(`/events/${id}`);
  },

  async approveEvent(id, status, reason) {
    // Lý do (reason) có thể cần thiết nếu từ chối, hiện tại API nhận body status
    return await apiService.put(`/events/${id}/approve`, { status, reason });
  },

  async rejectEvent(id, reason) {
    return await apiService.put(`/events/${id}/reject`, {
      status: "rejected",
      reason,
    });
  },

  async registerForEvent(eventId) {
    return await apiService.post("/registrations", { eventId });
  },

  async getUserEvents(userId) {
    return await apiService.get(`/registrations/user/${userId}`);
  },

  async cancelEventRegistration(registrationId) {
    return await apiService.delete(`/registrations/${registrationId}`);
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/file-service/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.result.url;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async uploadEventImage(eventId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/events/${eventId}/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.result;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default eventService;
