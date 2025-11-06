import React from "react";
import { AdminLayout } from "../../components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminEventsPage() {
  const events = [
    {
      id: 1,
      title: "Dọn dẹp bãi biển Vũng Tàu",
      organization: "Green Earth Vietnam",
      date: "15/02/2025",
      location: "Vũng Tàu",
      volunteers: 25,
      status: "pending",
    },
    {
      id: 2,
      title: "Trồng cây xanh tại công viên",
      organization: "Eco Warriors",
      date: "20/02/2025",
      location: "Công viên Thống Nhất",
      volunteers: 15,
      status: "approved",
    },
    {
      id: 3,
      title: "Dạy học cho trẻ em nghèo",
      organization: "Education For All",
      date: "25/02/2025",
      location: "Trung tâm Hà Nội",
      volunteers: 8,
      status: "approved",
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
            <p className="mt-2 text-muted-foreground">
              Quản lý tất cả sự kiện trong hệ thống
            </p>
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
                      <p className="text-sm text-muted-foreground mb-2">
                        Tổ chức: {event.organization}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{event.volunteers} tình nguyện viên</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                      {event.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                          >
                            Từ chối
                          </Button>
                          <Button size="sm">Phê duyệt</Button>
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
    </AdminLayout>
  );
}
