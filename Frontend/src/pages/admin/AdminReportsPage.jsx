import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/Layout";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Download, Printer, BarChart3, TrendingUp, Users, Clock, CheckCircle2, PlayCircle, XCircle } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import eventService from "../../services/eventService";
import userService from "../../services/userService";

// Recharts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    upcoming: 0,
    happening: 0,
    completed: 0,
    rejected: 0,
    totalUsers: 0,
    newUsersMonth: 0
  });

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bao_cao_tong_hop_${new Date().toISOString().slice(0,10)}`,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `
  });

  useEffect(() => {
    calculateRealStats();
  }, []);

  const calculateRealStats = async () => {
    try {
      setLoading(true);

      const [events, users] = await Promise.all([
        eventService.getEventsForAdmin().catch(() => []),
        userService.getUsers().catch(() => [])
      ]);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      let pending = 0;
      let upcoming = 0;
      let happening = 0;
      let completed = 0;
      let rejected = 0;

      events.forEach(ev => {
        // Ưu tiên lấy date (ngày diễn ra), fallback về createdAt nếu lỗi
        const eventDate = new Date(ev.date || ev.createdAt);
        eventDate.setHours(0, 0, 0, 0);

        if (ev.status === "pending") {
          pending++;
        } else if (ev.status === "rejected") {
          rejected++;
        } else if (ev.status === "approved") {
          if (eventDate.getTime() === now.getTime()) {
            happening++;
          } else if (eventDate < now) {
            completed++;
          } else {
            upcoming++;
          }
        }
      });

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newUsers = users.filter(u => {
        const joinDate = new Date(u.created_at || u.joinDate);
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
      }).length;

      setStats({
        total: events.length,
        pending,
        upcoming,
        happening,
        completed,
        rejected,
        totalUsers: users.length,
        newUsersMonth: newUsers
      });

    } catch (error) {
      console.error("Lỗi tính toán báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: "Sắp diễn ra", value: stats.upcoming, color: "#00C49F" },
    { name: "Đang diễn ra", value: stats.happening, color: "#FF8042" },
    { name: "Đang chờ duyệt", value: stats.pending, color: "#FFBB28" },
    { name: "Đã hoàn thành", value: stats.completed, color: "#0088FE" },
    { name: "Đã hủy", value: stats.rejected, color: "#EF4444" },
  ].filter(item => item.value > 0);

  const lineData = [
    { name: "T1", users: 10 }, { name: "T2", users: 30 },
    { name: "T3", users: 45 }, { name: "T4", users: 80 },
    { name: "Hiện tại", users: stats.totalUsers }
  ];

  if (loading) return <AdminLayout><div className="flex justify-center p-10"><LoadingSpinner /></div></AdminLayout>;

  return (
      <AdminLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8">

            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
                <p className="mt-1 text-muted-foreground">Số liệu thực tế tính đến {new Date().toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Printer className="h-4 w-4" /> In Báo Cáo
                </Button>
              </div>
            </div>

            {/* --- Cards Overview --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-blue-600" onClick={() => navigate("/admin/events")}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tổng sự kiện</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Toàn bộ lịch sử</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-yellow-500" onClick={() => navigate("/admin/dashboard")}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Chờ phê duyệt</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Cần xử lý ngay</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-green-600">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}% tỷ lệ hoàn thành
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-purple-600" onClick={() => navigate("/admin/users")}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tổng thành viên</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+{stats.newUsersMonth} trong tháng này</p>
                </CardContent>
              </Card>
            </div>

            {/* --- Charts --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 h-[400px]"> {/* Thêm chiều cao cố định để fix lỗi rechart */}
                <CardHeader>
                  <CardTitle>Tăng trưởng người dùng</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} dot={{r:4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-3 h-[400px]"> {/* Thêm chiều cao cố định */}
                <CardHeader>
                  <CardTitle>Trạng thái sự kiện</CardTitle>
                  <CardDescription>Phân bố thực tế các sự kiện</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* --- VÙNG IN ẨN (Hidden Print Area) --- */}
            <div className="hidden">
              <div ref={printRef} className="p-12 bg-white text-black font-serif text-sm">
                <div className="text-center mb-10">
                  <h3 className="font-bold uppercase text-base m-0">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                  <p className="font-bold underline mb-4">Độc lập - Tự do - Hạnh phúc</p>
                  <h1 className="text-2xl font-bold uppercase mt-8">BÁO CÁO TỔNG HỢP HOẠT ĐỘNG</h1>
                  <p className="italic mt-2">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 border-b pb-2">I. SỐ LIỆU THỐNG KÊ CHI TIẾT</h3>
                  <table className="w-full text-left border-collapse border border-gray-800">
                    <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-800 p-3 text-center w-16">STT</th>
                      <th className="border border-gray-800 p-3">Chỉ số thống kê</th>
                      <th className="border border-gray-800 p-3 text-center w-32">Số lượng</th>
                      <th className="border border-gray-800 p-3 text-center w-40">Ghi chú</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr><td className="border border-gray-800 p-2 text-center">1</td><td className="border border-gray-800 p-2">Tổng số sự kiện</td><td className="border border-gray-800 p-2 text-center font-bold">{stats.total}</td><td className="border border-gray-800 p-2"></td></tr>
                    <tr><td className="border border-gray-800 p-2 text-center">2</td><td className="border border-gray-800 p-2">Sự kiện đã hoàn thành</td><td className="border border-gray-800 p-2 text-center font-bold">{stats.completed}</td><td className="border border-gray-800 p-2 text-sm italic">Kết thúc &lt; Hôm nay</td></tr>
                    <tr><td className="border border-gray-800 p-2 text-center">3</td><td className="border border-gray-800 p-2">Sự kiện đang diễn ra</td><td className="border border-gray-800 p-2 text-center font-bold">{stats.happening}</td><td className="border border-gray-800 p-2 text-sm italic">Diễn ra hôm nay</td></tr>
                    <tr><td className="border border-gray-800 p-2 text-center">4</td><td className="border border-gray-800 p-2">Sự kiện sắp tới</td><td className="border border-gray-800 p-2 text-center font-bold">{stats.upcoming}</td><td className="border border-gray-800 p-2 text-sm italic">Tương lai</td></tr>
                    <tr><td className="border border-gray-800 p-2 text-center">5</td><td className="border border-gray-800 p-2">Sự kiện chờ phê duyệt</td><td className="border border-gray-800 p-2 text-center font-bold">{stats.pending}</td><td className="border border-gray-800 p-2 text-sm italic text-red-600">Cần xử lý</td></tr>
                    <tr><td className="border border-gray-800 p-2 text-center">6</td><td className="border border-gray-800 p-2">Tổng thành viên</td><td className="border border-gray-800 p-2 text-center font-bold">{stats.totalUsers}</td><td className="border border-gray-800 p-2"></td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-20 flex justify-between px-10">
                  <div className="text-center w-1/2">
                    <p className="font-bold">NGƯỜI LẬP BÁO CÁO</p>
                    <p className="italic text-sm mt-24">(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div className="text-center w-1/2">
                    <p className="font-bold">XÁC NHẬN CỦA QUẢN TRỊ VIÊN</p>
                    <p className="italic text-sm mt-24">(Ký và đóng dấu)</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </AdminLayout>
  );
}