import React from "react";
import { UserLayout } from "../../components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import {
  Settings,
  Bell,
  Globe,
  Moon,
  Sun,
  Mail,
  Shield,
  Database,
  Info,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import reportService from "../../services/reportService";
import { authService } from "../../services/authService";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [systemReport, setSystemReport] = React.useState("");
  const [sendingReport, setSendingReport] = React.useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);

  const submitSystemReport = async () => {
    if (!systemReport.trim()) return;
    setSendingReport(true);
    try {
      await reportService.createReport({
        type: "system",
        title: "Báo cáo hệ thống",
        description: systemReport.trim(),
      });
      setSystemReport("");
      alert("Đã gửi báo cáo hệ thống");
    } catch (err) {
      alert("Không thể gửi báo cáo: " + (err.message || "Lỗi không xác định"));
    } finally {
      setSendingReport(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới không khớp");
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      alert("Đổi mật khẩu thành công");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(
        "Đổi mật khẩu thất bại: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <UserLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground">
            Quản lý cài đặt và tùy chọn hệ thống
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cài đặt chung
              </CardTitle>
              <CardDescription>Cài đặt cơ bản về hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Giao diện</Label>
                  <p className="text-sm text-muted-foreground">
                    Chọn chế độ sáng hoặc tối
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) =>
                      setTheme(checked ? "dark" : "light")
                    }
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ngôn ngữ</Label>
                  <p className="text-sm text-muted-foreground">
                    Chọn ngôn ngữ hiển thị
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Tiếng Việt
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Thông báo
              </CardTitle>
              <CardDescription>Quản lý thông báo và cảnh báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo email</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo qua email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo sự kiện</Label>
                  <p className="text-sm text-muted-foreground">
                    Thông báo về sự kiện mới
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo cộng đồng</Label>
                  <p className="text-sm text-muted-foreground">
                    Thông báo từ cộng đồng
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Bảo mật
              </CardTitle>
              <CardDescription>Quản lý mật khẩu và bảo mật</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Đổi mật khẩu</Label>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hiển thị hồ sơ công khai</Label>
                  <p className="text-sm text-muted-foreground">
                    Cho phép người khác xem hồ sơ của bạn
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hiển thị email</Label>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị email trong hồ sơ
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Thông tin hệ thống
              </CardTitle>
              <CardDescription>
                Thông tin về hệ thống và phiên bản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phiên bản</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Người dùng</span>
                  <span className="font-medium">{user?.email || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vai trò</span>
                  <span className="font-medium capitalize">
                    {user?.role || "N/A"}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Báo cáo hệ thống</Label>
                <Textarea
                  placeholder="Mô tả vấn đề hệ thống hoặc phản hồi của bạn..."
                  value={systemReport}
                  onChange={(e) => setSystemReport(e.target.value)}
                  rows={4}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={submitSystemReport}
                  disabled={sendingReport || !systemReport.trim()}
                >
                  Gửi báo cáo
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Xem thông tin chi tiết
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}
