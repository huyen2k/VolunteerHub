import React, { createContext, useState, useEffect, useContext } from "react";
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

  // Helper map dữ liệu
  const mapBackendUserToFrontend = (backendUser) => {
    const roles = backendUser.roles || [];
    let role = "volunteer";
    if (roles.includes("ADMIN")) role = "admin";
    else if (roles.includes("EVEN_MANAGER")) role = "manager";

    return {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.full_name || backendUser.email,
      role: role,
      roles: roles,
      avatar: backendUser.avatar_url || "",
      phone: backendUser.phone || "",
      address: backendUser.address || "",
      bio: backendUser.bio || "",
      isActive: backendUser.isActive,
      createdAt: backendUser.created_at,
      updatedAt: backendUser.updated_at,
    };
  };

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
          localStorage.setItem("user", JSON.stringify(mappedUser));
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

  const login = async (email, password) => {
    await authService.login(email, password);
    const userData = await authService.getProfile();
    const mappedUser = mapBackendUserToFrontend(userData);
    setUser(mappedUser);
    localStorage.setItem("user", JSON.stringify(mappedUser));
    return mappedUser;
  };

  const register = async (name, email, password, phone = "", address = "", role = "volunteer") => {
    await authService.register({
      email,
      password,
      full_name: name,
      phone,
      address,
      avatar_url: "",
      role: role,
    });
    return await login(email, password);
  };

  const updateUser = async (updatedData) => {
    if (!user) throw new Error("No user logged in");
    const updatedBackendUser = await authService.updateProfile(user.id, updatedData);
    const mappedUser = mapBackendUserToFrontend(updatedBackendUser);
    setUser(mappedUser);
    localStorage.setItem("user", JSON.stringify(mappedUser));
    return mappedUser;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const hasRole = (roleToCheck) => user?.role === roleToCheck;

  return (
      <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, updateUser, logout, hasRole }}>
        {children}
      </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);