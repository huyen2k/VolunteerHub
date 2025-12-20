import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ManagerLayout } from "../../components/Layout";
import {
    Calendar, Users, Clock, TrendingUp, MessageSquare, Plus, Sparkles, PlayCircle, ArrowRight, ThumbsUp
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import postService from "../../services/postService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ManagerDashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [stats, setStats] = useState({
        total: 0, approved: 0, pending: 0, upcoming: 0, happening: 0, completed: 0, totalVolunteers: 0, newVolunteersMonth: 0,
    });

    const [newlyPublishedEvents, setNewlyPublishedEvents] = useState([]);
    const [eventsWithNewPosts, setEventsWithNewPosts] = useState([]);
    const [attractiveEvents, setAttractiveEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxAttractiveScore, setMaxAttractiveScore] = useState(1);

    useEffect(() => {
        if (user?.id) loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // 1. GỌI API
            const [statsData, managerEvents, hotPosts] = await Promise.all([
                eventService.getManagerDashboardStats().catch(() => null),
                eventService.getMyEvents().catch(() => []),
                postService.getHotPosts().catch(() => [])
            ]);

            // 2. CẬP NHẬT STATS
            if (statsData) {
                const totalVols = managerEvents.reduce((acc, ev) => acc + (ev.volunteersRegistered || 0), 0);

                setStats({
                    total: statsData.totalEvents || 0,
                    approved: (statsData.totalEvents || 0) - (statsData.pendingEvents || 0),
                    pending: statsData.pendingEvents || 0,
                    upcoming: statsData.upcomingEvents || 0,
                    happening: statsData.happeningEvents || 0,
                    completed: statsData.completedEvents || 0,
                    totalVolunteers: totalVols,
                    newVolunteersMonth: 0
                });
            }

            // 3. XỬ LÝ LIST HIỂN THỊ
            const approvedEvents = managerEvents.filter(e => e.status === 'approved');

            // --- LOGIC MỚI CÔNG BỐ (GIỮ NGUYÊN LOGIC, CHỈ SỬA UI BÊN DƯỚI) ---
            setNewlyPublishedEvents(approvedEvents
                .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
            );

            // --- SỰ KIỆN THU HÚT ---
            const attractiveList = approvedEvents.map(ev => ({
                ...ev,
                score: ((ev.volunteersRegistered || 0) * 3) + ((ev.comments || 0) * 1),
                totalVolunteers: ev.volunteersRegistered || 0,
                totalPosts: ev.comments || 0
            })).sort((a,b) => b.score - a.score).slice(0, 5);

            setAttractiveEvents(attractiveList);
            setMaxAttractiveScore(attractiveList.length > 0 ? Math.max(...attractiveList.map(e => e.score), 1) : 1);

            // --- THẢO LUẬN NỔI BẬT ---
            const discussions = hotPosts.map(p => ({
                id: p.channelId,
                title: "Thảo luận cộng đồng",
                latestPostTitle: p.content,
                latestPostAuthor: p.authorName,
                latestPostDate: p.createdAt,
                likesCount: p.likesCount,
                commentsCount: p.commentsCount,
                isGlobal: !p.eventId
            }));
            setEventsWithNewPosts(discussions);

        } catch (err) {
            console.error("Dashboard Loading Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const navigateToEvents = (filterType) => {
        navigate("/manager/events", { state: { filter: filterType } });
    };

    const handleDiscussionClick = (item) => {
        navigate(`/manager/community`);
    };

    if (loading) return <ManagerLayout><div className="flex justify-center p-20"><LoadingSpinner /></div></ManagerLayout>;

    return (
        <ManagerLayout>
            <div className="bg-muted/30 min-h-screen">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Quản lý</h1>
                            <p className="mt-1 text-muted-foreground">Tổng quan hoạt động và hiệu suất sự kiện của bạn</p>
                        </div>
                        <Button asChild className="bg-primary hover:bg-primary/90 shadow-md transition-all">
                            <Link to="/manager/events/create"><Plus className="mr-2 h-4 w-4"/> Tạo sự kiện mới</Link>
                        </Button>
                    </div>

                    {/* STATS CARDS */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-600 hover:-translate-y-1 bg-white" onClick={() => navigate("/manager/events")}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Tổng sự kiện</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
                                        <div className="mt-1 flex items-center text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                                            <Calendar className="h-3 w-3 mr-1" /> Tất cả sự kiện
                                        </div>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Calendar className="h-6 w-6" /></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-orange-500 hover:-translate-y-1 bg-white" onClick={() => navigateToEvents("happening")}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Đang diễn ra</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.happening}</p>
                                        <div className="mt-1 flex items-center text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full w-fit"><PlayCircle className="h-3 w-3 mr-1" /> Cần theo dõi</div>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600"><PlayCircle className="h-6 w-6" /></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-green-500 hover:-translate-y-1 bg-white" onClick={() => navigateToEvents("upcoming")}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Sắp diễn ra</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                                        <div className="mt-1 flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full w-fit"><Clock className="h-3 w-3 mr-1" /> Chuẩn bị kỹ</div>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"><Clock className="h-6 w-6" /></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-purple-600 hover:-translate-y-1 bg-white" onClick={() => navigate("/manager/volunteers")}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Tổng lượt đăng ký</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalVolunteers}</p>
                                        <div className="mt-1 flex items-center text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full w-fit"><Users className="h-3 w-3 mr-1" /> Tất cả sự kiện</div>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600"><Users className="h-6 w-6" /></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Cột chính */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* 1. Mới công bố - ĐÃ SỬA GIAO DIỆN THEO HÌNH */}
                            <div>
                                <div className="flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-yellow-500"/><h2 className="text-lg font-bold text-gray-800">Sự kiện mới công bố</h2></div>
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-0">
                                        {newlyPublishedEvents.length > 0 ? (
                                            <div className="divide-y">
                                                {newlyPublishedEvents.map(ev => (
                                                    <div
                                                        key={ev.id}
                                                        className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                                                        onClick={() => navigate(`/manager/events/${ev.id}`)}
                                                    >
                                                        {/* Phần nội dung bên trái */}
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 px-2.5 py-0.5 text-xs font-normal rounded-full">
                                                                    Mới
                                                                </Badge>
                                                                <h4 className="font-semibold text-gray-900 line-clamp-1">{ev.title}</h4>
                                                            </div>

                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground pl-1">
                                      <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                          {new Date(ev.date).toLocaleDateString("vi-VN")}
                                      </span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-300" />
                                                                <span className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" />
                                                                    {ev.location}
                                      </span>
                                                            </div>
                                                        </div>

                                                        {/* Mũi tên bên phải */}
                                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (<div className="text-center py-12"><Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-3" /><p className="text-muted-foreground">Chưa có sự kiện nào được duyệt.</p></div>)}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* 2. Thảo luận nổi bật */}
                            <div>
                                <div className="flex items-center gap-2 mb-4"><MessageSquare className="h-5 w-5 text-blue-500"/><h2 className="text-lg font-bold text-gray-800">Thảo luận nổi bật</h2></div>
                                <div className="space-y-3">
                                    {eventsWithNewPosts.length > 0 ? eventsWithNewPosts.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100/50 transition-colors group" onClick={() => handleDiscussionClick(item)}>
                                            <div className="overflow-hidden mr-4">
                                                <h4 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-700 transition-colors">{item.latestPostTitle}</h4>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span className="font-medium text-blue-600">{item.latestPostAuthor}</span><span className="w-1 h-1 rounded-full bg-gray-300"></span><span className="truncate max-w-[150px] font-medium text-gray-700">{item.title}</span>
                                                    {(item.likesCount > 0 || item.commentsCount > 0) && (<><span className="w-1 h-1 rounded-full bg-gray-300"></span><span className="flex items-center text-blue-600 font-semibold"><ThumbsUp className="h-3 w-3 mr-1"/> {item.likesCount} <MessageSquare className="h-3 w-3 ml-2 mr-1"/> {item.commentsCount}</span></>)}
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span><span>{item.latestPostDate ? new Date(item.latestPostDate).toLocaleDateString("vi-VN") : 'Vừa xong'}</span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-blue-600 shrink-0 hover:text-blue-700 hover:bg-white/50 rounded-full"><ArrowRight className="h-4 w-4"/></Button>
                                        </div>
                                    )) : (<div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200"><p className="text-muted-foreground">Chưa có bài thảo luận nổi bật nào.</p></div>)}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="h-full border-none shadow-sm sticky top-6">
                                <CardHeader className="pb-3 border-b bg-gray-50/50"><CardTitle className="flex items-center gap-2 text-base font-bold"><TrendingUp className="h-5 w-5 text-purple-600"/> Top sự kiện thu hút</CardTitle></CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    {attractiveEvents.length > 0 ? attractiveEvents.map((ev, idx) => (
                                        <div key={ev.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0 cursor-pointer group" onClick={() => navigate(`/manager/events/${ev.id}`)}>
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-xs ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>#{idx + 1}</div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm line-clamp-1 hover:text-primary cursor-pointer transition-colors">{ev.title}</h4>
                                                <div className="flex justify-between mt-1 text-xs text-muted-foreground"><span>{ev.totalVolunteers} TNV</span><span>{ev.totalPosts} bài viết</span></div>
                                                <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((ev.score / maxAttractiveScore) * 100, 100)}%`, minWidth: '5%' }}/></div>
                                            </div>
                                        </div>
                                    )) : (<div className="text-center py-10"><TrendingUp className="h-10 w-10 text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400">Chưa có đủ dữ liệu xếp hạng</p></div>)}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ManagerLayout>
    );
}