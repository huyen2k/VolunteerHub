import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ManagerEventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch event details
      const eventData = await eventService.getEventById(id);
      setEvent({
        id: eventData.id,
        title: eventData.title || "Không có tiêu đề",
        description: eventData.description || "",
        date: eventData.date ? new Date(eventData.date).toLocaleDateString("vi-VN") : "Chưa có",
        location: eventData.location || "Chưa có",
        status: eventData.status || "pending",
        createdAt: eventData.createdAt ? new Date(eventData.createdAt).toLocaleDateString("vi-VN") : "",
      });

      // Fetch registrations
      const registrations = await eventService.getEventRegistrations(id);
      
      // Fetch user details for each registration
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
          } catch (err) {
            return {
              id: reg.id,
              userId: reg.userId,
              name: "Unknown",
              email: "",
              status: reg.status || "pending",
              registeredAt: reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString("vi-VN") : "",
            };
          }
        })
      );
      
      setVolunteers(volunteersWithDetails);
    } catch (err) {
      console.error("Error loading event data:", err);
      setError(err.message || "Không thể tải thông tin sự kiện");
    } finally {
      setLoading(false);
    }
  };


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
      case "approved":
      case "completed":
        return <Badge className="bg-green-500 text-white">Đã xác nhận</Badge>;
      case "pending":
        return <Badge variant="secondary">Chờ xác nhận</Badge>;
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const exportEventReportPDF = () => {
    const doc = window.open("", "_blank");
    if (!doc) return;
    const html = `
      <html>
      <head>
        <title>Báo cáo sự kiện</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          h2 { font-size: 16px; margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>${event.title}</h1>
        <div>Ngày: ${event.date}</div>
        <div>Địa điểm: ${event.location}</div>
        <div>Trạng thái: ${event.status}</div>
        <h2>Danh sách người tham gia (${volunteers.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Đăng ký lúc</th>
            </tr>
          </thead>
          <tbody>
            ${volunteers.map(v => `
              <tr>
                <td>${v.name || ''}</td>
                <td>${v.email || ''}</td>
                <td>${v.status || ''}</td>
                <td>${v.registeredAt || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    doc.document.write(html);
    doc.document.close();
  };

  const handleApproveVolunteer = async (registrationId) => {
    try {
      await registrationService.updateRegistrationStatus(registrationId, "approved");
      await loadEventData();
    } catch (err) {
      console.error("Error approving volunteer:", err);
      alert("Không thể duyệt tình nguyện viên: " + (err.message || "Lỗi không xác định"));
    }
  };

  const handleRejectVolunteer = async (registrationId) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối tình nguyện viên này?")) {
      return;
    }
    try {
      await registrationService.updateRegistrationStatus(registrationId, "rejected");
      await loadEventData();
    } catch (err) {
      console.error("Error rejecting volunteer:", err);
      alert("Không thể từ chối tình nguyện viên: " + (err.message || "Lỗi không xác định"));
    }
  };

  const handleMarkCompleted = async (registrationId) => {
    try {
      await registrationService.updateRegistrationStatus(registrationId, "completed");
      await loadEventData();
    } catch (err) {
      console.error("Error marking completed:", err);
      alert("Không thể đánh dấu hoàn thành: " + (err.message || "Lỗi không xác định"));
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="container mx-auto p-6">
          <LoadingSpinner />
        </div>
      </ManagerLayout>
    );
  }

  if (error || !event) {
    return (
      <ManagerLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error || "Không tìm thấy sự kiện"}</p>
              <Button onClick={loadEventData} className="mt-4">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

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
                Tạo lúc: {event.createdAt}
              </p>
            </div>
            <div className="flex gap-2">
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
                      {volunteers.length}
                    </p>
                    <p className="text-xs text-green-600">
                      {volunteers.filter(v => v.status === "approved" || v.status === "completed").length} đã xác nhận
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
                            volunteers.filter((v) => v.status === "approved" || v.status === "completed")
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
                        {volunteer.status === "approved" && (
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
                        {volunteers.length > 0
                          ? Math.round(
                              (volunteers.filter((v) => v.status === "approved" || v.status === "completed")
                                .length /
                                volunteers.length) *
                                100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                  <Button className="w-full" onClick={exportEventReportPDF}>Xuất báo cáo PDF</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ManagerLayout>
  );
}
