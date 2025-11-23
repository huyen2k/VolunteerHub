import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ManagerVolunteersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEvent, setFilterEvent] = useState("all");
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all events of the manager
      const managerEvents = await eventService.getEventsByManager(user.id);
      setEvents(managerEvents || []);

      // Fetch registrations for each event and aggregate volunteers
      const allVolunteers = [];
      const volunteerMap = new Map(); // To deduplicate volunteers across events

      for (const event of managerEvents || []) {
        try {
          // Fetch registrations for this event
          const registrations = await eventService.getEventRegistrations(
            event.id
          );

          // Fetch user details for each registration
          for (const reg of registrations || []) {
            const volunteerKey = reg.userId;

            // If we haven't seen this volunteer yet, fetch their details
            if (!volunteerMap.has(volunteerKey)) {
              try {
                const userData = await userService.getUserById(reg.userId);
                volunteerMap.set(volunteerKey, {
                  userId: reg.userId,
                  name: userData.full_name || "Unknown",
                  email: userData.email || "",
                  phone: userData.phone || "",
                  events: [],
                });
              } catch (err) {
                console.error(`Error fetching user ${reg.userId}:`, err);
                // Create a placeholder entry
                volunteerMap.set(volunteerKey, {
                  userId: reg.userId,
                  name: "Unknown",
                  email: "",
                  phone: "",
                  events: [],
                });
              }
            }

            // Add this event registration to the volunteer's events list
            const volunteer = volunteerMap.get(volunteerKey);
            volunteer.events.push({
              eventId: event.id,
              eventTitle: event.title || "Unknown Event",
              registrationId: reg.id,
              status: reg.status || "pending",
              registeredAt: reg.registeredAt
                ? new Date(reg.registeredAt).toLocaleDateString("vi-VN")
                : "",
            });
          }
        } catch (err) {
          console.error(
            `Error loading registrations for event ${event.id}:`,
            err
          );
        }
      }

      // Convert map to array and determine overall status
      const volunteersArray = Array.from(volunteerMap.values()).map(
        (volunteer) => {
          // Determine overall status: if any event is pending, status is pending
          // Otherwise, use the most recent event status
          const hasPending = volunteer.events.some(
            (e) => e.status === "pending"
          );
          const hasApproved = volunteer.events.some(
            (e) => e.status === "approved"
          );
          const hasRejected = volunteer.events.some(
            (e) => e.status === "rejected"
          );
          const hasCompleted = volunteer.events.some(
            (e) => e.status === "completed"
          );

          let overallStatus = "pending";
          if (hasPending) {
            overallStatus = "pending";
          } else if (hasCompleted) {
            overallStatus = "completed";
          } else if (hasApproved) {
            overallStatus = "approved";
          } else if (hasRejected) {
            overallStatus = "rejected";
          }

          return {
            ...volunteer,
            status: overallStatus,
            registeredAt: volunteer.events[0]?.registeredAt || "",
          };
        }
      );

      setVolunteers(volunteersArray);
    } catch (err) {
      console.error("Error loading volunteers:", err);
      setError(err.message || "Không thể tải danh sách tình nguyện viên");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
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

  const getEventStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-blue-500 text-white">Hoàn thành</Badge>;
      case "approved":
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
      volunteer.events.some((event) => event.eventId === filterEvent);

    return matchesSearch && matchesStatus && matchesEvent;
  });

  const handleApproveVolunteer = async (registrationId) => {
    try {
      await registrationService.updateRegistrationStatus(
        registrationId,
        "approved"
      );
      await loadData();
    } catch (err) {
      console.error("Error approving volunteer:", err);
      alert(
        "Không thể duyệt tình nguyện viên: " +
          (err.message || "Lỗi không xác định")
      );
    }
  };

  const handleRejectVolunteer = async (registrationId) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối tình nguyện viên này?")) {
      return;
    }
    try {
      await registrationService.updateRegistrationStatus(
        registrationId,
        "rejected"
      );
      await loadData();
    } catch (err) {
      console.error("Error rejecting volunteer:", err);
      alert(
        "Không thể từ chối tình nguyện viên: " +
          (err.message || "Lỗi không xác định")
      );
    }
  };

  const handleMarkCompleted = async (registrationId) => {
    try {
      await registrationService.updateRegistrationStatus(
        registrationId,
        "completed"
      );
      await loadData();
    } catch (err) {
      console.error("Error marking completed:", err);
      alert(
        "Không thể đánh dấu hoàn thành: " +
          (err.message || "Lỗi không xác định")
      );
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

  if (error) {
    return (
      <ManagerLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadData} className="mt-4">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

  // Calculate stats
  const totalVolunteers = volunteers.length;
  const approvedCount = volunteers.filter(
    (v) => v.status === "approved" || v.status === "completed"
  ).length;
  const pendingCount = volunteers.filter((v) => v.status === "pending").length;
  const rejectedCount = volunteers.filter(
    (v) => v.status === "rejected"
  ).length;

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
                      {totalVolunteers}
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
                      {approvedCount}
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
                      {pendingCount}
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
                      {rejectedCount}
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
                <option value="approved">Đã xác nhận</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="rejected">Từ chối</option>
                <option value="completed">Hoàn thành</option>
              </select>
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">Tất cả sự kiện</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title || "Unknown Event"}
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
              <Card key={volunteer.userId}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold">
                          {volunteer.name}
                        </h3>
                        {getStatusBadge(volunteer.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">
                            Email: {volunteer.email || "Chưa có"}
                          </p>
                          <p className="text-muted-foreground">
                            Số điện thoại: {volunteer.phone || "Chưa có"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            Đăng ký lúc: {volunteer.registeredAt || "Chưa có"}
                          </p>
                          <p className="text-muted-foreground">
                            Số sự kiện: {volunteer.events.length}
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
                              key={event.registrationId}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {event.eventTitle}
                                </span>
                                {getEventStatusBadge(event.status)}
                              </div>
                              <div className="flex gap-2">
                                {event.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600"
                                      onClick={() =>
                                        handleApproveVolunteer(
                                          event.registrationId
                                        )
                                      }
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Duyệt
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleRejectVolunteer(
                                          event.registrationId
                                        )
                                      }
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Từ chối
                                    </Button>
                                  </>
                                )}
                                {event.status === "approved" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleMarkCompleted(event.registrationId)
                                    }
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Đánh dấu hoàn thành
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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
                  {searchTerm || filterStatus !== "all" || filterEvent !== "all"
                    ? "Không có tình nguyện viên nào phù hợp với bộ lọc của bạn"
                    : "Chưa có tình nguyện viên nào đăng ký sự kiện của bạn"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
