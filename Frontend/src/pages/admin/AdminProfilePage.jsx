import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera, Loader2, Crown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminProfilePage() {
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

  // --- 1. LOAD DATA ---
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
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadUserData();
  }, [user]);

  // --- 2. XỬ LÝ UPLOAD ẢNH ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview ảnh
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar_url: previewUrl }));

    setUploading(true);
    try {
      const result = await userService.uploadImage(file);
      console.log("Kết quả upload trả về:", result);
      // result là { url: "..." }
      if (result && result.url) {
        setFormData((prev) => ({ ...prev, avatar_url: result.url }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi khi tải ảnh lên: " + (error.message || "Không xác định"));
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
      alert("Lỗi cập nhật: " + (error.message || "Không xác định"));
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

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "A";

  if (loading) return <AdminLayout><div className="container mx-auto p-6"><LoadingSpinner /></div></AdminLayout>;

  return (
      <AdminLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hồ sơ Admin</h1>
              <p className="text-muted-foreground">Quản lý thông tin quản trị viên</p>
            </div>
            <Button variant={isEditing ? "outline" : "default"} onClick={() => isEditing ? handleCancel() : setIsEditing(true)}>
              {isEditing ? <><X className="mr-2 h-4 w-4" /> Hủy</> : <><Edit className="mr-2 h-4 w-4" /> Chỉnh sửa</>}
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* AVATAR */}
            <div className="lg:col-span-1">
              <Card className="border-red-100 shadow-sm">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4 relative">
                    <div className="relative group">
                      <Avatar className="h-28 w-28 border-4 border-red-50 shadow-sm">
                        <AvatarImage src={formData.avatar_url} className="object-cover" />
                        <AvatarFallback className="text-2xl bg-red-100 text-red-600">{getInitials(formData.full_name)}</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                          <label htmlFor="admin-avatar-upload" className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 shadow-md transition-all">
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Camera className="h-4 w-4"/>}
                          </label>
                      )}
                      <input id="admin-avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={!isEditing || uploading} />
                    </div>
                  </div>
                  <CardTitle className="mt-2">{userData?.full_name || "Administrator"}</CardTitle>
                  <CardDescription>
                    <Badge className="mt-2 bg-red-600 hover:bg-red-700 gap-1 pl-2 pr-3 py-1"><Crown className="h-3 w-3" /> System Admin</Badge>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* FORM */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Thông tin cá nhân</CardTitle><CardDescription>Cập nhật thông tin liên hệ của bạn</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="full_name">Họ và tên</Label><Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} disabled={!isEditing} /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" name="email" value={formData.email} disabled className="pl-9 bg-gray-50" /></div></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="phone">Số điện thoại</Label><div className="relative"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className="pl-9" /></div></div>
                    <div className="space-y-2"><Label htmlFor="address">Địa chỉ</Label><div className="relative"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="address" name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} className="pl-9" /></div></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="bio">Ghi chú cá nhân</Label><Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} disabled={!isEditing} placeholder="Ghi chú về vai trò..." rows={4} /></div>
                  {isEditing && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={handleCancel} disabled={saving}>Hủy</Button>
                        <Button onClick={handleSave} disabled={saving || uploading} className="bg-red-600 hover:bg-red-700">
                          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Đang lưu...</> : <><Save className="mr-2 h-4 w-4"/> Lưu thay đổi</>}
                        </Button>
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
  );
}