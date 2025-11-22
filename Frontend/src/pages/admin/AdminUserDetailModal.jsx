import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X } from "lucide-react";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";

export function AdminUserDetailModal({ userId, open, onOpenChange, onUpdate, initialEditMode = false }) {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });

  useEffect(() => {
    if (open && userId) {
      setIsEditing(initialEditMode);
      loadUserData();
    }
  }, [open, userId, initialEditMode]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserById(userId);
      setUserData(data);
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        bio: data.bio || "",
      });
    } catch (err) {
      console.error("Error loading user data:", err);
      alert("Không thể tải thông tin người dùng: " + (err.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await userService.updateUser(userId, formData);
      await loadUserData();
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Không thể cập nhật thông tin: " + (error.message || "Lỗi không xác định"));
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        bio: userData.bio || "",
      });
    }
    setIsEditing(false);
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { label: "Admin", variant: "destructive" },
      manager: { label: "Manager", variant: "default" },
      volunteer: { label: "Volunteer", variant: "outline" },
    };
    const roleInfo = roleMap[role] || { label: role, variant: "secondary" };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? "Chỉnh sửa người dùng" : "Chi tiết người dùng"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin người dùng"
              : "Xem và quản lý thông tin chi tiết người dùng"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {userData.full_name || "Unknown"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {getRoleBadge(userData.roles?.[0] || "volunteer")}
                      <Badge variant={userData.is_active ? "default" : "secondary"}>
                        {userData.is_active ? "Hoạt động" : "Vô hiệu hóa"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Hủy
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ và tên</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Giới thiệu</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                disabled={!isEditing}
                rows={4}
              />
            </div>

            <Separator />

            {/* Additional Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Ngày tạo</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {userData.created_at
                      ? new Date(userData.created_at).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>{userData.roles?.join(", ") || "volunteer"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-destructive">Không thể tải thông tin người dùng</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

