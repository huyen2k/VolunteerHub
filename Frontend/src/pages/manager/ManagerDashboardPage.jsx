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
import { ManagerLayout } from "../../components/Layout";
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  Plus,
  Eye,
  Settings,
} from "lucide-react";

export default function ManagerDashboardPage() {
  const recentEvents = [
    {
      id: 1,
      title: "Dọn dẹp bãi biển Vũng Tàu",
      date: "15/02/2025",
      location: "Vũng Tàu",
      volunteers: 25,
      status: "approved",
      newPosts: 3,
      likes: 12,
    },
    {
      id: 2,
      title: "Trồng cây xanh tại công viên",
      date: "20/02/2025",
      location: "Công viên Thống Nhất",
      volunteers: 15,
      status: "pending",
      newPosts: 0,
      likes: 5,
    },
    {
      id: 3,
      title: "Dạy học cho trẻ em nghèo",
      date: "25/02/2025",
      location: "Trung tâm Hà Nội",
      volunteers: 8,
      status: "approved",
      newPosts: 1,
      likes: 8,
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white">Đã duyệt</Badge>;
      case "pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTrendingEvents = () => {
    return recentEvents
      .filter((event) => event.status === "approved")
      .sort((a, b) => b.likes + b.newPosts - (a.likes + a.newPosts))
      .slice(0, 3);
  };

  return (
    <ManagerLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Quản lý</h1>
              <p className="mt-2 text-muted-foreground">
                Tổng quan sự kiện và hoạt động của bạn
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link to="/manager/events/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo sự kiện mới
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/manager/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng sự kiện
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">12</p>
                    <p className="mt-1 text-xs text-green-600">
                      +2 sự kiện mới tháng này
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
                      Tình nguyện viên
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">156</p>
                    <p className="mt-1 text-xs text-green-600">
                      +23 người mới tham gia
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
                    <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                    <p className="mt-1 text-3xl font-bold text-primary">3</p>
                    <p className="mt-1 text-xs text-yellow-600">Cần xử lý</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tương tác</p>
                    <p className="mt-1 text-3xl font-bold text-primary">89</p>
                    <p className="mt-1 text-xs text-green-600">
                      +15 bài viết mới
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Recent Events */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Sự kiện gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentEvents.map((event) => (
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
                          <span>{event.volunteers} tình nguyện viên</span>
                        </div>
                        {event.status === "approved" && (
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {event.newPosts} bài viết mới
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {event.likes} lượt thích
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/manager/events/${event.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

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
                    <Link to="/manager/events/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo sự kiện mới
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/manager/events">
                      <Calendar className="mr-2 h-4 w-4" />
                      Quản lý sự kiện
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/manager/volunteers">
                      <Users className="mr-2 h-4 w-4" />
                      Quản lý tình nguyện viên
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link to="/manager/community">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Kênh trao đổi
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                            <TrendingUp className="h-3 w-3" />
                            {event.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Chờ duyệt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentEvents
                    .filter((event) => event.status === "pending")
                    .map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.date} - {event.location}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="text-xs">
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Tóm tắt hoạt động</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sự kiện đang diễn ra
                    </span>
                    <span className="font-semibold">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tình nguyện viên hoạt động
                    </span>
                    <span className="font-semibold">89</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Bài viết mới tuần này
                    </span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tỷ lệ tham gia
                    </span>
                    <span className="font-semibold">78%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
