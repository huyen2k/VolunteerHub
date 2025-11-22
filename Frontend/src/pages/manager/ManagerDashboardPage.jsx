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
import { ManagerLayout } from "../../components/Layout";
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  Plus,
  Eye,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import statisticsService from "../../services/statisticsService";
import eventService from "../../services/eventService";
import channelService from "../../services/channelService";
import postService from "../../services/postService";
import registrationService from "../../services/registrationService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [events, setEvents] = useState([]);
  const [newlyPublishedEvents, setNewlyPublishedEvents] = useState([]);
  const [eventsWithNewPosts, setEventsWithNewPosts] = useState([]);
  const [attractiveEvents, setAttractiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch statistics
      const stats = await statisticsService.getEventStatistics(user.id);
      setStatistics(stats);

      // Fetch all events of manager
      const managerEvents = await eventService.getEventsByManager(user.id);
      setEvents(managerEvents || []);

      // Calculate dates
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // 1. Newly published events (created in last 7 days, status = approved)
      const newlyPublished = (managerEvents || [])
        .filter((event) => {
          if (event.status !== "approved") return false;
          const createdAt = event.createdAt ? new Date(event.createdAt) : null;
          return createdAt && createdAt >= sevenDaysAgo;
        })
        .map((event) => ({
          id: event.id,
          title: event.title || "Không có tiêu đề",
          date: event.date
            ? new Date(event.date).toLocaleDateString("vi-VN")
            : "Chưa có",
          location: event.location || "Chưa có",
          status: event.status,
          createdAt: event.createdAt
            ? new Date(event.createdAt).toLocaleDateString("vi-VN")
            : "",
        }));

      setNewlyPublishedEvents(newlyPublished);

      // 2. Events with new posts (posts created in last 24h)
      const eventsWithPosts = [];
      for (const event of managerEvents || []) {
        if (event.status !== "approved") continue;

        try {
          // Get channel for this event
          let channel;
          try {
            channel = await channelService.getChannelByEventId(event.id);
          } catch (err) {
            // Channel doesn't exist, skip
            continue;
          }

          if (channel) {
            // Get posts for this channel
            const channelPosts = await postService
              .getPostsByChannel(channel.id)
              .catch(() => []);

            // Check if there are posts created in last 24h
            const recentPosts = (channelPosts || []).filter((post) => {
              const postDate = post.createdAt ? new Date(post.createdAt) : null;
              return postDate && postDate >= twentyFourHoursAgo;
            });

            if (recentPosts.length > 0) {
              eventsWithPosts.push({
                id: event.id,
                title: event.title || "Không có tiêu đề",
                date: event.date
                  ? new Date(event.date).toLocaleDateString("vi-VN")
                  : "Chưa có",
                location: event.location || "Chưa có",
                status: event.status,
                newPostsCount: recentPosts.length,
              });
            }
          }
        } catch (err) {
          console.error(`Error loading posts for event ${event.id}:`, err);
        }
      }

      setEventsWithNewPosts(eventsWithPosts);

      // 3. Attractive events (rapid member increase + interaction in last 7 days)
      const attractive = [];
      for (const event of managerEvents || []) {
        if (event.status !== "approved") continue;

        try {
          // Get registrations for this event
          const registrations = await registrationService
            .getRegistrationsByEvent(event.id)
            .catch(() => []);

          // Count new registrations in last 7 days
          const newRegistrations = (registrations || []).filter((reg) => {
            const regDate = reg.registeredAt
              ? new Date(reg.registeredAt)
              : null;
            return regDate && regDate >= sevenDaysAgo;
          }).length;

          // Get channel and posts for interaction calculation
          let totalLikes = 0;
          let totalComments = 0;
          try {
            const channel = await channelService
              .getChannelByEventId(event.id)
              .catch(() => null);

            if (channel) {
              const channelPosts = await postService
                .getPostsByChannel(channel.id)
                .catch(() => []);

              // Calculate likes and comments from posts created in last 7 days
              const recentPosts = (channelPosts || []).filter((post) => {
                const postDate = post.createdAt
                  ? new Date(post.createdAt)
                  : null;
                return postDate && postDate >= sevenDaysAgo;
              });

              for (const post of recentPosts) {
                totalLikes += post.likeCount || post.likes || 0;
                totalComments += post.commentCount || post.comments || 0;
              }
            }
          } catch (err) {
            console.error(
              `Error loading channel/posts for event ${event.id}:`,
              err
            );
          }

          // Calculate attractiveness score (new registrations + interactions)
          const attractivenessScore =
            newRegistrations + totalLikes + totalComments;

          if (attractivenessScore > 0) {
            attractive.push({
              id: event.id,
              title: event.title || "Không có tiêu đề",
              date: event.date
                ? new Date(event.date).toLocaleDateString("vi-VN")
                : "Chưa có",
              location: event.location || "Chưa có",
              status: event.status,
              newRegistrations,
              totalLikes,
              totalComments,
              attractivenessScore,
              totalVolunteers: (registrations || []).length,
            });
          }
        } catch (err) {
          console.error(
            `Error calculating attractiveness for event ${event.id}:`,
            err
          );
        }
      }

      // Sort by attractiveness score (descending)
      attractive.sort((a, b) => b.attractivenessScore - a.attractivenessScore);
      setAttractiveEvents(attractive.slice(0, 5)); // Top 5
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Không thể tải dữ liệu dashboard");
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
              <Button onClick={loadDashboardData} className="mt-4">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

  // Calculate stats
  const totalEvents = events.length;
  const pendingEvents = events.filter((e) => e.status === "pending").length;
  const approvedEvents = events.filter((e) => e.status === "approved").length;
  const totalVolunteers = statistics?.approvedRegistrations || 0;

  return (
    <ManagerLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Quản lý</h1>
              <p className="mt-2 text-muted-foreground">
                Tổng quan sự kiện và hoạt động của bạn
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link to="/manager/events/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo sự kiện mới
                </Link>
              </Button>
              {/* Bỏ nút cài đặt theo yêu cầu */}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng sự kiện
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {totalEvents}
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      {approvedEvents} đã duyệt
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
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
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {totalVolunteers}
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      {statistics?.totalRegistrations || 0} tổng đăng ký
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
                    <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {pendingEvents}
                    </p>
                    <p className="mt-1 text-xs text-yellow-600">Cần xử lý</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Đăng ký chờ duyệt
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {statistics?.pendingRegistrations || 0}
                    </p>
                    <p className="mt-1 text-xs text-green-600">Cần xác nhận</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Newly Published Events */}
              {newlyPublishedEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Sự kiện mới công bố (7 ngày qua)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {newlyPublishedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {event.title}
                            </h3>
                            {getStatusBadge(event.status)}
                            <Badge variant="outline" className="bg-blue-50">
                              Mới
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{event.date}</span>
                            <span>{event.location}</span>
                            <span>Tạo: {event.createdAt}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/manager/events/${event.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Events with New Posts */}
              {eventsWithNewPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Sự kiện có tin bài mới (24h qua)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {eventsWithNewPosts.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {event.title}
                            </h3>
                            {getStatusBadge(event.status)}
                            <Badge variant="outline" className="bg-green-50">
                              {event.newPostsCount} bài mới
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{event.date}</span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/manager/community?event=${event.id}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Xem bài viết
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Bỏ khung Hành động nhanh theo yêu cầu */}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Attractive Events */}
              {attractiveEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Sự kiện thu hút
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {attractiveEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>{event.totalVolunteers} tình nguyện viên</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />+
                              {event.newRegistrations}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {event.totalComments}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {event.totalLikes}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            asChild
                          >
                            <Link to={`/manager/events/${event.id}`}>
                              <Eye className="mr-2 h-3 w-3" />
                              Xem chi tiết
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Pending Approvals */}
              {pendingEvents > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Chờ duyệt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {events
                      .filter((event) => event.status === "pending")
                      .slice(0, 5)
                      .map((event) => (
                        <div key={event.id} className="p-3 border rounded-lg">
                          <h4 className="font-semibold text-sm">
                            {event.title || "Không có tiêu đề"}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.date
                              ? new Date(event.date).toLocaleDateString("vi-VN")
                              : "Chưa có"}{" "}
                            - {event.location || "Chưa có"}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="text-xs"
                              variant="outline"
                              asChild
                            >
                              <Link to={`/manager/events/${event.id}`}>
                                Xem
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
