import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { GuestLayout } from "../../components/Layout";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Textarea } from "../../components/ui/textarea";
import postService from "../../services/postService";
import channelService from "../../services/channelService";
import userService from "../../services/userService";
import reportService from "../../services/reportService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { AlertCircle } from "lucide-react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  Mail,
  LogIn,
} from "lucide-react";

const defaultEventImage =
  "https://www.wildapricot.com/wp-content/uploads/2022/10/bigstock-portrait-of-a-happy-and-divers-19389686.jpg";

export default function EventDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [event, setEvent] = useState(null);
  const [managerContact, setManagerContact] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [eventReportText, setEventReportText] = useState("");
  const [eventReportOpen, setEventReportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await eventService.getEventById(id);
        // Map backend
        const mappedEvent = {
          id: data.id || data._id || id,
          title: data.title || "Không có tiêu đề",
          description: data.description || "",
          location: data.location || "Chưa có địa điểm",
          date: data.date
            ? new Date(data.date).toLocaleDateString("vi-VN")
            : "",
          status: data.status || "pending",
          category: data.category || "Sự kiện",
          image: data.image || defaultEventImage,
          volunteers: 0,
          maxVolunteers: data.volunteersNeeded || 0,
          likes: 0,
          comments: 0,
          shares: 0,
          contact: null,
        };
        setEvent(mappedEvent);
        if (data.createdBy) {
          try {
            const creator = await userService.getUserById(data.createdBy);
            setManagerContact({
              name: creator.full_name || creator.email || "Ban tổ chức",
              email: creator.email || "",
              phone: creator.phone || "",
              role: "Quản lý sự kiện",
            });
          } catch {}
        }
      } catch (err) {
        setError(err.message || "Không thể tải thông tin sự kiện");
        console.error("Error loading event:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEvent();
    }
  }, [id]);

  // Sử dụng event được lấy hoặc exception for default
  const displayEvent = event || {
    id: id,
    title: "",
    description: "",
    location: "",
    date: "",
    status: "pending",
    category: "Sự kiện",
    image: defaultEventImage,
    volunteers: 0,
    maxVolunteers: 100,
    likes: 0,
    comments: 0,
    shares: 0,
    requirements: [],
    benefits: [],
    contact: {
      name: "Ban tổ chức",
      email: "contact@volunteerhub.com",
      phone: "0123456789",
      role: "Quản lý sự kiện",
    },
  };

  const handleRegisterClick = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Vui lòng đăng nhập để đăng ký tham gia sự kiện này",
          returnTo: `/events/${id}`,
        },
      });
    } else {
      try {
        await eventService.registerForEvent(id);
        alert("Đăng ký thành công! Bạn sẽ nhận được thông báo xác nhận.");
        navigate("/user/events");
      } catch (err) {
        alert("Đăng ký thất bại: " + err.message);
      }
    }
  };

  const handleCommunityClick = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Vui lòng đăng nhập để tham gia thảo luận",
          returnTo: `/events/${id}`,
        },
      });
    } else {
      navigate(`/community?event=${id}`);
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !commentContent.trim()) return;
    setSubmittingComment(true);
    try {
      let channel;
      try {
        channel = await channelService.getChannelByEventId(id);
      } catch (err) {
        channel = await channelService.createChannel({ eventId: id });
      }
      await postService.createPost({
        content: commentContent.trim(),
        images: [],
        channelId: channel.id,
      });
      setCommentContent("");
      alert("Đã gửi bình luận vào kênh sự kiện");
    } catch (err) {
      alert(
        "Không thể gửi bình luận: " + (err.message || "Lỗi không xác định")
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const submitEventReport = async () => {
    if (!eventReportText.trim()) return;
    try {
      await reportService.createReport({
        type: "event",
        targetId: id,
        title: "Báo cáo sự kiện",
        description: eventReportText.trim(),
      });
      setEventReportText("");
      alert("Đã gửi báo cáo sự kiện");
    } catch (err) {
      alert("Không thể gửi báo cáo: " + (err.message || "Lỗi không xác định"));
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Vui lòng đăng nhập để thích sự kiện này",
          returnTo: `/events/${id}`,
        },
      });
    } else {
      console.log("Like event:", id);
    }
  };

  const handleShare = () => {
    console.log("Share event:", id);
  };

  if (loading) {
    return (
      <GuestLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </GuestLayout>
    );
  }

  if (error || !event) {
    return (
      <GuestLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
              <p className="text-muted-foreground text-center mb-4">
                {error || "Không tìm thấy sự kiện"}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => navigate("/events")} variant="outline">
                  Quay lại danh sách
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{displayEvent.title}</h1>
                <Badge className="bg-primary text-primary-foreground">
                  {displayEvent.category}
                </Badge>
                <Badge
                  variant={
                    displayEvent.status === "approved" ? "default" : "secondary"
                  }
                >
                  {displayEvent.status === "approved"
                    ? "Đã duyệt"
                    : displayEvent.status === "pending"
                    ? "Chờ duyệt"
                    : displayEvent.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLike}>
                <Heart className="mr-2 h-4 w-4" />
                {displayEvent.likes}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
              <Button
                variant="outline"
                onClick={() => setEventReportOpen(true)}
              >
                <AlertCircle className="mr-2 h-4 w-4" /> Báo cáo
              </Button>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <LogIn className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-800">
                    Muốn tham gia sự kiện này?
                  </p>
                  <p className="text-sm text-blue-700">
                    Đăng nhập để đăng ký tham gia và truy cập đầy đủ tính năng
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link to="/login">Đăng nhập</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/register">Đăng ký</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Event Image */}
          <div className="mb-8">
            <img
              src={displayEvent.image || "/placeholder.svg"}
              alt={displayEvent.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          {/* Event Info Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ngày diễn ra
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {displayEvent.date || "Chưa có"}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Địa điểm</p>
                    <p className="mt-1 text-lg font-semibold">
                      {displayEvent.location}
                    </p>
                  </div>
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                    <p className="mt-1 text-lg font-semibold">
                      {displayEvent.status === "approved"
                        ? "Đã duyệt"
                        : displayEvent.status === "pending"
                        ? "Chờ duyệt"
                        : displayEvent.status}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tương tác</p>
                    <p className="mt-1 text-lg font-semibold">
                      {displayEvent.likes +
                        displayEvent.comments +
                        displayEvent.shares}
                    </p>
                    <p className="text-xs text-blue-600">
                      {displayEvent.likes} thích, {displayEvent.comments} bình
                      luận
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="details">Chi tiết</TabsTrigger>
                  <TabsTrigger value="community">Cộng đồng</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Mô tả sự kiện</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {displayEvent.description || "Chưa có mô tả"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  {displayEvent.requirements &&
                    displayEvent.requirements.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Yêu cầu tham gia</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {displayEvent.requirements.map((req, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                  {/* Benefits */}
                  {displayEvent.benefits &&
                    displayEvent.benefits.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Lợi ích khi tham gia</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {displayEvent.benefits.map((benefit, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                </TabsContent>

                <TabsContent value="details" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Thông tin liên hệ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">
                              {managerContact?.name || "Ban tổ chức"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {managerContact?.role || "Quản lý sự kiện"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">
                            {managerContact?.email ||
                              "contact@volunteerhub.com"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">
                            {managerContact?.phone || "0123456789"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Dialog
                    open={eventReportOpen}
                    onOpenChange={setEventReportOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Báo cáo sự kiện</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Mô tả vấn đề của sự kiện..."
                          value={eventReportText}
                          onChange={(e) => setEventReportText(e.target.value)}
                          rows={4}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setEventReportOpen(false)}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={async () => {
                              await submitEventReport();
                              setEventReportOpen(false);
                            }}
                            disabled={!eventReportText.trim()}
                          >
                            Gửi báo cáo
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lịch trình sự kiện</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">08:00 - 08:30</p>
                            <p className="text-sm text-muted-foreground">
                              Tập trung và điểm danh
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">08:30 - 12:00</p>
                            <p className="text-sm text-muted-foreground">
                              Dọn dẹp rác thải
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">12:00 - 13:00</p>
                            <p className="text-sm text-muted-foreground">
                              Nghỉ trưa
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">13:00 - 17:00</p>
                            <p className="text-sm text-muted-foreground">
                              Tiếp tục dọn dẹp và tổng kết
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="community" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bình luận sự kiện</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isAuthenticated ? (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Viết bình luận về sự kiện này..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            rows={4}
                          />
                          <Button
                            className="w-full"
                            onClick={handleSubmitComment}
                            disabled={
                              submittingComment || !commentContent.trim()
                            }
                          >
                            <MessageSquare className="mr-2 h-4 w-4" /> Gửi bình
                            luận
                          </Button>
                          <Button variant="outline" className="w-full" asChild>
                            <Link to={`/community?event=${event.id}`}>
                              Xem thảo luận trong cộng đồng
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleCommunityClick}
                          className="w-full"
                        >
                          <LogIn className="mr-2 h-4 w-4" /> Đăng nhập để bình
                          luận
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration */}
              <Card>
                <CardHeader>
                  <CardTitle>Đăng ký tham gia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Button className="w-full" onClick={handleRegisterClick}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Đăng ký tham gia
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Bạn sẽ nhận được thông báo xác nhận sau khi đăng ký
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button className="w-full" onClick={handleRegisterClick}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Đăng nhập để đăng ký
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Đăng nhập để có thể đăng ký tham gia sự kiện
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Event Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê sự kiện</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lượt thích</span>
                    <span className="font-semibold">{displayEvent.likes}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bình luận</span>
                    <span className="font-semibold">
                      {displayEvent.comments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Chia sẻ</span>
                    <span className="font-semibold">{displayEvent.shares}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <Badge
                      variant={
                        displayEvent.status === "approved"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {displayEvent.status === "approved"
                        ? "Đã duyệt"
                        : displayEvent.status === "pending"
                        ? "Chờ duyệt"
                        : displayEvent.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
