import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { ManagerLayout } from "../../components/Layout";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Calendar, MapPin, Plus, Printer, Users, Eye, FileText, ChevronLeft, ChevronRight, Search } from "lucide-react";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { ManagerEventDetailModal } from "./ManagerEventDetailModal";

export default function ManagerEventsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [allEvents, setAllEvents] = useState([]); // Chứa toàn bộ dữ liệu gốc
  const [filteredEvents, setFilteredEvents] = useState([]); // Dữ liệu sau khi lọc
  const [displayEvents, setDisplayEvents] = useState([]); // Dữ liệu hiển thị (phân trang)
  const [loading, setLoading] = useState(true);

  // Pagination State (Client-side)
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // Modal State
  const [detailId, setDetailId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const printRef = useRef(null);
  const processedFilterRef = useRef(false);

  // --- HELPER ---
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
    documentTitle: `Danh_sach_su_kien_${new Date().toISOString().slice(0, 10)}`,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; font-family: 'Times New Roman', Times, serif; }
      }
    `,
  });

  // 1. XỬ LÝ NHẬN FILTER TỪ DASHBOARD
  useEffect(() => {
    if (location.state?.filter && !processedFilterRef.current) {
      const filterType = location.state.filter;
      setFilterDate("all");
      setStatusFilter("all");

      if (filterType === 'upcoming') setFilterDate('upcoming');
      else if (filterType === 'happening') setFilterDate('happening');
      else if (filterType === 'ended') setFilterDate('ended');
      else if (filterType === 'pending') setStatusFilter('pending');
      else if (filterType === 'rejected') setStatusFilter('rejected');

      processedFilterRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // 2. LOAD DATA
  useEffect(() => { loadEvents(); }, []);

  // 3. TẠO DANH SÁCH DANH MỤC (Merge Default + Dynamic)
  const uniqueCategories = useMemo(() => {
    const defaultCats = [
      "Môi trường", "Giáo dục", "Cộng đồng", "Y tế", "Văn hóa",
      "Kỹ năng", "Thể thao", "Công nghệ", "Thiện nguyện"
    ];
    const eventCats = allEvents.map(e => e.category).filter(Boolean).map(c => c.trim());
    return Array.from(new Set([...defaultCats, ...eventCats])).sort();
  }, [allEvents]);

  // 4. LOGIC LỌC DỮ LIỆU (Client-side Filter)
  useEffect(() => {
    let result = allEvents;

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(lower) || e.location.toLowerCase().includes(lower));
    }
    // Category
    if (filterCategory !== "all") {
      result = result.filter(e => e.category === filterCategory);
    }
    // Date Logic
    const now = new Date();
    if (filterDate !== "all") {
      result = result.filter(e => {
        const eventDate = new Date(e.date);
        const endDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);

        if (filterDate === "upcoming") return eventDate > now;
        if (filterDate === "happening") return now >= eventDate && now <= endDate;
        if (filterDate === "ended") return now > endDate;
        if (filterDate === "this-week") {
          const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        }
        return true;
      });
    }
    // Status
    if (statusFilter !== "all") {
      result = result.filter(e => e.computedStatus === statusFilter);
    }

    setFilteredEvents(result);
    setPage(0); // Reset về trang 1 khi lọc lại
  }, [allEvents, searchTerm, statusFilter, filterCategory, filterDate]);

  // 5. LOGIC PHÂN TRANG (Client-side Pagination)
  useEffect(() => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayEvents(filteredEvents.slice(startIndex, endIndex));
  }, [page, filteredEvents]);


  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getMyEvents(); // API này trả về List, chưa phân trang
      const now = new Date();

      const transformed = (data || []).map((ev) => {
        const evDate = new Date(ev.date);
        const endDate = new Date(evDate.getTime() + 4 * 60 * 60 * 1000);

        const currentQty = getVal(ev, 'volunteersRegistered', 'registeredCount', 'currentVolunteers');
        const maxQty = getVal(ev, 'volunteersNeeded', 'maxVolunteers', 'limit');
        const isFull = maxQty > 0 && currentQty >= maxQty;

        // Logic Badge
        let badgeLabel = "";
        let badgeClass = "";
        let computedStatus = ev.status;

        if (ev.status === "pending") {
          badgeLabel = "Chờ duyệt";
          badgeClass = "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200";
          computedStatus = "pending";
        } else if (ev.status === "rejected") {
          badgeLabel = "Bị từ chối";
          badgeClass = "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
          computedStatus = "rejected";
        } else if (ev.status === "approved") {
          if (now > endDate) {
            badgeLabel = "Đã kết thúc";
            badgeClass = "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";
            computedStatus = "completed";
          } else if (now >= evDate && now <= endDate) {
            badgeLabel = "Đang diễn ra";
            badgeClass = "bg-green-500 text-white animate-pulse border-green-600";
            computedStatus = "happening";
          } else if (isFull) {
            badgeLabel = "Hết chỗ";
            badgeClass = "bg-red-500 text-white hover:bg-red-600 border-red-600";
            computedStatus = "upcoming";
          } else {
            badgeLabel = "Sắp diễn ra";
            badgeClass = "bg-primary/90 text-white hover:bg-primary border-primary";
            computedStatus = "upcoming";
          }
        }

        return {
          ...ev,
          computedStatus,
          badgeLabel,
          badgeClass,
          displayDate: evDate.toLocaleDateString("vi-VN"),
          displayTime: evDate.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
          realVolunteersCount: currentQty,
          maxVolunteersDisplay: maxQty > 0 ? maxQty : '∞'
        };
      });

      setAllEvents(transformed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

    } catch (err) { console.error("Load Events Error:", err); }
    finally { setLoading(false); }
  };

  const openDetailModal = (e, id) => {
    e.stopPropagation();
    setDetailId(id);
    setIsDetailOpen(true);
  };

  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  if (loading && allEvents.length === 0) return <ManagerLayout><div className="p-10 flex justify-center"><LoadingSpinner /></div></ManagerLayout>;

  return (
      <ManagerLayout>
        <div className="bg-gray-50/50 min-h-screen pb-12">
          <div className="container mx-auto px-4 py-8">

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý sự kiện</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Quản lý, theo dõi và báo cáo các sự kiện của bạn
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-mono">
                    Total: {filteredEvents.length}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate("/manager/events/create")}
                        className="bg-primary hover:bg-primary/90 shadow-sm"><Plus className="mr-2 h-4 w-4"/> Tạo mới</Button>
                <Button onClick={handlePrint}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Printer className="mr-2 h-4 w-4"/> In danh sách</Button>
              </div>
            </div>

            {/* FILTER BA */}
            <div className="bg-white p-4 rounded-xl border shadow-sm mb-8 sticky top-4 z-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 relative">
                  <Input
                      placeholder="Tìm kiếm tên, địa điểm..."
                      className="bg-gray-50 border-gray-200"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="md:col-span-7 grid grid-cols-3 gap-3">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="bg-gray-50 border-gray-200"><SelectValue placeholder="Danh mục"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {uniqueCategories.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterDate} onValueChange={setFilterDate}>
                    <SelectTrigger className="bg-gray-50 border-gray-200"><SelectValue placeholder="Thời gian"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả thời gian</SelectItem>
                      <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                      <SelectItem value="happening">Đang diễn ra</SelectItem>
                      <SelectItem value="ended">Đã kết thúc</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-50 border-gray-200"><SelectValue placeholder="Trạng thái"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="happening">Đang diễn ra</SelectItem>
                      <SelectItem value="completed">Đã hoàn thành</SelectItem>
                      <SelectItem value="rejected">Bị từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* VÙNG IN */}
            <div ref={printRef}>
              <div className="hidden print:block p-10 bg-white text-black text-sm"
                   style={{fontFamily: '"Times New Roman", Times, serif'}}>
                <div className="text-center mb-8 border-b-2 border-black pb-4 pt-4">
                  <h1 className="text-2xl font-bold uppercase">DANH SÁCH SỰ KIỆN CỦA TÔI</h1>
                  <p className="italic">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
                </div>
                <table className="w-full text-sm text-left border-collapse border border-black">
                  <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-black p-2 w-10 text-center">STT</th>
                    <th className="border border-black p-2">Tên sự kiện</th>
                    <th className="border border-black p-2">Thời gian</th>
                    <th className="border border-black p-2">Địa điểm</th>
                    <th className="border border-black p-2 text-center">Số TNV</th>
                    <th className="border border-black p-2 text-center">Trạng thái</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredEvents.map((ev, idx) => (
                      <tr key={ev.id}>
                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                        <td className="border border-black p-2 font-bold">{ev.title}</td>
                        <td className="border border-black p-2">{ev.displayDate} <br/> {ev.displayTime}</td>
                        <td className="border border-black p-2">{ev.location}</td>
                        <td className="border border-black p-2 text-center">{ev.realVolunteersCount} / {ev.maxVolunteersDisplay}</td>
                        <td className="border border-black p-2 text-center">{ev.badgeLabel}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              {/* Grid Cards (Hiển thị displayEvents đã phân trang) */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:hidden">
                {displayEvents.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed text-gray-500">
                      Không tìm thấy sự kiện nào phù hợp.
                    </div>
                ) : (
                    displayEvents.map(ev => (
                        <Card key={ev.id}
                              className="group overflow-hidden hover:shadow-lg transition-all flex flex-col h-full border-gray-200">

                          <div className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer"
                               onClick={(e) => openDetailModal(e, ev.id)}>
                            <img
                                src={ev.image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=300"}
                                alt={ev.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            <div className="absolute top-3 right-3">
                              <Badge className={`shadow-sm border ${ev.badgeClass}`}>
                                {ev.badgeLabel}
                              </Badge>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
                              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm text-xs">
                                {ev.category || 'Hoạt động'}
                              </Badge>
                            </div>
                          </div>

                          <CardContent className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-primary transition-colors cursor-pointer"
                                onClick={(e) => openDetailModal(e, ev.id)}>
                              {ev.title}
                            </h3>

                            <div className="space-y-2 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500"/>{ev.displayDate} - {ev.displayTime}</div>
                              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500"/> <span className="line-clamp-1">{ev.location}</span></div>

                              <div className="pt-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-gray-700 flex items-center gap-1">
                                        <Users className="w-3 h-3"/> {ev.realVolunteersCount} đã tham gia
                                    </span>
                                  <span className="text-gray-500">Mục tiêu: {ev.maxVolunteersDisplay}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                      className={`h-full rounded-full transition-all duration-500 ${ev.badgeLabel === 'Hết chỗ' ? 'bg-red-500' : 'bg-primary'}`}
                                      style={{ width: `${ev.maxVolunteersDisplay > 0 ? Math.min((ev.realVolunteersCount / ev.maxVolunteersDisplay) * 100, 100) : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="p-4 pt-0 mt-auto border-t border-gray-50 bg-gray-50/50">
                            <div className="w-full grid grid-cols-2 gap-2 mt-4">
                              <Button variant="outline" size="sm" onClick={(e) => openDetailModal(e, ev.id)}
                                      className="bg-white border-gray-200 hover:bg-gray-100 hover:text-primary">
                                <Eye className="mr-1.5 h-3.5 w-3.5"/> Xem nhanh
                              </Button>
                              <Button size="sm" onClick={() => navigate(`/manager/events/${ev.id}`)}
                                      className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary shadow-sm">
                                <FileText className="mr-1.5 h-3.5 w-3.5"/> Chi tiết
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                    ))
                )}
              </div>

              {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8 print:hidden">
                    <Button
                        variant="outline"
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                    </Button>
                    <span className="text-sm font-medium">
                          Trang {page + 1} / {totalPages}
                      </span>
                    <Button
                        variant="outline"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                    >
                      Tiếp <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
              )}

            </div>
          </div>
        </div>
        <ManagerEventDetailModal eventId={detailId} open={isDetailOpen} onOpenChange={setIsDetailOpen}
                                 onUpdate={loadEvents}/>
      </ManagerLayout>
  );
}