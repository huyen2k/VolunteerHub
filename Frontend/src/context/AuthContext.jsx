import React, { createContext, useState, useEffect } from "react";
import mockApi from "../services/mockApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await mockApi.login(email, password);

      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error("Login failed: " + error.message);
    }
  };

  const register = async (
    name,
    email,
    password,
    role = "volunteer",
    phone = "",
    address = ""
  ) => {
    try {
      const response = await mockApi.register({
        name,
        email,
        password,
        role,
        phone,
        address,
        avatar: "/avatars/default.jpg",
        bio: "",
      });

      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error("Registration failed: " + error.message);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      const updatedUser = await mockApi.updateUser(user.id, updatedData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw new Error("Update failed: " + error.message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Redirect to homepage after logout
    window.location.href = "/";
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
