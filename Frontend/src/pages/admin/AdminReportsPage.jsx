import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/Layout";

import {
  Card, CardContent, CardHeader, CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Printer, BarChart3, Users, Clock, CheckCircle2 } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import eventService from "../../services/eventService";
import userService from "../../services/userService";

// Recharts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State cho thống kê số liệu
  const [stats, setStats] = useState({
    total: 0, pending: 0, upcoming: 0, happening: 0, completed: 0, rejected: 0,
    totalUsers: 0, // Tổng thành viên (lấy từ DB)
    newUsersMonth: 0 // Thành viên mới trong tháng
  });

  // State cho biểu đồ Line (Tăng trưởng người dùng)
  const [userGrowthData, setUserGrowthData] = useState([]);

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bao_cao_tong_hop_${new Date().toISOString().slice(0,10)}`,
  });

  useEffect(() => { calculateRealStats(); }, []);

  const calculateRealStats = async () => {
    try {
      setLoading(true);

      // 1. Gọi API
      const [eventsRes, usersRes] = await Promise.all([
        eventService.getEventsForAdmin().catch(() => []),
        userService.getUsers().catch(() => [])
      ]);

      // --- XỬ LÝ SỰ KIỆN (EVENTS) ---
      let eventsData = [];
      if (Array.isArray(eventsRes)) eventsData = eventsRes;
      else if (eventsRes?.result?.content) eventsData = eventsRes.result.content;
      else if (eventsRes?.result) eventsData = eventsRes.result;
      else if (eventsRes?.content) eventsData = eventsRes.content;

      const now = new Date();
      let pending = 0, upcoming = 0, happening = 0, completed = 0, rejected = 0;

      eventsData.forEach(ev => {
        const status = (ev.status || "").toLowerCase();
        if (status === "pending") pending++;
        else if (status === "rejected" || status === "cancelled") rejected++;
        else if (status === "approved" || status === "confirmed") {
          // const eventStart = new Date(ev.date || ev.startDate || ev.createdAt);
          // const eventEnd = ev.endDate ? new Date(ev.endDate) : new Date(eventStart.getTime() + (4 * 60 * 60 * 1000));

          const eventStart = new Date(ev.date || ev.startDate || ev.createdAt);
          // Tạo mốc kết thúc là 23:59:59 của ngày bắt đầu
          const eventEnd = new Date(eventStart);
          eventEnd.setHours(23, 59, 59, 999);

          if (now >= eventStart && now <= eventEnd) happening++;
          else if (now > eventEnd) completed++;
          else upcoming++;
        } else if (status === "completed") completed++;
      });

      // --- XỬ LÝ NGƯỜI DÙNG (USERS) ---
      let usersData = [];
      let totalUsersCount = 0;

      // Logic bóc tách dữ liệu User phức tạp hơn để lấy TOTAL chuẩn
      if (Array.isArray(usersRes)) {
        usersData = usersRes;
        totalUsersCount = usersData.length;
      } else {
        // Nếu là Object phân trang (Pageable)
        // 1. Lấy danh sách user trong trang hiện tại để vẽ biểu đồ
        if (usersRes?.result?.content) usersData = usersRes.result.content;
        else if (usersRes?.content) usersData = usersRes.content;
        else if (usersRes?.result) usersData = usersRes.result;

        // 2. QUAN TRỌNG: Lấy tổng số bản ghi từ metadata (totalElements)
        // Nếu API trả về totalElements thì lấy, nếu không thì đành lấy length của mảng
        if (usersRes?.totalElements !== undefined) totalUsersCount = usersRes.totalElements;
        else if (usersRes?.result?.totalElements !== undefined) totalUsersCount = usersRes.result.totalElements;
        else if (usersRes?.total !== undefined) totalUsersCount = usersRes.total;
        else totalUsersCount = usersData.length;
      }

      // --- TÍNH TOÁN BIỂU ĐỒ USER (Realtime) ---
      // Lưu ý: Nếu API phân trang, biểu đồ này chỉ chính xác dựa trên số user ĐÃ TẢI VỀ (usersData).
      // Để chính xác 100%, backend cần API riêng cho thống kê (vd: /api/stats/user-growth).
      // Ở đây ta tính dựa trên usersData hiện có.

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Đếm user mới trong tháng hiện tại
      const newUsersCount = usersData.filter(u => {
        const d = new Date(u.created_at || u.createdAt || u.joinDate || Date.now());
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;

      // Tạo dữ liệu cho biểu đồ Line (4 tháng gần nhất)
      const growthMap = {};
      // Khởi tạo 4 tháng gần nhất = 0
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `T${d.getMonth() + 1}`;
        growthMap[key] = 0;
      }

      // Loop qua user để cộng dồn vào tháng tương ứng
      usersData.forEach(u => {
        const d = new Date(u.created_at || u.createdAt || u.joinDate || Date.now());
        const key = `T${d.getMonth() + 1}`;
        if (growthMap.hasOwnProperty(key)) {
          growthMap[key]++;
        }
      });

      // Chuyển Map thành Array cho Recharts
      const realLineData = Object.keys(growthMap).map(key => ({
        name: key,
        users: growthMap[key]
      }));

      setUserGrowthData(realLineData);

      setStats({
        total: eventsData.length,
        pending, upcoming, happening, completed, rejected,
        totalUsers: totalUsersCount, // Số này giờ sẽ chính xác nếu API trả về totalElements
        newUsersMonth: newUsersCount
      });

    } catch (error) {
      console.error("Lỗi tính toán:", error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: "Sắp tới", value: stats.upcoming, color: "#00C49F" },
    { name: "Đang diễn ra", value: stats.happening, color: "#c57e22" },
    { name: "Đang chờ duyệt", value: stats.pending, color: "#FFBB28" },
    { name: "Đã hoàn thành", value: stats.completed, color: "#0088FE" },
    { name: "Bị từ chối", value: stats.rejected, color: "#EF4444" },
  ].filter(item => item.value > 0);

  if (loading) return <AdminLayout><div className="flex justify-center p-10"><LoadingSpinner /></div></AdminLayout>;

  return (
      <AdminLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8">

            {/* Header + Print Button */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
                <p className="mt-1 text-muted-foreground">Số liệu thực tế tính đến {new Date().toLocaleTimeString("vi-VN")}</p>
              </div>
              <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Printer className="h-4 w-4" /> In Báo Cáo
              </Button>
            </div>

            {/* Hidden Print Content (Giữ nguyên phần in ấn) */}
            <div ref={printRef} className="hidden print:block">
              {/* ... (Code in ấn giữ nguyên như cũ để tiết kiệm chỗ hiển thị) ... */}
              <div className="p-10 bg-white text-black text-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <h1 className="text-center text-2xl font-bold uppercase">BÁO CÁO HOẠT ĐỘNG</h1>
                <p className="text-center italic mb-8">Ngày: {new Date().toLocaleDateString("vi-VN")}</p>
                <table className="w-full border-collapse border border-black">
                  <thead>
                  <tr><th className="border p-2">Mục</th><th className="border p-2">Số lượng</th></tr>
                  </thead>
                  <tbody>
                  <tr><td className="border p-2">Tổng thành viên</td><td className="border p-2 font-bold">{stats.totalUsers}</td></tr>
                  <tr><td className="border p-2">Tổng sự kiện</td><td className="border p-2 font-bold">{stats.total}</td></tr>
                  <tr><td className="border p-2">Sự kiện hoàn thành</td><td className="border p-2">{stats.completed}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="print:hidden space-y-8">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-blue-600" onClick={() => navigate("/admin/events")}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Tổng sự kiện</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{stats.total}</div><p className="text-xs text-muted-foreground">Toàn bộ lịch sử</p></CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-yellow-500" onClick={() => navigate("/admin/events", { state: { filter: 'pending' } })}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Chờ phê duyệt</CardTitle><Clock className="h-4 w-4 text-yellow-500" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{stats.pending}</div><p className="text-xs text-muted-foreground">Cần xử lý ngay</p></CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-green-600" onClick={() => navigate("/admin/events", { state: { filter: 'completed' } })}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle><CheckCircle2 className="h-4 w-4 text-green-600" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{stats.completed}</div><div className="text-xs text-muted-foreground">Đã kết thúc</div></CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-purple-600" onClick={() => navigate("/admin/users")}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Tổng thành viên</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent>
                    {/* Hiển thị số liệu chính xác hơn */}
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">+{stats.newUsersMonth} trong tháng này</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                {/* Biểu đồ Line - Tăng trưởng User */}
                <Card className="col-span-4 h-[400px]">
                  <CardHeader><CardTitle>Người dùng mới (4 tháng gần nhất)</CardTitle></CardHeader>
                  <CardContent className="pl-2 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                        <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={3} dot={{r:4, fill: "#8884d8"}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Biểu đồ Pie - Trạng thái sự kiện */}
                <Card className="col-span-3 h-[400px]">
                  <CardHeader><CardTitle className="text-lg">Trạng thái sự kiện</CardTitle><p className="text-sm text-muted-foreground">Tỉ lệ phân bố hiện tại</p></CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {pieData.length > 0 ? (
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                              {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                      ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">Chưa có dữ liệu sự kiện</div>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </AdminLayout>
  );
}