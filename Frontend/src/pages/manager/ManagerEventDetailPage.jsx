import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { ManagerLayout } from "../../components/Layout";
import {
  Calendar, MapPin, Users, Clock, CheckCircle2, XCircle,
  MessageSquare, UserCheck, UserX, ArrowLeft, Printer, RotateCcw,
  Send, User, Mail, Trash2, ExternalLink, Edit // ✅ Import icon Edit
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import userService from "../../services/userService";
import channelService from "../../services/channelService";
import postService from "../../services/postService";
import LoadingSpinner from "../../components/LoadingSpinner";
import PostItem from "../../components/PostItem";

export default function ManagerEventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ... (State giữ nguyên) ...
  const [activeTab, setActiveTab] = useState("overview");
  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [channelPosts, setChannelPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  // ... (useReactToPrint giữ nguyên) ...
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bao_cao_chi_tiet_${id}`,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        * { font-family: 'Times New Roman', Times, serif !important; }
      }
    `
  });

  useEffect(() => { if (id) loadEventData(); }, [id]);

  // ... (loadEventData, loadChannelPosts, handlePostComment giữ nguyên) ...
  const loadEventData = async () => {
    try {
      setLoading(true); setError("");
      const eventData = await eventService.getEventById(id);
      setEvent({
        id: eventData.id,
        title: eventData.title || "Không có tiêu đề",
        description: eventData.description || "",
        date: eventData.date ? new Date(eventData.date).toLocaleDateString("vi-VN") : "Chưa có",
        time: eventData.date ? new Date(eventData.date).toLocaleTimeString("vi-VN", {hour:'2-digit', minute:'2-digit'}) : "",
        fullDate: eventData.date ? new Date(eventData.date) : null,
        location: eventData.location || "Chưa có",
        status: eventData.status || "pending",
        createdAt: eventData.createdAt ? new Date(eventData.createdAt).toLocaleDateString("vi-VN") : "",
        volunteersNeeded: eventData.volunteersNeeded || 0,
      });

      const registrations = await registrationService.getRegistrationsByEvent(id);
      const volunteersWithDetails = await Promise.all(
          (registrations || []).map(async (reg) => {
            try {
              const userData = await userService.getUserById(reg.userId);
              return {
                id: reg.id,
                userId: reg.userId,
                name: userData.full_name || "Unknown",
                email: userData.email || "",
                status: reg.status || "pending",
                registeredAt: reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString("vi-VN") : "",
              };
            } catch (err) { return { ...reg, name: "Unknown" }; }
          })
      );
      setVolunteers(volunteersWithDetails);
      loadChannelPosts(id);
    } catch (err) { console.error(err); setError(err.message); } finally { setLoading(false); }
  };

  const loadChannelPosts = async (eventId) => {
    try {
      setLoadingPosts(true);
      // Gọi API tìm kênh, nếu lỗi trả về null để không crash
      const channel = await channelService.getChannelByEventId(eventId).catch(() => null);

      if (channel) {
        const res = await postService.getPostsByChannel(channel.id).catch(() => []);

        // FIX LỖI: Kiểm tra kỹ cấu trúc trả về để lấy đúng mảng bài viết
        // Backend Spring Boot thường trả về: res.result.content HOẶC res.content
        let posts = [];
        if (Array.isArray(res)) posts = res;
        else if (res?.result?.content) posts = res.result.content;
        else if (res?.content) posts = res.content;
        else if (res?.result && Array.isArray(res.result)) posts = res.result;

        setChannelPosts(posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        setChannelPosts([]);
      }
    } catch (err) {
      console.error("Lỗi tải thảo luận:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentContent.trim()) return;
    setSubmittingComment(true);
    try {
      let channel = await channelService.getChannelByEventId(event.id).catch(() => null);

      // Nếu chưa có kênh, thử tạo mới (Fallback)
      if (!channel) {
        try {
          const res = await channelService.createChannel({
            eventId: event.id,
            name: `Thảo luận: ${event.title}`
          });
          channel = res?.result || res;
        } catch (e) {
          throw new Error("Sự kiện này chưa có kênh thảo luận. Vui lòng báo Admin khởi tạo.");
        }
      }

      // Gửi bài viết
      await postService.createPost({
        content: commentContent,
        channelId: channel.id,
        images: []
      });

      setCommentContent("");
      // Reload lại danh sách bài viết bằng hàm đã fix ở trên
      await loadChannelPosts(event.id);

    } catch (err) {
      alert("Gửi thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteEvent = async () => {
    const activeVolunteers = volunteers.filter(v => v.status === 'approved' || v.status === 'completed');
    if (activeVolunteers.length > 0) {
      alert(`KHÔNG THỂ XÓA!\nSự kiện đang có ${activeVolunteers.length} TNV tham gia.`);
      return;
    }
    if (!confirm("CẢNH BÁO: Xóa sự kiện này?")) return;
    try {
      setLoading(true);
      await eventService.deleteEvent(id);
      alert("Đã xóa sự kiện.");
      navigate("/manager/events");
    } catch (err) { alert("Lỗi xóa: " + err.message); setLoading(false); }
  };

  const handleEditEvent = () => {
    // Chỉ cho phép sửa khi chưa completed hoặc tùy logic nghiệp vụ
    // Ở đây cho phép sửa thoải mái, nhưng có thể cảnh báo nếu đã có TNV
    navigate(`/manager/events/${id}/edit`);
  };

  const handleGoToCommunity = () => { navigate(`/manager/community?event=${id}`); };

  // ... (getStatusBadge, getVolunteerStatusBadge, handleApproveVolunteer... giữ nguyên) ...
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-500 text-white">Đã duyệt</Badge>;
      case "pending": return <Badge className="bg-yellow-500 text-white">Chờ duyệt</Badge>;
      case "rejected": return <Badge variant="destructive">Từ chối</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVolunteerStatusBadge = (status) => {
    switch (status) {
      case "approved": return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Đã tham gia</Badge>;
      case "completed": return <Badge className="bg-green-100 text-green-700 border-green-200">Hoàn thành</Badge>;
      case "pending": return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Chờ duyệt</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-700 border-red-200">Từ chối</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApproveVolunteer = async (regId) => { try { await registrationService.updateRegistrationStatus(regId, "approved"); loadEventData(); } catch (err) { alert(err.message); } };
  const handleRejectVolunteer = async (regId) => { if(confirm("Từ chối TNV?")) { try { await registrationService.updateRegistrationStatus(regId, "rejected"); loadEventData(); } catch (err) { alert(err.message); } } };
  const handleMarkCompleted = async (regId) => { if (event.fullDate && new Date() < event.fullDate && !confirm("Sự kiện chưa diễn ra. Hoàn thành sớm?")) return; try { await registrationService.updateRegistrationStatus(regId, "completed"); loadEventData(); } catch (err) { alert(err.message); } };
  const handleUndoCompletion = async (regId) => { if(confirm("Hoàn tác trạng thái?")) { try { await registrationService.updateRegistrationStatus(regId, "approved"); loadEventData(); } catch (err) { alert(err.message); } } };

  if (loading) return <ManagerLayout><div className="flex justify-center p-10"><LoadingSpinner/></div></ManagerLayout>;
  if (error || !event) return <ManagerLayout><div className="p-6 text-red-500 text-center">{error || "Not found"}</div></ManagerLayout>;

  return (
      <ManagerLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

            {/* HEADER */}
            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/manager/events")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold">{event.title}</h1>
                    {getStatusBadge(event.status)}
                  </div>
                  <p className="text-muted-foreground text-sm">Tạo lúc: {event.createdAt}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" onClick={handleDeleteEvent} className="shadow-sm">
                  <Trash2 className="h-4 w-4 mr-2"/> Xóa
                </Button>

                <Button variant="outline" onClick={handleEditEvent} className="bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50">
                  <Edit className="h-4 w-4 mr-2"/> Chỉnh sửa
                </Button>


                <Button onClick={handleGoToCommunity} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                  <ExternalLink className="h-4 w-4 mr-2 text-blue-600"/> Thảo luận
                </Button>
              </div>
            </div>

            <div ref={printRef}>
              {/* VÙNG IN (Giữ nguyên) */}
              <div className="hidden print:block p-12 bg-white text-black text-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <div className="text-center mb-10"><h3 className="font-bold uppercase text-base m-0">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3><p className="font-bold underline mb-4">Độc lập - Tự do - Hạnh phúc</p><h1 className="text-2xl font-bold uppercase mt-8">BÁO CÁO CHI TIẾT SỰ KIỆN</h1></div>
                <div className="mb-6 grid grid-cols-2 gap-y-2 text-base"><p><strong>Tên sự kiện:</strong> {event.title}</p><p><strong>Thời gian:</strong> {event.date} {event.time}</p><p><strong>Địa điểm:</strong> {event.location}</p><p><strong>Số lượng TNV:</strong> {volunteers.filter(v => ['approved','completed'].includes(v.status)).length} / {event.volunteersNeeded}</p></div>
                <div className="mb-8"><h3 className="font-bold border-b border-black mb-2 text-lg">I. NỘI DUNG</h3><p className="text-justify whitespace-pre-wrap">{event.description}</p></div>
                <div className="mb-8"><h3 className="font-bold mb-4 text-lg border-b border-black pb-2">II. DANH SÁCH TNV</h3>
                  <table className="w-full border-collapse border border-black text-sm"><thead><tr><th className="border border-black p-2">STT</th><th className="border border-black p-2">Họ tên</th><th className="border border-black p-2">Email</th><th className="border border-black p-2">Trạng thái</th></tr></thead><tbody>{volunteers.map((v, i) => (<tr key={i}><td className="border border-black p-2 text-center">{i+1}</td><td className="border border-black p-2">{v.name}</td><td className="border border-black p-2">{v.email}</td><td className="border border-black p-2 text-center">{v.status}</td></tr>))}</tbody></table>
                </div>
              </div>

              {/* VÙNG WEB */}
              <div className="print:hidden space-y-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card><CardContent className="p-6 flex justify-between items-center"><div><p className="text-sm text-muted-foreground">Ngày diễn ra</p><p className="font-semibold">{event.date}</p></div><Calendar className="h-8 w-8 text-blue-500"/></CardContent></Card>
                  <Card><CardContent className="p-6 flex justify-between items-center"><div><p className="text-sm text-muted-foreground">Địa điểm</p><p className="font-semibold line-clamp-1">{event.location}</p></div><MapPin className="h-8 w-8 text-red-500"/></CardContent></Card>
                  <Card><CardContent className="p-6 flex justify-between items-center"><div><p className="text-sm text-muted-foreground">Tiến độ TNV</p><p className="font-semibold">{volunteers.filter(v => ['approved','completed'].includes(v.status)).length} / {event.volunteersNeeded}</p></div><Users className="h-8 w-8 text-green-500"/></CardContent></Card>
                  <Card><CardContent className="p-6 flex justify-between items-center"><div><p className="text-sm text-muted-foreground">Thảo luận</p><p className="font-semibold">{channelPosts.length}</p></div><MessageSquare className="h-8 w-8 text-purple-500"/></CardContent></Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-xl shadow-sm border">
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="volunteers">Quản lý TNV</TabsTrigger>
                    <TabsTrigger value="community">Thảo luận nhanh</TabsTrigger>
                    <TabsTrigger value="reports">Báo cáo</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <Card><CardHeader><CardTitle>Mô tả sự kiện</CardTitle></CardHeader><CardContent><p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p></CardContent></Card>
                  </TabsContent>

                  <TabsContent value="volunteers" className="mt-6 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex justify-between items-center"><div><p className="text-sm text-green-600 font-medium">Đã tham gia</p><h3 className="text-2xl font-bold text-green-700">{volunteers.filter(v => ['approved','completed'].includes(v.status)).length}</h3></div><UserCheck className="h-8 w-8 text-green-400"/></div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex justify-between items-center"><div><p className="text-sm text-yellow-600 font-medium">Chờ duyệt</p><h3 className="text-2xl font-bold text-yellow-700">{volunteers.filter(v => v.status === 'pending').length}</h3></div><Clock className="h-8 w-8 text-yellow-400"/></div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex justify-between items-center"><div><p className="text-sm text-red-600 font-medium">Từ chối</p><h3 className="text-2xl font-bold text-red-700">{volunteers.filter(v => v.status === 'rejected').length}</h3></div><UserX className="h-8 w-8 text-red-400"/></div>
                    </div>
                    <Card><CardHeader><CardTitle>Danh sách đăng ký</CardTitle></CardHeader><CardContent className="space-y-0 divide-y">{volunteers.map(v => (
                        <div key={v.id} className="flex flex-col sm:flex-row items-center justify-between p-4 hover:bg-gray-50">
                          <div className="mb-2 sm:mb-0"><div className="flex items-center gap-2 mb-1"><span className="font-semibold">{v.name}</span>{getVolunteerStatusBadge(v.status)}</div><div className="text-sm text-gray-500"><span className="mr-3">{v.email}</span><span>{v.registeredAt}</span></div></div>
                          <div className="flex gap-2">
                            {v.status === 'pending' && <><Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={()=>handleApproveVolunteer(v.id)}>Duyệt</Button><Button size="sm" variant="outline" className="text-red-600" onClick={()=>handleRejectVolunteer(v.id)}>Từ chối</Button></>}
                            {v.status === 'approved' && <Button size="sm" variant="outline" className="text-blue-600" onClick={()=>handleMarkCompleted(v.id)}>Hoàn thành</Button>}
                            {v.status === 'completed' && <Button size="sm" variant="ghost" onClick={()=>handleUndoCompletion(v.id)}>Hoàn tác</Button>}
                          </div>
                        </div>
                    ))}</CardContent></Card>
                  </TabsContent>

                  <TabsContent value="community" className="mt-6">
                    <Card className="border-none shadow-sm bg-transparent"><CardContent className="p-0">
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between items-center mb-6">
                        <div className="text-sm text-blue-700">💡 Mẹo: Quản lý chi tiết hơn tại trang <strong>Cộng đồng</strong>.</div>
                        <Button size="sm" variant="outline" className="bg-white text-blue-600" onClick={handleGoToCommunity}>Đi tới trang Cộng đồng</Button>
                      </div>
                      <div className="bg-white p-4 rounded-xl border shadow-sm mb-6">
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">{user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="User"/> : <User className="h-6 w-6 m-2 text-gray-500"/>}</div>
                          <div className="flex-1">
                            <Textarea placeholder="Gửi thông báo nhanh..." value={commentContent} onChange={(e) => setCommentContent(e.target.value)} className="bg-gray-50 border-0 min-h-[80px] mb-2"/>
                            <div className="flex justify-end"><Button size="sm" onClick={handlePostComment} disabled={submittingComment || !commentContent.trim()}>{submittingComment ? <LoadingSpinner size="sm"/> : <><Send className="w-3 h-3 mr-2"/> Gửi tin nhắn</>}</Button></div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">{channelPosts.length > 0 ? channelPosts.map(post => <PostItem key={post.id} post={post} currentUser={user} />) : <div className="text-center py-10 bg-white rounded-xl border border-dashed text-gray-500">Chưa có thảo luận nào.</div>}</div>
                    </CardContent></Card>
                  </TabsContent>

                  <TabsContent value="reports" className="mt-6 space-y-6">
                    <Card><CardHeader><CardTitle>Báo cáo sự kiện</CardTitle></CardHeader><CardContent><div className="p-4 border rounded-lg bg-gray-50 mb-4"><h4 className="font-semibold mb-2">Thống kê</h4><p className="text-sm text-muted-foreground">Tổng: {volunteers.length}</p></div><Button className="w-full bg-blue-600 text-white" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> In báo cáo ngay</Button></CardContent></Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </ManagerLayout>
  );
}