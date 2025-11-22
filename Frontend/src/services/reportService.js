// Report Service - Kết nối với Backend API
import apiService from "./api";

export const reportService = {
  // Lấy danh sách tất cả báo cáo
  async getReports(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.type) params.append("type", filters.type);
      
      const queryString = params.toString();
      const url = queryString ? `/reports?${queryString}` : "/reports";
      return await apiService.get(url);
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  },

  // Lấy thống kê báo cáo
  async getReportStats() {
    try {
      return await apiService.get("/reports/stats");
    } catch (error) {
      console.error("Error fetching report stats:", error);
      throw error;
    }
  },

  // Lấy chi tiết báo cáo theo ID
  async getReportById(id) {
    try {
      return await apiService.get(`/reports/${id}`);
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái báo cáo
  async updateReportStatus(id, status) {
    try {
      return await apiService.put(`/reports/${id}/status`, { status });
    } catch (error) {
      console.error("Error updating report status:", error);
      throw error;
    }
  },

  // Từ chối báo cáo
  async rejectReport(id, reason = "") {
    try {
      return await apiService.put(`/reports/${id}/reject`, { reason });
    } catch (error) {
      console.error("Error rejecting report:", error);
      throw error;
    }
  },

  // Chấp nhận báo cáo
  async acceptReport(id) {
    try {
      return await apiService.put(`/reports/${id}/accept`);
    } catch (error) {
      console.error("Error accepting report:", error);
      throw error;
    }
  },

  // Đánh dấu đã giải quyết
  async resolveReport(id) {
    try {
      return await apiService.put(`/reports/${id}/resolve`);
    } catch (error) {
      console.error("Error resolving report:", error);
      throw error;
    }
  },

  // Tạo báo cáo mới
  async createReport(data) {
    try {
      return await apiService.post("/reports", data);
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  },
};

export default reportService;

