import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import userService from "../../services/userService";

export function AdminEventDetailModal({ eventId, open, onOpenChange, onDeleted }) {
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && eventId) {
      load();
    }
  }, [open, eventId]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [evt, regs] = await Promise.all([
        eventService.getEventById(eventId),
        registrationService.getRegistrationsByEvent(eventId).catch(() => []),
      ]);
      setEvent(evt || null);
      const regsWithNames = await Promise.all((regs || []).map(async (r) => {
        try {
          const u = await userService.getUserById(r.userId);
          return { ...r, user: { full_name: u.full_name, email: u.email } };
        } catch {
          return { ...r, user: { full_name: "Unknown", email: r.userId } };
        }
      }));
      setRegistrations(regsWithNames);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) return;
    try {
      await eventService.deleteEvent(eventId);
      onOpenChange(false);
      onDeleted?.(eventId);
    } catch (err) {
      alert("Không thể xóa sự kiện: " + (err.message || "Lỗi không xác định"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Chi tiết sự kiện</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="p-6">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-destructive">{error}</div>
        ) : event ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <div className="text-sm text-muted-foreground">
                <p>Ngày: {event.date ? new Date(event.date).toLocaleDateString("vi-VN") : ""}</p>
                <p>Địa điểm: {event.location || ""}</p>
              </div>
              <div className="mt-2">
                <Badge variant={event.status === "approved" ? "default" : event.status === "pending" ? "secondary" : "destructive"}>
                  {event.status}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold">Người tạo (manager)</h4>
              <p className="text-sm text-muted-foreground">{event.createdBy || "Không rõ"}</p>
            </div>

            <div>
              <h4 className="font-semibold">Người tham gia ({registrations.length})</h4>
              <div className="space-y-2 max-h-48 overflow-auto">
                {registrations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{r.user?.full_name || r.user?.email || r.userId}</span>
                    <Badge variant="outline" className="text-xs">{r.status}</Badge>
                  </div>
                ))}
                {registrations.length === 0 && (
                  <p className="text-sm text-muted-foreground">Chưa có người tham gia</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="text-destructive" onClick={handleDelete}>Xóa sự kiện</Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
            </div>
          </div>
        ) : (
          <div className="p-6">Không có dữ liệu sự kiện</div>
        )}
      </DialogContent>
    </Dialog>
  );
}