import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ManagerLayout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  Users, Search, Printer, Download
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ManagerVolunteersPage() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEvent, setFilterEvent] = useState("all");

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Danh_sach_TNV_${new Date().toISOString().slice(0,10)}`,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        * { font-family: 'Times New Roman', Times, serif !important; }
      }
    `
  });

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  // --- HÀM LOAD DATA ĐÃ TỐI ƯU ---
  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Lấy danh sách sự kiện quản lý
      const managerEvents = await eventService.getMyEvents();
      setEvents(managerEvents);

      if (!managerEvents.length) {
        setVolunteers([]);
        return;
      }

      // 2. Lấy TOÀN BỘ registration của các sự kiện song song (Parallel)
      // Thay vì await trong vòng lặp, ta dùng Promise.all
      const registrationsPromises = managerEvents.map(ev =>
          registrationService.getRegistrationsByEvent(ev.id)
              .then(regs => regs.map(r => ({ ...r, eventTitle: ev.title, eventId: ev.id }))) // Gắn luôn thông tin event vào
              .catch(() => [])
      );

      const allRegistrationsArrays = await Promise.all(registrationsPromises);
      const allRegistrations = allRegistrationsArrays.flat(); // Gộp thành 1 mảng duy nhất

      // 3. Lấy thông tin User (Tránh gọi trùng lặp)
      // Gom tất cả userId lại (Unique)
      const userIds = [...new Set(allRegistrations.map(r => r.userId))];

      // Gọi API lấy thông tin user song song
      const userPromises = userIds.map(uid =>
          userService.getUserById(uid).then(u => ({...u, id: uid})).catch(() => ({ id: uid, full_name: "Unknown", email: "N/A" }))
      );

      const users = await Promise.all(userPromises);

      // Tạo Map để tra cứu nhanh: userId -> UserInfo
      const userMap = users.reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});

      // 4. Ghép dữ liệu lại (User + Registrations)
      const volunteerMap = new Map();

      allRegistrations.forEach(reg => {
        const userInfo = userMap[reg.userId] || { full_name: "Unknown", email: "N/A" };

        if (!volunteerMap.has(reg.userId)) {
          volunteerMap.set(reg.userId, {
            ...userInfo,
            id: reg.userId, // Đảm bảo ID là userId
            registrations: []
          });
        }
        volunteerMap.get(reg.userId).registrations.push(reg);
      });

      setVolunteers(Array.from(volunteerMap.values()));

    } catch (err) {
      console.error("Lỗi load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredVolunteers = volunteers.filter(v => {
    const term = searchTerm.toLowerCase();
    const matchSearch = (v.full_name?.toLowerCase() || "").includes(term) || (v.email?.toLowerCase() || "").includes(term);

    // Logic filter event & status phải kiểm tra xem user có registration nào thỏa mãn không
    const relevantRegistrations = v.registrations.filter(r => {
      const matchEvt = filterEvent === 'all' || r.eventId === filterEvent;
      const matchSts = filterStatus === 'all' || r.status === filterStatus;
      return matchEvt && matchSts;
    });

    // Nếu filter event/status được chọn, chỉ hiện user có ít nhất 1 đăng ký phù hợp
    const hasRelevantReg = relevantRegistrations.length > 0;

    return matchSearch && hasRelevantReg;
  });

  // Action Handlers
  const handleStatusUpdate = async (regId, newStatus) => {
    if(newStatus === 'rejected' && !confirm("Bạn có chắc muốn từ chối?")) return;
    try {
      await registrationService.updateRegistrationStatus(regId, newStatus);
      // Reload lại data nhẹ nhàng hơn (hoặc cập nhật state trực tiếp để đỡ load lại)
      // Ở đây ta cập nhật state trực tiếp cho nhanh:
      setVolunteers(prev => prev.map(vol => ({
        ...vol,
        registrations: vol.registrations.map(r => r.id === regId ? { ...r, status: newStatus } : r)
      })));
    } catch(e) { alert(e.message); }
  };

  if (loading) return <ManagerLayout><div className="flex justify-center p-10"><LoadingSpinner/></div></ManagerLayout>;

  return (
      <ManagerLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8">

            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Quản lý Tình nguyện viên</h1>
                <p className="mt-1 text-muted-foreground">Xác nhận đăng ký và đánh dấu hoàn thành</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Printer className="h-4 w-4"/> In danh sách</Button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Tìm kiếm tên, email..." className="pl-9" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
              </div>
              <div className="w-full md:w-64">
                <Select value={filterEvent} onValueChange={setFilterEvent}>
                  <SelectTrigger><SelectValue placeholder="Sự kiện"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả sự kiện</SelectItem>
                    {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue placeholder="Trạng thái"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div ref={printRef}>

              {/* 1. Header & Table In (Giữ nguyên logic in ấn) */}
              <div className="hidden print:block p-10 bg-white text-black text-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                  <h1 className="text-2xl font-bold uppercase">DANH SÁCH TÌNH NGUYỆN VIÊN</h1>
                  <p className="italic">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
                </div>
                <table className="w-full text-left border-collapse border border-black">
                  <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-black p-2 text-center w-10">STT</th>
                    <th className="border border-black p-2">Họ tên</th>
                    <th className="border border-black p-2">Email / SĐT</th>
                    <th className="border border-black p-2">Sự kiện tham gia</th>
                    <th className="border border-black p-2 text-center">Trạng thái</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredVolunteers.map((v, i) => (
                      <tr key={i}>
                        <td className="border border-black p-2 text-center">{i+1}</td>
                        <td className="border border-black p-2 font-bold">{v.full_name}</td>
                        <td className="border border-black p-2">{v.email}<br/>{v.phone}</td>
                        <td className="border border-black p-2">
                          {v.registrations.map(r => (
                              (filterEvent === 'all' || r.eventId === filterEvent) &&
                              (filterStatus === 'all' || r.status === filterStatus) ?
                                  <div key={r.id}>- {r.eventTitle}</div> : null
                          ))}
                        </td>
                        <td className="border border-black p-2 text-center">
                          {v.registrations.map(r => (
                              (filterEvent === 'all' || r.eventId === filterEvent) &&
                              (filterStatus === 'all' || r.status === filterStatus) ?
                                  <div key={r.id}>{r.status}</div> : null
                          ))}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              {/* 2. Web List */}
              <div className="grid gap-4 print:hidden">
                {filteredVolunteers.map(vol => (
                    <Card key={vol.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                          <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              {vol.full_name}
                              <Badge variant="outline" className="ml-2">
                                {/* Đếm số lượng phù hợp với filter thay vì hiển thị tổng */}
                                {vol.registrations.filter(r => (filterEvent === 'all' || r.eventId === filterEvent) && (filterStatus === 'all' || r.status === filterStatus)).length} đăng ký
                              </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground">{vol.email} • {vol.phone || "No Phone"}</p>
                          </div>
                          <div className="flex-1 md:max-w-xl">
                            {vol.registrations.map(reg => {
                              // Logic hiển thị chi tiết theo filter
                              if(filterEvent !== 'all' && reg.eventId !== filterEvent) return null;
                              if(filterStatus !== 'all' && reg.status !== filterStatus) return null;

                              return (
                                  <div key={reg.id} className="flex items-center justify-between border-t pt-2 mt-2 first:border-0 first:mt-0 first:pt-0">
                                    <div className="text-sm">
                                      <p className="font-medium">{reg.eventTitle}</p>
                                      <p className="text-xs text-muted-foreground">Đăng ký: {new Date(reg.registeredAt).toLocaleDateString("vi-VN")}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={reg.status === 'approved' ? 'default' : reg.status === 'pending' ? 'secondary' : reg.status === 'completed' ? 'success' : 'outline'} className={reg.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : ''}>
                                        {reg.status === 'approved' ? 'Đã duyệt' : reg.status === 'pending' ? 'Chờ duyệt' : reg.status === 'completed' ? 'Hoàn thành' : reg.status === 'rejected' ? 'Từ chối' : reg.status}
                                      </Badge>

                                      {/* Action Buttons */}
                                      {reg.status === 'pending' && (
                                          <>
                                            <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700" onClick={()=>handleStatusUpdate(reg.id, 'approved')}>Duyệt</Button>
                                            <Button size="sm" variant="destructive" className="h-7" onClick={()=>handleStatusUpdate(reg.id, 'rejected')}>X</Button>
                                          </>
                                      )}
                                      {reg.status === 'approved' && (
                                          <Button size="sm" variant="outline" className="h-7 text-blue-600 border-blue-600 hover:bg-blue-50" onClick={()=>handleStatusUpdate(reg.id, 'completed')}>
                                            Hoàn thành
                                          </Button>
                                      )}
                                      {/* Nút hoàn tác cho Completed/Rejected nếu cần */}
                                      {(reg.status === 'completed' || reg.status === 'rejected') && (
                                          <Button size="sm" variant="ghost" className="h-7 text-gray-500" onClick={()=>handleStatusUpdate(reg.id, 'approved')}>Hoàn tác</Button>
                                      )}
                                    </div>
                                  </div>
                              )
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
                {filteredVolunteers.length === 0 && <div className="text-center py-10 text-muted-foreground">Không tìm thấy tình nguyện viên nào phù hợp.</div>}
              </div>

            </div>

          </div>
        </div>
      </ManagerLayout>
  );
}