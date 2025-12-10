import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { AdminLayout } from "../../components/Layout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Calendar, MapPin, Download, Printer, Search, Filter } from "lucide-react";
import { AdminEventDetailModal } from "./AdminEventDetailModal";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailEventId, setDetailEventId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Danh_sach_su_kien_${new Date().toISOString().slice(0,10)}`,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  // Filter Effect
  useEffect(() => {
    let result = events;

    // Lọc theo Search Term
    if (searchTerm) {
      result = result.filter(e =>
          e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo Status (Computed)
    if (statusFilter !== "all") {
      result = result.filter(e => e.computedStatus === statusFilter);
    }

    setFilteredEvents(result);
  }, [events, searchTerm, statusFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventsForAdmin();

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset giờ về 0h để so sánh ngày

      const transformedEvents = (data || []).map((event) => {
        // --- LOGIC CHUẨN HÓA TRẠNG THÁI ---
        let computedStatus = event.status; // mặc định lấy status gốc
        let statusLabel = "";
        let statusVariant = "default";

        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0); // Reset giờ sự kiện

        if (event.status === "pending") {
          statusLabel = "Chờ duyệt";
          statusVariant = "secondary"; // Vàng/Xám
          computedStatus = "pending";
        } else if (event.status === "rejected") {
          statusLabel = "Từ chối";
          statusVariant = "destructive"; // Đỏ
          computedStatus = "rejected";
        } else if (event.status === "approved") {
          if (eventDate.getTime() === now.getTime()) {
            statusLabel = "Đang diễn ra";
            statusVariant = "default"; // Xanh đậm (Primary)
            computedStatus = "happening";
          } else if (eventDate < now) {
            statusLabel = "Đã hoàn thành";
            statusVariant = "outline"; // Trắng viền
            computedStatus = "completed";
          } else {
            statusLabel = "Sắp diễn ra";
            statusVariant = "success"; // Xanh lá (Cần custom class nếu muốn, tạm dùng default)
            computedStatus = "upcoming";
          }
        }

        return {
          ...event,
          computedStatus, // Dùng để lọc
          statusLabel,    // Dùng để hiển thị text
          statusVariant,  // Dùng để tô màu
          displayDate: new Date(event.date).toLocaleDateString("vi-VN"),
          displayTime: new Date(event.date).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})
        };
      });

      // Sắp xếp: Mới nhất lên đầu
      transformedEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setEvents(transformedEvents);
      setFilteredEvents(transformedEvents); // Init danh sách hiển thị
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportEvents = () => {
    if (filteredEvents.length === 0) return alert("Không có dữ liệu");
    const headers = ["ID", "Tiêu đề", "Ngày", "Giờ", "Địa điểm", "Trạng thái"];
    const csvRows = [headers.join(",")];
    filteredEvents.forEach(item => {
      const row = [
        `"${item.id}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.displayDate}"`,
        `"${item.displayTime}"`,
        `"${item.location.replace(/"/g, '""')}"`,
        `"${item.statusLabel}"`
      ];
      csvRows.push(row.join(","));
    });
    const csvString = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "events_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApprove = async (eventId) => {
    try { await eventService.approveEvent(eventId, "approved", ""); await loadEvents(); }
    catch (err) { alert("Lỗi: " + err.message); }
  };

  const handleReject = async (eventId) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối sự kiện này?")) return;
    try { await eventService.rejectEvent(eventId, ""); await loadEvents(); }
    catch (err) { alert("Lỗi: " + err.message); }
  };

  const openDetail = (eventId) => {
    setDetailEventId(eventId);
    setIsDetailOpen(true);
  };

  if (loading) return <AdminLayout><div className="flex justify-center p-10"><LoadingSpinner /></div></AdminLayout>;

  return (
      <AdminLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8">

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
                <p className="mt-1 text-muted-foreground">Tổng số: {filteredEvents.length} sự kiện</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportEvents} variant="outline" className="gap-2 bg-white text-slate-900 border">
                  <Download className="h-4 w-4" /> Xuất Excel
                </Button>
                <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Printer className="h-4 w-4" /> In danh sách
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
                    <SelectItem value="pending">Chờ phê duyệt</SelectItem>
                    <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                    <SelectItem value="happening">Đang diễn ra</SelectItem>
                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    <SelectItem value="rejected">Đã từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Print Area (Hidden) */}
            <div className="hidden">
              <div ref={printRef} className="p-10 text-black bg-white font-serif text-sm">
                <div className="text-center mb-8 border-b-2 pb-4">
                  <h1 className="text-2xl font-bold uppercase">DANH SÁCH SỰ KIỆN</h1>
                  <p className="italic">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
                </div>
                <table className="w-full text-sm text-left border-collapse border border-gray-800">
                  <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border border-gray-800 text-center w-10">STT</th>
                    <th className="p-2 border border-gray-800">Tên sự kiện</th>
                    <th className="p-2 border border-gray-800">Thời gian</th>
                    <th className="p-2 border border-gray-800">Địa điểm</th>
                    <th className="p-2 border border-gray-800 text-center">Trạng thái</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredEvents.map((event, idx) => (
                      <tr key={event.id}>
                        <td className="p-2 border border-gray-800 text-center">{idx + 1}</td>
                        <td className="p-2 border border-gray-800 font-bold">{event.title}</td>
                        <td className="p-2 border border-gray-800">{event.displayDate} <br/> {event.displayTime}</td>
                        <td className="p-2 border border-gray-800">{event.location}</td>
                        <td className="p-2 border border-gray-800 text-center">{event.statusLabel}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
              {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
                            <Badge variant={event.statusVariant} className={event.statusVariant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                              {event.statusLabel}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /><span>{event.displayDate} - {event.displayTime}</span></div>
                            <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{event.location}</span></div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openDetail(event.id)}>Xem chi tiết</Button>
                          {event.computedStatus === "pending" && (
                              <>
                                <Button variant="outline" size="sm" className="text-destructive hover:bg-red-50" onClick={() => handleReject(event.id)}>Từ chối</Button>
                                <Button size="sm" onClick={() => handleApprove(event.id)}>Phê duyệt</Button>
                              </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              )) : (
                  <div className="text-center py-10 text-muted-foreground bg-white rounded-lg border border-dashed">
                    Không tìm thấy sự kiện nào phù hợp với bộ lọc.
                  </div>
              )}
            </div>
          </div>
        </div>
        <AdminEventDetailModal eventId={detailEventId} open={isDetailOpen} onOpenChange={setIsDetailOpen} onDeleted={loadEvents} />
      </AdminLayout>
  );
}