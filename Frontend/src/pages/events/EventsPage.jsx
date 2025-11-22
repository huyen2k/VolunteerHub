import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { GuestLayout } from "../../components/Layout";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Calendar,
  MapPin,
  Search,
  Heart,
  MessageSquare,
  AlertCircle,
  LogIn,
} from "lucide-react";

const defaultEventImage =
  "https://www.wildapricot.com/wp-content/uploads/2022/10/bigstock-portrait-of-a-happy-and-divers-19389686.jpg";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await eventService.getEvents();
        const mappedEvents = (data || []).map((event) => ({
          id: event.id || event._id,
          title: event.title || "Không có tiêu đề",
          description: event.description || "",
          location: event.location || "",
          date: event.date
            ? new Date(event.date).toLocaleDateString("vi-VN")
            : "",
          status: event.status || "pending",
          category: "Sự kiện",
          image: event.image || null, // Để null để xử lý fallback sau
          likes: event.likes || 0,
          comments: event.comments || 0,
        }));
        setEvents(mappedEvents);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách sự kiện");
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const categories = ["Môi trường", "Giáo dục", "Cộng đồng", "Y tế", "Văn hóa"];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || event.category === filterCategory;

    const matchesDate =
      filterDate === "all" ||
      (filterDate === "upcoming" &&
        event.date &&
        new Date(event.date.split("/").reverse().join("-")) > new Date()) || // Fix logic so sánh ngày
      (filterDate === "this-week" &&
        event.date &&
        isThisWeek(new Date(event.date.split("/").reverse().join("-"))));

    return matchesSearch && matchesCategory && matchesDate;
  });

  const isThisWeek = (date) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= startOfWeek && date <= endOfWeek;
  };

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { message: "Vui lòng đăng nhập để đăng ký tham gia sự kiện" },
      });
    }
  };

  return (
    <GuestLayout>
      <div className="bg-muted/30 min-h-screen">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Sự kiện tình nguyện
            </h1>
            <p className="mt-2 text-muted-foreground">
              Khám phá các sự kiện tình nguyện ý nghĩa và tham gia đóng góp cho
              cộng đồng
            </p>

            {!isAuthenticated ? (
              <div className="mt-6 mx-auto max-w-2xl p-4 bg-blue-50/50 border border-blue-100 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-blue-800">
                  <strong>Muốn tham gia?</strong> Đăng nhập để đăng ký sự kiện
                  và tham gia cộng đồng!
                </p>
                <div className="mt-3 flex gap-2 justify-center">
                  <Button size="sm" asChild>
                    <Link to="/login">Đăng nhập</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/register">Đăng ký</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 mx-auto max-w-2xl p-4 bg-green-50/50 border border-green-100 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-green-800">
                  Chào mừng <strong>{user?.name}</strong>! Truy cập trang cá
                  nhân để quản lý hoạt động.
                </p>
                <div className="mt-3 flex gap-2 justify-center">
                  <Button size="sm" asChild>
                    <Link to="/user/events">
                      <Calendar className="mr-2 h-3 w-3" />
                      Sự kiện của tôi
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8 bg-background p-4 rounded-xl shadow-sm border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-20 z-10">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-ring"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-ring"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="this-week">Tuần này</option>
              </select>
            </div>
            <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {filteredEvents.length} kết quả
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {!loading && error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="flex flex-col items-center py-8">
                <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-destructive font-medium">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4 border-destructive text-destructive hover:bg-destructive/10"
                >
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="group flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted"
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={event.image || defaultEventImage}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = defaultEventImage;
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-sm">
                        {event.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem] text-card-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description ||
                        "Chưa có mô tả chi tiết cho sự kiện này."}
                    </p>

                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="truncate line-clamp-1">
                          {event.location || "Chưa cập nhật địa điểm"}
                        </span>
                      </div>
                      {event.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>{event.date}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats Divider */}
                    <div className="border-t pt-3 mb-4 flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer">
                          <Heart className="h-4 w-4" /> {event.likes}
                        </span>
                        <span className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer">
                          <MessageSquare className="h-4 w-4" /> {event.comments}
                        </span>
                      </div>
                      <div className="text-xs font-medium px-2 py-0.5 bg-muted rounded">
                        {event.status === "approved"
                          ? "Sắp diễn ra"
                          : "Đang mở"}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Link to={`/events/${event.id}`}>Xem chi tiết</Link>
                      </Button>

                      {isAuthenticated ? (
                        <Button
                          size="sm"
                          onClick={() => navigate("/user/events")}
                          className="flex-1"
                        >
                          Đăng ký
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleRegisterClick}
                          className="flex-1"
                        >
                          <LogIn className="mr-2 h-3 w-3" /> Đăng ký
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">
                Không tìm thấy sự kiện nào
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy kết quả
                phù hợp hơn.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                  setFilterDate("all");
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}

          {/* CTA Footer */}
          {!isAuthenticated && filteredEvents.length > 0 && (
            <div className="mt-12 bg-primary rounded-2xl p-8 text-center text-primary-foreground">
              <h3 className="text-2xl font-bold mb-4">
                Sẵn sàng tạo ra sự khác biệt?
              </h3>
              <p className="mb-6 opacity-90">
                Tham gia cùng hàng ngàn tình nguyện viên khác ngay hôm nay.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="font-semibold"
                >
                  <Link to="/register">Đăng ký tài khoản</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GuestLayout>
  );
}
