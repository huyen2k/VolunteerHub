// Event Service - Kết nối với Backend API
import apiService from "./api";

export const eventService = {
  // Lấy danh sách sự kiện (Public - Chỉ Approved)
  async getEvents() {
    try {
      const events = await apiService.get("/events");
      return events || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  // Lấy tất cả sự kiện cho Admin (Pending/Rejected/Approved)
  async getEventsForAdmin() {
    try {
      // Backend endpoint: GET /events/admin
      const events = await apiService.get("/events/admin");
      return events || [];
    } catch (error) {
      console.error("Error fetching admin events:", error);
      throw error;
    }
  },

  async getEventById(id) {
    try {
      return await apiService.get(`/events/${id}`);
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },

  async createEvent(eventData) {
    try {
      return await apiService.post("/events", eventData);
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  async updateEvent(id, eventData) {
    try {
      return await apiService.put(`/events/${id}`, eventData);
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  async deleteEvent(id) {
    try {
      return await apiService.delete(`/events/${id}`);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  async approveEvent(id, status, reason) {
    try {
      return await apiService.put(`/events/${id}/approve`, { status, reason });
    } catch (error) {
      console.error("Error approving event:", error);
      throw error;
    }
  },

  async registerForEvent(eventId) {
    try {
      return await apiService.post("/registrations", { eventId });
    } catch (error) {
      console.error("Error registering for event:", error);
      throw error;
    }
  },

  async cancelEventRegistration(registrationId) {
    try {
      return await apiService.delete(`/registrations/${registrationId}`);
    } catch (error) {
      console.error("Error canceling event registration:", error);
      throw error;
    }
  },

  async getUserEvents(userId) {
    try {
      return await apiService.get(`/registrations/user/${userId}`);
    } catch (error) {
      console.error("Error fetching user events:", error);
      throw error;
    }
  },

  async getEventRegistrations(eventId) {
    try {
      return await apiService.get(`/registrations/event/${eventId}`);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      throw error;
    }
  },

  async getEventsByManager(managerId) {
    try {
      return await apiService.get(`/events/manager/${managerId}`);
    } catch (error) {
      console.error("Error fetching events by manager:", error);
      throw error;
    }
  },

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