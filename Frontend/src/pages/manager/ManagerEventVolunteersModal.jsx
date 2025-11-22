import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import registrationService from "../../services/registrationService";

export function ManagerEventVolunteersModal({ eventId, open, onOpenChange }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && eventId) load();
  }, [open, eventId]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const regs = await registrationService.getRegistrationsByEvent(eventId).catch(() => []);
      setRegistrations(regs || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách tình nguyện viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tình nguyện viên tham gia</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="p-6">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-destructive">{error}</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-auto">
            {registrations.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-2 border rounded">
                <div className="text-sm">
                  <div>{r.user?.email || r.userId}</div>
                  {r.registeredAt && (
                    <div className="text-xs text-muted-foreground">
                      Đăng ký: {new Date(r.registeredAt).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">{r.status}</Badge>
              </div>
            ))}
            {registrations.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có tình nguyện viên</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}