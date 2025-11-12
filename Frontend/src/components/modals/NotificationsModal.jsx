import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
// Using div with overflow instead of ScrollArea for simplicity
import {
  Bell,
  Check,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function NotificationsModal({ open, onOpenChange }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadNotifications();
    }
  }, [open, user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await notificationService.getNotifications(user.id);
      
      // Mock data for now
      const mockNotifications = [
        {
          id: "1",
          title: "Đăng ký sự kiện thành công",
          message: "Bạn đã đăng ký sự kiện 'Dọn dẹp bãi biển' thành công",
          type: "success",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: false,
        },
        {
          id: "2",
          title: "Sự kiện sắp diễn ra",
          message: "Sự kiện 'Trồng cây xanh' sẽ diễn ra trong 3 ngày tới",
          type: "info",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isRead: false,
        },
        {
          id: "3",
          title: "Hoàn thành sự kiện",
          message: "Bạn đã hoàn thành sự kiện 'Dạy học cho trẻ em'",
          type: "success",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isRead: true,
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // TODO: Replace with actual API call
      // await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} phút trước`;
    } else if (hours < 24) {
      return `${hours} giờ trước`;
    } else {
      return `${days} ngày trước`;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Thông báo
            </span>
            {unreadCount > 0 && (
              <Badge variant="default">{unreadCount} mới</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Thông báo cá nhân của bạn
          </DialogDescription>
        </DialogHeader>
        <div className="h-[400px] overflow-y-auto pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Đang tải...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.isRead
                      ? "bg-background"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

