import React, { createContext, useEffect, useState } from "react";

const ThemeContext = createContext(); // Context để quản lý theme --> share cho toàn bộ hệ thống

export function ThemeProvider({
  // Component để wrap toàn bộ hệ thống và cung cấp theme cho toàn bộ hệ thống
  children,
  defaultTheme = "system",
  enableSystem = true,
}) {
  const [theme, setTheme] = useState(() => {
    // Lấy từ LocalS hoặc default
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, enableSystem]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export { ThemeContext };
