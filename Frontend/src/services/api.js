const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    // Nếu là URL tuyệt đối (bắt đầu bằng http), dùng luôn URL đó, không nối với baseURL
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

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

      if (!response.ok) {
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.code = data.code;
        error.status = response.status;
        error.response = data;
        throw error;
      }

      // Logic xử lý code 1000 cho backend Spring Boot của bạn
      if (data.code && data.code !== 1000) {
        const error = new Error(data.message || "Request failed");
        error.code = data.code;
        error.status = 200;
        throw error;
      }

      return data.result !== undefined ? data.result : data;
    } catch (error) {
      if (error.status !== 404 && error.code !== 1015) {
        console.error("API Request Failed:", { url: endpoint, status: error.status, message: error.message });
      }
      throw error;
    }
  }

  // --- GIỮ NGUYÊN CÁC HÀM CŨ ĐỂ KHÔNG HỎNG BÀI ---
  async get(endpoint, options = {}) { return this.request(endpoint, { ...options, method: "GET" }); }
  async post(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: "POST", body: JSON.stringify(data) }); }
  async put(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: "PUT", body: JSON.stringify(data) }); }
  async delete(endpoint, options = {}) { return this.request(endpoint, { ...options, method: "DELETE" }); }
  async patch(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(data) }); }

  // --- THÊM MỚI: HÀM CHO CLOUD DICTIONARY ---
  async fetchCloudWord(word) {
    // Gọi trực tiếp đến API ngoài, không đi qua tiền tố /api/v1 của bạn
    return this.get(`https://api.clouddictionary.com/v1/search?word=${word}`);
  }
}

export const apiService = new ApiService();
export default apiService;