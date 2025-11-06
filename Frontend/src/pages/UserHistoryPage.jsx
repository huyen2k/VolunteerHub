import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { UserLayout } from "../components/Layout";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Star,
  Award,
  TrendingUp,
  Eye,
} from "lucide-react";

export default function UserHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const historyEvents = [
    {
      id: 1,
      title: "Phân phát thức ăn cho người vô gia cư",
      organization: "Care & Share Foundation",
      date: "10/01/2025",
      location: "Quận 1, TP.HCM",
      status: "completed",
      rating: 5,
      hours: 8,
      feedback:
        "Sự kiện rất ý nghĩa, tôi đã học hỏi được nhiều điều từ việc giúp đỡ người khác.",
      certificate: true,
      skills: ["Giao tiếp", "Tổ chức", "Làm việc nhóm"],
    },
    {
      id: 2,
      title: "Trồng cây tại công viên",
      organization: "Eco Warriors",
      date: "05/01/2025",
      location: "Công viên Lê Văn Tám",
      status: "completed",
      rating: 4,
      hours: 6,
      feedback:
        "Hoạt động bảo vệ môi trường rất tích cực, cảm thấy tự hào khi đóng góp cho cộng đồng.",
      certificate: true,
      skills: ["Lãnh đạo", "Bảo vệ môi trường"],
    },
    {
      id: 3,
      title: "Dạy học cho trẻ em nghèo",
      organization: "Education For All",
      date: "28/12/2024",
      location: "Trung tâm Hà Nội",
      status: "completed",
      rating: 5,
      hours: 10,
      feedback:
        "Trải nghiệm tuyệt vời khi được dạy học cho các em nhỏ, thấy được sự tiến bộ của các em.",
      certificate: true,
      skills: ["Giảng dạy", "Kiên nhẫn", "Giao tiếp"],
    },
    {
      id: 4,
      title: "Dọn dẹp bãi biển Vũng Tàu",
      organization: "Green Earth Vietnam",
      date: "15/12/2024",
      location: "Vũng Tàu",
      status: "completed",
      rating: 4,
      hours: 7,
      feedback:
        "Hoạt động bảo vệ môi trường biển rất quan trọng, hy vọng có thể tham gia nhiều hơn.",
      certificate: true,
      skills: ["Bảo vệ môi trường", "Làm việc nhóm"],
    },
    {
      id: 5,
      title: "Hỗ trợ người già tại viện dưỡng lão",
      organization: "Golden Age Care",
      date: "08/12/2024",
      location: "Quận 3, TP.HCM",
      status: "completed",
      rating: 5,
      hours: 6,
      feedback:
        "Cảm động khi được lắng nghe những câu chuyện của các cụ, học được nhiều bài học quý giá.",
      certificate: true,
      skills: ["Lắng nghe", "Đồng cảm", "Chăm sóc"],
    },
    {
      id: 6,
      title: "Xây dựng nhà tình thương",
      organization: "Build Hope Foundation",
      date: "01/12/2024",
      location: "Huyện Củ Chi",
      status: "completed",
      rating: 4,
      hours: 12,
      feedback:
        "Hoạt động xây dựng rất ý nghĩa, giúp đỡ những gia đình có hoàn cảnh khó khăn.",
      certificate: true,
      skills: ["Xây dựng", "Làm việc nhóm", "Kiên trì"],
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "Tình nguyện viên tích cực",
      description: "Tham gia 6 sự kiện trong tháng",
      icon: "🏆",
      earned: true,
      date: "01/01/2025",
    },
    {
      id: 2,
      title: "Bảo vệ môi trường",
      description: "Hoàn thành 3 sự kiện về môi trường",
      icon: "🌱",
      earned: true,
      date: "15/12/2024",
    },
    {
      id: 3,
      title: "Giáo viên tình nguyện",
      description: "Tham gia 2 sự kiện giáo dục",
      icon: "📚",
      earned: true,
      date: "28/12/2024",
    },
    {
      id: 4,
      title: "Người bạn của người già",
      description: "Tham gia 1 sự kiện chăm sóc người già",
      icon: "👴",
      earned: true,
      date: "08/12/2024",
    },
    {
      id: 5,
      title: "Thợ xây tình nguyện",
      description: "Tham gia 1 sự kiện xây dựng",
      icon: "🔨",
      earned: true,
      date: "01/12/2024",
    },
    {
      id: 6,
      title: "Tình nguyện viên xuất sắc",
      description: "Đạt điểm đánh giá trung bình 4.5/5",
      icon: "⭐",
      earned: true,
      date: "10/01/2025",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      case "no-show":
        return <Badge variant="secondary">Không tham gia</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredEvents = historyEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || event.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalHours = historyEvents.reduce((sum, event) => sum + event.hours, 0);
  const averageRating =
    historyEvents.reduce((sum, event) => sum + event.rating, 0) /
    historyEvents.length;
  const totalEvents = historyEvents.length;

  return (
    <UserLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Lịch sử tham gia</h1>
            <p className="mt-2 text-muted-foreground">
              Xem lại các sự kiện bạn đã tham gia và thành tích đạt được
            </p>
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
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {totalEvents}
                    </p>
                    <p className="mt-1 text-xs text-green-600">Đã hoàn thành</p>
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
                      Giờ tình nguyện
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {totalHours}
                    </p>
                    <p className="mt-1 text-xs text-blue-600">Tổng cộng</p>
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
                    <p className="text-sm text-muted-foreground">Đánh giá TB</p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {averageRating.toFixed(1)}
                    </p>
                    <p className="mt-1 text-xs text-yellow-600">⭐ Sao</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Thành tích</p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {achievements.filter((a) => a.earned).length}
                    </p>
                    <p className="mt-1 text-xs text-purple-600">Đã đạt được</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="no-show">Không tham gia</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredEvents.length} / {historyEvents.length} sự kiện
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Events History */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Sự kiện đã tham gia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredEvents.map((event) => (
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
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>{event.date}</span>
                          <span>{event.location}</span>
                          <span>{event.hours} giờ</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{event.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Tổ chức: {event.organization}
                        </p>
                        {event.feedback && (
                          <p className="text-sm italic text-muted-foreground">
                            "{event.feedback}"
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {event.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {event.certificate && (
                            <Badge className="bg-green-500 text-white text-xs">
                              <Award className="mr-1 h-3 w-3" />
                              Chứng chỉ
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/events/${event.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem lại
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Thành tích
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 border rounded-lg ${
                        achievement.earned
                          ? "bg-green-50 border-green-200"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                          {achievement.earned && (
                            <p className="text-xs text-green-600 mt-1">
                              Đạt được: {achievement.date}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Progress Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tóm tắt tiến độ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sự kiện hoàn thành
                    </span>
                    <span className="font-semibold">{totalEvents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Giờ tình nguyện
                    </span>
                    <span className="font-semibold">{totalHours}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Đánh giá trung bình
                    </span>
                    <span className="font-semibold">
                      {averageRating.toFixed(1)}⭐
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Thành tích</span>
                    <span className="font-semibold">
                      {achievements.filter((a) => a.earned).length}/
                      {achievements.length}
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
                    <Link to="/dashboard">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Dashboard
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
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
