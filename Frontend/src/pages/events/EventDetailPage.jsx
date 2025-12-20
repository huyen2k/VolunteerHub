import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "../../components/ui/dialog";
import {
  GuestLayout, UserLayout, AdminLayout, ManagerLayout,
} from "../../components/Layout";
import LoadingSpinner from "../../components/LoadingSpinner";
import PostItem from "../../components/PostItem";

// Hooks & Services
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import postService from "../../services/postService";
import channelService from "../../services/channelService";
import userService from "../../services/userService";
import reportService from "../../services/reportService";

// Icons
import {
  Calendar, MapPin, Users, Clock, ArrowLeft, Heart,
  MessageSquare, Share2, CheckCircle2, AlertCircle,
  Phone, Mail, User, LogIn, Send, Hourglass, Star
} from "lucide-react";

const defaultEventImage = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=1000";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // --- STATE ---
  const [event, setEvent] = useState(null);
  const [managerContact, setManagerContact] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Community State
  const [activeTab, setActiveTab] = useState("overview");
  const [channelPosts, setChannelPosts] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Report State
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");

  const getLayout = () => {
    if (!isAuthenticated) return GuestLayout;
    switch (user?.role) {
      case "admin": return AdminLayout;
      case "manager": return ManagerLayout;
      case "volunteer": return UserLayout;
      default: return UserLayout;
    }
  };
  const Layout = getLayout();

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [eventData, userRegs] = await Promise.all([
          eventService.getEventById(id),
          (isAuthenticated && user?.id) ? eventService.getUserEvents(user.id).catch(() => []) : Promise.resolve([])
        ]);

        // Map Event Data
        const mappedEvent = {
          ...eventData,
          id: eventData.id || id,
          image: eventData.image || defaultEventImage,
          dateDisplay: eventData.date ? new Date(eventData.date).toLocaleDateString("vi-VN") : "Chưa cập nhật",
          timeDisplay: eventData.date ? new Date(eventData.date).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'}) : "",
          fullDate: eventData.date ? new Date(eventData.date) : null,
          volunteersRegistered: eventData.volunteersRegistered || 0,
          volunteersNeeded: eventData.volunteersNeeded || 0,
        };
        setEvent(mappedEvent);

        // Check registration status
        if (userRegs.length > 0) {
          const myReg = userRegs.find(r => r.eventId === id);
          setUserRegistration(myReg || null);
        }

        // Load Manager Info
        if (eventData.createdBy) {
          userService.getUserById(eventData.createdBy)
              .then(creator => setManagerContact({
                name: creator.full_name || "Ban tổ chức",
                email: creator.email,
                phone: creator.phone,
                avatar: creator.avatar_url
              }))
              .catch(() => {});
        }

        // Load Channel
        loadChannel(id);

      } catch (err) {
        setError("Không thể tải thông tin sự kiện.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id, isAuthenticated, user?.id]);

  // --- 2. COMMUNITY LOGIC ---
  const loadChannel = async (eventId) => {
    try {
      setLoadingPosts(true);
      const channel = await channelService.getChannelByEventId(eventId).catch(() => null);

      if (channel) {
        setCurrentChannel(channel);
        const res = await postService.getPostsByChannel(channel.id).catch(() => []);

        // FIX LỖI: Kiểm tra kỹ cấu trúc trả về để lấy đúng mảng bài viết
        let posts = [];
        if (Array.isArray(res)) posts = res;
        else if (res?.result?.content) posts = res.result.content;
        else if (res?.content) posts = res.content;
        else if (res?.result && Array.isArray(res.result)) posts = res.result;

        setChannelPosts(posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        // Nếu không có kênh thì thôi, không báo lỗi, chỉ để trống
        setChannelPosts([]);
      }
    } catch (err) {
      console.error("Lỗi tải thảo luận:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // --- HÀM 2: Đăng comment (Đã fix lỗi) ---
  const handlePostComment = async () => {
    if (!isAuthenticated) return navigate("/login");
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      let targetChannelId = currentChannel?.id;

      // Nếu chưa có kênh, thử lấy lại lần nữa
      if (!targetChannelId) {
        const ch = await channelService.getChannelByEventId(id).catch(() => null);
        if (ch) {
          targetChannelId = ch.id;
          setCurrentChannel(ch);
        } else {
          // User thường KHÔNG ĐƯỢC TỰ TẠO KÊNH nếu chưa có
          // Chỉ Admin/Manager mới tạo được. Nên ở đây ta báo lỗi lịch sự.
          alert("Sự kiện này chưa mở kênh thảo luận. Vui lòng quay lại sau.");
          setSubmittingComment(false);
          return;
        }
      }

      await postService.createPost({
        content: commentContent,
        channelId: targetChannelId,
        images: []
      });

      setCommentContent("");
      // Reload lại danh sách (gọi lại hàm đã fix ở trên)
      loadChannel(id);

    } catch (err) {
      alert("Lỗi đăng bài: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingComment(false);
    }
  };

  // --- ACTIONS ---
  const handleRegisterClick = async () => {
    if (!isAuthenticated) return navigate("/login", { state: { returnTo: location.pathname } });

    if (window.confirm("Xác nhận đăng ký tham gia sự kiện?")) {
      try {
        await eventService.registerForEvent(id);
        alert("Đã gửi yêu cầu tham gia! Vui lòng chờ duyệt.");
        window.location.reload();
      } catch (err) {
        alert(err.message || "Đăng ký thất bại.");
      }
    }
  };

  const handleUnregisterClick = async () => {
    if (!userRegistration) return;
    if (window.confirm("Bạn có chắc chắn muốn hủy đăng ký/yêu cầu này?")) {
      try {
        await eventService.cancelEventRegistration(userRegistration.id);
        alert("Đã hủy thành công.");
        window.location.reload();
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
    }
  }

  const handleReport = async () => {
    if (!reportText.trim()) return;
    try {
      await reportService.createReport({ type: "event", targetId: id, title: "Báo cáo sự kiện", description: reportText });
      alert("Đã gửi báo cáo.");
      setReportOpen(false);
      setReportText("");
    } catch (err) { alert("Lỗi: " + err.message); }
  };

  const getBackLink = () => {
    if (user?.role === "admin") return "/admin/events";
    if (user?.role === "manager") return "/manager/events";
    return "/user/events";
  };

  // --- HELPER RENDER BUTTON (LOGIC HOÀN CHỈNH) ---
  const renderActionButton = () => {
    const now = new Date();
    const eventDate = event.fullDate ? new Date(event.fullDate) : new Date();

    // Giả định sự kiện kéo dài 4 tiếng (hoặc logic tùy chỉnh của bạn)
    const endDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);

    const isEnded = now > endDate;
    const isHappening = !isEnded && now >= eventDate;

    const isFull = event.volunteersNeeded > 0 && event.volunteersRegistered >= event.volunteersNeeded;

    // 1. CHƯA ĐĂNG KÝ
    if (!userRegistration) {
      if (isEnded) return <Button disabled variant="secondary" className="w-full">Đã kết thúc</Button>;
      if (isHappening) return <Button disabled variant="secondary" className="w-full">Đang diễn ra</Button>;
      if (isFull) return <Button disabled variant="secondary" className="w-full">Hết chỗ</Button>;

      return (
          <Button className="w-full text-lg h-12 shadow-md hover:shadow-lg transition-all" onClick={handleRegisterClick}>
            Đăng ký ngay
          </Button>
      );
    }

    // 2. ĐÃ ĐĂNG KÝ (XỬ LÝ TRẠNG THÁI)
    const status = userRegistration.status;

    // Case: Hoàn thành hoặc Từ chối
    if (status === 'completed') {
      return <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" disabled><Star className="w-4 h-4 mr-2"/> Đã hoàn thành</Button>;
    }
    if (status === 'rejected') {
      return <Button disabled variant="secondary" className="w-full bg-red-50 text-red-500">Bị từ chối</Button>;
    }

    // Case: Đang diễn ra (Dù Pending hay Approved đều không được hủy ngang)
    if (isHappening) {
      return <Button disabled variant="outline" className="w-full text-green-600 bg-green-50 border-green-200">
        Đang diễn ra...
      </Button>;
    }

    // Case: Đã kết thúc (Chưa completed)
    if (isEnded) {
      if (status === 'approved') {
        return <Button disabled variant="outline" className="w-full text-gray-500">Chờ xác nhận</Button>; // Đợi Manager duyệt completed
      }
      if (status === 'pending') {
        return <Button disabled variant="outline" className="w-full text-gray-400">Hết hạn duyệt</Button>; // Hết giờ mà vẫn pending
      }
    }

    // Case: Sắp diễn ra (Pending hoặc Approved) -> Cho phép Hủy
    return (
        <Button
            variant="destructive"
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200 border"
            onClick={handleUnregisterClick}
        >
          {status === 'pending' ? "Hủy yêu cầu" : "Hủy tham gia"}
        </Button>
    );
  };

  // --- RENDER ---
  if (loading) return <Layout><div className="flex justify-center py-20"><LoadingSpinner /></div></Layout>;
  if (!event) return <Layout><div className="text-center py-20">Sự kiện không tồn tại.</div></Layout>;

  return (
      <Layout>
        <div className="bg-gray-50/50 min-h-screen pb-12">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" asChild>
                <Link to={getBackLink()}><ArrowLeft className="mr-2 h-4 w-4"/> Quay lại danh sách</Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}>
                  <AlertCircle className="mr-2 h-4 w-4 text-orange-500"/> Báo cáo
                </Button>
                <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4"/> Chia sẻ</Button>
              </div>
            </div>

            {/* BANNER */}
            <div className="relative aspect-[21/9] w-full bg-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
                <Badge className="w-fit mb-3 bg-primary text-white border-none">{event.category || "Hoạt động"}</Badge>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-200 text-sm md:text-base">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {event.dateDisplay}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {event.location}</span>
                </div>
              </div>
            </div>

            {/* GRID CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT: INFO */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="bg-white shadow-sm border-0"><CardContent className="p-4 flex flex-col items-center justify-center text-center"><Calendar className="h-6 w-6 text-blue-500 mb-2"/><span className="text-xs text-gray-500">Ngày</span><span className="font-bold">{event.dateDisplay}</span></CardContent></Card>
                  <Card className="bg-white shadow-sm border-0"><CardContent className="p-4 flex flex-col items-center justify-center text-center"><Clock className="h-6 w-6 text-orange-500 mb-2"/><span className="text-xs text-gray-500">Giờ</span><span className="font-bold">{event.timeDisplay}</span></CardContent></Card>
                  <Card className="bg-white shadow-sm border-0"><CardContent className="p-4 flex flex-col items-center justify-center text-center"><Users className="h-6 w-6 text-green-500 mb-2"/><span className="text-xs text-gray-500">Đã duyệt</span><span className="font-bold">{event.volunteersRegistered}/{event.volunteersNeeded > 0 ? event.volunteersNeeded : '∞'}</span></CardContent></Card>
                  <Card className="bg-white shadow-sm border-0"><CardContent className="p-4 flex flex-col items-center justify-center text-center"><MessageSquare className="h-6 w-6 text-purple-500 mb-2"/><span className="text-xs text-gray-500">Thảo luận</span><span className="font-bold">{channelPosts.length}</span></CardContent></Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-xl shadow-sm border">
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="details">Chi tiết</TabsTrigger>
                    <TabsTrigger value="community">Cộng đồng</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <Card className="border-none shadow-sm"><CardHeader><CardTitle>Mô tả</CardTitle></CardHeader><CardContent className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</CardContent></Card>
                    {(event.requirements?.length > 0 || event.benefits?.length > 0) && (
                        <div className="grid md:grid-cols-2 gap-6">
                          <Card className="border-none shadow-sm h-full"><CardHeader><CardTitle className="text-base">Yêu cầu</CardTitle></CardHeader><CardContent><ul className="space-y-2">{event.requirements?.map((req, i) => <li key={i} className="flex gap-2 text-sm text-gray-600"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0"/> {req}</li>) || <li className="text-gray-400 italic">Không có yêu cầu</li>}</ul></CardContent></Card>
                          <Card className="border-none shadow-sm h-full"><CardHeader><CardTitle className="text-base">Quyền lợi</CardTitle></CardHeader><CardContent><ul className="space-y-2">{event.benefits?.map((ben, i) => <li key={i} className="flex gap-2 text-sm text-gray-600"><Heart className="h-4 w-4 text-red-500 flex-shrink-0"/> {ben}</li>) || <li className="text-gray-400 italic">Không có thông tin</li>}</ul></CardContent></Card>
                        </div>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="mt-6 space-y-6">
                    <Card className="border-none shadow-sm">
                      <CardHeader><CardTitle>Liên hệ</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">{managerContact?.name?.charAt(0) || "M"}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{managerContact?.name}</h4>
                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                              {managerContact?.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5"/> {managerContact.email}</span>}
                              {managerContact?.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5"/> {managerContact.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm"><CardHeader><CardTitle>Địa điểm</CardTitle></CardHeader><CardContent><div className="flex gap-2 text-gray-600 mb-4"><MapPin className="h-5 w-5 text-red-500"/> {event.location}</div></CardContent></Card>
                  </TabsContent>

                  <TabsContent value="community" className="mt-6">
                    <Card className="border-none shadow-sm bg-transparent"><CardContent className="p-0">
                      {isAuthenticated ? (
                          <div className="bg-white p-4 rounded-xl border shadow-sm mb-6">
                            <div className="flex gap-3">
                              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">{user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : <User className="h-6 w-6 m-2 text-gray-500"/>}</div>
                              <div className="flex-1">
                                <Textarea placeholder="Chia sẻ suy nghĩ..." value={commentContent} onChange={(e) => setCommentContent(e.target.value)} className="bg-gray-50 border-0 min-h-[80px] mb-2"/>
                                <div className="flex justify-end"><Button size="sm" onClick={handlePostComment} disabled={submittingComment || !commentContent.trim()}>{submittingComment ? <LoadingSpinner size="sm"/> : <><Send className="w-3 h-3 mr-2"/> Đăng bài</>}</Button></div>
                              </div>
                            </div>
                          </div>
                      ) : (
                          <div className="bg-blue-50 p-6 rounded-xl text-center mb-6 border border-blue-100"><p className="text-blue-700 mb-3">Đăng nhập để thảo luận!</p><Button size="sm" variant="outline" className="bg-white text-blue-600" onClick={() => navigate("/login")}><LogIn className="w-4 h-4 mr-2"/> Đăng nhập</Button></div>
                      )}
                      <div className="space-y-4">{channelPosts.length > 0 ? channelPosts.map(post => <PostItem key={post.id} post={post} currentUser={user} />) : <div className="text-center py-10 bg-white rounded-xl border border-dashed text-gray-500">Chưa có thảo luận nào.</div>}</div>
                    </CardContent></Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* RIGHT: SIDEBAR */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-0 shadow-lg sticky top-6 overflow-hidden">
                  <div className="h-2 bg-primary w-full"></div>
                  <CardHeader className="pb-2"><CardTitle className="text-xl">Đăng ký tham gia</CardTitle><CardDescription>Đừng bỏ lỡ cơ hội này.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm py-2 border-b"><span className="text-gray-500">Trạng thái:</span><Badge variant={event.status === 'approved' ? 'default' : 'secondary'}>{event.status === 'approved' ? 'Đang mở' : 'Tạm đóng'}</Badge></div>

                    {/* ✅ Hiển thị Vô cực nếu Needed = 0 */}
                    <div className="flex justify-between items-center text-sm py-2 border-b">
                      <span className="text-gray-500">Số lượng:</span>
                      <span className="font-semibold">{event.volunteersRegistered} / {event.volunteersNeeded > 0 ? event.volunteersNeeded : '∞'}</span>
                    </div>

                    {/* ✅ Thanh tiến độ: Chỉ chạy % nếu có giới hạn */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${event.volunteersNeeded > 0 ? Math.min((event.volunteersRegistered / event.volunteersNeeded) * 100, 100) : 0}%` }}
                      ></div>
                    </div>

                    {/* RENDER BUTTON THEO LOGIC MỚI */}
                    {renderActionButton()}

                    <p className="text-xs text-center text-gray-400">Bằng việc đăng ký, bạn đồng ý với quy định của sự kiện.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogContent><DialogHeader><DialogTitle>Báo cáo sự kiện</DialogTitle></DialogHeader><Textarea placeholder="Mô tả vấn đề..." value={reportText} onChange={(e) => setReportText(e.target.value)} rows={4}/><DialogFooter><Button variant="outline" onClick={() => setReportOpen(false)}>Hủy</Button><Button onClick={handleReport} className="bg-red-600 text-white">Gửi</Button></DialogFooter></DialogContent>
          </Dialog>
        </div>
      </Layout>
  );
}