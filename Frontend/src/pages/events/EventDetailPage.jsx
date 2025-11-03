import React, { useState } from "react";
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

export default function EventDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mock data - trong thực tế sẽ fetch từ API
  const event = {
    id: parseInt(id),
    title: "Dọn dẹp bãi biển Vũng Tàu",
    description:
      "Hoạt động dọn dẹp rác thải tại bãi biển Vũng Tàu để bảo vệ môi trường biển. Chúng ta sẽ thu gom rác thải, phân loại và xử lý đúng cách. Đây là hoạt động ý nghĩa giúp bảo vệ môi trường biển và tạo ý thức bảo vệ môi trường cho cộng đồng.",
    organization: "Green Earth Vietnam",
    date: "15/02/2025",
    time: "08:00 - 17:00",
    location: "Bãi biển Vũng Tàu, Vũng Tàu",
    volunteers: 25,
    maxVolunteers: 30,
    status: "published",
    category: "Môi trường",
    image: "/beach-cleanup-volunteers.png",
    requirements: [
      "Mang theo găng tay và dụng cụ bảo hộ",
      "Mặc quần áo thoải mái, dễ vận động",
      "Mang theo nước uống và đồ ăn nhẹ",
      "Có tinh thần tích cực và nhiệt tình",
      "Tuân thủ hướng dẫn của ban tổ chức",
    ],
    benefits: [
      "Nhận chứng chỉ tham gia tình nguyện",
      "Cơ hội giao lưu với các tình nguyện viên khác",
      "Học hỏi về bảo vệ môi trường",
      "Đóng góp tích cực cho cộng đồng",
    ],
    contact: {
      name: "Nguyễn Văn A",
      email: "contact@greenearth.vn",
      phone: "0901234567",
      role: "Trưởng nhóm",
    },
    likes: 12,
    comments: 8,
    shares: 3,
  };

  const relatedEvents = [
    {
      id: 2,
      title: "Trồng cây xanh tại công viên",
      date: "20/02/2025",
      location: "Công viên Thống Nhất",
      volunteers: 15,
      maxVolunteers: 20,
      category: "Môi trường",
    },
    {
      id: 3,
      title: "Dạy học cho trẻ em nghèo",
      date: "25/02/2025",
      location: "Trung tâm Hà Nội",
      volunteers: 8,
      maxVolunteers: 15,
      category: "Giáo dục",
    },
  ];

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Vui lòng đăng nhập để đăng ký tham gia sự kiện này",
          returnTo: `/events/${event.id}`,
        },
      });
    } else {
      console.log("Register for event:", event.id);
    }
  };

  const handleCommunityClick = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Vui lòng đăng nhập để tham gia thảo luận",
          returnTo: `/events/${event.id}`,
        },
      });
    } else {
      navigate(`/community?event=${event.id}`);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Vui lòng đăng nhập để thích sự kiện này",
          returnTo: `/events/${event.id}`,
        },
      });
    } else {
      console.log("Like event:", event.id);
    }
  };

  const handleShare = () => {
    console.log("Share event:", event.id);
  };

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
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <Badge className="bg-primary text-primary-foreground">
                  {event.category}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Tổ chức: {event.organization}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLike}>
                <Heart className="mr-2 h-4 w-4" />
                {event.likes}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
            </div>
          </div>

          {/* Login Prompt for Guest */}
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
              src={event.image || "/placeholder.svg"}
              alt={event.title}
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
                    <p className="mt-1 text-lg font-semibold">{event.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.time}
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
                      {event.location}
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
                    <p className="text-sm text-muted-foreground">
                      Tình nguyện viên
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {event.volunteers}/{event.maxVolunteers}
                    </p>
                    <p className="text-xs text-green-600">
                      {Math.round(
                        (event.volunteers / event.maxVolunteers) * 100
                      )}
                      % đã đăng ký
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
                      {event.likes + event.comments + event.shares}
                    </p>
                    <p className="text-xs text-blue-600">
                      {event.likes} thích, {event.comments} bình luận
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
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Yêu cầu tham gia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {event.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Benefits */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Lợi ích khi tham gia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {event.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="mt-6 space-y-6">
                  {/* Contact Info */}
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
                              {event.contact.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {event.contact.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{event.contact.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{event.contact.phone}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Event Schedule */}
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
                      <CardTitle>Kênh trao đổi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Tham gia thảo luận với các tình nguyện viên khác về sự
                        kiện này.
                      </p>
                      {isAuthenticated ? (
                        <Button asChild className="w-full">
                          <Link to={`/community?event=${event.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Tham gia thảo luận
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          onClick={handleCommunityClick}
                          className="w-full"
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Đăng nhập để tham gia thảo luận
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
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Còn {event.maxVolunteers - event.volunteers} chỗ trống
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mb-4">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            (event.volunteers / event.maxVolunteers) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() =>
                          console.log("Register for event:", event.id)
                        }
                      >
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

              {/* Related Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Sự kiện liên quan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedEvents.map((relatedEvent) => (
                    <div
                      key={relatedEvent.id}
                      className="p-3 border rounded-lg"
                    >
                      <h4 className="font-semibold text-sm">
                        {relatedEvent.title}
                      </h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        <p>
                          {relatedEvent.date} - {relatedEvent.location}
                        </p>
                        <p>
                          {relatedEvent.volunteers}/{relatedEvent.maxVolunteers}{" "}
                          tình nguyện viên
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        asChild
                      >
                        <Link to={`/events/${relatedEvent.id}`}>
                          Xem chi tiết
                        </Link>
                      </Button>
                    </div>
                  ))}
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
                    <span className="font-semibold">{event.likes}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bình luận</span>
                    <span className="font-semibold">{event.comments}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Chia sẻ</span>
                    <span className="font-semibold">{event.shares}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tỷ lệ đăng ký</span>
                    <span className="font-semibold">
                      {Math.round(
                        (event.volunteers / event.maxVolunteers) * 100
                      )}
                      %
                    </span>
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
