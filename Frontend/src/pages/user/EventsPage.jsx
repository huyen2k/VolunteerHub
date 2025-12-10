import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { UserLayout } from "../../components/Layout";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import userService from "../../services/userService";
import {
  Calendar, MapPin, Users, Clock, Search, Heart, MessageSquare,
  UserCheck, Star, TrendingUp, Loader2, AlertCircle
} from "lucide-react";

export default function UserEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [userStats, setUserStats] = useState({
    totalRegistered: 0, completed: 0, upcoming: 0, totalHours: 0, totalPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allEvents, userRegistrations, statsData] = await Promise.all([
        eventService.getEvents(),
        user ? eventService.getUserEvents(user.id) : Promise.resolve([]),
        user ? userService.getUserStats(user.id).catch(() => ({})) : Promise.resolve({}),
      ]);

      setEvents(allEvents || []);

      const userEventsWithDetails = await Promise.all(
          (userRegistrations || []).map(async (reg) => {
            try {
              const event = await eventService.getEventById(reg.eventId);
              return {
                ...event,
                registrationId: reg.id,
                registrationStatus: reg.status,
                registeredAt: reg.registeredAt,
                userRating: reg.rating,
                userReview: reg.review
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Merge & Filter Logic
  const eventsWithStatus = events.map((event) => {
    const userEvent = userEvents.find((ue) => ue.id === event.id);
    return {
      ...event,
      isRegistered: !!userEvent,
      registrationStatus: userEvent?.registrationStatus || null,
      registrationId: userEvent?.registrationId || null,
      userRating: userEvent?.userRating || null,
      userReview: userEvent?.userReview || null,
    };
  });

  const combinedEvents = [...eventsWithStatus];
  userEvents.forEach(ue => {
    if (!combinedEvents.find(e => e.id === ue.id)) {
      combinedEvents.push({ ...ue, isRegistered: true });
    }
  });

  // Ẩn sự kiện bị Reject/Cancel khỏi danh sách
  const visibleEvents = combinedEvents.filter(event =>
      event.status !== 'rejected' && event.status !== 'cancelled'
  );

  const categories = ["Môi trường", "Giáo dục", "Cộng đồng", "Y tế", "Văn hóa"];
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "registered", label: "Đã đăng ký" },
    { value: "completed", label: "Đã hoàn thành" },
  ];

  const isThisWeek = (date) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= startOfWeek && date <= endOfWeek;
  };

  const filteredEvents = visibleEvents.filter((event) => {
    const title = (event.title || "").toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || event.category === filterCategory;

    const eventDate = event.date ? new Date(event.date) : null;
    const matchesDate =
        filterDate === "all" ||
        !eventDate ||
        (filterDate === "upcoming" && eventDate > new Date()) ||
        (filterDate === "this-week" && isThisWeek(eventDate));

    const matchesStatus = filterStatus === "all" ||
        (filterStatus === "registered" && event.isRegistered) ||
        (filterStatus === "completed" && event.registrationStatus === "completed") ||
        (filterStatus === "available" && !event.isRegistered);

    return matchesSearch && matchesCategory && matchesDate && matchesStatus;
  });

  const getStatusBadge = (event) => {
    if (event.status === "rejected" || event.status === "cancelled") {
      return <Badge className="bg-red-100 text-red-800">Sự kiện bị hủy</Badge>;
    }
    if (event.status === "pending") {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Sự kiện đang chờ duyệt</Badge>;
    }
    if (event.isRegistered) {
      switch (event.registrationStatus) {
        case "approved": return <Badge className="bg-green-100 text-green-800">Đã tham gia</Badge>;
        case "pending": return <Badge className="bg-yellow-100 text-yellow-800">Đăng ký chờ duyệt</Badge>;
        case "rejected": return <Badge className="bg-red-100 text-red-800">Đăng ký bị từ chối</Badge>;
        case "completed": return <Badge className="bg-blue-100 text-blue-800">Đã hoàn thành</Badge>;
        default: return <Badge className="bg-gray-100 text-gray-800">Đã đăng ký</Badge>;
      }
    }
    return null;
  };

  const handleRegisterClick = async (eventId) => {
    if (!user) return navigate("/login");
    try {
      await eventService.registerForEvent(eventId);
      alert("Đăng ký thành công!");
      await loadData();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleUnregisterClick = async (registrationId) => {
    if (!registrationId) return alert("Không tìm thấy thông tin đăng ký!");
    if (!confirm("Bạn có chắc chắn muốn hủy đăng ký?")) return;

    try {
      await eventService.cancelEventRegistration(registrationId);
      alert("Hủy đăng ký thành công!");
      await loadData();
    } catch (error) {
      alert("Lỗi hủy đăng ký: " + error.message);
    }
  };

  return (
      <UserLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold">Sự kiện của tôi</h1>
              <p className="mt-2 text-muted-foreground">Quản lý các sự kiện bạn đã và đang tham gia</p>
            </div>

            {/* User Stats - Sửa lỗi ESLint: sử dụng biến userStats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Đã tham gia</p>
                      <p className="text-2xl font-bold">{userStats.totalRegistered}</p>
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
                      <p className="text-sm text-muted-foreground">Giờ tình nguyện</p>
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
                      <p className="text-sm text-muted-foreground">Điểm tích lũy</p>
                      <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters - Sửa lỗi ESLint: sử dụng các biến setFilter... */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
                </div>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-foreground">
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-foreground">
                  <option value="all">Tất cả thời gian</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="this-week">Tuần này</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-foreground">
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

            {loading && <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>}

            {/* Error State - Sửa lỗi ESLint: sử dụng biến error */}
            {error && (
                <Card className="mb-8 border-destructive/50 bg-destructive/10">
                  <CardContent className="p-6 text-center text-red-600">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold">Có lỗi xảy ra:</p>
                    <p className="text-sm">{error}</p>
                  </CardContent>
                </Card>
            )}

            {!loading && !error && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map((event) => {
                    const isPastEvent = event.date && new Date() > new Date(event.date);

                    return (
                        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative h-48">
                            <img src={event.image || "/placeholder.svg"} alt={event.title} className="h-full w-full object-cover" />
                            <div className="absolute top-3 right-3 flex gap-2">
                              {getStatusBadge(event)}
                            </div>
                          </div>

                          <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-2 line-clamp-2">{event.title}</h3>
                            <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</div>
                              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {event.date ? new Date(event.date).toLocaleDateString("vi-VN") : "Chưa có"}</div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild className="flex-1">
                                <Link to={`/events/${event.id}`}>Xem chi tiết</Link>
                              </Button>

                              {event.isRegistered ? (
                                  <div className="flex-1">
                                    {event.registrationStatus !== "completed" && !isPastEvent && (
                                        <Button size="sm" variant="destructive" className="w-full" onClick={() => handleUnregisterClick(event.registrationId)}>
                                          Hủy đăng ký
                                        </Button>
                                    )}
                                    {event.registrationStatus === "completed" && (
                                        <Button size="sm" variant="outline" className="w-full">
                                          <Star className="mr-2 h-4 w-4" /> Đánh giá
                                        </Button>
                                    )}
                                  </div>
                              ) : (
                                  event.status === 'approved' && !isPastEvent && (
                                      <Button size="sm" onClick={() => handleRegisterClick(event.id)} className="flex-1">
                                        <UserCheck className="mr-2 h-4 w-4" /> Đăng ký
                                      </Button>
                                  )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                    )})}
                </div>
            )}

            {!loading && !error && filteredEvents.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Không tìm thấy sự kiện</h3>
                    <p className="text-muted-foreground text-center">Không có sự kiện nào phù hợp với bộ lọc của bạn</p>
                  </CardContent>
                </Card>
            )}
          </div>
        </div>
      </UserLayout>
  );
}