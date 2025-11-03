import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { UserLayout } from "../components/Layout";
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  Bell,
  Eye,
  Heart,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import eventService from "../services/eventService";
import LoadingSpinner from "../components/LoadingSpinner";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEvents, setUserEvents] = useState([]);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    completed: 0,
    upcoming: 0,
    totalHours: 0,
    totalPoints: 0,
  });

  // Temporary mocked notifications until real service is available
  const [notifications] = useState([
    {
      id: 1,
      title: "Đăng ký sự kiện thành công",
      message: "Bạn đã đăng ký sự kiện gần đây",
      type: "success",
      time: "2 giờ trước",
      isRead: false,
    },
    {
      id: 2,
      title: "Sự kiện sắp diễn ra",
      message: "Một sự kiện sắp diễn ra trong vài ngày tới",
      type: "info",
      time: "1 ngày trước",
      isRead: false,
    },
    {
      id: 3,
      title: "Hoàn thành sự kiện",
      message: "Bạn vừa hoàn thành một sự kiện",
      type: "success",
      time: "3 ngày trước",
      isRead: true,
    },
  ]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError("");
        const [events, userStats] = await Promise.all([
          eventService.getUserEvents(user.id),
          eventService.getUserEventStats(user.id),
        ]);
        setUserEvents(events);
        setStats(userStats);
      } catch (e) {
        setError(e?.message || "Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return userEvents
      .filter(
        (e) =>
          new Date(e.date) > now &&
          (e.registrationStatus === "confirmed" || e.status === "confirmed")
      )
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: new Date(e.date).toLocaleDateString("vi-VN"),
        location: e.location,
        status: "registered",
        // Map từ mockApi: dùng comments như newPosts, registeredCount/volunteers
        newPosts: e.comments ?? 0,
        likes: e.likes ?? 0,
        volunteers:
          e.registeredCount ?? (e.volunteers ? e.volunteers.length : 0),
        maxVolunteers: e.maxVolunteers ?? 0,
      }));
  }, [userEvents]);

  const completedEvents = useMemo(() => {
    return userEvents
      .filter(
        (e) => e.status === "completed" || e.registrationStatus === "completed"
      )
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: new Date(e.date).toLocaleDateString("vi-VN"),
        location: e.location,
        status: "completed",
        rating: e.userRating ?? 0,
        hours: e.totalHours ?? 0,
      }));
  }, [userEvents]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "registered":
        return <Badge className="bg-green-500 text-white">Đã đăng ký</Badge>;
      case "pending":
        return <Badge variant="secondary">Chờ xác nhận</Badge>;
      case "completed":
        return <Badge className="bg-blue-500 text-white">Hoàn thành</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "info":
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendingEvents = () => {
    return upcomingEvents
      .filter((event) => event.status === "registered")
      .sort(
        (a, b) => b.likes + (b.newPosts || 0) - (a.likes + (a.newPosts || 0))
      )
      .slice(0, 3);
  };

  return (
    <UserLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner />
            </div>
          )}
          {!loading && error && (
            <div className="mb-6 p-4 rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard Tình nguyện viên</h1>
            <p className="mt-2 text-muted-foreground">
              Chào mừng bạn trở lại! Đây là tổng quan về hoạt động tình nguyện
              của bạn
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Sự kiện đã tham gia
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {stats.completed}
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      {stats.totalHours} giờ tình nguyện
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Sự kiện sắp tới
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {stats.upcoming}
                    </p>
                    <p className="mt-1 text-xs text-blue-600">
                      Đã đăng ký tham gia
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
                    <p className="text-sm text-muted-foreground">
                      Đánh giá trung bình
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {completedEvents.length > 0
                        ? (
                            completedEvents.reduce(
                              (sum, event) => sum + (event.rating || 0),
                              0
                            ) / completedEvents.length
                          ).toFixed(1)
                        : "0.0"}
                    </p>
                    <p className="mt-1 text-xs text-yellow-600">⭐ Sao</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Thông báo mới
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {notifications.filter((n) => !n.isRead).length}
                    </p>
                    <p className="mt-1 text-xs text-red-600">Cần xem</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Upcoming Events */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Sự kiện sắp tới
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {event.title}
                          </h3>
                          {getStatusBadge(event.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{event.date}</span>
                          <span>{event.location}</span>
                          <span>
                            {event.volunteers}/{event.maxVolunteers} tình nguyện
                            viên
                          </span>
                        </div>
                        {event.status === "registered" && (
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {event.newPosts} bài viết mới
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {event.likes} lượt thích
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/events/${event.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </Link>
                        </Button>
                        {event.status === "registered" && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/community?event=${event.id}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Tham gia thảo luận
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Thông báo gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        !notification.isRead
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/notifications">Xem tất cả thông báo</Link>
                  </Button>
                </CardContent>
              </Card>
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
                    <Link to="/user/events">
                      <Calendar className="mr-2 h-4 w-4" />
                      Xem sự kiện mới
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/profile/history">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Lịch sử tham gia
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/community">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Kênh trao đổi
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/profile">
                      <Users className="mr-2 h-4 w-4" />
                      Hồ sơ cá nhân
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Trending Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Sự kiện thu hút
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getTrendingEvents().map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>{event.volunteers} tình nguyện viên</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {event.newPosts}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {event.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Achievement Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Thành tích của bạn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sự kiện hoàn thành
                    </span>
                    <span className="font-semibold">
                      {completedEvents.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Giờ tình nguyện
                    </span>
                    <span className="font-semibold">
                      {completedEvents.reduce(
                        (sum, event) => sum + event.hours,
                        0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Đánh giá trung bình
                    </span>
                    <span className="font-semibold">
                      {(
                        completedEvents.reduce(
                          (sum, event) => sum + event.rating,
                          0
                        ) / completedEvents.length
                      ).toFixed(1)}
                      ⭐
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cấp độ</span>
                    <span className="font-semibold">
                      Tình nguyện viên tích cực
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
