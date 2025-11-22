import React, { useState, useEffect } from "react";
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
import statisticsService from "../../services/statisticsService";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminDashboardPage() {
  const [userStats, setUserStats] = useState(null);
  const [overviewStats, setOverviewStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch user statistics
      const userStatsData = await statisticsService.getUserStatistics();
      setUserStats(userStatsData);

      // Fetch overview statistics
      const overviewData = await statisticsService.getOverviewStatistics();
      setOverviewStats(overviewData);

      // Fetch pending events
      const allEvents = await eventService.getEvents();
      const pending = (allEvents || []).filter(e => e.status === "pending").slice(0, 5);
      setPendingEvents(pending.map(e => ({
        id: e.id,
        type: "event",
        title: e.title || "Không có tiêu đề",
        date: e.createdAt ? new Date(e.createdAt).toLocaleDateString("vi-VN") : "",
        status: "pending",
      })));
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadDashboardData} className="mt-4">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

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
            {/* Bỏ nút cài đặt theo yêu cầu */}
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
                      {userStats?.totalUsers || 0}
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      {userStats?.totalVolunteers || 0} tình nguyện viên
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
                      {overviewStats?.totalEvents || overviewStats?.recentEventSummaries?.length || 0}
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      {overviewStats?.upcomingEvents || 0} sự kiện sắp tới
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
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {userStats?.totalManagers || 0}
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      Quản lý sự kiện
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
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {pendingEvents.length}
                    </p>
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
                  {pendingEvents.map((item) => (
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
                              Sự kiện cần phê duyệt
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
                              onClick={async () => {
                                try {
                                  await eventService.rejectEvent(item.id, "");
                                  await loadDashboardData();
                                } catch (err) {
                                  alert("Không thể từ chối: " + err.message);
                                }
                              }}
                            >
                              Từ chối
                            </Button>
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={async () => {
                                try {
                                  await eventService.approveEvent(item.id, "approved", "");
                                  await loadDashboardData();
                                } catch (err) {
                                  alert("Không thể phê duyệt: " + err.message);
                                }
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Phê duyệt
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {pendingEvents.length === 0 && (
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
                  {overviewStats?.recentEventSummaries && overviewStats.recentEventSummaries.length > 0 ? (
                    overviewStats.recentEventSummaries.map((event, index) => (
                      <Card key={event.id || index}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{event.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {event.registrationCount || 0} đăng ký | Trạng thái: {event.status}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Shield className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">
                          Không có hoạt động gần đây
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar: chỉ giữ trạng thái hệ thống và thống kê nền tảng */}
            <div className="space-y-6">

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

              <Card>
                <CardHeader>
                  <CardTitle>Thống kê nền tảng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Người dùng hoạt động
                    </span>
                    <span className="font-semibold">{overviewStats?.activeVolunteers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sự kiện sắp tới
                    </span>
                    <span className="font-semibold">{overviewStats?.upcomingEvents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sự kiện gần đây
                    </span>
                    <span className="font-semibold">{overviewStats?.recentEvents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tổng đăng ký
                    </span>
                    <span className="font-semibold">{overviewStats?.recentEventSummaries?.reduce((sum, e) => sum + (e.registrationCount || 0), 0) || 0}</span>
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
