import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ManagerLayout } from "../../components/Layout";
import {
  Calendar, Users, Clock, TrendingUp, MessageSquare, Plus, Sparkles, PlayCircle, ArrowRight, Globe, ThumbsUp
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import channelService from "../../services/channelService";
import postService from "../../services/postService";
import registrationService from "../../services/registrationService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [stats, setStats] = useState({
    total: 0, approved: 0, pending: 0, upcoming: 0, happening: 0, completed: 0, totalVolunteers: 0, newVolunteersMonth: 0,
  });

  const [newlyPublishedEvents, setNewlyPublishedEvents] = useState([]);
  const [eventsWithNewPosts, setEventsWithNewPosts] = useState([]); // Đây là list "Thảo luận nổi bật"
  const [attractiveEvents, setAttractiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxAttractiveScore, setMaxAttractiveScore] = useState(1);

  useEffect(() => {
    if (user?.id) loadDashboardData();
  }, [user]);

  const calculatePostHotScore = (post) => {
    // Logic: 1 Comment = 2 điểm, 1 Like = 1 điểm
    const comments = post.commentsCount || post.comments?.length || 0;
    const likes = post.likesCount || post.likes?.length || 0;
    return (comments * 2) + likes;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Start loading dashboard...");

      // 1. Lấy tất cả sự kiện của Manager
      const managerEvents = await eventService.getMyEvents();

      // 2. Lấy số liệu đăng ký (Chạy song song)
      const regPromises = managerEvents.map(ev =>
          registrationService.getRegistrationsByEvent(ev.id).catch(() => [])
      );
      const allRegistrationsLists = await Promise.all(regPromises);

      // Map: EventID -> Registrations[]
      const regsMap = {};
      managerEvents.forEach((ev, idx) => {
        regsMap[ev.id] = allRegistrationsLists[idx];
      });

      // --- TÍNH TOÁN STATS CƠ BẢN ---
      const now = new Date(); // Thời gian thực tại giây phút này
      let s_approved = 0, s_pending = 0, s_upcoming = 0, s_happening = 0, s_completed = 0;
      let s_totalVolunteers = 0;
      let s_newVolunteersMonth = 0;

      managerEvents.forEach((ev) => {
        const evStartDate = new Date(ev.date);
        // Giả định thời gian kết thúc là 4h sau khi bắt đầu (nếu DB chưa có trường endDate)
        const evEndDate = new Date(evStartDate.getTime() + (4 * 60 * 60 * 1000));

        const regs = regsMap[ev.id] || [];
        s_totalVolunteers += regs.length;

        const currentMonth = now.getMonth();
        regs.forEach(r => {
          if (new Date(r.registeredAt).getMonth() === currentMonth) s_newVolunteersMonth++;
        });

        if (ev.status === 'pending') {
          s_pending++;
        } else if (ev.status === 'approved') {
          s_approved++;

          // So sánh thời gian thực đến từng phút
          if (now >= evStartDate && now <= evEndDate) {
            s_happening++; // Đang diễn ra (Now nằm trong khoảng Start và End)
          } else if (now > evEndDate) {
            s_completed++; // Đã kết thúc (Now đã vượt quá End)
          } else {
            s_upcoming++;  // Sắp diễn ra (Now chưa đến Start)
          }
        }
      });

      setStats({
        total: managerEvents.length, approved: s_approved, pending: s_pending,
        upcoming: s_upcoming, happening: s_happening, completed: s_completed,
        totalVolunteers: s_totalVolunteers, newVolunteersMonth: s_newVolunteersMonth
      });
      // --- SỰ KIỆN MỚI CÔNG BỐ (7 ngày) ---
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      setNewlyPublishedEvents(managerEvents.filter(e =>
          e.status === 'approved' && new Date(e.createdAt) >= sevenDaysAgo
      ).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3));

      // --- TÍNH TOÁN THU HÚT & THẢO LUẬN ---
      const attractiveList = [];
      const activeDiscussions = [];
      const approvedEvents = managerEvents.filter(e => e.status === 'approved');

      try {
        const channels = await channelService.getChannels().catch(() => []);
        const globalChannel = channels.find(c => c.eventId === "GLOBAL_FEED");

        if (globalChannel) {
          const globalPosts = await postService.getPostsByChannel(globalChannel.id).catch(() => []);

          // Lọc bài trong 30 ngày qua
          const recentDays = 30;
          const recentGlobalPosts = globalPosts.filter(p => new Date(p.createdAt) >= new Date(Date.now() - recentDays * 86400000));

          if (recentGlobalPosts.length > 0) {
            // Sort bài Hot nhất lên đầu
            recentGlobalPosts.sort((a, b) => calculatePostHotScore(b) - calculatePostHotScore(a));
            const hottestPost = recentGlobalPosts[0];

            activeDiscussions.push({
              id: "global",
              title: "Cộng đồng chung",
              latestPostTitle: hottestPost.title || hottestPost.content,
              latestPostAuthor: hottestPost.authorName || 'Thành viên',
              latestPostDate: hottestPost.createdAt,
              latestPostId: hottestPost.id,
              // Lưu điểm Hot để sort tổng
              hotScore: calculatePostHotScore(hottestPost),
              likesCount: hottestPost.likesCount || hottestPost.likes?.length || 0,
              commentsCount: hottestPost.commentsCount || hottestPost.comments?.length || 0,
              isGlobal: true
            });
          }
        }
      } catch (e) {
        console.warn("Lỗi tải Global Feed:", e);
      }

      await Promise.all(approvedEvents.map(async (ev) => {
        try {
          const regs = regsMap[ev.id] || [];
          let posts = [];

          try {
            const channel = await channelService.getChannelByEventId(ev.id);
            if (channel) {
              posts = await postService.getPostsByChannel(channel.id);
            }
          } catch (e) {}

          // Lọc bài trong 30 ngày
          const recentDays = 30;
          const recentPosts = posts.filter(p => new Date(p.createdAt) >= new Date(Date.now() - recentDays * 86400000));

          if (recentPosts.length > 0) {
            // Sort bài Hot nhất của event này
            recentPosts.sort((a, b) => calculatePostHotScore(b) - calculatePostHotScore(a));
            const hottestPost = recentPosts[0];

            activeDiscussions.push({
              ...ev,
              latestPostTitle: hottestPost.title || hottestPost.content,
              latestPostAuthor: hottestPost.authorName || 'Thành viên',
              latestPostDate: hottestPost.createdAt,
              latestPostId: hottestPost.id,
              // Lưu điểm Hot
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

        } catch (err) {
          console.error("Error processing event loop:", ev.id, err);
        }
      }));

      activeDiscussions.sort((a, b) => {
        if (b.hotScore !== a.hotScore) {
          return b.hotScore - a.hotScore; // Hot nhất lên đầu
        }
        return new Date(b.latestPostDate).getTime() - new Date(a.latestPostDate).getTime(); // Mới nhất lên đầu
      });
      setEventsWithNewPosts(activeDiscussions.slice(0, 5));

      // Sort danh sách Thu hút
      const sortedAttractive = attractiveList.sort((a,b) => b.score - a.score).slice(0, 5);
      setAttractiveEvents(sortedAttractive);

      // Tính Max Score
      const maxScore = sortedAttractive.length > 0 ? Math.max(...sortedAttractive.map(e => e.score), 1) : 1;
      setMaxAttractiveScore(maxScore);

    } catch (err) {
      console.error("Dashboard Loading Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToEvents = (filterType) => {
    navigate("/manager/events", { state: { filter: filterType } });
  };

  // Hàm xử lý click vào item thảo luận
  const handleDiscussionClick = (item) => {
    if (item.latestPostId) {
      navigate(`/manager/community/posts/${item.latestPostId}`);
    } else if (item.isGlobal) {
      navigate(`/manager/community?event=global`);
    } else {
      navigate(`/manager/community?event=${item.id}`);
    }
  };

  if (loading) return <ManagerLayout><div className="flex justify-center p-10"><LoadingSpinner /></div></ManagerLayout>;

  return (
      <ManagerLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Quản lý</h1>
                <p className="mt-1 text-muted-foreground">Tổng quan hoạt động và hiệu suất sự kiện của bạn</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 shadow-md transition-all">
                <Link to="/manager/events/create"><Plus className="mr-2 h-4 w-4"/> Tạo sự kiện mới</Link>
              </Button>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-600 hover:-translate-y-1 bg-white" onClick={() => navigate("/manager/events")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tổng sự kiện</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
                      <div className="mt-1 flex items-center text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                        <Calendar className="h-3 w-3 mr-1" /> {stats.approved} đã được duyệt
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
                      <div className="mt-1 flex items-center text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full w-fit">
                        <PlayCircle className="h-3 w-3 mr-1" /> Cần theo dõi
                      </div>
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
                      <div className="mt-1 flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full w-fit">
                        <Clock className="h-3 w-3 mr-1" /> Chuẩn bị kỹ
                      </div>
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
                      <div className="mt-1 flex items-center text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full w-fit">
                        <Users className="h-3 w-3 mr-1" /> +{stats.newVolunteersMonth} tháng này
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600"><Users className="h-6 w-6" /></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">

              {/* Cột chính (Chiếm 2/3) */}
              <div className="lg:col-span-2 space-y-8">

                {/* 1. KHỐI SỰ KIỆN MỚI CÔNG BỐ */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-yellow-500"/>
                    <h2 className="text-lg font-bold text-gray-800">Mới công bố (7 ngày qua)</h2>
                  </div>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                      {newlyPublishedEvents.length > 0 ? (
                          <div className="divide-y">
                            {newlyPublishedEvents.map(ev => (
                                <div key={ev.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/manager/events/${ev.id}`)}>
                                  <div>
                                    <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{ev.title}</h4>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(ev.date).toLocaleDateString("vi-VN")}</span>
                                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                      <span className="flex items-center gap-1"><Users className="h-3 w-3"/> {ev.location}</span>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4"/></Button>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="text-center py-12">
                            <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                            <p className="text-muted-foreground">Chưa có sự kiện nào mới được duyệt gần đây.</p>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 2. KHỐI THẢO LUẬN NỔI BẬT (GIAO DIỆN & LOGIC ĐÃ ĐỒNG BỘ VỚI ADMIN) */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-blue-500"/>
                    <h2 className="text-lg font-bold text-gray-800">Thảo luận nổi bật</h2>
                  </div>
                  <div className="space-y-3">
                    {eventsWithNewPosts.length > 0 ? eventsWithNewPosts.map(item => (
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

                              {/* Hiển thị số Like/Cmt (Logic mới) */}
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
                          <p className="text-muted-foreground">Chưa có bài thảo luận nào trong 30 ngày qua.</p>
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
                    {attractiveEvents.length > 0 ? attractiveEvents.map((ev, idx) => (
                        <div key={ev.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0 cursor-pointer group" onClick={() => navigate(`/manager/events/${ev.id}`)}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-xs ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            #{idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm line-clamp-1 hover:text-primary cursor-pointer transition-colors">
                              {ev.title}
                            </h4>
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{ev.totalVolunteers} TNV</span>
                              <span>{ev.totalPosts} bài viết</span>
                            </div>

                            {/* PROGRESS BAR */}
                            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{ width: `${Math.min((ev.score / maxAttractiveScore) * 100, 100)}%`, minWidth: '5%' }}
                              />
                            </div>
                          </div>
                        </div>
                    )) : (
                        <div className="text-center py-10">
                          <TrendingUp className="h-10 w-10 text-gray-200 mx-auto mb-2"/>
                          <p className="text-sm text-gray-400">Chưa có đủ dữ liệu xếp hạng</p>
                        </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </ManagerLayout>
  );
}