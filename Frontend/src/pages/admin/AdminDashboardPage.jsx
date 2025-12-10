import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../components/ui/button";
// ✅ FIX: Import thêm CardHeader và CardTitle
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { AdminLayout } from "../../components/Layout";
import {
  Users, Calendar, Building2, Clock,
  CheckCircle2, Shield, TrendingUp, Download, Printer
} from "lucide-react";
import statisticsService from "../../services/statisticsService";
import eventService from "../../services/eventService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [userStats, setUserStats] = useState(null);
  const [overviewStats, setOverviewStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Danh_sach_cho_duyet_${new Date().toISOString().slice(0,10)}`,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const userStatsData = await statisticsService.getUserStatistics();
      setUserStats(userStatsData);

      const overviewData = await statisticsService.getOverviewStatistics();
      setOverviewStats(overviewData);

      const allEvents = await eventService.getEventsForAdmin();
      const pending = (allEvents || []).filter(e => e.status === "pending");

      setPendingEvents(pending.map(e => ({
        id: e.id,
        title: e.title || "Không có tiêu đề",
        date: e.createdAt ? new Date(e.createdAt).toLocaleDateString("vi-VN") : "",
        status: "pending",
        location: e.location || "Chưa có"
      })));
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const dataToExport = pendingEvents;
    if (!dataToExport || dataToExport.length === 0) {
      alert("Không có dữ liệu chờ duyệt để xuất!");
      return;
    }
    const headers = ["ID", "Tiêu đề", "Ngày tạo", "Địa điểm", "Trạng thái"];
    const csvRows = [headers.join(",")];
    dataToExport.forEach(item => {
      const row = [
        `"${item.id}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.date}"`,
        `"${item.location}"`,
        `"${item.status}"`
      ];
      csvRows.push(row.join(","));
    });
    const csvString = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `events_pending_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApprove = async (id) => {
    try { await eventService.approveEvent(id, "approved", ""); await loadDashboardData(); }
    catch (err) { alert(err.message); }
  };

  const handleReject = async (id) => {
    if(!confirm("Từ chối sự kiện này?")) return;
    try { await eventService.rejectEvent(id, ""); await loadDashboardData(); }
    catch (err) { alert(err.message); }
  };

  if (loading) return <AdminLayout><div className="container mx-auto p-6"><LoadingSpinner /></div></AdminLayout>;
  if (error) return <AdminLayout><div className="container mx-auto p-6"><Card><CardContent className="p-6"><p className="text-destructive">{error}</p><Button onClick={loadDashboardData} className="mt-4">Thử lại</Button></CardContent></Card></div></AdminLayout>;

  return (
      <AdminLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
                <p className="mt-2 text-muted-foreground">Tổng quan và quản lý VolunteerHub</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportData} variant="outline" className="gap-2 bg-white text-slate-900 border">
                  <Download className="h-4 w-4" /> Xuất Excel (Chờ duyệt)
                </Button>
                <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Printer className="h-4 w-4" /> In sự kiện chờ duyệt
                </Button>
              </div>
            </div>

            {/* --- VÙNG IN ẤN --- */}
            <div style={{ display: "none" }}>
              <div ref={printRef} className="p-10 text-black bg-white">
                <div className="text-center mb-8 border-b-2 pb-4">
                  <h1 className="text-2xl font-bold uppercase">Danh sách sự kiện chờ phê duyệt</h1>
                  <p className="text-sm text-gray-500 mt-1">Hệ thống Quản lý Tình nguyện VolunteerHub</p>
                  <p className="text-xs text-gray-400 italic">Ngày xuất báo cáo: {new Date().toLocaleDateString("vi-VN")}</p>
                </div>
                <table className="w-full text-sm text-left border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border border-gray-300 text-center w-12">STT</th>
                    <th className="p-3 border border-gray-300">Tên sự kiện</th>
                    <th className="p-3 border border-gray-300">Ngày tạo</th>
                    <th className="p-3 border border-gray-300">Địa điểm</th>
                    <th className="p-3 border border-gray-300 text-center">Trạng thái</th>
                  </tr>
                  </thead>
                  <tbody>
                  {pendingEvents.length > 0 ? pendingEvents.map((event, idx) => (
                      <tr key={event.id}>
                        <td className="p-3 border border-gray-300 text-center">{idx + 1}</td>
                        <td className="p-3 border border-gray-300 font-medium">{event.title}</td>
                        <td className="p-3 border border-gray-300">{event.date}</td>
                        <td className="p-3 border border-gray-300">{event.location}</td>
                        <td className="p-3 border border-gray-300 text-center text-yellow-600 font-semibold">Pending</td>
                      </tr>
                  )) : (
                      <tr><td colSpan="5" className="p-4 text-center">Không có dữ liệu</td></tr>
                  )}
                  </tbody>
                </table>
                <div className="flex justify-between mt-16 px-10">
                  <div className="text-center"><p className="font-bold">Người lập biểu</p><p className="italic text-sm mt-16">(Ký tên)</p></div>
                  <div className="text-center"><p className="font-bold">Xác nhận của Admin</p><p className="italic text-sm mt-16">(Ký và đóng dấu)</p></div>
                </div>
              </div>
            </div>

            {/* --- GIAO DIỆN WEB --- */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/admin/users")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                      <p className="mt-1 text-3xl font-bold text-primary">{userStats?.totalUsers || 0}</p>
                      <p className="mt-1 text-xs text-green-600">{userStats?.totalVolunteers || 0} tình nguyện viên</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><Users className="h-6 w-6 text-primary" /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer hover:shadow-md transition-shadow ${activeTab === 'activities' ? 'ring-2 ring-primary border-primary' : ''}`} onClick={() => setActiveTab("activities")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng sự kiện</p>
                      <p className="mt-1 text-3xl font-bold text-primary">{overviewStats?.totalEvents || 0}</p>
                      <p className="mt-1 text-xs text-green-600">{overviewStats?.upcomingEvents || 0} sự kiện sắp tới</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/admin/users")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổ chức</p>
                      <p className="mt-1 text-3xl font-bold text-primary">{userStats?.totalManagers || 0}</p>
                      <p className="mt-1 text-xs text-green-600">Quản lý sự kiện</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><Building2 className="h-6 w-6 text-primary" /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer hover:shadow-md transition-shadow border-yellow-200 bg-yellow-50/50 ${activeTab === 'pending' ? 'ring-2 ring-yellow-500' : ''}`} onClick={() => setActiveTab("pending")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chờ phê duyệt</p>
                      <p className="mt-1 text-3xl font-bold text-primary">{overviewStats?.pendingEvents || pendingEvents.length}</p>
                      <p className="mt-1 text-xs text-yellow-600">Cần xử lý ngay</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100"><Clock className="h-6 w-6 text-yellow-600" /></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">Chờ phê duyệt</TabsTrigger>
                    <TabsTrigger value="activities">Hoạt động gần đây</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="mt-6 space-y-4">
                    {pendingEvents.length > 0 ? pendingEvents.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="border-yellow-500 text-yellow-600">Sự kiện</Badge>
                                  <h3 className="text-lg font-semibold">{item.title}</h3>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" /><span>Gửi lúc: {item.date}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent" onClick={() => handleReject(item.id)}>Từ chối</Button>
                                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleApprove(item.id)}><CheckCircle2 className="mr-2 h-4 w-4" /> Phê duyệt</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    )) : (
                        <Card><CardContent className="flex flex-col items-center justify-center py-12"><CheckCircle2 className="h-12 w-12 text-green-500" /><p className="mt-4 text-muted-foreground">Không có mục nào cần phê duyệt</p></CardContent></Card>
                    )}
                  </TabsContent>

                  <TabsContent value="activities" className="mt-6 space-y-4">
                    {overviewStats?.recentEventSummaries?.length > 0 ? overviewStats.recentEventSummaries.map((event, index) => (
                        <Card key={event.id || index}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
                              <div className="flex-1">
                                <p className="font-semibold">{event.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{event.registrationCount || 0} đăng ký | Trạng thái: {event.status}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    )) : (<Card><CardContent className="flex flex-col items-center justify-center py-12"><Shield className="h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">Không có hoạt động gần đây</p></CardContent></Card>)}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-3">
                    <h3 className="font-semibold mb-4">Thống kê nền tảng</h3>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Người dùng hoạt động</span><span className="font-semibold">{overviewStats?.activeVolunteers || 0}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sự kiện sắp tới</span><span className="font-semibold">{overviewStats?.upcomingEvents || 0}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sự kiện gần đây</span><span className="font-semibold">{overviewStats?.recentEvents || 0}</span></div>
                  </CardContent>
                </Card>

                {overviewStats?.attractiveEvents?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-5 w-5" /> Sự kiện thu hút</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {overviewStats.attractiveEvents.map((event) => (
                            <div key={event.id} className="p-3 border rounded-lg">
                              <h4 className="font-semibold text-sm line-clamp-1">{event.title}</h4>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                <span>{event.registrationCount} người tham gia</span>
                                <Badge variant="outline" className="text-[10px]">{event.status}</Badge>
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
      </AdminLayout>
  );
}