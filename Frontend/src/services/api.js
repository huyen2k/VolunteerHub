const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    // Xử lý URL
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    // Cấu hình headers mặc định
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Tự động thêm Token (trừ các API public cụ thể)
    const token = localStorage.getItem("token");
    if (token && !endpoint.startsWith('https://api.clouddictionary.com')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      // Xử lý lỗi HTTP (4xx, 5xx)
      if (!response.ok) {
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.code = data.code;
        error.status = response.status;
        error.response = data;
        throw error;
      }

      // Xử lý lỗi Logic nghiệp vụ (Code != 1000)
      if (data.code && data.code !== 1000) {
        const error = new Error(data.message || "Request failed");
        error.code = data.code;
        error.status = 200; // HTTP OK nhưng Logic Fail
        throw error;
      }


      return data.result !== undefined ? data.result : data;

    } catch (error) {
      // Bỏ log lỗi 404 hoặc các lỗi business đã biết để đỡ rác console
      if (error.status !== 404 && error.code !== 1015) {
        console.error("API Request Failed:", { url, status: error.status, message: error.message });
      }
      throw error;
    }
  }

  // Các phương thức tiện ích
  async get(endpoint, options = {}) { return this.request(endpoint, { ...options, method: "GET" }); }

  async post(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: "POST", body: JSON.stringify(data) }); }

  async put(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: "PUT", body: JSON.stringify(data) }); }

  async delete(endpoint, options = {}) { return this.request(endpoint, { ...options, method: "DELETE" }); }

  async patch(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(data) }); }

  // API ngoài
  async fetchCloudWord(word) {
    return this.get(`https://api.clouddictionary.com/v1/search?word=${word}`);
  }
}

export const apiService = new ApiService();
export default apiService;