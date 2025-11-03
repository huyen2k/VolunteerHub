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
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ManagerEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const events = [
    {
      id: 1,
      title: "Dọn dẹp bãi biển Vũng Tàu",
      description: "Hoạt động dọn dẹp rác thải tại bãi biển Vũng Tàu",
      organization: "Green Earth Vietnam",
      date: "15/02/2025",
      time: "08:00 - 17:00",
      location: "Bãi biển Vũng Tàu",
      volunteers: 25,
      maxVolunteers: 30,
      status: "approved",
      createdAt: "10/01/2025",
    },
    {
      id: 2,
      title: "Trồng cây xanh tại công viên",
      description: "Trồng cây xanh để tạo môi trường xanh sạch đẹp",
      organization: "Eco Warriors",
      date: "20/02/2025",
      time: "07:00 - 12:00",
      location: "Công viên Thống Nhất",
      volunteers: 15,
      maxVolunteers: 20,
      status: "pending",
      createdAt: "12/01/2025",
    },
    {
      id: 3,
      title: "Dạy học cho trẻ em nghèo",
      description: "Dạy học miễn phí cho trẻ em có hoàn cảnh khó khăn",
      organization: "Education For All",
      date: "25/02/2025",
      time: "14:00 - 18:00",
      location: "Trung tâm Hà Nội",
      volunteers: 8,
      maxVolunteers: 15,
      status: "approved",
      createdAt: "15/01/2025",
    },
    {
      id: 4,
      title: "Phân phát thức ăn cho người vô gia cư",
      description: "Phân phát thức ăn và đồ dùng cần thiết",
      organization: "Care & Share Foundation",
      date: "28/02/2025",
      time: "18:00 - 21:00",
      location: "Quận 1, TP.HCM",
      volunteers: 12,
      maxVolunteers: 25,
      status: "rejected",
      createdAt: "18/01/2025",
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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (eventId) => {
    console.log("Approve event:", eventId);
    // TODO: Implement approve logic
  };

  const handleReject = (eventId) => {
    console.log("Reject event:", eventId);
    // TODO: Implement reject logic
  };

  const handleDelete = (eventId) => {
    console.log("Delete event:", eventId);
    // TODO: Implement delete logic
  };

  return (
    <ManagerLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
              <p className="mt-2 text-muted-foreground">
                Tạo, chỉnh sửa và quản lý các sự kiện của bạn
              </p>
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link to="/manager/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Tạo sự kiện mới
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sự kiện..."
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
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredEvents.length} / {events.length} sự kiện
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {event.volunteers}/{event.maxVolunteers} tình nguyện
                            viên
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Tạo lúc: {event.createdAt} | Tổ chức:{" "}
                        {event.organization}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 lg:flex-row">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/manager/events/${event.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/manager/events/${event.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </Button>
                      {event.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleApprove(event.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(event.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Không tìm thấy sự kiện
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterStatus !== "all"
                    ? "Không có sự kiện nào phù hợp với bộ lọc của bạn"
                    : "Bạn chưa tạo sự kiện nào"}
                </p>
                <Button asChild>
                  <Link to="/manager/events/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo sự kiện đầu tiên
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
