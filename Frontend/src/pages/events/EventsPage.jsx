import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { PublicLayout } from "../../components/Layout";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  Heart,
  MessageSquare,
  Eye,
  LogIn,
  AlertCircle,
} from "lucide-react";

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
        // Map backend event format to frontend format
        const mappedEvents = (data || []).map((event) => ({
          id: event.id || event._id,
          title: event.title || "Không có tiêu đề",
          description: event.description || "",
          location: event.location || "",
          date: event.date
            ? new Date(event.date).toLocaleDateString("vi-VN")
            : "",
          status: event.status || "pending",
          category: "Sự kiện", // Backend doesn't have category yet
          image: "/placeholder.svg",
          volunteers: 0,
          maxVolunteers: 100,
          likes: 0,
          comments: 0,
          isRegistered: false,
          registrationStatus: null,
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
        new Date(event.date) > new Date()) ||
      (filterDate === "this-week" &&
        event.date &&
        isThisWeek(new Date(event.date)));

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

  const handleCommunityClick = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { message: "Vui lòng đăng nhập để tham gia thảo luận" },
      });
    }
  };

  return (
    <PublicLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Sự kiện tình nguyện</h1>
            <p className="mt-2 text-muted-foreground">
              Khám phá các sự kiện tình nguyện ý nghĩa và tham gia đóng góp cho
              cộng đồng
            </p>
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Muốn tham gia?</strong> Đăng nhập để đăng ký sự
                  kiện và tham gia cộng đồng tình nguyện viên!
                </p>
                <div className="mt-3 flex gap-2 justify-center">
                  <Button asChild>
                    <Link to="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Đăng nhập
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/register">Đăng ký tài khoản</Link>
                  </Button>
                </div>
              </div>
            )}
            {isAuthenticated && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  🎉 <strong>Chào mừng {user?.name}!</strong> Bạn đã đăng nhập.
                  Truy cập trang sự kiện cá nhân để xem các sự kiện đã đăng ký
                  và đánh giá.
                </p>
                <div className="mt-3 flex gap-2 justify-center">
                  <Button asChild>
                    <Link to="/user/events">
                      <Calendar className="mr-2 h-4 w-4" />
                      Sự kiện của tôi
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="this-week">Tuần này</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredEvents.length} / {events.length} sự kiện
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
                <p className="text-muted-foreground text-center">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground">
                        {event.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location || "Chưa có địa điểm"}</span>
                      </div>
                      {event.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge
                          variant={
                            event.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {event.status === "approved"
                            ? "Đã duyệt"
                            : event.status === "pending"
                            ? "Chờ duyệt"
                            : event.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Interaction Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {event.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {event.comments}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link to={`/events/${event.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </Link>
                      </Button>
                      {isAuthenticated ? (
                        <Button
                          size="sm"
                          onClick={() => navigate("/user/events")}
                          className="flex-1"
                        >
                          Đăng ký tham gia
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleRegisterClick}
                          className="flex-1"
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Đăng nhập để đăng ký
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filteredEvents.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Không tìm thấy sự kiện
                </h3>
                <p className="text-muted-foreground text-center">
                  Không có sự kiện nào phù hợp với bộ lọc của bạn
                </p>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              {!isAuthenticated ? (
                <>
                  <h3 className="text-2xl font-bold mb-4">
                    Sẵn sàng tham gia cộng đồng tình nguyện?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Đăng ký tài khoản để có thể đăng ký sự kiện, tham gia thảo
                    luận và theo dõi lịch sử hoạt động của bạn.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button size="lg" asChild>
                      <Link to="/register">
                        <LogIn className="mr-2 h-5 w-5" />
                        Đăng ký ngay
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-4">
                    Bạn đã đăng nhập! 🎉
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Truy cập trang sự kiện cá nhân để xem các sự kiện đã đăng
                    ký, đánh giá và quản lý hoạt động tình nguyện của bạn.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button size="lg" asChild>
                      <Link to="/user/events">
                        <Calendar className="mr-2 h-5 w-5" />
                        Sự kiện của tôi
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
