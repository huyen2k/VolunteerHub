import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { AdminLayout } from "../../components/Layout";
import {
  Users,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";

export default function AdminDashboardPage() {
  const pendingApprovals = [
    {
      id: 1,
      type: "event",
      title: "Dọn dẹp bãi biển Vũng Tàu",
      organization: "Green Earth Vietnam",
      date: "15 Tháng 2, 2025",
      status: "pending",
    },
    {
      id: 2,
      type: "organization",
      title: "Education For All",
      description: "Tổ chức giáo dục phi lợi nhuận",
      date: "12 Tháng 2, 2025",
      status: "pending",
    },
    {
      id: 3,
      type: "event",
      title: "Trồng cây xanh tại công viên",
      organization: "Eco Warriors",
      date: "10 Tháng 2, 2025",
      status: "pending",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "Phê duyệt sự kiện",
      detail: "Trồng cây xanh tại công viên",
      user: "Admin",
      time: "2 giờ trước",
    },
    {
      id: 2,
      action: "Phê duyệt tổ chức",
      detail: "Care & Share Foundation",
      user: "Admin",
      time: "5 giờ trước",
    },
    {
      id: 3,
      action: "Xử lý báo cáo",
      detail: "Báo cáo vi phạm từ người dùng",
      user: "Admin",
      time: "1 ngày trước",
    },
    {
      id: 4,
      action: "Cập nhật hệ thống",
      detail: "Nâng cấp tính năng bảo mật",
      user: "Admin",
      time: "2 ngày trước",
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
              <p className="mt-2 text-muted-foreground">
                Tổng quan và quản lý VolunteerHub
              </p>
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link to="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng người dùng
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      5,234
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      +12% so với tháng trước
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng sự kiện
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      1,456
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      +8% so với tháng trước
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tổ chức</p>
                    <p className="mt-1 text-3xl font-bold text-primary">89</p>
                    <p className="mt-1 text-xs text-green-600">
                      +5% so với tháng trước
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Chờ phê duyệt
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">23</p>
                    <p className="mt-1 text-xs text-yellow-600">Cần xử lý</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending">Chờ phê duyệt</TabsTrigger>
                  <TabsTrigger value="activities">
                    Hoạt động gần đây
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6 space-y-4">
                  {pendingApprovals.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="border-yellow-500 text-yellow-600"
                              >
                                {item.type === "event" ? "Sự kiện" : "Tổ chức"}
                              </Badge>
                              <h3 className="text-lg font-semibold">
                                {item.title}
                              </h3>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {item.type === "event"
                                ? `Tổ chức: ${item.organization}`
                                : item.description}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Gửi lúc: {item.date}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive bg-transparent"
                            >
                              Từ chối
                            </Button>
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Phê duyệt
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {pendingApprovals.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <p className="mt-4 text-muted-foreground">
                          Không có mục nào cần phê duyệt
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activities" className="mt-6 space-y-4">
                  {recentActivities.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{activity.action}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {activity.detail}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Bởi: {activity.user}</span>
                              <span>{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Hành động nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                    asChild
                  >
                    <Link to="/admin/users">
                      <Users className="mr-2 h-4 w-4" />
                      Quản lý người dùng
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/admin/events">
                      <Calendar className="mr-2 h-4 w-4" />
                      Quản lý sự kiện
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/admin/organizations">
                      <Building2 className="mr-2 h-4 w-4" />
                      Quản lý tổ chức
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/admin/reports">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Báo cáo & Khiếu nại
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/admin/analytics">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Thống kê & Báo cáo
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Trạng thái hệ thống</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Hệ thống
                    </span>
                    <Badge className="bg-green-500 text-white">
                      Hoạt động tốt
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Cơ sở dữ liệu
                    </span>
                    <Badge className="bg-green-500 text-white">
                      Hoạt động tốt
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <Badge className="bg-green-500 text-white">
                      Hoạt động tốt
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Thông báo
                    </span>
                    <Badge className="bg-green-500 text-white">
                      Hoạt động tốt
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê nền tảng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Người dùng hoạt động
                    </span>
                    <span className="font-semibold">3,456</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sự kiện đang diễn ra
                    </span>
                    <span className="font-semibold">234</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Giờ tình nguyện tháng này
                    </span>
                    <span className="font-semibold">12,456</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tỷ lệ hài lòng
                    </span>
                    <span className="font-semibold">94%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
