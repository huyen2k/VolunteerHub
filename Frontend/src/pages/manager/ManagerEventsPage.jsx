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
import { ManagerLayout } from "../../components/Layout";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { ManagerEventVolunteersModal } from "./ManagerEventVolunteersModal";

export default function ManagerEventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [volEventId, setVolEventId] = useState(null);
  const [volOpen, setVolOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      console.log("User ID hien tai o Frontend:", user.id);
      loadEvents();
    } else {
      console.log("Chua co User ID (user null hoac undefined)");
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await eventService.getEventsByManager(user.id);

      // Transform backend data to frontend format
      const transformedEvents = (data || []).map((event) => ({
        id: event.id,
        title: event.title || "Không có tiêu đề",
        description: event.description || "",
        date: event.date
          ? new Date(event.date).toLocaleDateString("vi-VN")
          : "Chưa có",
        location: event.location || "Chưa có",
        status: event.status || "pending",
        createdAt: event.createdAt
          ? new Date(event.createdAt).toLocaleDateString("vi-VN")
          : "",
        volunteers: 0, // Will be fetched separately if needed
        maxVolunteers: 0,
      }));

      setEvents(transformedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setError(err.message || "Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async (eventId) => {
    try {
      await eventService.approveEvent(eventId, "approved", "");
      await loadEvents();
    } catch (err) {
      console.error("Error approving event:", err);
      alert(
        "Không thể duyệt sự kiện: " + (err.message || "Lỗi không xác định")
      );
    }
  };

  const handleReject = async (eventId) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối sự kiện này?")) {
      return;
    }
    try {
      await eventService.rejectEvent(eventId, "");
      await loadEvents();
    } catch (err) {
      console.error("Error rejecting event:", err);
      alert(
        "Không thể từ chối sự kiện: " + (err.message || "Lỗi không xác định")
      );
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      return;
    }
    try {
      await eventService.deleteEvent(eventId);
      await loadEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Không thể xóa sự kiện: " + (err.message || "Lỗi không xác định"));
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="container mx-auto p-6">
          <LoadingSpinner />
        </div>
      </ManagerLayout>
    );
  }

  if (error) {
    return (
      <ManagerLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadEvents} className="mt-4">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
              <p className="mt-2 text-muted-foreground">
                Tạo, chỉnh sửa và quản lý các sự kiện của bạn
              </p>
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link to="/manager/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Tạo sự kiện mới
              </Link>
            </Button>
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
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredEvents.length} / {events.length} sự kiện
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Tạo lúc: {event.createdAt}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 lg:flex-row">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/manager/events/${event.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setVolEventId(event.id); setVolOpen(true); }}>
                        <Users className="mr-2 h-4 w-4" />
                        Tình nguyện viên
                      </Button>
                      {(event.status === "pending" ||
                        event.status === "rejected") && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/manager/events/${event.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </Link>
                        </Button>
                      )}
                      {event.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleApprove(event.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(event.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Không tìm thấy sự kiện
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterStatus !== "all"
                    ? "Không có sự kiện nào phù hợp với bộ lọc của bạn"
                    : "Bạn chưa tạo sự kiện nào"}
                </p>
                <Button asChild>
                  <Link to="/manager/events/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo sự kiện đầu tiên
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ManagerEventVolunteersModal eventId={volEventId} open={volOpen} onOpenChange={setVolOpen} />
    </ManagerLayout>
  );
}
