import React, { useState, useEffect, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminLayout } from "../../components/Layout";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
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
  Printer,
  Search,
  Users,
  Eye,
  Check,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminEventDetailModal } from "./AdminEventDetailModal";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  // Modal State
  const [detailEventId, setDetailEventId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const printRef = useRef(null);
  const processedFilterRef = useRef(false);

  const safeParseInt = (value) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getVal = (obj, ...keys) => {
    if (!obj) return 0;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return safeParseInt(obj[key]);
      }
    }
    return 0;
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Danh_sach_su_kien_Admin_${new Date()
      .toISOString()
      .slice(0, 10)}`,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; font-family: 'Times New Roman', Times, serif; }
      }
    `,
  });

  // 1. Auto Filter từ Dashboard
  useEffect(() => {
    if (location.state?.filter && !processedFilterRef.current) {
      const filterType = location.state.filter;
      setFilterDate("all");
      setStatusFilter("all");
      if (filterType === "pending") setStatusFilter("pending");
      else if (filterType === "happening") setFilterDate("happening");
      else if (filterType === "completed") setFilterDate("ended");
      else if (filterType === "upcoming") setFilterDate("upcoming");
      processedFilterRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // 2. Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset về trang đầu khi tìm kiếm
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 3. Load Data khi Page hoặc Search thay đổi
  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearchTerm]);

  // 4. Tối ưu Danh mục (List chuẩn + Dynamic)
  const uniqueCategories = useMemo(() => {
    // Danh sách danh mục chuẩn, không thừa không thiếu
    const standardCategories = [
      "Môi trường",
      "Giáo dục",
      "Cộng đồng",
      "Y tế",
      "Văn hóa",
      "Trẻ em",
      "Người cao tuổi",
      "Cứu trợ",
      "Động vật",
    ];
    // Vẫn quét qua events hiện tại để bắt các danh mục lạ (nếu có)
    const currentCats = events
      .map((e) => e.category)
      .filter(Boolean)
      .map((c) => c.trim());

    // Merge và Sort
    return Array.from(new Set([...standardCategories, ...currentCats])).sort();
  }, [events]);

  // 5. Client-side Filter
  useEffect(() => {
    let result = events;

    if (filterCategory !== "all") {
      result = result.filter((e) => e.category === filterCategory);
    }

    const now = new Date();
    if (filterDate !== "all") {
      result = result.filter((e) => {
        const eventDate = new Date(e.date);
        // const endDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
        const endDate = new Date(eventDate);
        endDate.setHours(23, 59, 59, 999);

        if (filterDate === "upcoming") return eventDate > now;
        if (filterDate === "happening")
          return now >= eventDate && now <= endDate;
        if (filterDate === "ended") return now > endDate;
        return true;
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((e) => e.computedStatus === statusFilter);
    }

    setFilteredEvents(result);
  }, [events, filterCategory, filterDate, statusFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Gọi API với keyword đã debounce
      const response = await eventService.getEvents(
        debouncedSearchTerm,
        page,
        pageSize
      );

      let pageData = response;
      if (response && response.result) pageData = response.result;

      const rawEvents = Array.isArray(pageData.content) ? pageData.content : [];
      const now = new Date();

      const transformedEvents = rawEvents.map((event) => {
        const eventDate = new Date(event.date);
        // const endDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
        const endDate = new Date(eventDate);
        endDate.setHours(23, 59, 59, 999);

        const currentQty = getVal(
          event,
          "volunteersRegistered",
          "registeredCount",
          "currentVolunteers"
        );
        const maxQty = getVal(
          event,
          "volunteersNeeded",
          "maxVolunteers",
          "limit"
        );
        const isFull = maxQty > 0 && currentQty >= maxQty;

        let badgeLabel = "";
        let badgeClass = "";
        let computedStatus = event.status;

        if (event.status === "pending") {
          badgeLabel = "Chờ duyệt";
          badgeClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
          computedStatus = "pending";
        } else if (event.status === "rejected") {
          badgeLabel = "Đã từ chối";
          badgeClass = "bg-red-100 text-red-700 border-red-200";
          computedStatus = "rejected";
        } else if (event.status === "approved") {
          if (now > endDate) {
            badgeLabel = "Đã hoàn thành";
            badgeClass = "bg-gray-100 text-gray-600 border-gray-200";
            computedStatus = "completed";
          } else if (now >= eventDate && now <= endDate) {
            badgeLabel = "Đang diễn ra";
            badgeClass =
              "bg-green-500 text-white animate-pulse border-green-600";
            computedStatus = "happening";
          } else if (isFull) {
            badgeLabel = "Hết chỗ";
            badgeClass = "bg-red-500 text-white border-red-600";
            computedStatus = "upcoming";
          } else {
            badgeLabel = "Sắp diễn ra";
            badgeClass = "bg-primary/90 text-white border-primary";
            computedStatus = "upcoming";
          }
        }

        return {
          ...event,
          computedStatus,
          badgeLabel,
          badgeClass,
          displayDate: eventDate.toLocaleDateString("vi-VN"),
          displayTime: eventDate.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          finalCurrentQty: currentQty,
          finalMaxQtyDisplay: maxQty > 0 ? maxQty : "∞",
        };
      });

      setEvents(transformedEvents);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await eventService.approveEvent(eventId, "approved", "");
      await loadEvents();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleReject = async (eventId) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối sự kiện này?")) return;
    try {
      await eventService.rejectEvent(eventId, "");
      await loadEvents();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const openDetail = (eventId) => {
    setDetailEventId(eventId);
    setIsDetailOpen(true);
  };

  if (loading && page === 0 && events.length === 0)
    return (
      <AdminLayout>
        <div className="flex justify-center p-10">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="bg-gray-50/50 min-h-screen pb-12">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý sự kiện
              </h1>
              <p className="mt-1 text-gray-500">
                Tổng quan và kiểm duyệt các hoạt động
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-mono">
                  Total: {totalElements}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handlePrint}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <Printer className="h-4 w-4 mr-2" /> In danh sách
              </Button>
            </div>
          </div>

          {/* ✅ FILTER BAR (GIỐNG CODE CŨ CỦA BẠN 100%) */}
          <div className="bg-white p-4 rounded-xl border shadow-sm mb-8 sticky top-4 z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <Input
                  placeholder="Tìm kiếm tên, địa điểm..."
                  className="bg-gray-50 border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="md:col-span-7 grid grid-cols-3 gap-3">
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {uniqueCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thời gian</SelectItem>
                    <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                    <SelectItem value="happening">Đang diễn ra</SelectItem>
                    <SelectItem value="ended">Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ phê duyệt</SelectItem>
                    <SelectItem value="happening">Đang diễn ra</SelectItem>
                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    <SelectItem value="rejected">Đã từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* VÙNG IN / GRID CARDS */}
          <div ref={printRef}>
            <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4 pt-4">
              <h1 className="text-2xl font-bold uppercase">
                DANH SÁCH SỰ KIỆN HỆ THỐNG
              </h1>
              <p className="italic">
                Trang {page + 1}/{totalPages} - Ngày xuất:{" "}
                {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>

            {/* Grid Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:hidden">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed text-gray-500">
                  Không tìm thấy sự kiện nào phù hợp.
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="group overflow-hidden hover:shadow-lg transition-all flex flex-col h-full border-gray-200"
                  >
                    <div
                      className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer"
                      onClick={() => openDetail(event.id)}
                    >
                      <img
                        src={
                          event.image ||
                          "https://images.unsplash.com/photo-1559027615-cd4628902d4a"
                        }
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge
                          className={`shadow-sm border-none ${event.badgeClass}`}
                        >
                          {event.badgeLabel}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-0 backdrop-blur-sm text-[10px] font-bold"
                        >
                          {event.category || "Hoạt động"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h3
                        className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => openDetail(event.id)}
                      >
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          {event.displayDate}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />{" "}
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span className="text-gray-700 flex items-center gap-1">
                              <Users className="w-3 h-3" />{" "}
                              {event.finalCurrentQty} TNV
                            </span>
                            <span className="text-gray-400">
                              Mục tiêu: {event.finalMaxQtyDisplay}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                event.badgeLabel === "Hết chỗ"
                                  ? "bg-red-500"
                                  : "bg-primary"
                              }`}
                              style={{
                                width: `${
                                  event.finalMaxQtyDisplay > 0
                                    ? Math.min(
                                        (event.finalCurrentQty /
                                          event.finalMaxQtyDisplay) *
                                          100,
                                        100
                                      )
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 mt-auto border-t border-gray-50">
                      <div className="w-full grid grid-cols-2 gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(event.id)}
                          className="bg-white border-gray-200 hover:bg-gray-50 rounded-lg"
                        >
                          Chi tiết
                        </Button>
                        {event.computedStatus === "pending" ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm"
                            onClick={() => handleApprove(event.id)}
                          >
                            Duyệt
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 cursor-default hover:bg-transparent"
                          >
                            <FileText className="mr-1.5 h-3.5 w-3.5" /> Đã duyệt
                          </Button>
                        )}
                      </div>
                      {event.computedStatus === "pending" && (
                        <div className="w-full mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 rounded-lg"
                            onClick={() => handleReject(event.id)}
                          >
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>

            {/* Bảng in ấn */}
            <div className="hidden print:block w-full mt-8">
              <table className="w-full text-sm text-left border-collapse border border-black">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-black p-2 text-center">STT</th>
                    <th className="border border-black p-2">Tên sự kiện</th>
                    <th className="border border-black p-2">Thời gian</th>
                    <th className="border border-black p-2 text-center">TNV</th>
                    <th className="border border-black p-2 text-center">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((e, i) => (
                    <tr key={e.id}>
                      <td className="border border-black p-2 text-center">
                        {page * pageSize + i + 1}
                      </td>
                      <td className="border border-black p-2 font-bold">
                        {e.title}
                      </td>
                      <td className="border border-black p-2">
                        {e.displayDate}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {e.finalCurrentQty}/{e.finalMaxQtyDisplay}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {e.badgeLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 print:hidden">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Trước
              </Button>
              <span className="text-sm font-medium">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Tiếp <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <AdminEventDetailModal
        eventId={detailEventId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onDeleted={loadEvents}
      />
    </AdminLayout>
  );
}
