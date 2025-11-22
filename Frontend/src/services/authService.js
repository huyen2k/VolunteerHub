import apiService from "./api";

export const authService = {
  // Login user
  async login(email, password) {
    const response = await apiService.post("/auth/login", { email, password });
    if (response.token) {
      localStorage.setItem("token", response.token);
    }
    return response;
  },

  //dang ky
  async register(userData) {
    return apiService.post("/users", userData);
  },

  async logout() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await apiService.post("/auth/logout", { token });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  async getProfile() {
    return apiService.get("/users/info");
  },

  async updateProfile(userId, userData) {
    return apiService.put(`/users/${userId}`, userData);
  },

  async introspect(token) {
    return apiService.post("/auth/introspect", { token });
  },

  async refreshToken(token) {
    return apiService.post("/auth/refresh", { token });
  },
};
