import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ManagerLayout } from "../../components/Layout"; // Layout riêng cho Manager
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Calendar,
  MapPin,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";
// Giả sử bạn có Modal chi tiết riêng cho Manager, nếu chưa có thì dùng chung AdminEventDetailModal hoặc tạo mới
import { ManagerEventDetailModal } from "./ManagerEventDetailModal";

export default function ManagerEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal chi tiết
  const [detailId, setDetailId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadEvents();
  }, []);

  // --- FILTER EFFECT ---
  useEffect(() => {
    let result = events;

    // 1. Lọc theo Search Term (Tên hoặc Địa điểm)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(e =>
          e.title.toLowerCase().includes(lowerTerm) ||
          e.location.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Lọc theo Status (Computed Status)
    if (statusFilter !== "all") {
      result = result.filter(e => e.computedStatus === statusFilter);
    }

    setFilteredEvents(result);
  }, [events, searchTerm, statusFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Gọi API lấy sự kiện của chính Manager này tạo
      // Nếu chưa có hàm getMyEvents, bạn có thể dùng getEvents và lọc ở backend hoặc frontend
      const data = await eventService.getMyEvents();

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset về 0h sáng nay để so sánh ngày chuẩn

      const transformedEvents = (data || []).map((event) => {
        // --- LOGIC TRẠNG THÁI CHUẨN ---
        let computedStatus = event.status; // pending, rejected
        let statusLabel = "";
        let statusVariant = "default";

        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        if (event.status === "pending") {
          statusLabel = "Đang chờ duyệt";
          statusVariant = "secondary"; // Vàng/Xám
          computedStatus = "pending";
        } else if (event.status === "rejected") {
          statusLabel = "Bị từ chối";
          statusVariant = "destructive"; // Đỏ
          computedStatus = "rejected";
        } else if (event.status === "approved") {
          // Logic thời gian cho sự kiện đã duyệt
          if (eventDate.getTime() === now.getTime()) {
            statusLabel = "Đang diễn ra";
            statusVariant = "default"; // Xanh (Primary)
            computedStatus = "happening";
          } else if (eventDate < now) {
            statusLabel = "Đã hoàn thành";
            statusVariant = "outline"; // Trắng viền
            computedStatus = "completed";
          } else {
            statusLabel = "Sắp diễn ra";
            statusVariant = "success"; // Xanh lá (Hoặc dùng class riêng)
            computedStatus = "upcoming";
          }
        }

        return {
          ...event,
          computedStatus,
          statusLabel,
          statusVariant,
          displayDate: new Date(event.date).toLocaleDateString("vi-VN"),
          displayTime: new Date(event.date).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})
        };
      });

      // Sắp xếp: Mới nhất lên đầu
      transformedEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setEvents(transformedEvents);
      setFilteredEvents(transformedEvents);
    } catch (err) {
      console.error("Lỗi tải sự kiện:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.")) return;
    try {
      await eventService.deleteEvent(id);
      // Reload lại danh sách sau khi xóa
      loadEvents();
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    }
  };

  const handleExport = () => {
    if (filteredEvents.length === 0) return alert("Không có dữ liệu để xuất");

    const headers = ["ID", "Tên sự kiện", "Ngày", "Giờ", "Địa điểm", "Số lượng TNV", "Trạng thái"];
    const csvRows = [headers.join(",")];

    filteredEvents.forEach(item => {
      const row = [
        `"${item.id}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.displayDate}"`,
        `"${item.displayTime}"`,
        `"${item.location.replace(/"/g, '""')}"`,
        `"${item.volunteersCount || 0}/${item.volunteersNeeded || '∞'}"`,
        `"${item.statusLabel}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvString = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my_events_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDetail = (id) => {
    setDetailId(id);
    setIsDetailOpen(true);
  };

  if (loading) return <ManagerLayout><div className="flex justify-center p-10"><LoadingSpinner /></div></ManagerLayout>;

  return (
      <ManagerLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8">

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
                <p className="mt-1 text-muted-foreground">Danh sách các sự kiện do bạn tổ chức</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport} variant="outline" className="gap-2 bg-white text-slate-900 border">
                  <Download className="h-4 w-4" /> Xuất Excel
                </Button>
                <Button onClick={() => navigate("/manager/events/create")} className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4" /> Tạo sự kiện mới
                </Button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Tìm kiếm theo tên, địa điểm..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Đang chờ duyệt</SelectItem>
                    <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                    <SelectItem value="happening">Đang diễn ra</SelectItem>
                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    <SelectItem value="rejected">Bị từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Event List */}
            <div className="grid gap-4">
              {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                      <Card key={event.id} className="group hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                            {/* Left: Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                                  {event.title}
                                </h3>
                                <Badge variant={event.statusVariant} className={event.statusVariant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                                  {event.statusLabel}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4" />
                                  <span>{event.displayDate} - {event.displayTime}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-4 w-4" />
                                  {/* Hiển thị số lượng đã đăng ký / cần thiết */}
                                  <span>
                                {event.volunteersCount || 0} / {event.volunteersNeeded || "∞"} TNV
                            </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openDetail(event.id)}>
                                <Eye className="h-4 w-4 mr-2" /> Chi tiết
                              </Button>

                              {/* Chỉ cho phép Sửa/Xóa nếu chưa hoàn thành (Tùy logic nghiệp vụ của bạn) */}
                              {event.computedStatus !== "completed" && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigate(`/manager/events/${event.id}/edit`)}>
                                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onClick={() => handleDelete(event.id)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" /> Xóa sự kiện
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                              )}
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                  ))
              ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed">
                    <Calendar className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <p className="text-muted-foreground">Không tìm thấy sự kiện nào.</p>
                    {searchTerm === "" && statusFilter === "all" && (
                        <Button variant="link" onClick={() => navigate("/manager/events/create")} className="mt-2">
                          Tạo sự kiện đầu tiên ngay
                        </Button>
                    )}
                  </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal chi tiết (Nếu cần) */}
        <ManagerEventDetailModal
            eventId={detailId}
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            onUpdate={loadEvents} // Truyền callback để reload sau khi sửa/xóa trong modal
        />
      </ManagerLayout>
  );
}