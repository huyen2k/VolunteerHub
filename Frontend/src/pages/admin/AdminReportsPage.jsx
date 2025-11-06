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
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

export default function AdminReportsPage() {
  const reports = [
    {
      id: 1,
      type: "user_report",
      title: "Báo cáo vi phạm người dùng",
      description: "Người dùng spam tin nhắn trong chat",
      reporter: "user123@example.com",
      reported: "spammer@example.com",
      status: "pending",
      date: "20/01/2025",
    },
    {
      id: 2,
      type: "event_report",
      title: "Báo cáo sự kiện không phù hợp",
      description: "Sự kiện có nội dung không phù hợp với trẻ em",
      reporter: "parent@example.com",
      reported: "Event: Trồng cây",
      status: "investigating",
      date: "18/01/2025",
    },
    {
      id: 3,
      type: "system_issue",
      title: "Lỗi hệ thống",
      description: "Không thể đăng ký tham gia sự kiện",
      reporter: "volunteer@example.com",
      reported: "System Bug",
      status: "resolved",
      date: "15/01/2025",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case "investigating":
        return <Badge variant="outline">Đang điều tra</Badge>;
      case "resolved":
        return <Badge className="bg-green-500 text-white">Đã giải quyết</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "user_report":
        return <Users className="h-5 w-5 text-primary" />;
      case "event_report":
        return <AlertCircle className="h-5 w-5 text-primary" />;
      case "system_issue":
        return <AlertCircle className="h-5 w-5 text-primary" />;
      default:
        return <AlertCircle className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <AdminLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Báo cáo & Khiếu nại</h1>
            <p className="mt-2 text-muted-foreground">
              Quản lý các báo cáo và khiếu nại từ người dùng
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng báo cáo
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">156</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                    <p className="mt-1 text-3xl font-bold text-primary">23</p>
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
                      Đã giải quyết
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">133</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tỷ lệ giải quyết
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">85%</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <div className="grid gap-6">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        {getTypeIcon(report.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {report.title}
                          </h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {report.description}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <p>Người báo cáo: {report.reporter}</p>
                          <p>Đối tượng: {report.reported}</p>
                          <p>Ngày: {report.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                      {report.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                          >
                            Từ chối
                          </Button>
                          <Button size="sm">Chấp nhận</Button>
                        </>
                      )}
                      {report.status === "investigating" && (
                        <Button size="sm">Đánh dấu đã giải quyết</Button>
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
