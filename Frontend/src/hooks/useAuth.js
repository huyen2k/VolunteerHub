import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext); // Lấy dữ liệu từ AuthContext
  if (context === undefined) {
    throw new Error("Không thể dùng ngoài phạm vi");
  }
  return context;
}
