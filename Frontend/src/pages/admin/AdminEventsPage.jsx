import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar, MapPin, Users, Clock, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminEventDetailModal } from "./AdminEventDetailModal";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailEventId, setDetailEventId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await eventService.getEvents();
      
      const transformedEvents = (data || []).map((event) => ({
        id: event.id,
        title: event.title || "Không có tiêu đề",
        date: event.date ? new Date(event.date).toLocaleDateString("vi-VN") : "Chưa có",
        location: event.location || "Chưa có",
        status: event.status || "pending",
      }));
      
      setEvents(transformedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setError(err.message || "Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await eventService.approveEvent(eventId, "approved", "");
      await loadEvents();
    } catch (err) {
      alert("Không thể duyệt sự kiện: " + (err.message || "Lỗi không xác định"));
    }
  };

  const handleReject = async (eventId) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối sự kiện này?")) {
      return;
    }
    try {
      await eventService.rejectEvent(eventId, "");
      await loadEvents();
    } catch (err) {
      alert("Không thể từ chối sự kiện: " + (err.message || "Lỗi không xác định"));
    }
  };

  const openDetail = (eventId) => {
    setDetailEventId(eventId);
    setIsDetailOpen(true);
  };


  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadEvents} className="mt-4">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
              <p className="mt-2 text-muted-foreground">
                Quản lý tất cả sự kiện trong hệ thống
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/admin/community">
                <MessageSquare className="mr-2 h-4 w-4" />
                Cộng đồng
              </Link>
            </Button>
          </div>

          <div className="grid gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <Badge
                          variant={
                            event.status === "approved"
                              ? "default"
                              : event.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {event.status === "approved"
                            ? "Đã phê duyệt"
                            : event.status === "pending"
                            ? "Chờ phê duyệt"
                            : "Từ chối"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDetail(event.id)}>
                        Xem chi tiết
                      </Button>
                      {event.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleReject(event.id)}
                          >
                            Từ chối
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApprove(event.id)}
                          >
                            Phê duyệt
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <AdminEventDetailModal
        eventId={detailEventId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onDeleted={loadEvents}
      />
    </AdminLayout>
  );
}
