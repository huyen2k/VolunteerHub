import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = userState(null);
  const [loading, setLoading] = useState(true); // Cho biết hệ thống đang check thông tin đăng nhập

  // check phiên đăng nhập
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Hàm đăng nhập
  const login = async (email, pass) => {
    try {
      const res = await mockApi.login(email, pass);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      setUser(res.user);
      return res.user;
    } catch (error) {
      throw new Error("Lỗi đăng nhập : " + error.message);
    }
  };

  // Hàm đăng ký :V Ta sẽ mặc định là volunteer --> mana với admin tính sau
  const register = async (
    name,
    email,
    pass,
    role = "volunteer",
    phone = "",
    address = ""
  ) => {
    try {
      const res = await mockApi.register({
        name,
        email,
        password,
        role,
        phone,
        address,
        avatar: "/avatars/default.jpg",
        bio: "",
      });
      //Tam thoi luu vao local
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error("Lỗi đăng ký bruh: " + error.message);
    }
  };

  //update user
  const updateUser = async (updateData) => {
    try {
      if (!user) {
        throw new Error("No user logged");
      }
      const updatedUser = await mockApi.updateUser(user.id, updateData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw new Error("Lỗi update: " + error.message);
    }
  };

  // dang xuat
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href = "/";
  };

  //check role
  const hasPermission = (role) => {
    if (!user) return false;
    return user.permissions?.includes(role) || false;
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // thông tin và hàm được share cho toàn bộ hệ thống
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
