import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { ManagerLayout } from "../../components/Layout";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Calendar,
  MapPin,
  Filter,
} from "lucide-react";

export default function ManagerVolunteersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEvent, setFilterEvent] = useState("all");

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
      events: [
        { id: 1, title: "Dọn dẹp bãi biển Vũng Tàu", status: "completed" },
        { id: 2, title: "Trồng cây xanh", status: "confirmed" },
      ],
      rating: 4.8,
      completedEvents: 5,
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
      events: [
        { id: 1, title: "Dọn dẹp bãi biển Vũng Tàu", status: "pending" },
      ],
      rating: 4.2,
      completedEvents: 2,
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
      events: [
        { id: 1, title: "Dọn dẹp bãi biển Vũng Tàu", status: "confirmed" },
        { id: 3, title: "Dạy học cho trẻ em", status: "confirmed" },
      ],
      rating: 4.9,
      completedEvents: 8,
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
      events: [
        { id: 1, title: "Dọn dẹp bãi biển Vũng Tàu", status: "rejected" },
      ],
      rating: 3.5,
      completedEvents: 1,
    },
    {
      id: 5,
      name: "Nguyễn Thị F",
      email: "user5@example.com",
      phone: "0956789012",
      status: "confirmed",
      registeredAt: "16/01/2025",
      skills: ["Nhiếp ảnh", "Thiết kế"],
      experience: "2 năm",
      events: [
        { id: 2, title: "Trồng cây xanh", status: "confirmed" },
        { id: 3, title: "Dạy học cho trẻ em", status: "confirmed" },
      ],
      rating: 4.6,
      completedEvents: 4,
    },
  ];

  const events = [
    { id: 1, title: "Dọn dẹp bãi biển Vũng Tàu" },
    { id: 2, title: "Trồng cây xanh tại công viên" },
    { id: 3, title: "Dạy học cho trẻ em nghèo" },
    { id: 4, title: "Phân phát thức ăn cho người vô gia cư" },
  ];

  const getStatusBadge = (status) => {
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

  const getEventStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-blue-500 text-white">Hoàn thành</Badge>;
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

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || volunteer.status === filterStatus;

    const matchesEvent =
      filterEvent === "all" ||
      volunteer.events.some((event) => event.id === parseInt(filterEvent));

    return matchesSearch && matchesStatus && matchesEvent;
  });

  const handleApproveVolunteer = (volunteerId) => {
    console.log("Approve volunteer:", volunteerId);
    // TODO: Implement approve logic
  };

  const handleRejectVolunteer = (volunteerId) => {
    console.log("Reject volunteer:", volunteerId);
    // TODO: Implement reject logic
  };

  const handleMarkCompleted = (volunteerId, eventId) => {
    console.log("Mark completed:", volunteerId, eventId);
    // TODO: Implement mark completed logic
  };

  return (
    <ManagerLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Quản lý tình nguyện viên</h1>
            <p className="mt-2 text-muted-foreground">
              Xác nhận đăng ký và đánh dấu hoàn thành cho tình nguyện viên
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng tình nguyện viên
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {volunteers.length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Đã xác nhận</p>
                    <p className="mt-1 text-3xl font-bold text-green-600">
                      {
                        volunteers.filter((v) => v.status === "confirmed")
                          .length
                      }
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
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
                    <p className="mt-1 text-3xl font-bold text-yellow-600">
                      {volunteers.filter((v) => v.status === "pending").length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Từ chối</p>
                    <p className="mt-1 text-3xl font-bold text-red-600">
                      {volunteers.filter((v) => v.status === "rejected").length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tình nguyện viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="rejected">Từ chối</option>
              </select>
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">Tất cả sự kiện</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredVolunteers.length} / {volunteers.length} tình
              nguyện viên
            </div>
          </div>

          {/* Volunteers List */}
          <div className="grid gap-6">
            {filteredVolunteers.map((volunteer) => (
              <Card key={volunteer.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold">
                          {volunteer.name}
                        </h3>
                        {getStatusBadge(volunteer.status)}
                        <Badge variant="outline">⭐ {volunteer.rating}</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">
                            Email: {volunteer.email}
                          </p>
                          <p className="text-muted-foreground">
                            Số điện thoại: {volunteer.phone}
                          </p>
                          <p className="text-muted-foreground">
                            Kinh nghiệm: {volunteer.experience}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            Đăng ký lúc: {volunteer.registeredAt}
                          </p>
                          <p className="text-muted-foreground">
                            Sự kiện hoàn thành: {volunteer.completedEvents}
                          </p>
                          <p className="text-muted-foreground">
                            Kỹ năng: {volunteer.skills.join(", ")}
                          </p>
                        </div>
                      </div>

                      {/* Events */}
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">
                          Sự kiện tham gia:
                        </h4>
                        <div className="space-y-2">
                          {volunteer.events.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{event.title}</span>
                                {getEventStatusBadge(event.status)}
                              </div>
                              {event.status === "confirmed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleMarkCompleted(volunteer.id, event.id)
                                  }
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Đánh dấu hoàn thành
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:flex-row">
                      {volunteer.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleApproveVolunteer(volunteer.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Xác nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectVolunteer(volunteer.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        Xem hồ sơ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVolunteers.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Không tìm thấy tình nguyện viên
                </h3>
                <p className="text-muted-foreground text-center">
                  Không có tình nguyện viên nào phù hợp với bộ lọc của bạn
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
