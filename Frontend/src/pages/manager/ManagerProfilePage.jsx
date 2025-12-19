import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ManagerProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    avatar_url: "",
  });

  // --- 1. LOAD DATA (Dùng getMyProfile để tránh lỗi ID không khớp) ---
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const data = await userService.getMyProfile();
        setUserData(data);
        setFormData({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
      } catch (err) {
        console.error("Error loading manager data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadUserData();
  }, [user]);

  // --- 2. XỬ LÝ UPLOAD ẢNH (Sử dụng service mới) ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await userService.uploadImage(file);

      if (result && result.url) {
        setFormData((prev) => ({ ...prev, avatar_url: result.url }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi khi tải ảnh lên Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 3. LƯU THAY ĐỔI ---
  const handleSave = async () => {
    if (uploading) {
      alert("Vui lòng đợi ảnh tải lên hoàn tất.");
      return;
    }
    setSaving(true);
    try {
      await userService.updateMyProfile(formData);

      setUserData(formData);
      setIsEditing(false);
      alert("Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Hiển thị lỗi chi tiết từ Backend (như User not existed nếu token hỏng)
      alert("Lỗi cập nhật: " + (error.message || "Kiểm tra lại kết nối server."));
    } finally {
      setSaving(false);
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
        avatar_url: userData.avatar_url || "",
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "M";
  };

  if (loading) return <ManagerLayout><div className="flex justify-center p-20"><LoadingSpinner /></div></ManagerLayout>;

  return (
      <ManagerLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hồ sơ Manager</h1>
              <p className="text-muted-foreground">Quản lý thông tin quản trị viên sự kiện</p>
            </div>
            <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            >
              {isEditing ? (
                  <><X className="mr-2 h-4 w-4" /> Hủy</>
              ) : (
                  <><Edit className="mr-2 h-4 w-4" /> Chỉnh sửa</>
              )}
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* CỘT TRÁI: AVATAR */}
            <div className="lg:col-span-1">
              <Card className="border-none shadow-md">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4 relative">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                        {/* Sửa src rỗng thành null để tránh cảnh báo trình duyệt */}
                        <AvatarImage
                            src={formData.avatar_url || null}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-3xl bg-blue-100 text-blue-600 font-bold">
                          {getInitials(formData.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      {isEditing && (
                          <label
                              htmlFor="manager-avatar-upload"
                              className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full cursor-pointer hover:bg-primary/90 shadow-lg transition-all"
                          >
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-5 w-5" />}
                          </label>
                      )}
                      <input
                          id="manager-avatar-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={!isEditing || uploading}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{userData?.full_name || "Event Manager"}</CardTitle>
                  <div className="flex justify-center mt-2">
                    <Badge className="bg-blue-600 hover:bg-blue-600 uppercase text-[10px] tracking-wider">
                      {user?.roles?.[0] || "Manager"}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* CỘT PHẢI: FORM */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" /> Thông tin cá nhân
                  </CardTitle>
                  <CardDescription>Cập nhật thông tin để ban tổ chức liên hệ khi cần</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Họ và tên</Label>
                      <Input
                          id="full_name"
                          name="full_name"
                          placeholder="Nhập họ và tên..."
                          value={formData.full_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={isEditing ? "border-blue-200 focus:border-blue-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            value={formData.email}
                            disabled
                            className="pl-9 bg-gray-50 text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-9"
                            placeholder="0xxx xxx xxx"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ / Cơ quan</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-9"
                            placeholder="TP. Hồ Chí Minh..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Mô tả bản thân / Kinh nghiệm</Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Giới thiệu ngắn về các dự án tình nguyện bạn đã quản lý..."
                        rows={4}
                    />
                  </div>

                  {isEditing && (
                      <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                          Hủy bỏ
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || uploading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                          {saving ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</>
                          ) : (
                              <><Save className="mr-2 h-4 w-4" /> Lưu thay đổi</>
                          )}
                        </Button>
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ManagerLayout>
  );
}