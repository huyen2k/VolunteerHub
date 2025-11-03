import React, { useState } from "react";
import { AdminLayout } from "../../components/Layout";
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
import { Separator } from "../../components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Users,
  BarChart3,
  Settings,
  Crown,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: user?.bio || "",
    organization: user?.organization || "",
    position: user?.position || "",
    adminLevel: user?.adminLevel || "Super Admin",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      bio: user?.bio || "",
      organization: user?.organization || "",
      position: user?.position || "",
      adminLevel: user?.adminLevel || "Super Admin",
    });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "A"
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hồ sơ Admin</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin cá nhân và cài đặt tài khoản Administrator
            </p>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl bg-red-100 text-red-600">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="mt-4">{user?.name}</CardTitle>
                <CardDescription>
                  <Badge variant="default" className="mt-2 bg-red-600">
                    <Crown className="mr-1 h-3 w-3" />
                    Super Administrator
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tham gia từ:</span>
                    <span>
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : "Không có thông tin"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <Badge variant={user?.isActive ? "default" : "secondary"}>
                      {user?.isActive ? "Hoạt động" : "Tạm khóa"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Crown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cấp độ:</span>
                    <Badge variant="outline">{formData.adminLevel}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">156</div>
                  <div className="text-sm text-muted-foreground">
                    Người dùng đã quản lý
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">89</div>
                  <div className="text-sm text-muted-foreground">
                    Sự kiện đã duyệt
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">12</div>
                  <div className="text-sm text-muted-foreground">
                    Manager đã tạo
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân của Administrator
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-9"
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
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Tổ chức</Label>
                    <Input
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Tên tổ chức"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Chức vụ</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Chức vụ hiện tại"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu bản thân</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Hãy chia sẻ về kinh nghiệm quản trị hệ thống của bạn..."
                    rows={4}
                  />
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      Hủy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Thống kê hệ thống
                </CardTitle>
                <CardDescription>
                  Tổng quan về hoạt động quản trị hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">1,256</div>
                    <div className="text-sm text-muted-foreground">
                      Tổng người dùng
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-muted-foreground">
                      Manager đang hoạt động
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">89</div>
                    <div className="text-sm text-muted-foreground">
                      Sự kiện đã duyệt
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      99.9%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Uptime hệ thống
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Quyền Administrator
                </CardTitle>
                <CardDescription>
                  Danh sách quyền hạn của tài khoản Admin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {user?.permissions?.map((permission, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                    >
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium capitalize">
                        {permission.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Cài đặt tài khoản
                </CardTitle>
                <CardDescription>
                  Quản lý bảo mật và cài đặt tài khoản Administrator
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mật khẩu</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      Đổi mật khẩu
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email xác thực</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Đã xác thực</Badge>
                    <Button variant="outline" size="sm">
                      Gửi lại email xác thực
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Quyền Admin</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Super Admin</Badge>
                    <Button variant="outline" size="sm">
                      Xem chi tiết quyền
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>2FA Authentication</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Chưa bật</Badge>
                    <Button variant="outline" size="sm">
                      Bật 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt hệ thống
                </CardTitle>
                <CardDescription>
                  Tùy chọn quản trị và thông báo hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Thông báo hệ thống</div>
                    <div className="text-sm text-muted-foreground">
                      Nhận thông báo về các vấn đề hệ thống
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Bật
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Thông báo Manager</div>
                    <div className="text-sm text-muted-foreground">
                      Nhận thông báo từ Manager về sự kiện
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Bật
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Thông báo bảo mật</div>
                    <div className="text-sm text-muted-foreground">
                      Nhận thông báo về các hoạt động bảo mật
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Bật
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Chế độ bảo trì</div>
                    <div className="text-sm text-muted-foreground">
                      Đặt hệ thống vào chế độ bảo trì
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Tắt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

