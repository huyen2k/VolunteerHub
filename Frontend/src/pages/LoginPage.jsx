import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { VolunteerLogoWithText } from "../components/VolunteerLogo";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || "/dashboard";
  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user) {
        // Redirect dựa trên role
        let redirectPath = returnTo;

        // Nếu returnTo là default dashboard hoặc không có returnTo, redirect theo role
        if (!location.state?.returnTo || returnTo === "/dashboard") {
          if (user.role === "admin") {
            redirectPath = "/admin/dashboard";
          } else if (user.role === "manager") {
            redirectPath = "/manager/dashboard";
          } else {
            redirectPath = "/dashboard";
          }
        }

        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError(
        err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo đồng bộ với trang đăng ký */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <VolunteerLogoWithText logoSize="lg" textSize="xl" />
        </Link>

        <Card className="shadow-2xl border-blue-200/50 rounded-xl">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-extrabold text-primary">
              Đăng nhập
            </CardTitle>
            <CardDescription className="text-base">
              Chào mừng bạn quay trở lại!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Message from redirect (ví dụ: cần đăng nhập để xem trang này) */}
            {message && (
              <Alert className="bg-blue-50 text-blue-900 border-blue-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="volunteer@example.com"
                    className="pl-9 h-11 text-base border-blue-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-11 text-base border-blue-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={setRemember}
                  className="border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  Ghi nhớ đăng nhập
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-lg font-semibold h-12 transition-all duration-300 hover:scale-[1.01]"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <div className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-2">
              <Link
                to="/"
                className="text-primary hover:underline flex items-center justify-center gap-2 transition-colors hover:text-primary-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Về trang chủ
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
