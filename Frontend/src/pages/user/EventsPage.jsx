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
import userService from "../../services/userService";
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allEvents, userRegistrations, statsData] = await Promise.all([
          eventService.getEvents(),
          user ? eventService.getUserEvents(user.id) : Promise.resolve([]),
          user
            ? userService.getUserStats(user.id).catch(() => ({
                totalEventsRegistered: 0,
                completedEvents: 0,
                upcomingEvents: 0,
                totalHours: 0,
                totalPoints: 0,
              }))
            : Promise.resolve({
                totalEventsRegistered: 0,
                completedEvents: 0,
                upcomingEvents: 0,
                totalHours: 0,
                totalPoints: 0,
              }),
        ]);

        setEvents(allEvents || []);

        const userEventsWithDetails = await Promise.all(
          (userRegistrations || []).map(async (reg) => {
            try {
              const event = await eventService.getEventById(reg.eventId);
              return {
                id: event.id,
                eventId: event.id,
                registrationId: reg.id,
                title: event.title,
                description: event.description,
                date: event.date,
                location: event.location,
                status: event.status,
                registrationStatus: reg.status,
                registeredAt: reg.registeredAt,
              };
            } catch (err) {
              console.error(`Error loading event ${reg.eventId}:`, err);
              return null;
            }
          })
        );
        setUserEvents(userEventsWithDetails.filter((e) => e !== null));
        setUserStats({
          totalRegistered: statsData?.totalEventsRegistered || 0,
          completed: statsData?.completedEvents || 0,
          upcoming: statsData?.upcomingEvents || 0,
          totalHours: statsData?.totalHours || 0,
          totalPoints: statsData?.totalPoints || 0,
        });
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

  const eventsWithStatus = events.map((event) => {
    const userEvent = userEvents.find(
      (ue) => ue.eventId === event.id || ue.id === event.id
    );
    return {
      ...event,
      isRegistered: !!userEvent,
      registrationStatus: userEvent?.registrationStatus || null,
      registrationId: userEvent?.registrationId || null,
      userRating: userEvent?.userRating || null,
      userReview: userEvent?.userReview || null,
    };
  });

  const filteredEvents = eventsWithStatus.filter((event) => {
    const title = (event.title || "").toLowerCase();
    const description = (event.description || "").toLowerCase();
    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" ||
      !event.category ||
      event.category === filterCategory;

    const eventDate = event.date ? new Date(event.date) : null;
    const matchesDate =
      filterDate === "all" ||
      !eventDate ||
      (filterDate === "upcoming" && eventDate > new Date()) ||
      (filterDate === "this-week" && isThisWeek(eventDate));

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

      await eventService.registerForEvent(eventId);

      const [allEvents, userRegistrations, statsData] = await Promise.all([
        eventService.getEvents(),
        eventService.getUserEvents(user.id),
        userService.getUserStats(user.id).catch(() => ({
          totalEventsRegistered: 0,
          completedEvents: 0,
          upcomingEvents: 0,
          totalHours: 0,
          totalPoints: 0,
        })),
      ]);

      setEvents(allEvents || []);
      const userEventsWithDetails = await Promise.all(
        (userRegistrations || []).map(async (reg) => {
          try {
            const event = await eventService.getEventById(reg.eventId);
            return {
              id: event.id,
              eventId: event.id,
              registrationId: reg.id,
              title: event.title,
              description: event.description,
              date: event.date,
              location: event.location,
              status: event.status,
              registrationStatus: reg.status,
              registeredAt: reg.registeredAt,
            };
          } catch (err) {
            console.error(`Error loading event ${reg.eventId}:`, err);
            return null;
          }
        })
      );
      setUserEvents(userEventsWithDetails.filter((e) => e !== null));
      setUserStats({
        totalRegistered: statsData?.totalEventsRegistered || 0,
        completed: statsData?.completedEvents || 0,
        upcoming: statsData?.upcomingEvents || 0,
        totalHours: statsData?.totalHours || 0,
        totalPoints: statsData?.totalPoints || 0,
      });

      alert("Đăng ký sự kiện thành công!");
    } catch (error) {
      console.error("Error registering for event:", error);
      alert(
        "Không thể đăng ký sự kiện: " + (error.message || "Lỗi không xác định")
      );
    }
  };

  const handleUnregisterClick = async (registrationId) => {
    try {
      if (!user) return;

      if (!confirm("Bạn có chắc chắn muốn hủy đăng ký sự kiện này?")) {
        return;
      }

      await eventService.cancelEventRegistration(registrationId);

      const [allEvents, userRegistrations, statsData] = await Promise.all([
        eventService.getEvents(),
        eventService.getUserEvents(user.id),
        userService.getUserStats(user.id).catch(() => ({
          totalEventsRegistered: 0,
          completedEvents: 0,
          upcomingEvents: 0,
          totalHours: 0,
          totalPoints: 0,
        })),
      ]);

      setEvents(allEvents || []);
      const userEventsWithDetails = await Promise.all(
        (userRegistrations || []).map(async (reg) => {
          try {
            const event = await eventService.getEventById(reg.eventId);
            return {
              id: event.id,
              eventId: event.id,
              registrationId: reg.id,
              title: event.title,
              description: event.description,
              date: event.date,
              location: event.location,
              status: event.status,
              registrationStatus: reg.status,
              registeredAt: reg.registeredAt,
            };
          } catch (err) {
            console.error(`Error loading event ${reg.eventId}:`, err);
            return null;
          }
        })
      );
      setUserEvents(userEventsWithDetails.filter((e) => e !== null));
      setUserStats({
        totalRegistered: statsData?.totalEventsRegistered || 0,
        completed: statsData?.completedEvents || 0,
        upcoming: statsData?.upcomingEvents || 0,
        totalHours: statsData?.totalHours || 0,
        totalPoints: statsData?.totalPoints || 0,
      });

      alert("Hủy đăng ký sự kiện thành công!");
    } catch (error) {
      console.error("Error unregistering from event:", error);
      alert(
        "Không thể hủy đăng ký: " + (error.message || "Lỗi không xác định")
      );
    }
  };

  const handleRateEvent = (eventId) => {
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
                      {event.category && (
                        <Badge className="bg-primary text-primary-foreground">
                          {event.category}
                        </Badge>
                      )}
                      {getStatusBadge(event)}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {event.title}
                    </h3>
                    {event.organization && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.organization}
                      </p>
                    )}
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
                          {event.date
                            ? new Date(event.date).toLocaleDateString("vi-VN")
                            : "Chưa có"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.registeredCount || 0}/
                          {event.maxVolunteers || "N/A"} tình nguyện viên
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
                    {(event.likes || event.comments) && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {event.likes !== undefined && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {event.likes || 0}
                          </span>
                        )}
                        {event.comments !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {event.comments || 0}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link to={`/events/${event.id}`}>Xem chi tiết</Link>
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
                              onClick={() =>
                                handleUnregisterClick(event.registrationId)
                              }
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
