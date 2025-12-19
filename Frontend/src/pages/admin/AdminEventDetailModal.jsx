import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Calendar, MapPin, Users, Printer, Trash2, X, FileText, User
} from "lucide-react";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import userService from "../../services/userService";

export function AdminEventDetailModal({ eventId, open, onOpenChange, onDeleted }) {
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tạo Ref để bao vùng cần in
  const componentRef = useRef(null);


  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Bao_cao_su_kien_${eventId}`,
  });

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

      const regsWithNames = await Promise.all(
          (regs || []).map(async (r) => {
            try {
              if (r.user && r.user.full_name) return r;
              const u = await userService.getUserById(r.userId);
              return { ...r, user: { full_name: u.full_name, email: u.email } };
            } catch {
              return { ...r, user: { full_name: "Không rõ", email: "N/A" } };
            }
          })
      );
      setRegistrations(regsWithNames);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("CẢNH BÁO: Xóa sự kiện này?")) return;
    try {
      await eventService.deleteEvent(eventId);
      onOpenChange(false);
      if (onDeleted) onDeleted(eventId);
    } catch (err) {
      alert("Lỗi xóa: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-500">Đã phê duyệt</Badge>;
      case "pending": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case "rejected": return <Badge variant="destructive">Từ chối</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Chi tiết sự kiện
            </DialogTitle>
          </DialogHeader>

          {loading ? (
              <div className="flex justify-center p-8">Đang tải dữ liệu...</div>
          ) : error ? (
              <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>
          ) : event ? (
              <>
                {/* --- KHU VỰC IN ẤN --- */}
                {/* Gán ref vào div cha của phần cần in */}
                <div ref={componentRef} className="p-4 bg-white text-black print:p-8">

                  {/* Header Báo Cáo (Chỉ hiện khi in) */}
                  <div className="hidden print:block text-center mb-8 border-b-2 pb-4">
                    <h1 className="text-2xl font-bold uppercase">Báo cáo chi tiết sự kiện</h1>
                    <p className="text-sm text-gray-500 mt-1">Hệ thống Quản lý Tình nguyện VolunteerHub</p>
                    <p className="text-xs text-gray-400">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
                  </div>

                  {/* Thông tin chung */}
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(event.status)}
                          <span className="text-sm text-gray-500">ID: {event.id}</span>
                        </div>
                      </div>
                      {event.image && (
                          <img src={event.image} alt="Event" className="w-32 h-20 object-cover rounded-md border" />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border print:border-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Ngày diễn ra:</span>
                        <span className="text-sm">{new Date(event.date).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Địa điểm:</span>
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Người tạo:</span>
                        <span className="text-sm">{event.contactName || "Quản lý sự kiện"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Số lượng:</span>
                        <span className="text-sm">
                            {registrations.length} / {event.volunteersNeeded > 0 ? event.volunteersNeeded : "∞"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4"/> Mô tả nội dung:</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 border rounded-md min-h-[80px]">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Danh sách người tham gia */}
                  <div className="mt-8">
                    <h3 className="font-bold text-lg mb-3 border-b pb-1 flex items-center gap-2">
                      <Users className="h-5 w-5"/> Danh sách người tham gia ({registrations.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse border border-gray-200">
                        <thead className="bg-gray-100 print:bg-gray-200">
                        <tr>
                          <th className="p-2 border border-gray-200 text-center w-12">STT</th>
                          <th className="p-2 border border-gray-200">Họ và tên</th>
                          <th className="p-2 border border-gray-200">Email</th>
                          <th className="p-2 border border-gray-200">Ngày đăng ký</th>
                          <th className="p-2 border border-gray-200 text-center">Trạng thái</th>
                        </tr>
                        </thead>
                        <tbody>
                        {registrations.map((r, index) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                              <td className="p-2 border border-gray-200 text-center">{index + 1}</td>
                              <td className="p-2 border border-gray-200 font-medium">{r.user?.full_name || "N/A"}</td>
                              <td className="p-2 border border-gray-200 text-gray-600">{r.user?.email || r.userId}</td>
                              <td className="p-2 border border-gray-200">
                                {r.registeredAt ? new Date(r.registeredAt).toLocaleDateString("vi-VN") : "N/A"}
                              </td>
                              <td className="p-2 border border-gray-200 text-center">
                                {r.status}
                              </td>
                            </tr>
                        ))}
                        {registrations.length === 0 && (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">Chưa có người đăng ký.</td></tr>
                        )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer Báo Cáo (Chỉ hiện khi in) */}
                  <div className="hidden print:flex justify-between mt-16 pt-8 px-10">
                    <div className="text-center">
                      <p className="font-bold mb-16">Người lập báo cáo</p>
                      <p className="italic text-sm">(Ký và ghi rõ họ tên)</p>
                    </div>
                    <div className="text-center">
                      <p className="italic text-sm mb-1">Ngày ..... tháng ..... năm .......</p>
                      <p className="font-bold mb-16">Xác nhận của Ban quản lý</p>
                      <p className="italic text-sm">(Ký và đóng dấu)</p>
                    </div>
                  </div>

                </div>
                {/* --- KẾT THÚC KHU VỰC IN --- */}

                <DialogFooter className="flex justify-between sm:justify-between items-center mt-4 border-t pt-4">
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                    <Trash2 className="h-4 w-4" /> Xóa sự kiện
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      <X className="h-4 w-4 mr-2"/> Đóng
                    </Button>
                    <Button onClick={() => handlePrint()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                      <Printer className="h-4 w-4" /> In Báo Cáo
                    </Button>
                  </div>
                </DialogFooter>
              </>
          ) : (
              <div className="p-6 text-center text-gray-500">Không có dữ liệu sự kiện</div>
          )}
        </DialogContent>
      </Dialog>
  );
}