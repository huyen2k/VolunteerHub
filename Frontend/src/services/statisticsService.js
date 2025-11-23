// Statistics Service - Kết nối với Backend API
import apiService from "./api";

export const statisticsService = {
  // Lấy thống kê users (admin only)
  async getUserStatistics() {
    try {
      return await apiService.get("/statistics/users");
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      throw error;
    }
  },

  // Lấy thống kê events (manager/admin)
  async getEventStatistics(managerId = null) {
    try {
      const url = managerId 
        ? `/statistics/events?managerId=${managerId}`
        : "/statistics/events";
      return await apiService.get(url);
    } catch (error) {
      console.error("Error fetching event statistics:", error);
      throw error;
    }
  },

  // Lấy tổng quan hệ thống
  async getOverviewStatistics() {
    try {
      return await apiService.get("/statistics/overview");
    } catch (error) {
      console.error("Error fetching overview statistics:", error);
      throw error;
    }
  },
};

export default statisticsService;

