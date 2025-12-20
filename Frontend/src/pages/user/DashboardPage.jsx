import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { UserLayout } from "../../components/Layout";
import {
  Calendar, Users, CheckCircle2, Clock, TrendingUp, MessageSquare, Bell,
  ArrowRight, Sparkles, PlayCircle, ThumbsUp, Activity
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import notificationService from "../../services/notificationService";
import channelService from "../../services/channelService";
import postService from "../../services/postService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newlyPublishedEvents, setNewlyPublishedEvents] = useState([]);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [attractiveEvents, setAttractiveEvents] = useState([]);

  const [stats, setStats] = useState({
    totalRegistered: 0, completed: 0, upcoming: 0, happening: 0, totalHours: 0, unreadNotis: 0
  });
  const [maxAttractiveScore, setMaxAttractiveScore] = useState(1);

  useEffect(() => {
    if (user?.id) loadDashboardData();
  }, [user]);

  const calculatePostHotScore = (post) => {
    const comments = post.commentsCount || post.comments?.length || 0;
    const likes = post.likesCount || post.likes?.length || 0;
    return (comments * 2) + likes;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");


      const [statsData, unreadNoti, topNewEvents, hotPosts, allPublicEvents] = await Promise.all([
        eventService.getDashboardStats().catch(() => null),
        notificationService.getUnreadNotifications().catch(() => []),
        eventService.getTopNewEvents().catch(() => []), // API MỚI: Chỉ lấy 3 cái
        postService.getHotPosts().catch(() => []),      // API MỚI: Chỉ lấy 5 cái
        eventService.getEvents().catch(() => [])        // Vẫn cần cái này cho Attractive (hoặc tối ưu sau)
      ]);

      // 1. Stats
      if (statsData) {
        setStats({
          totalRegistered: statsData.totalEvents || 0,
          completed: statsData.completedEvents || 0,
          upcoming: statsData.upcomingEvents || 0,
          happening: statsData.happeningEvents || 0,
          totalHours: 0,
          unreadNotis: unreadNoti.length || 0
        });
      }

      // 2. Newly Published (Dùng dữ liệu từ API mới)
      setNewlyPublishedEvents(topNewEvents);

      // 3. Hot Discussions (Dùng dữ liệu từ API mới - Không cần loop qua từng channel nữa!)
      // Map lại dữ liệu hotPosts để khớp với giao diện
      const mappedDiscussions = hotPosts.map(p => ({
        id: p.channelId, // Lưu ý: Cần điều hướng về channel/event chứa post này
        latestPostTitle: p.content, // Hoặc title nếu có
        latestPostAuthor: p.authorName,
        latestPostDate: p.createdAt,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        // Cần thêm logic lấy title event nếu muốn hiển thị tên event
        title: "Thảo luận cộng đồng"
      }));
      setRecentDiscussions(mappedDiscussions);

      // 4. Attractive Events (Giữ nguyên logic cũ hoặc tối ưu sau nếu còn chậm)
      // Logic này vẫn chạy ở client nhưng vì đã giải phóng 2 phần trên nên sẽ nhanh hơn
      const attractiveList = allPublicEvents.map(ev => ({
        ...ev,
        score: ((ev.volunteersRegistered || 0) * 3) + ((ev.comments || 0) * 1),
        totalVolunteers: ev.volunteersRegistered || 0,
        totalPosts: ev.comments || 0
      })).sort((a, b) => b.score - a.score).slice(0, 5);

      setAttractiveEvents(attractiveList);
      setMaxAttractiveScore(attractiveList.length > 0 ? Math.max(...attractiveList.map(e => e.score), 1) : 1);

    } catch (e) {
      setError("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscussionClick = (item) => {
    if (item.latestPostId) {
      navigate(`/community?event=${item.isGlobal ? 'global' : item.id}`);
    }
    else if (item.isGlobal) navigate(`/community?event=global`);
    else navigate(`/community?event=${item.id}`);
  };

  if (loading) return <UserLayout><div className="flex justify-center p-20"><LoadingSpinner /></div></UserLayout>;

  return (
      <UserLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Tình nguyện viên</h1>
              <p className="mt-1 text-muted-foreground">Chào mừng trở lại! Cập nhật tin tức và hoạt động mới nhất.</p>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-600 hover:-translate-y-1 bg-white" onClick={() => navigate("/user/events", { state: { filter: "registered" } })}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Đã tham gia</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stats.completed}</p>
                      <div className="mt-1 flex items-center text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit"><CheckCircle2 className="h-3 w-3 mr-1" /> {stats.totalHours} giờ</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600"><CheckCircle2 className="h-6 w-6" /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-orange-500 hover:-translate-y-1 bg-white" onClick={() => navigate("/user/events", { state: { filter: "upcoming" } })}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sắp tới</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                      <div className="mt-1 flex items-center text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full w-fit"><PlayCircle className="h-3 w-3 mr-1" /> Đã đăng ký</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600"><Calendar className="h-6 w-6" /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-green-600 hover:-translate-y-1 bg-white" onClick={() => navigate("/user/events", { state: { filter: "happening" } })}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Đang diễn ra</p>
                      <p className="mt-2 text-3xl font-bold text-green-600">{stats.happening}</p>
                      <div className="mt-1 flex items-center text-xs text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full w-fit animate-pulse"><Activity className="h-3 w-3 mr-1" /> LIVE</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"><PlayCircle className="h-6 w-6" /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-pink-500 hover:-translate-y-1 bg-white" onClick={() => navigate("/notifications")}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Thông báo mới</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stats.unreadNotis}</p>
                      <div className="mt-1 flex items-center text-xs text-pink-600 font-medium bg-pink-50 px-2 py-0.5 rounded-full w-fit"><Bell className="h-3 w-3 mr-1" /> Cần xem</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600"><Bell className="h-6 w-6" /></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Các phần khác giữ nguyên giao diện */}
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-yellow-500"/> Sự kiện mới công bố</h2>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                      {newlyPublishedEvents.length > 0 ? (
                          <div className="divide-y">
                            {newlyPublishedEvents.map((event) => (
                                <div key={event.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                                  <div>
                                    <div className="flex items-center gap-3 mb-1"><Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">Mới</Badge><h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{event.title}</h4></div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {new Date(event.date).toLocaleDateString("vi-VN")}</span><span className="w-1 h-1 rounded-full bg-gray-300"></span><span className="flex items-center gap-1"><Users className="h-3 w-3"/> {event.location}</span></div>
                                  </div>
                                  <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4"/></Button>
                                </div>
                            ))}
                          </div>
                      ) : (<div className="text-center py-12"><Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-3" /><p className="text-muted-foreground">Không có sự kiện mới nào trong 7 ngày qua.</p></div>)}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><MessageSquare className="h-5 w-5 text-blue-500"/> Thảo luận nổi bật</h2>
                  <div className="space-y-3">
                    {recentDiscussions.length > 0 ? recentDiscussions.map((item, idx) => (
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
                    )) : (<div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200"><p className="text-muted-foreground">Chưa có thảo luận nào sôi nổi gần đây.</p></div>)}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Hành động nhanh</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90" asChild><Link to="/user/events">Sự kiện của tôi</Link></Button>
                    <Button variant="outline" className="w-full justify-start" asChild><Link to="/profile">Hồ sơ cá nhân</Link></Button>
                  </CardContent>
                </Card>

                <Card className="h-full border-none shadow-sm sticky top-6">
                  <CardHeader className="pb-3 border-b bg-gray-50/50"><CardTitle className="flex items-center gap-2 text-base font-bold"><TrendingUp className="h-5 w-5 text-purple-600"/> Top sự kiện thu hút</CardTitle></CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {attractiveEvents.length > 0 ? attractiveEvents.map((event, idx) => (
                        <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0 cursor-pointer group" onClick={() => navigate(`/events/${event.id}`)}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-xs ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>#{idx + 1}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm line-clamp-1 text-gray-900 group-hover:text-primary transition-colors">{event.title}</h4>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground"><span>{event.totalVolunteers} TNV</span><span>{event.totalPosts} bài viết</span></div>
                            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((event.score / maxAttractiveScore) * 100, 100)}%`, minWidth: '5%' }}/></div>
                          </div>
                        </div>
                    )) : (<div className="text-center py-6"><p className="text-sm text-gray-400">Chưa có đủ dữ liệu xếp hạng</p></div>)}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
  );
}