import apiService from "./api";

export const eventService = {
  // 1. Lấy danh sách sự kiện (ĐÃ TỐI ƯU: KHÔNG DÙNG PROMISE.ALL DƯ THỪA)
  async getEvents() {
    try {
      // Chỉ lấy danh sách, Backend đã xử lý toEnrichedResponse rồi
      const response = await apiService.get("/events");
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching events:", error);
      return []; // Trả về mảng rỗng để UI không bị văng lỗi
    }
  },

  // 2. Lấy sự kiện của cá nhân Manager (SỬA LẠI URL CHO ĐÚNG CONTROLLER)
  async getMyEvents() {
    try {
      // Dùng chung apiService để hưởng cấu hình baseURL và Token
      const response = await apiService.get("/events/my-events");
      return response || [];
    } catch (error) {
      console.error("Error fetching my events:", error);
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


  async getEventsForAdmin() {
    return await apiService.get("/events/admin");
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
    return await apiService.put(`/events/${id}/approve`, { status, reason });
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

   async uploadEventImage(eventId, file) {
    const formData = new FormData();
    formData.append("file", file); // Key 'file' phải khớp với @RequestParam("file") ở Controller

    return apiService.request(`/events/${eventId}/upload-image`, {
      method: "POST",
      body: formData,
      headers: {}
    });
  },
};

export default eventService;