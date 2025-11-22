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
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import reportService from "../../services/reportService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    resolutionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [reportsData, statsData] = await Promise.all([
        reportService.getReports().catch(() => []),
        reportService.getReportStats().catch(() => ({
          total: 0,
          pending: 0,
          resolved: 0,
          resolutionRate: 0,
        })),
      ]);
      setReports(reportsData || []);
      setStats(
        statsData || {
          total: 0,
          pending: 0,
          resolved: 0,
          resolutionRate: 0,
        }
      );
    } catch (err) {
      console.error("Error loading reports:", err);
      setError(err.message || "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

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

  const handleAcceptReport = async (reportId) => {
    try {
      await reportService.acceptReport(reportId);
      await loadData();
    } catch (err) {
      console.error("Error accepting report:", err);
      alert(
        "Không thể chấp nhận báo cáo: " + (err.message || "Lỗi không xác định")
      );
    }
  };

  const handleRejectReport = async (reportId) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối báo cáo này?")) {
      return;
    }
    try {
      await reportService.rejectReport(reportId);
      await loadData();
    } catch (err) {
      console.error("Error rejecting report:", err);
      alert(
        "Không thể từ chối báo cáo: " + (err.message || "Lỗi không xác định")
      );
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await reportService.resolveReport(reportId);
      await loadData();
    } catch (err) {
      console.error("Error resolving report:", err);
      alert(
        "Không thể đánh dấu đã giải quyết: " +
          (err.message || "Lỗi không xác định")
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
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

          {error && (
            <div className="mb-6 p-4 rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng báo cáo
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {stats.total || 0}
                    </p>
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
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {stats.pending || 0}
                    </p>
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
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {stats.resolved || 0}
                    </p>
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
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {stats.resolutionRate ? `${stats.resolutionRate}%` : "0%"}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          {reports.length === 0 && !loading && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Chưa có báo cáo nào</p>
              </CardContent>
            </Card>
          )}
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
                            {report.title || "Báo cáo không có tiêu đề"}
                          </h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {report.description || "Không có mô tả"}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Người báo cáo:{" "}
                            {report.reporter?.email || report.reporter || "N/A"}
                          </p>
                          <p>Đối tượng: {report.reported || "N/A"}</p>
                          <p>
                            Ngày: {formatDate(report.createdAt || report.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement view details modal
                          console.log("View report details:", report.id);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                      {report.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleRejectReport(report.id)}
                          >
                            Từ chối
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptReport(report.id)}
                          >
                            Chấp nhận
                          </Button>
                        </>
                      )}
                      {report.status === "investigating" && (
                        <Button
                          size="sm"
                          onClick={() => handleResolveReport(report.id)}
                        >
                          Đánh dấu đã giải quyết
                        </Button>
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
