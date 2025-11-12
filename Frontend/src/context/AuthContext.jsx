import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async () => {
    try {
      const userData = await authService.getProfile();
      const mappedUser = mapBackendUserToFrontend(userData);
      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
    } catch (error) {
      console.error("Error loading user profile:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing session and validate token
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      authService
        .introspect(token)
        .then((result) => {
          if (result.valid) {
            loadUserProfile();
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setLoading(false);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const mapBackendUserToFrontend = (backendUser) => {
    return {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.full_name || backendUser.email,
      role: backendUser.roles?.[0]?.toLowerCase() || "volunteer",
      avatar: backendUser.avatar_url || "/avatars/default.jpg",
      phone: backendUser.phone || "",
      address: backendUser.address || "",
      bio: backendUser.bio || "",
      isActive: backendUser.is_active !== false,
      createdAt: backendUser.created_at,
      updatedAt: backendUser.updated_at,
      roles: backendUser.roles || [],
    };
  };

  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      const userData = await authService.getProfile();
      const mappedUser = mapBackendUserToFrontend(userData);

      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));

      return mappedUser;
    } catch (error) {
      throw new Error("Login failed: " + error.message);
    }
  };

  const register = async (name, email, password, phone = "", address = "") => {
    try {
      // Register user
      await authService.register({
        email,
        password,
        full_name: name,
        phone,
        address,
        avatar_url: "/avatars/default.jpg",
        bio: "",
      });

      // After successful registration, login to get token
      await authService.login(email, password);

      // Get user profile with token
      const profileData = await authService.getProfile();
      const mappedUser = mapBackendUserToFrontend(profileData);

      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));

      return mappedUser;
    } catch (error) {
      throw new Error("Registration failed: " + error.message);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      const updatedUser = await authService.updateProfile(user.id, updatedData);
      const mappedUser = mapBackendUserToFrontend(updatedUser);

      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      return mappedUser;
    } catch (error) {
      throw new Error("Update failed: " + error.message);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const value = {
    user,
    login,
    register,
    updateUser,
    logout,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
