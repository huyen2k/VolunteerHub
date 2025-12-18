import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { UserLayout } from "../../components/Layout";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import userService from "../../services/userService";
import {
    Calendar, MapPin, Search, Star, AlertCircle,
    Clock, CheckCircle2, XCircle, ArrowRight, Filter, Users, History, Hourglass
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function UserEventsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterDate, setFilterDate] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const [displayEvents, setDisplayEvents] = useState([]);
    const [userStats, setUserStats] = useState({ totalRegistered: 0, completed: 0, upcoming: 0, totalHours: 0, totalPoints: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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

    useEffect(() => {
        if (location.state?.filter && !processedFilterRef.current) {
            const filterType = location.state.filter;
            if (filterType === 'upcoming') setFilterDate('upcoming');
            else if (filterType === 'registered') setFilterStatus('registered');
            else if (filterType === 'happening') setFilterDate('happening');
            processedFilterRef.current = true;
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    // --- LOAD DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [publicEventsRaw, userRegistrations, statsData] = await Promise.all([
                    eventService.getEvents().catch(() => []),
                    user?.id ? eventService.getUserEvents(user.id).catch(() => []) : Promise.resolve([]),
                    user?.id ? userService.getUserStats(user.id).catch(() => ({})) : Promise.resolve({}),
                ]);

                const finalEvents = publicEventsRaw.map(event => {
                    const userRegistration = (userRegistrations || []).find(reg => reg.eventId === event.id);

                    return {
                        ...event,
                        isRegistered: !!userRegistration,
                        registrationId: userRegistration?.id,
                        registrationStatus: userRegistration?.status,

                        currentVolunteers: getVal(event, 'volunteersRegistered', 'registeredCount', 'currentVolunteers'),
                        maxVolunteers: getVal(event, 'volunteersNeeded', 'maxVolunteers', 'limit')
                    };
                });

                setDisplayEvents(finalEvents);

                setUserStats({
                    totalRegistered: getVal(statsData, 'totalEventsRegistered', 'total_events_registered'),
                    completed: getVal(statsData, 'completedEvents', 'completed_events'),
                    upcoming: getVal(statsData, 'upcomingEvents', 'upcoming_events'),
                    totalHours: getVal(statsData, 'totalHours', 'total_hours'),
                    totalPoints: getVal(statsData, 'totalPoints', 'total_points'),
                });

            } catch (err) {
                console.error("Load Error:", err);
                setError("Có lỗi khi tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    const uniqueCategories = useMemo(() => {
        const defaultCats = ["Môi trường", "Giáo dục", "Cộng đồng", "Y tế", "Văn hóa"];
        const eventCats = displayEvents.map(e => e.category).filter(Boolean);
        const cleanedCats = eventCats.map(c => c.trim()); // Xóa khoảng trắng thừa

        // Gộp default + cate mới, dùng Set để unique, sau đó sort
        return Array.from(new Set([...defaultCats, ...cleanedCats])).sort();
    }, [displayEvents]);

    // --- FILTERING LOGIC ---
    const filteredEvents = displayEvents.filter((event) => {
        const title = (event.title || "").toLowerCase();
        const matchesSearch = title.includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || event.category === filterCategory;

        const eventDate = event.date ? new Date(event.date) : null;
        const now = new Date();
        const endDate = eventDate ? new Date(eventDate.getTime() + 4 * 60 * 60 * 1000) : null;

        const isThisWeek = (d) => {
            const start = new Date(now); start.setDate(now.getDate() - now.getDay());
            const end = new Date(start); end.setDate(start.getDate() + 6);
            return d >= start && d <= end;
        };

        let matchesDate = true;
        if (filterDate !== "all" && eventDate) {
            if (filterDate === "upcoming") matchesDate = eventDate > now;
            else if (filterDate === "happening") matchesDate = now >= eventDate && now <= endDate;
            else if (filterDate === "ended") matchesDate = now > endDate;
            else if (filterDate === "this-week") matchesDate = isThisWeek(eventDate);
        }

        let matchesStatus = true;
        if (filterStatus !== "all") {
            if (filterStatus === "registered") matchesStatus = event.isRegistered;
            else if (filterStatus === "completed") matchesStatus = event.registrationStatus === "completed";
            else if (filterStatus === "available") matchesStatus = !event.isRegistered && event.status === "approved";
        }

        const isVisible = (event.status !== 'rejected' && event.status !== 'cancelled') || event.isRegistered;

        return matchesSearch && matchesCategory && matchesDate && matchesStatus && isVisible;
    });

    const handleRegisterClick = async (eventId) => {
        if (!user) return navigate("/login");
        if (confirm("Xác nhận đăng ký tham gia sự kiện này?")) {
            try { await eventService.registerForEvent(eventId); alert("Gửi yêu cầu thành công! Vui lòng chờ duyệt."); window.location.reload(); } catch (error) { alert("Lỗi: " + error.message); }
        }
    };

    const handleUnregisterClick = async (registrationId) => {
        if (!confirm("Bạn có chắc muốn hủy đăng ký/yêu cầu này?")) return;
        try { await eventService.cancelEventRegistration(registrationId); alert("Đã hủy thành công."); window.location.reload(); } catch (error) { alert("Lỗi: " + error.message); }
    };

    const getStatusBadge = (event, isFull, isHappening, isEnded) => {
        if (event.isRegistered) {
            if (event.registrationStatus === "completed") return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Đã hoàn thành</Badge>;
            if (event.registrationStatus === "approved") return <Badge className="bg-green-100 text-green-700 border-green-200">Đã tham gia</Badge>;
            if (event.registrationStatus === "rejected") return <Badge className="bg-red-100 text-red-700 border-red-200">Bị từ chối</Badge>;
            if (event.registrationStatus === "pending" && isEnded) return <Badge variant="secondary">Hết hạn duyệt</Badge>;
            return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Hourglass className="w-3 h-3 mr-1"/> Chờ duyệt</Badge>;
        }

        if (isEnded) return <Badge variant="secondary">Đã kết thúc</Badge>;
        if (isHappening) return <Badge className="bg-green-500 text-white animate-pulse">Đang diễn ra</Badge>;
        if (isFull) return <Badge variant="destructive">Hết chỗ</Badge>;
        return <Badge className="bg-primary/90 text-white hover:bg-primary">Đang mở</Badge>;
    };

    const renderActionButton = (event, isFull, isHappening, isEnded) => {
        if (!event.isRegistered) {
            if (isEnded) return <Button disabled variant="secondary" className="w-full">Đã kết thúc</Button>;
            if (isHappening) return <Button disabled variant="secondary" className="w-full">Đang diễn ra</Button>;
            if (isFull) return <Button disabled variant="secondary" className="w-full">Hết chỗ</Button>;
            return <Button className="w-full shadow-sm hover:shadow-md transition-all" onClick={() => handleRegisterClick(event.id)}>Đăng ký tham gia</Button>;
        }

        if (event.registrationStatus === "completed") {
            return <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" disabled><Star className="w-4 h-4 mr-2"/> Đã hoàn thành</Button>;
        }
        if (event.registrationStatus === "rejected") {
            return <Button disabled variant="secondary" className="w-full bg-red-50 text-red-500">Bị từ chối</Button>;
        }
        if (isHappening) {
            return <Button disabled variant="outline" className="w-full text-green-600 bg-green-50 border-green-200">Đang diễn ra...</Button>;
        }
        if (isEnded) {
            if (event.registrationStatus === 'approved') return <Button disabled variant="outline" className="w-full text-gray-500">Chờ xác nhận</Button>;
            if (event.registrationStatus === 'pending') return <Button disabled variant="outline" className="w-full text-gray-400">Hết hạn duyệt</Button>;
        }
        return (
            <Button
                variant="destructive"
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200 border"
                onClick={() => handleUnregisterClick(event.registrationId)}
            >
                {event.registrationStatus === 'pending' ? "Hủy yêu cầu" : "Hủy tham gia"}
            </Button>
        );
    };

    return (
        <UserLayout>
            <div className="bg-gray-50/50 min-h-screen pb-12">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

                    {/* HEADER */}
                    <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sự kiện tình nguyện</h1>
                            <p className="text-gray-500 mt-1">Khám phá và tham gia các hoạt động ý nghĩa ngay hôm nay.</p>
                        </div>

                        {user && (
                            <div className="flex gap-3 items-center">
                                <Button variant="outline" className="bg-white border-gray-200 shadow-sm hover:bg-gray-50" asChild>
                                    <Link to="/history">
                                        <History className="w-4 h-4 mr-2 text-gray-600"/>
                                        Lịch sử hoạt động
                                    </Link>
                                </Button>

                                <Badge variant="outline" className="text-sm py-2 px-3 bg-white shadow-sm border-gray-200">
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600"/>
                                    {userStats.totalRegistered} đã tham gia
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* FILTER BAR */}
                    <div className="bg-white p-4 rounded-xl border shadow-sm mb-8 sticky top-4 z-10">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-5"><Input placeholder="Tìm kiếm sự kiện, địa điểm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-gray-50"/></div>
                            <div className="md:col-span-7 grid grid-cols-3 gap-3">

                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Danh mục"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                                        {uniqueCategories.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filterDate} onValueChange={setFilterDate}>
                                    <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Thời gian"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả thời gian</SelectItem>
                                        <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                                        <SelectItem value="happening">Đang diễn ra</SelectItem>
                                        <SelectItem value="this-week">Trong tuần này</SelectItem>
                                        <SelectItem value="ended">Đã kết thúc</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Trạng thái"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="registered">Đã đăng ký</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        </div>
                    </div>

                    {/* LIST EVENTS */}
                    {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> :
                        filteredEvents.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                                <div className="text-gray-400 mb-2">Không tìm thấy sự kiện nào phù hợp.</div>
                                <Button variant="link" onClick={() => {setSearchTerm(""); setFilterCategory("all"); setFilterDate("all"); setFilterStatus("all");}}>Xóa bộ lọc</Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredEvents.map((event) => {
                                    const now = new Date();
                                    const eventDate = new Date(event.date);
                                    const isUpcoming = now < eventDate;
                                    const isEnded = now > new Date(eventDate.getTime() + 14400000); // 4 hours duration
                                    const isHappening = !isUpcoming && !isEnded;

                                    const currentQty = event.currentVolunteers;
                                    const maxQty = event.maxVolunteers;
                                    const isFull = maxQty > 0 && currentQty >= maxQty;

                                    return (
                                        <Card key={event.id} className="group overflow-hidden hover:shadow-lg transition-all flex flex-col h-full border-gray-200">

                                            <Link to={`/events/${event.id}`} className="block relative aspect-video bg-gray-100 overflow-hidden cursor-pointer">
                                                <img
                                                    src={event.image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a"}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 right-3">{getStatusBadge(event, isFull, isHappening, isEnded)}</div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
                                                    <div className="text-white text-xs font-medium flex items-center gap-1">
                                                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                                            {event.category || 'Hoạt động'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Link>

                                            <CardContent className="p-5 flex-1 flex flex-col">
                                                <Link to={`/events/${event.id}`} className="hover:underline">
                                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-primary transition-colors">{event.title}</h3>
                                                </Link>

                                                <div className="space-y-2 text-sm text-gray-600 mt-1">
                                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500"/>{new Date(event.date).toLocaleDateString("vi-VN")}</div>
                                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500"/> <span className="line-clamp-1">{event.location}</span></div>

                                                    <div className="pt-2">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="font-medium text-gray-700 flex items-center gap-1"><Users className="w-3 h-3"/> {currentQty} đã tham gia</span>
                                                            <span className="text-gray-500">Mục tiêu: {maxQty > 0 ? maxQty : '∞'}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-primary'}`}
                                                                style={{ width: `${maxQty > 0 ? Math.min((currentQty / maxQty) * 100, 100) : 0}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>

                                            <CardFooter className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
                                                <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50 hover:text-primary" asChild>
                                                    <Link to={`/events/${event.id}`}>Chi tiết</Link>
                                                </Button>
                                                {renderActionButton(event, isFull, isHappening, isEnded)}
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                </div>
            </div>
        </UserLayout>
    );
}