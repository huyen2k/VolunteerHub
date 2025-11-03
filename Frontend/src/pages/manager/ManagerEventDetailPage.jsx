import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { ManagerLayout } from "../../components/Layout";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  CheckCircle2,
  XCircle,
  MessageSquare,
  UserCheck,
  UserX,
  ArrowLeft,
} from "lucide-react";

export default function ManagerEventDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - trong thực tế sẽ fetch từ API
  const event = {
    id: parseInt(id),
    title: "Dọn dẹp bãi biển Vũng Tàu",
    description:
      "Hoạt động dọn dẹp rác thải tại bãi biển Vũng Tàu để bảo vệ môi trường biển. Chúng ta sẽ thu gom rác thải, phân loại và xử lý đúng cách.",
    organization: "Green Earth Vietnam",
    date: "15/02/2025",
    time: "08:00 - 17:00",
    location: "Bãi biển Vũng Tàu, Vũng Tàu",
    volunteers: 25,
    maxVolunteers: 30,
    status: "approved",
    createdAt: "10/01/2025",
    requirements: [
      "Mang theo găng tay và dụng cụ bảo hộ",
      "Mặc quần áo thoải mái, dễ vận động",
      "Mang theo nước uống và đồ ăn nhẹ",
      "Có tinh thần tích cực và nhiệt tình",
    ],
    contact: {
      name: "Nguyễn Văn A",
      email: "contact@greenearth.vn",
      phone: "0901234567",
    },
  };

  const volunteers = [
    {
      id: 1,
      name: "Trần Thị B",
      email: "user1@example.com",
      phone: "0912345678",
      status: "confirmed",
      registeredAt: "12/01/2025",
      skills: ["Lãnh đạo", "Giao tiếp"],
      experience: "2 năm",
    },
    {
      id: 2,
      name: "Lê Văn C",
      email: "user2@example.com",
      phone: "0923456789",
      status: "pending",
      registeredAt: "13/01/2025",
      skills: ["Tổ chức", "Làm việc nhóm"],
      experience: "1 năm",
    },
    {
      id: 3,
      name: "Phạm Thị D",
      email: "user3@example.com",
      phone: "0934567890",
      status: "confirmed",
      registeredAt: "14/01/2025",
      skills: ["Giao tiếp", "Ngoại ngữ"],
      experience: "3 năm",
    },
    {
      id: 4,
      name: "Hoàng Văn E",
      email: "user4@example.com",
      phone: "0945678901",
      status: "rejected",
      registeredAt: "15/01/2025",
      skills: ["Kỹ thuật", "Sửa chữa"],
      experience: "1 năm",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white">Đã duyệt</Badge>;
      case "pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVolunteerStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500 text-white">Đã xác nhận</Badge>;
      case "pending":
        return <Badge variant="secondary">Chờ xác nhận</Badge>;
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleApproveVolunteer = (volunteerId) => {
    console.log("Approve volunteer:", volunteerId);
    // TODO: Implement approve logic
  };

  const handleRejectVolunteer = (volunteerId) => {
    console.log("Reject volunteer:", volunteerId);
    // TODO: Implement reject logic
  };

  const handleMarkCompleted = (volunteerId) => {
    console.log("Mark completed:", volunteerId);
    // TODO: Implement mark completed logic
  };

  return (
    <ManagerLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/manager/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                {getStatusBadge(event.status)}
              </div>
              <p className="text-muted-foreground">
                Tổ chức: {event.organization} | Tạo lúc: {event.createdAt}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/manager/events/${event.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Link>
              </Button>
              <Button asChild>
                <Link to={`/manager/community?event=${event.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Kênh trao đổi
                </Link>
              </Button>
            </div>
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
                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                    <p className="mt-1 text-lg font-semibold">
                      {event.status === "approved"
                        ? "Đã duyệt"
                        : event.status === "pending"
                        ? "Chờ duyệt"
                        : "Từ chối"}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="volunteers">Tình nguyện viên</TabsTrigger>
              <TabsTrigger value="reports">Báo cáo</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Mô tả sự kiện</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{event.description}</p>
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

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin liên hệ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <strong>Người phụ trách:</strong> {event.contact.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {event.contact.email}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {event.contact.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volunteers" className="mt-6 space-y-6">
              {/* Volunteer Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Đã xác nhận
                        </p>
                        <p className="mt-1 text-2xl font-bold text-green-600">
                          {
                            volunteers.filter((v) => v.status === "confirmed")
                              .length
                          }
                        </p>
                      </div>
                      <UserCheck className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Chờ xác nhận
                        </p>
                        <p className="mt-1 text-2xl font-bold text-yellow-600">
                          {
                            volunteers.filter((v) => v.status === "pending")
                              .length
                          }
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Từ chối</p>
                        <p className="mt-1 text-2xl font-bold text-red-600">
                          {
                            volunteers.filter((v) => v.status === "rejected")
                              .length
                          }
                        </p>
                      </div>
                      <UserX className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Volunteers List */}
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách tình nguyện viên</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {volunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{volunteer.name}</h4>
                          {getVolunteerStatusBadge(volunteer.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Email: {volunteer.email}</p>
                          <p>Số điện thoại: {volunteer.phone}</p>
                          <p>Kỹ năng: {volunteer.skills.join(", ")}</p>
                          <p>Kinh nghiệm: {volunteer.experience}</p>
                          <p>Đăng ký lúc: {volunteer.registeredAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {volunteer.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() =>
                                handleApproveVolunteer(volunteer.id)
                              }
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Xác nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleRejectVolunteer(volunteer.id)
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        {volunteer.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkCompleted(volunteer.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Đánh dấu hoàn thành
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Báo cáo sự kiện</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Thống kê đăng ký</h4>
                      <p className="text-sm text-muted-foreground">
                        Tổng số đăng ký: {volunteers.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tỷ lệ xác nhận:{" "}
                        {Math.round(
                          (volunteers.filter((v) => v.status === "confirmed")
                            .length /
                            volunteers.length) *
                            100
                        )}
                        %
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Thống kê kỹ năng</h4>
                      <p className="text-sm text-muted-foreground">
                        Kỹ năng phổ biến: Lãnh đạo, Giao tiếp
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Kinh nghiệm trung bình: 1.75 năm
                      </p>
                    </div>
                  </div>
                  <Button className="w-full">Xuất báo cáo PDF</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ManagerLayout>
  );
}
