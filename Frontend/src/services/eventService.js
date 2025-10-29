// test

// Event Service sử dụng Mock API
import mockApi from "./mockApi";

export const eventService = {
  // Lấy danh sách tất cả sự kiện
  async getEvents(filters = {}) {
    try {
      return await mockApi.getEvents(filters);
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  // Lấy chi tiết sự kiện theo ID
  async getEventById(id) {
    try {
      return await mockApi.getEventById(id);
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },

  // Lấy sự kiện của user đã đăng ký
  async getUserEvents(userId) {
    try {
      return await mockApi.getUserEvents(userId);
    } catch (error) {
      console.error("Error fetching user events:", error);
      throw error;
    }
  },

  // Đăng ký tham gia sự kiện
  async registerForEvent(userId, eventId) {
    try {
      return await mockApi.registerForEvent(userId, eventId);
    } catch (error) {
      console.error("Error registering for event:", error);
      throw error;
    }
  },

  // Hủy đăng ký sự kiện
  async cancelEventRegistration(userId, eventId) {
    try {
      return await mockApi.cancelEventRegistration(userId, eventId);
    } catch (error) {
      console.error("Error canceling event registration:", error);
      throw error;
    }
  },

  // Kiểm tra user đã đăng ký sự kiện chưa
  async isUserRegistered(userId, eventId) {
    try {
      const userEvents = await this.getUserEvents(userId);
      return userEvents.some((event) => event.id === eventId);
    } catch (error) {
      console.error("Error checking registration status:", error);
      return false;
    }
  },

  // Lấy thống kê sự kiện cho user
  async getUserEventStats(userId) {
    try {
      const userEvents = await this.getUserEvents(userId);

      const stats = {
        totalRegistered: userEvents.length,
        completed: userEvents.filter((e) => e.status === "completed").length,
        upcoming: userEvents.filter(
          (e) => e.status === "confirmed" && new Date(e.date) > new Date()
        ).length,
        totalHours: userEvents.reduce((sum, e) => sum + (e.totalHours || 0), 0),
        totalPoints: userEvents.reduce((sum, e) => sum + (e.points || 0), 0),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        totalRegistered: 0,
        completed: 0,
        upcoming: 0,
        totalHours: 0,
        totalPoints: 0,
      };
    }
  },
};

export default eventService;
