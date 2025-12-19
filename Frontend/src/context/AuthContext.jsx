import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  updateUser: async () => {},
  logout: () => {},
  hasRole: () => false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const mapBackendUserToFrontend = (backendUser) => {
    const roles = backendUser.roles || [];
    let role = "volunteer";

    // Lưu ý: Kiểm tra kỹ xem backend trả về "ADMIN" hay "ROLE_ADMIN"
    if (roles.includes("ADMIN")) role = "admin";
    // Lưu ý: Backend Java của bạn đang là EVEN_MANAGER (thiếu chữ T), kiểm tra lại nhé
    else if (roles.includes("EVEN_MANAGER") || roles.includes("EVENT_MANAGER")) role = "manager";

    return {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.full_name || backendUser.email, // Mapping snake_case
      role: role,
      roles: roles,
      avatar: backendUser.avatar_url || "", // Mapping snake_case
      phone: backendUser.phone || "",
      address: backendUser.address || "",
      bio: backendUser.bio || "",
      isActive: backendUser.isActive,
      createdAt: backendUser.created_at,
      updatedAt: backendUser.updated_at,
    };
  };

  // 1. Khởi tạo Auth
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getProfile();
        if (userData) {
          const mappedUser = mapBackendUserToFrontend(userData);
          setUser(mappedUser);
          // localStorage.setItem("user", JSON.stringify(mappedUser));
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Login
  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      // Sau khi login, gọi ngay getProfile để lấy info
      const userData = await authService.getProfile();
      const mappedUser = mapBackendUserToFrontend(userData);

      setUser(mappedUser);
      return mappedUser;
    } catch (error) {
      throw error; // Ném lỗi ra để trang Login hiển thị alert
    }
  };

  // 3. Register
  const register = async (name, email, password, phone = "", address = "", role = "volunteer") => {
    try {
      // Đảm bảo key gửi lên khớp với snake_case DTO của Backend
      await authService.register({
        email,
        password,
        full_name: name, // map name -> full_name
        phone,
        address,
        avatar_url: "",
        role: role,
      });
      // Đăng ký xong tự động login luôn
      return await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  // 4. Update User (SỬA LẠI LOGIC)
  const updateUser = async (updatedData) => {
    if (!user) throw new Error("No user logged in");


    const updatedBackendUser = await authService.updateProfile(updatedData);

    const mappedUser = mapBackendUserToFrontend(updatedBackendUser);
    setUser(mappedUser);
    return mappedUser;
  };

  // 5. Logout
  const logout = () => {
    authService.logout(); // Gọi service để xóa token
    setUser(null);
    navigate("/login"); // Chuyển hướng mượt mà
    // window.location.href = "/login"; // Dùng cái này nếu muốn reload sạch sẽ state
  };

  const hasRole = (roleToCheck) => user?.role === roleToCheck;

  return (
      <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, updateUser, logout, hasRole }}>
        {!loading && children}
      </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);