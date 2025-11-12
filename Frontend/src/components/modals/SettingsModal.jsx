import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function SettingsModal({ open, onOpenChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    onOpenChange(false);
    // Navigate to profile based on role
    if (user?.role === "admin") {
      navigate("/admin/profile");
    } else if (user?.role === "manager") {
      navigate("/manager/profile");
    } else {
      navigate("/profile");
    }
  };

  const handleSettingsClick = () => {
    onOpenChange(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    onOpenChange(false);
    logout();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
          <DialogDescription>
            Quản lý tài khoản và cài đặt hệ thống
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleProfileClick}
          >
            <User className="mr-2 h-4 w-4" />
            Hồ sơ
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSettingsClick}
          >
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt hệ thống
          </Button>
          <div className="border-t my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

