import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { AdminLayout } from "../../components/Layout";
import {
  Users, Calendar, Clock, CheckCircle2, Shield, TrendingUp,
  Download, Printer, MessageSquare, ArrowRight, Globe, ThumbsUp
} from "lucide-react";
import statisticsService from "../../services/statisticsService";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { AdminEventDetailModal } from "./AdminEventDetailModal";
import channelService from "../../services/channelService";
import postService from "../../services/postService";
import userService from "../../services/userService";
import registrationService from "../../services/registrationService";

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userStats, setUserStats] = useState(null);
  const [overviewStats, setOverviewStats] = useState(null);

  const [pendingEvents, setPendingEvents] = useState([]);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [attractiveEvents, setAttractiveEvents] = useState([]);
  const [maxAttractiveScore, setMaxAttractiveScore] = useState(1);

  // Modal State
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [summary, setSummary] = useState({
    totalUsers: 0, totalVolunteers: 0,
    totalEvents: 0, upcomingEvents: 0,
    totalPosts: 0, newPostsToday: 0,
    pendingEvents: 0, activeUsers: 0
  });

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Danh_sach_cho_duyet_${new Date().toISOString().slice(0,10)}`,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const calculatePostHotScore = (post) => {
    // Logic: 1 Comment = 2 điểm, 1 Like = 1 điểm
    const comments = post.commentsCount || post.comments?.length || 0;
    const likes = post.likesCount || post.likes?.length || 0;
    return (comments * 2) + likes;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [userStatsData, overviewData, allEvents, allUsers] = await Promise.all([
        statisticsService.getUserStatistics(),
        statisticsService.getOverviewStatistics(),
        eventService.getEventsForAdmin(),
        userService.getUsers().catch(() => [])
      ]);

      setUserStats(userStatsData);
      setOverviewStats(overviewData);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // --- 1. PHÂN LOẠI SỰ KIỆN ---
      let s_pending = 0, s_upcoming = 0;
      const pendingList = [];
      const approvedList = [];

      (allEvents || []).forEach(ev => {
        const evDate = new Date(ev.date || ev.createdAt);
        evDate.setHours(0, 0, 0, 0);

        if (ev.status === 'pending') {
          s_pending++;
          pendingList.push({
            id: ev.id,
            title: ev.title || "Chưa có tiêu đề",
            date: new Date(ev.createdAt).toLocaleDateString("vi-VN"),
            location: ev.location || "Chưa cập nhật",
            status: 'pending'
          });
        } else if (ev.status === 'approved') {
          approvedList.push(ev);
          if (evDate > now) s_upcoming++;
        }
      });

      // --- 2. CHUẨN BỊ DỮ LIỆU ---
      const regPromises = approvedList.map(ev =>
          registrationService.getRegistrationsByEvent(ev.id).catch(() => [])
      );
      const allRegistrationsLists = await Promise.all(regPromises);
      const regsMap = {};
      approvedList.forEach((ev, idx) => { regsMap[ev.id] = allRegistrationsLists[idx]; });

      const attractiveList = [];
      const activeDiscussions = [];
      let totalPostsCount = 0;
      let newPostsTodayCount = 0;

      // --- 3. XỬ LÝ GLOBAL FEED (Tính điểm Hot) ---
      try {
        const channels = await channelService.getChannels().catch(() => []);
        const globalChannel = channels.find(c => c.eventId === "GLOBAL_FEED");

        if (globalChannel) {
          const globalPosts = await postService.getPostsByChannel(globalChannel.id).catch(() => []);
          totalPostsCount += globalPosts.length;

          globalPosts.forEach(p => {
            if (new Date(p.createdAt).toDateString() === now.toDateString()) newPostsTodayCount++;
          });

          // Lọc bài trong 30 ngày
          const recentGlobalPosts = globalPosts.filter(p => new Date(p.createdAt) >= new Date(Date.now() - 30 * 86400000));

          if (recentGlobalPosts.length > 0) {
            recentGlobalPosts.sort((a, b) => calculatePostHotScore(b) - calculatePostHotScore(a));
            const hottestPost = recentGlobalPosts[0];

            activeDiscussions.push({
              id: "global",
              title: "Cộng đồng chung",
              latestPostTitle: hottestPost.title || hottestPost.content,
              latestPostAuthor: hottestPost.authorName || 'Thành viên',
              latestPostDate: hottestPost.createdAt,
              latestPostId: hottestPost.id,
              // Lưu điểm để sort tổng thể
              hotScore: calculatePostHotScore(hottestPost),
              likesCount: hottestPost.likesCount || hottestPost.likes?.length || 0,
              commentsCount: hottestPost.commentsCount || hottestPost.comments?.length || 0,
              isGlobal: true
            });
          }
        }
      } catch (e) { console.warn("Lỗi Global Feed:", e); }

      // --- 4. XỬ LÝ SỰ KIỆN (Events) - Tính điểm Hot ---
      const eventsToScan = approvedList; // Quét toàn bộ

      await Promise.all(eventsToScan.map(async (ev) => {
        try {
          const regs = regsMap[ev.id] || [];
          let posts = [];

          try {
            const channel = await channelService.getChannelByEventId(ev.id);
            if (channel) {
              posts = await postService.getPostsByChannel(channel.id);
              totalPostsCount += posts.length;
              posts.forEach(p => {
                if (new Date(p.createdAt).toDateString() === now.toDateString()) newPostsTodayCount++;
              });
            }
          } catch {}

          // Lọc bài trong 30 ngày
          const recentPosts = posts.filter(p => new Date(p.createdAt) >= new Date(Date.now() - 30 * 86400000));

          if (recentPosts.length > 0) {
            recentPosts.sort((a, b) => calculatePostHotScore(b) - calculatePostHotScore(a));
            const hottestPost = recentPosts[0];

            activeDiscussions.push({
              ...ev,
              latestPostTitle: hottestPost.title || hottestPost.content,
              latestPostAuthor: hottestPost.authorName || 'Thành viên',
              latestPostDate: hottestPost.createdAt,
              latestPostId: hottestPost.id,
              // Lưu điểm
              hotScore: calculatePostHotScore(hottestPost),
              likesCount: hottestPost.likesCount || hottestPost.likes?.length || 0,
              commentsCount: hottestPost.commentsCount || hottestPost.comments?.length || 0,
            });
          }

          const score = (regs.length * 3) + (posts.length * 1);
          attractiveList.push({
            ...ev,
            score,
            totalVolunteers: regs.length,
            totalPosts: posts.length
          });

        } catch (e) { console.warn(e); }
      }));

      // --- 5. SẮP XẾP CUỐI CÙNG (DỰA TRÊN ĐỘ HOT) ---

      // Nếu điểm bằng nhau -> Mới hơn xếp trên
      activeDiscussions.sort((a, b) => {
        if (b.hotScore !== a.hotScore) {
          return b.hotScore - a.hotScore; // Hot nhất lên đầu
        }
        return new Date(b.latestPostDate).getTime() - new Date(a.latestPostDate).getTime();
      });

      setRecentDiscussions(activeDiscussions.slice(0, 5));

      const sortedAttractive = attractiveList.sort((a,b) => b.score - a.score).slice(0, 5);
      setAttractiveEvents(sortedAttractive);

      const maxScore = sortedAttractive.length > 0 ? Math.max(...sortedAttractive.map(e => e.score), 1) : 1;
      setMaxAttractiveScore(maxScore);
      setPendingEvents(pendingList);

      setSummary({
        totalUsers: allUsers.length,
        totalVolunteers: allUsers.filter(u => u.role === 'VOLUNTEER' || u.roles?.includes('VOLUNTEER')).length,
        activeUsers: allUsers.filter(u => u.isActive).length,
        totalEvents: allEvents.length,
        upcomingEvents: s_upcoming,
        pendingEvents: s_pending,
        totalPosts: totalPostsCount,
        newPostsToday: newPostsTodayCount,
      });

    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => { try { await eventService.approveEvent(id, "approved", ""); loadDashboardData(); } catch (err) { alert(err.message); } };
  const handleReject = async (id) => { if(!confirm("Từ chối?")) return; try { await eventService.rejectEvent(id, ""); loadDashboardData(); } catch (err) { alert(err.message); } };
  const handleExportData = () => { /* Logic export */ };
  const openEventModal = (id) => { setSelectedEventId(id); setIsEventModalOpen(true); };

  const handleDiscussionClick = (item) => {
    if (item.latestPostId) {
      navigate(`/admin/community/posts/${item.latestPostId}`);
    } else if (item.isGlobal) {
      navigate(`/admin/community?event=global`);
    } else {
      navigate(`/admin/community?event=${item.id}`);
    }
  };

  if (loading) return <AdminLayout><div className="flex justify-center p-10"><LoadingSpinner /></div></AdminLayout>;
  if (error) return <AdminLayout><div className="p-6 text-red-500 text-center">{error}</div></AdminLayout>;

  return (
      <AdminLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
                <p className="mt-2 text-muted-foreground">Tổng quan và quản lý VolunteerHub</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportData} variant="outline" className="gap-2 bg-white text-slate-900 border"><Download className="h-4 w-4" /> Xuất Excel</Button>
                <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Printer className="h-4 w-4" /> In danh sách</Button>
              </div>
            </div>

            {/* --- CARDS THỐNG KÊ (Giữ nguyên) --- */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-purple-600 hover:-translate-y-1 bg-white" onClick={() => navigate("/admin/users")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tổng người dùng</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{summary.totalUsers}</p>
                      <div className="mt-1 flex items-center text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full w-fit"><Users className="h-3 w-3 mr-1" /> {summary.totalVolunteers} TNV</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600"><Users className="h-6 w-6" /></div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-600 hover:-translate-y-1 bg-white`} onClick={() => navigate("/admin/events")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tổng sự kiện</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{summary.totalEvents}</p>
                      <div className="mt-1 flex items-center text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit"><Calendar className="h-3 w-3 mr-1" /> {summary.upcomingEvents} sắp tới</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Calendar className="h-6 w-6" /></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-pink-500 hover:-translate-y-1 bg-white" onClick={() => navigate("/admin/community")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bài trao đổi</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{summary.totalPosts}</p>
                      <div className="mt-1 flex items-center text-xs text-pink-600 font-medium bg-pink-50 px-2 py-0.5 rounded-full w-fit"><Globe className="h-3 w-3 mr-1" /> +{summary.newPostsToday} hôm nay</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600"><MessageSquare className="h-6 w-6" /></div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-yellow-500 hover:-translate-y-1 bg-white`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Chờ phê duyệt</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{summary.pendingEvents}</p>
                      <div className="mt-1 flex items-center text-xs text-yellow-700 font-medium bg-yellow-100 px-2 py-0.5 rounded-full w-fit"><Clock className="h-3 w-3 mr-1" /> Cần xử lý ngay</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600"><Shield className="h-6 w-6" /></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">

              {/* Cột chính */}
              <div className="lg:col-span-2 space-y-8">

                {/* 1. KHỐI CHỜ PHÊ DUYỆT */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-yellow-500"/>
                    <h2 className="text-lg font-bold text-gray-800">Sự kiện chờ phê duyệt</h2>
                  </div>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                      {pendingEvents.length > 0 ? (
                          <div className="divide-y">
                            {pendingEvents.map((item) => (
                                <div key={item.id} className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">Sự kiện</Badge>
                                      <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {item.date}</span>
                                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                      <span>{item.location}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(item.id)}>Từ chối</Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(item.id)}>
                                      <CheckCircle2 className="mr-2 h-4 w-4" /> Phê duyệt
                                    </Button>
                                  </div>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="text-center py-12">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <p className="text-muted-foreground">Tuyệt vời! Không có sự kiện nào cần duyệt.</p>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 2. KHỐI THẢO LUẬN NỔI BẬT (Hiển thị thêm số Like/Cmt) */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-blue-500"/>
                    <h2 className="text-lg font-bold text-gray-800">Thảo luận nổi bật</h2>
                  </div>
                  <div className="space-y-3">
                    {recentDiscussions.length > 0 ? recentDiscussions.map((item) => (
                        <div
                            key={item.id === 'global' ? 'global-feed' : item.id}
                            className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100/50 transition-colors group"
                            onClick={() => handleDiscussionClick(item)}
                        >
                          <div className="overflow-hidden mr-4">
                            <h4 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-700 transition-colors">
                              {item.latestPostTitle || `Thảo luận mới tại ${item.title}`}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span className="font-medium text-blue-600">{item.latestPostAuthor}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="truncate max-w-[150px] font-medium text-gray-700">{item.title}</span>

                              {/* Hiển thị số Like/Cmt để user thấy tại sao nó lên top */}
                              {(item.likesCount > 0 || item.commentsCount > 0) && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span className="flex items-center text-blue-600 font-semibold">
                                                    <ThumbsUp className="h-3 w-3 mr-1"/> {item.likesCount}
                                      <MessageSquare className="h-3 w-3 ml-2 mr-1"/> {item.commentsCount}
                                                </span>
                                  </>
                              )}

                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span>{item.latestPostDate ? new Date(item.latestPostDate).toLocaleDateString("vi-VN") : 'Vừa xong'}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-blue-600 shrink-0 hover:text-blue-700 hover:bg-white/50 rounded-full">
                            <ArrowRight className="h-4 w-4"/>
                          </Button>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                          <p className="text-muted-foreground">Chưa có thảo luận nào gần đây</p>
                        </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Sidebar: SỰ KIỆN THU HÚT */}
              <div className="space-y-6">
                <Card className="h-full border-none shadow-sm sticky top-6">
                  <CardHeader className="pb-3 border-b bg-gray-50/50">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <TrendingUp className="h-5 w-5 text-purple-600"/> Top sự kiện thu hút
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {attractiveEvents.length > 0 ? attractiveEvents.map((event, idx) => (
                        <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0 cursor-pointer group" onClick={() => openEventModal(event.id)}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-xs ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            #{idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm line-clamp-1 text-gray-900 group-hover:text-primary transition-colors">{event.title}</h4>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{event.totalVolunteers || 0} TNV</span>
                              <span>{event.totalPosts || 0} bài viết</span>
                            </div>
                            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{ width: `${Math.min(((event.score || 0) / maxAttractiveScore) * 100, 100)}%`, minWidth: '5%' }}
                              />
                            </div>
                          </div>
                        </div>
                    )) : <p className="text-center text-sm text-muted-foreground py-4">Chưa có dữ liệu xếp hạng</p>}
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>

        <AdminEventDetailModal eventId={selectedEventId} open={isEventModalOpen} onOpenChange={setIsEventModalOpen} onDeleted={loadDashboardData} />
      </AdminLayout>
  );
}