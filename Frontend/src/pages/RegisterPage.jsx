import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  AlertCircle,
  ChevronDown,
} from "lucide-react"; // Thêm ChevronDown cho select
import { VolunteerLogoWithText } from "../components/VolunteerLogo";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "volunteer", // Default to volunteer
    agreeTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Vui lòng đồng ý với điều khoản sử dụng!");
      return;
    }

    setLoading(true);

    try {
      const user = await register(
        formData.name,
        formData.email,
        formData.password,
        "", // Address (nếu có)
        "", // Phone (nếu có)
        formData.role
      );

      if (user) {
        if (user.role === "manager") {
          navigate("/manager/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {" "}
      {/* Nền màu nhẹ nhàng hơn */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <VolunteerLogoWithText logoSize="lg" textSize="xl" />
        </Link>

        <Card className="shadow-2xl border-blue-200/50 rounded-xl">
          {" "}
          {/* Bóng đổ mạnh hơn, bo tròn hơn */}
          <CardHeader className="space-y-2 text-center pb-6">
            {" "}
            {/* Khoảng cách lớn hơn */}
            <CardTitle className="text-3xl font-extrabold text-primary">
              {" "}
              {/* Font to và đậm hơn */}
              Đăng ký tài khoản
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Tạo tài khoản mới
            </CardDescription>{" "}
            {/* Font to hơn */}
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {" "}
              {/* Tăng khoảng cách giữa các phần tử */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {/* Họ tên */}
              <div className="space-y-2">
                <Label htmlFor="name">Họ tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="pl-9 h-11 text-base border-blue-200 focus:border-primary focus:ring-1 focus:ring-primary" // Chiều cao và style
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="volunteer@example.com"
                    className="pl-9 h-11 text-base border-blue-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              {/* Mật khẩu */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-11 text-base border-blue-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              {/* Xác nhận mật khẩu */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-11 text-base border-blue-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              {/* Vai trò (Select) */}
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-3 pr-9 py-2 h-11 text-base border border-input rounded-md bg-background text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  >
                    <option value="volunteer">Tình nguyện viên</option>
                    <option value="manager">Quản lý sự kiện</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />{" "}
                  {/* Icon mũi tên cho select */}
                </div>
              </div>
              {/* Checkbox và Điều khoản */}
              <div className="flex items-center space-x-2 pt-1">
                {" "}
                {/* Căn chỉnh thẳng hàng hơn */}
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      agreeTerms: checked,
                    }));
                  }}
                  className="w-4 h-4 rounded-sm border-gray-300 text-primary focus:ring-primary focus:ring-offset-background"
                />
                <Label
                  htmlFor="agreeTerms"
                  className="text-sm font-normal text-muted-foreground leading-relaxed"
                >
                  Tôi đồng ý với{" "}
                  <Link
                    to="/terms"
                    className="text-primary hover:underline font-medium"
                  >
                    điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/privacy"
                    className="text-primary hover:underline font-medium"
                  >
                    chính sách bảo mật
                  </Link>
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6">
              {" "}
              {/* Tăng khoảng cách */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-lg font-semibold h-12 transition-all duration-300 hover:scale-[1.01]" // Font to, nút cao hơn
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Đăng nhập ngay
                </Link>
              </div>
              <div className="text-center text-sm text-muted-foreground mt-2">
                {" "}
                {/* Thêm margin top */}
                <Link
                  to="/"
                  className="text-primary hover:underline flex items-center justify-center gap-2 transition-colors hover:text-primary-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Về trang chủ
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
