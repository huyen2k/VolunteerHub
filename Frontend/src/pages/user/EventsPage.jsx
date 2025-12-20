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
    Calendar, MapPin, Search, Star,
    CheckCircle2, History, Hourglass, Users
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function UserEventsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // --- STATE ---
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [displayEvents, setDisplayEvents] = useState([]);

    const [userStats, setUserStats] = useState({ totalRegistered: 0 });
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 12;

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const [filterCategory, setFilterCategory] = useState("all");
    const [filterDate, setFilterDate] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const processedFilterRef = useRef(false);

    const getVal = (obj, ...keys) => {
        if (!obj) return 0;
        for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null) {
                const parsed = parseInt(obj[key], 10);
                return isNaN(parsed) ? 0 : parsed;
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

    // Chuyển fetchUserData ra ngoài để có thể gọi lại sau khi Action thành công
    const fetchUserData = async () => {
        if (!user?.id) return;
        try {
            const [regs, stats] = await Promise.all([
                eventService.getUserEvents(user.id).catch(() => []),
                userService.getUserStats(user.id).catch(() => ({}))
            ]);
            setMyRegistrations(regs);
            setUserStats({ totalRegistered: getVal(stats, 'totalEventsRegistered', 'total_events_registered') });
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchUserData();
    }, [user?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const fetchEvents = async () => {
            if (filterStatus === 'registered') return;
            try {
                setLoading(true);
                const response = await eventService.getEvents(debouncedSearchTerm, page, pageSize);
                let pageData = response;
                if (response && response.result) pageData = response.result;
                const rawEvents = Array.isArray(pageData.content) ? pageData.content : [];
                setEvents(rawEvents);
                setTotalPages(pageData.totalPages || 0);
            } catch (err) {
                console.error(err);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [page, debouncedSearchTerm, filterStatus]);

    const uniqueCategories = useMemo(() => {
        const defaultCats = ["Môi trường", "Giáo dục", "Cộng đồng", "Y tế", "Văn hóa", "Thiện nguyện"];
        const currentCats = events.map(e => e.category).filter(Boolean).map(c => c.trim());
        return Array.from(new Set([...defaultCats, ...currentCats])).sort();
    }, [events]);

    useEffect(() => {
        let sourceList = [];
        if (filterStatus === 'registered') {
            sourceList = myRegistrations.map(reg => ({
                ...reg.event,
                isRegistered: true,
                registrationId: reg.id,
                registrationStatus: reg.status
            })).filter(e => e && e.id);
        } else {
            sourceList = events.map(ev => {
                const reg = myRegistrations.find(r => r.eventId === ev.id);
                return {
                    ...ev,
                    isRegistered: !!reg,
                    registrationId: reg?.id,
                    registrationStatus: reg?.status
                };
            });
        }

        let result = sourceList.filter(event => {
            if (!event.date) return true;
            const eventDate = new Date(event.date);
            const now = new Date();
            const endDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);


            if (filterCategory !== "all" && event.category !== filterCategory) return false;

            if (filterDate !== "all") {
                if (filterDate === "upcoming" && eventDate <= now) return false;
                if (filterDate === "happening" && (now < eventDate || now > endDate)) return false;
                if (filterDate === "ended" && now <= endDate) return false;
                if (filterDate === "this-week") {
                    const start = new Date(now); start.setDate(now.getDate() - now.getDay());
                    const end = new Date(start); end.setDate(start.getDate() + 6);
                    if (eventDate < start || eventDate > end) return false;
                }
            }

            if (filterStatus === 'registered' && debouncedSearchTerm) {
                const title = (event.title || "").toLowerCase();
                if (!title.includes(debouncedSearchTerm.toLowerCase())) return false;
            }
            return true;
        });

        setDisplayEvents(result);
    }, [events, myRegistrations, filterStatus, filterCategory, filterDate, debouncedSearchTerm]);


    // --- ACTIONS ---
    const handleRegisterClick = async (eventId) => {
        if (!user) return navigate("/login");
        if (window.confirm("Xác nhận đăng ký tham gia sự kiện này?")) {
            try {
                await eventService.registerForEvent(eventId);
                alert("Đăng ký thành công!");
                fetchUserData(); // Cập nhật lại data thay vì reload trang
            }
            catch (error) { alert("Lỗi: " + error.message); }
        }
    };

    const handleUnregisterClick = async (registrationId) => {
        if (window.confirm("Hủy đăng ký tham gia?")) {
            try {
                await eventService.cancelEventRegistration(registrationId);
                alert("Đã hủy.");
                fetchUserData();
            }
            catch (error) { alert("Lỗi: " + error.message); }
        }
    };

    // --- RENDER HELPERS (THẮT CHẶT LOGIC) ---
    const getStatusBadge = (event, isFull, isHappening, isEnded) => {
        if (event.isRegistered) {
            if (event.registrationStatus === "completed") return <Badge className="bg-purple-100 text-purple-700">Hoàn thành</Badge>;

            // Nếu đã được duyệt nhưng sự kiện đã kết thúc -> Chờ Manager confirm hoàn thành
            if (event.registrationStatus === "approved" && isEnded)
                return <Badge className="bg-blue-100 text-blue-700"><Hourglass className="w-3 h-3 mr-1"/> Đợi xác nhận hoàn thành</Badge>;

            if (event.registrationStatus === "approved") return <Badge className="bg-green-100 text-green-700">Đã xác nhận</Badge>;
            if (event.registrationStatus === "rejected") return <Badge className="bg-red-100 text-red-700">Bị từ chối</Badge>;
            return <Badge className="bg-yellow-100 text-yellow-700"><Hourglass className="w-3 h-3 mr-1"/> Chờ duyệt</Badge>;
        }
        if (isEnded) return <Badge variant="secondary">Đã kết thúc</Badge>;
        if (isHappening) return <Badge className="bg-green-500 text-white animate-pulse">Đang diễn ra</Badge>;
        if (isFull) return <Badge variant="destructive">Hết chỗ</Badge>;
        return <Badge className="bg-primary/90 text-white">Đang mở</Badge>;
    };

    const renderActionButton = (event, isFull, isHappening, isEnded, isUpcoming) => {
        // TRƯỜNG HỢP 1: CHƯA ĐĂNG KÝ
        if (!event.isRegistered) {
            if (isEnded) return <Button disabled variant="secondary" className="w-full">Đã kết thúc</Button>;
            if (isFull) return <Button disabled variant="secondary" className="w-full">Hết chỗ</Button>;
            // Cho phép đăng ký khi Sắp diễn ra HOẶC Đang diễn ra
            return <Button className="w-full" onClick={() => handleRegisterClick(event.id)}>Đăng ký tham gia</Button>;
        }

        // TRƯỜNG HỢP 2: ĐÃ ĐĂNG KÝ
        // Nếu đã hoàn thành hoặc bị từ chối -> Chỉ xem chi tiết
        if (event.registrationStatus === "completed" || event.registrationStatus === "rejected") {
            return <Button variant="outline" className="w-full border-gray-200" asChild><Link to={`/events/${event.id}`}>Xem lại</Link></Button>;
        }

        // LOGIC HỦY: Chỉ cho phép hủy nếu sự kiện CHƯA BẮT ĐẦU (Upcoming)
        if (isUpcoming) {
            return (
                <Button variant="destructive" className="w-full bg-red-50 text-red-600 hover:bg-red-100" onClick={() => handleUnregisterClick(event.registrationId)}>
                    Hủy tham gia
                </Button>
            );
        }

        // Nếu sự kiện đang diễn ra hoặc đã kết thúc nhưng User đã đăng ký -> Không được hủy nữa
        return <Button disabled variant="secondary" className="w-full">Đã tham gia</Button>;
    };

    return (
        <UserLayout>
            <div className="bg-gray-50/50 min-h-screen pb-12">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sự kiện tình nguyện</h1>
                            <p className="text-gray-500 mt-1">Khám phá và tham gia các hoạt động ý nghĩa.</p>
                        </div>
                        {user && (
                            <div className="flex gap-3 items-center">
                                <Button variant="outline" className="bg-white border-gray-200" asChild>
                                    <Link to="/history"><History className="w-4 h-4 mr-2"/> Lịch sử</Link>
                                </Button>
                                <Badge variant="outline" className="text-sm py-2 px-3 bg-white border-gray-200">
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600"/> {userStats.totalRegistered} đã tham gia
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-xl border shadow-sm mb-8 sticky top-4 z-10">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-5">
                                <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
                                <Input
                                    placeholder="Tìm kiếm sự kiện, địa điểm..."
                                    className="bg-gray-50 pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-7 grid grid-cols-3 gap-3">
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Danh mục"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                                        {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={filterDate} onValueChange={setFilterDate}>
                                    <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Thời gian"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả thời gian</SelectItem>
                                        <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                                        <SelectItem value="happening">Đang diễn ra</SelectItem>
                                        <SelectItem value="ended">Đã kết thúc</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Trạng thái"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả bài</SelectItem>
                                        <SelectItem value="registered">Đã đăng ký</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* List Events */}
                    {loading && displayEvents.length === 0 ? <div className="flex justify-center py-20"><LoadingSpinner /></div> :
                        displayEvents.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">Không tìm thấy sự kiện nào.</div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {displayEvents.map((event) => {
                                    const now = new Date();
                                    const eventDate = new Date(event.date);
                                    const isUpcoming = now < eventDate;
                                    const isEnded = now > new Date(eventDate.getTime() + 4 * 60 * 60 * 1000); // 4h duration
                                    const isHappening = !isUpcoming && !isEnded;

                                    const currentQty = getVal(event, 'volunteersRegistered', 'registeredCount', 'currentVolunteers');
                                    const maxQty = getVal(event, 'volunteersNeeded', 'maxVolunteers', 'limit');
                                    const isFull = maxQty > 0 && currentQty >= maxQty;

                                    return (
                                        <Card key={event.id} className="group overflow-hidden hover:shadow-lg transition-all flex flex-col h-full border-gray-200">
                                            <Link to={`/events/${event.id}`} className="block relative aspect-video bg-gray-100 overflow-hidden cursor-pointer">
                                                <img src={event.image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a"} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                                <div className="absolute top-3 right-3">{getStatusBadge(event, isFull, isHappening, isEnded)}</div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
                                                    <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">{event.category || 'Hoạt động'}</Badge>
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
                                                            <span className="font-medium text-gray-700 flex items-center gap-1"><Users className="w-3 h-3"/> {currentQty} tham gia</span>
                                                            <span className="text-gray-500">Mục tiêu: {maxQty > 0 ? maxQty : '∞'}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${maxQty > 0 ? Math.min((currentQty / maxQty) * 100, 100) : 0}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
                                                <Button variant="outline" className="w-full border-gray-200" asChild><Link to={`/events/${event.id}`}>Chi tiết</Link></Button>
                                                {renderActionButton(event, isFull, isHappening, isEnded, isUpcoming)}
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                    {filterStatus !== 'registered' && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Trước</Button>
                            <span className="text-sm font-medium">Trang {page + 1} / {totalPages}</span>
                            <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Tiếp</Button>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}