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
import { UserLayout } from "../../components/Layout";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
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
  UserCheck,
  Star,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function UserEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [userStats, setUserStats] = useState({
    totalRegistered: 0,
    completed: 0,
    upcoming: 0,
    totalHours: 0,
    totalPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load data from Mock API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all events and user events in parallel
        const [allEvents, userEventsData, stats] = await Promise.all([
          eventService.getEvents(),
          user ? eventService.getUserEvents(user.id) : Promise.resolve([]),
          user
            ? eventService.getUserEventStats(user.id)
            : Promise.resolve({
                totalRegistered: 0,
                completed: 0,
                upcoming: 0,
                totalHours: 0,
                totalPoints: 0,
              }),
        ]);

        setEvents(allEvents);
        setUserEvents(userEventsData);
        setUserStats(stats);
      } catch (err) {
        setError(err.message);
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const categories = ["Môi trường", "Giáo dục", "Cộng đồng", "Y tế", "Văn hóa"];
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "registered", label: "Đã đăng ký" },
    { value: "available", label: "Có thể đăng ký" },
    { value: "completed", label: "Đã hoàn thành" },
  ];

  // Combine all events with user registration status
  const eventsWithStatus = events.map((event) => {
    const userEvent = userEvents.find((ue) => ue.id === event.id);
    return {
      ...event,
      isRegistered: !!userEvent,
      registrationStatus: userEvent?.registrationStatus || null,
      userRating: userEvent?.userRating || null,
      userReview: userEvent?.userReview || null,
    };
  });

  const filteredEvents = eventsWithStatus.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || event.category === filterCategory;

    const matchesDate =
      filterDate === "all" ||
      (filterDate === "upcoming" && new Date(event.date) > new Date()) ||
      (filterDate === "this-week" && isThisWeek(new Date(event.date)));

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "registered" && event.isRegistered) ||
      (filterStatus === "available" && !event.isRegistered) ||
      (filterStatus === "completed" &&
        event.registrationStatus === "completed");

    return matchesSearch && matchesCategory && matchesDate && matchesStatus;
  });

  const isThisWeek = (date) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= startOfWeek && date <= endOfWeek;
  };

  const getStatusBadge = (event) => {
    if (event.isRegistered) {
      switch (event.registrationStatus) {
        case "confirmed":
          return (
            <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>
          );
        case "pending":
          return (
            <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
          );
        case "completed":
          return (
            <Badge className="bg-blue-100 text-blue-800">Đã hoàn thành</Badge>
          );
        default:
          return (
            <Badge className="bg-gray-100 text-gray-800">Đã đăng ký</Badge>
          );
      }
    }
    return null;
  };

  const handleRegisterClick = async (eventId) => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      await eventService.registerForEvent(user.id, eventId);

      // Reload data to reflect changes
      const [allEvents, userEventsData, stats] = await Promise.all([
        eventService.getEvents(),
        eventService.getUserEvents(user.id),
        eventService.getUserEventStats(user.id),
      ]);

      setEvents(allEvents);
      setUserEvents(userEventsData);
      setUserStats(stats);

      // Show success message (you can add a toast notification here)
      console.log("Successfully registered for event");
    } catch (error) {
      console.error("Error registering for event:", error);
      setError(error.message);
    }
  };

  const handleUnregisterClick = async (eventId) => {
    try {
      if (!user) return;

      await eventService.cancelEventRegistration(user.id, eventId);

      // Reload data to reflect changes
      const [allEvents, userEventsData, stats] = await Promise.all([
        eventService.getEvents(),
        eventService.getUserEvents(user.id),
        eventService.getUserEventStats(user.id),
      ]);

      setEvents(allEvents);
      setUserEvents(userEventsData);
      setUserStats(stats);

      console.log("Successfully unregistered from event");
    } catch (error) {
      console.error("Error unregistering from event:", error);
      setError(error.message);
    }
  };

  const handleRateEvent = (eventId) => {
    // TODO: Implement rating modal/dialog
    console.log("Rate event:", eventId);
  };

  return (
    <UserLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Sự kiện tình nguyện</h1>
            <p className="mt-2 text-muted-foreground">
              Chào mừng {user?.name}! Khám phá và tham gia các sự kiện tình
              nguyện ý nghĩa
            </p>
          </div>

          {/* User Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Đã tham gia</p>
                    <p className="text-2xl font-bold">
                      {userStats.totalRegistered}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sắp diễn ra</p>
                    <p className="text-2xl font-bold">{userStats.upcoming}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Giờ tình nguyện
                    </p>
                    <p className="text-2xl font-bold">{userStats.totalHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Điểm tích lũy
                    </p>
                    <p className="text-2xl font-bold">
                      {userStats.totalPoints}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredEvents.length} / {events.length} sự kiện
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <p className="font-semibold">Có lỗi xảy ra:</p>
                  <p className="text-sm">{error}</p>
                </div>
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
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {event.category}
                      </Badge>
                      {getStatusBadge(event)}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.organization}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.registeredCount}/{event.maxVolunteers} tình
                          nguyện viên
                        </span>
                      </div>
                    </div>

                    {/* User Rating */}
                    {event.userRating && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">
                            Đánh giá của bạn: {event.userRating}/5
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {event.userReview}
                        </p>
                      </div>
                    )}

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
                      {event.isRegistered ? (
                        <div className="flex gap-1">
                          {event.registrationStatus === "completed" &&
                            !event.userRating && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRateEvent(event.id)}
                                className="flex-1"
                              >
                                <Star className="mr-2 h-4 w-4" />
                                Đánh giá
                              </Button>
                            )}
                          {event.registrationStatus !== "completed" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUnregisterClick(event.id)}
                              className="flex-1"
                            >
                              Hủy đăng ký
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRegisterClick(event.id)}
                          className="flex-1"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Đăng ký tham gia
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
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
        </div>
      </div>
    </UserLayout>
  );
}
