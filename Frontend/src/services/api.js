const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL; //Khởi tạo base URL
  }

  //Hàm gửi request đến API
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`; //Tạo URL đầy đủ
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // thêm token auth nếu có
    const token = localStorage.getItem("token"); // Đọc token từ local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      // Nếu response không ok --> throw error
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // hàm get request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" }); //gọi hàm req với method = GET
  }

  // hàm post request --> Tương tự nhưng thêm dữ liệu gửi đi
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // PATCH request
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
