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
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { UserLayout } from "../../components/Layout";
import {
  Calendar, MapPin, Search, CheckCircle2,
  Clock, XCircle, Hourglass, Filter, ArrowRight
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function UserHistoryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- LOAD DATA (ĐÃ SỬA LOGIC) ---
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);

        // 1. Gọi song song: Lấy tất cả sự kiện (để lấy info) & Lấy lịch sử đăng ký
        const [allEvents, userRegs] = await Promise.all([
          eventService.getEvents().catch(() => []),
          eventService.getUserEvents(user.id).catch(() => [])
        ]);

        // 2. Map dữ liệu chuẩn xác
        const mapped = (userRegs || []).map((r) => {
          // Tìm thông tin sự kiện gốc trong danh sách allEvents dựa vào eventId
          // Ưu tiên dữ liệu nested (r.event) nếu có, nếu không thì tìm trong allEvents
          const eventInfo = r.event || allEvents.find(e => e.id === r.eventId) || {};

          return {
            // QUAN TRỌNG: ID dùng để dẫn link phải là EventID, không phải RegistrationID
            id: eventInfo.id || r.eventId,
            registrationId: r.id, // Lưu lại ID đăng ký nếu cần dùng

            title: eventInfo.title || "Sự kiện không còn tồn tại",
            date: eventInfo.date ? new Date(eventInfo.date) : new Date(),
            location: eventInfo.location || "Chưa cập nhật",
            status: r.status || "pending",
            image: eventInfo.image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a", // Ảnh mặc định nếu thiếu
            registeredAt: r.registeredAt ? new Date(r.registeredAt) : new Date(),
          };
        });

        // Sắp xếp mới nhất lên đầu
        setEvents(mapped.sort((a, b) => b.registeredAt - a.registeredAt));
      } catch (err) {
        console.error("Error loading history:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // --- FILTER LOGIC ---
  const filteredEvents = events.filter((event) => {
    const title = event.title || "";
    const loc = event.location || "";

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- STATS CALCULATION ---
  const stats = {
    total: events.length,
    approved: events.filter(e => e.status === 'approved' || e.status === 'completed').length,
    pending: events.filter(e => e.status === 'pending').length,
    rejected: events.filter(e => e.status === 'rejected' || e.status === 'cancelled').length,
  };

  // --- HELPER: BADGE ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Hoàn thành</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Đã tham gia</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Chờ duyệt</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Bị từ chối</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <UserLayout><div className="flex justify-center p-20"><LoadingSpinner/></div></UserLayout>;

  return (
      <UserLayout>
        <div className="bg-gray-50/50 min-h-screen pb-12">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Lịch sử hoạt động</h1>
              <p className="mt-2 text-gray-500">
                Theo dõi quá trình tham gia và kết quả các sự kiện tình nguyện của bạn.
              </p>
            </div>

            {/* Stats Cards - Thống kê thực tế */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tổng đăng ký</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Filter className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Đã tham gia</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">{stats.approved}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">{stats.pending}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-full">
                      <Hourglass className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bị từ chối / Hủy</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">{stats.rejected}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Main Content */}
            <div className="grid gap-8 lg:grid-cols-4">

              {/* Sidebar Filters */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm sticky top-4">
                  <h3 className="font-semibold mb-4 text-gray-900">Bộ lọc tìm kiếm</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-1.5 block">Từ khóa</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Tên sự kiện..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500 mb-1.5 block">Trạng thái</label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="bg-gray-50">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="approved">Đã tham gia</SelectItem>
                          <SelectItem value="pending">Chờ duyệt</SelectItem>
                          <SelectItem value="rejected">Bị từ chối</SelectItem>
                          <SelectItem value="completed">Đã hoàn thành</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {setSearchTerm(""); setFilterStatus("all");}}
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </div>
              </div>

              {/* Event List */}
              <div className="lg:col-span-3">
                <Card className="border-none shadow-sm bg-transparent">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl flex items-center gap-2">
                      Danh sách chi tiết
                      <Badge variant="secondary" className="ml-2 font-normal text-sm">
                        {filteredEvents.length} kết quả
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed">
                          <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                            <Calendar className="h-full w-full"/>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">Chưa có dữ liệu</h3>
                          <p className="text-gray-500 max-w-sm mx-auto mt-1">
                            Bạn chưa tham gia sự kiện nào hoặc không tìm thấy kết quả phù hợp với bộ lọc.
                          </p>
                          <Button className="mt-4" asChild>
                            <Link to="/user/events">Khám phá sự kiện ngay</Link>
                          </Button>
                        </div>
                    ) : (
                        filteredEvents.map((event) => (
                            <div
                                key={event.id} // Lúc này event.id đã là ID của sự kiện (chuẩn)
                                className="group bg-white p-5 border rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                            >
                              {/* Thumbnail (Clickable) */}
                              <Link to={`/events/${event.id}`} className="w-full sm:w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer block">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </Link>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="text-lg font-bold text-gray-900 truncate pr-2">
                                    {/* Link chuẩn tới ID sự kiện */}
                                    <Link to={`/events/${event.id}`} className="hover:text-primary transition-colors">
                                      {event.title}
                                    </Link>
                                  </h3>
                                  {getStatusBadge(event.status)}
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                {event.date.toLocaleDateString("vi-VN")}
                              </span>
                                  <span className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-red-500" />
                                  <span className="truncate max-w-[200px]">{event.location}</span>
                              </span>
                                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                  <Clock className="h-3.5 w-3.5" />
                                  Đăng ký: {event.registeredAt.toLocaleDateString("vi-VN")}
                              </span>
                                </div>
                              </div>

                              {/* Action */}
                              <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto group-hover:bg-gray-50">
                                  <Link to={`/events/${event.id}`} className="flex items-center">
                                    Xem chi tiết <ArrowRight className="ml-1.5 h-4 w-4 text-gray-400 group-hover:text-primary transition-colors"/>
                                  </Link>
                                </Button>
                              </div>
                            </div>
                        ))
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </UserLayout>
  );
}