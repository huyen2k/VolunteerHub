import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
    Calendar,
    MapPin,
    Users,
    Printer,
    Trash2,
    X,
    FileText,
    User,
    Edit
} from "lucide-react";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";

export function ManagerEventDetailModal({ eventId, open, onOpenChange, onUpdate }) {
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Ref dùng cho chức năng in
    const componentRef = useRef();

    // Hook xử lý in ấn
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Chi_tiet_su_kien_${eventId || "event"}`,
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

            // Lấy thông tin sự kiện
            const eventData = await eventService.getEventById(eventId);
            setEvent(eventData);

            // Lấy danh sách đăng ký (Nếu có API)
            try {
                const regs = await registrationService.getRegistrationsByEvent(eventId);

                // Enrich thông tin user nếu cần
                const regsWithNames = await Promise.all(
                    (regs || []).map(async (r) => {
                        try {
                            if (r.user && r.user.full_name) return r;
                            const u = await userService.getUserById(r.userId);
                            return { ...r, user: { full_name: u.full_name, email: u.email, phone: u.phone } };
                        } catch {
                            return { ...r, user: { full_name: "N/A", email: "N/A" } };
                        }
                    })
                );
                setRegistrations(regsWithNames);
            } catch (err) {
                console.warn("Không tải được danh sách đăng ký:", err);
                setRegistrations([]);
            }

        } catch (err) {
            setError("Không thể tải chi tiết sự kiện");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.")) return;
        try {
            await eventService.deleteEvent(eventId);
            onOpenChange(false);
            if (onUpdate) onUpdate(); // Reload danh sách bên ngoài
        } catch (err) {
            alert("Không thể xóa sự kiện: " + (err.message || "Lỗi không xác định"));
        }
    };

    const handleEdit = () => {
        onOpenChange(false); // Đóng modal trước
        navigate(`/manager/events/${eventId}/edit`); // Chuyển sang trang sửa
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved": return <Badge className="bg-green-600 hover:bg-green-700">Đã phê duyệt</Badge>;
            case "pending": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Đang chờ duyệt</Badge>;
            case "rejected": return <Badge variant="destructive">Bị từ chối</Badge>;
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
                    <div className="flex justify-center p-8"><LoadingSpinner /></div>
                ) : error ? (
                    <div className="p-4 text-red-500 bg-red-50 rounded-md text-center">{error}</div>
                ) : event ? (
                    <>
                        {/* --- KHU VỰC IN ẤN --- */}
                        <div style={{ display: "none" }}>
                            <div ref={componentRef} className="p-10 bg-white text-black font-serif">
                                <div className="text-center mb-8 border-b-2 border-black pb-4">
                                    <h1 className="text-2xl font-bold uppercase">BÁO CÁO CHI TIẾT SỰ KIỆN</h1>
                                    <p className="text-sm mt-1">Hệ thống Quản lý Tình nguyện VolunteerHub</p>
                                    <p className="italic text-xs mt-1">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                                    <p><strong>Mã sự kiện:</strong> {event.id}</p>
                                    <p><strong>Trạng thái:</strong> {event.status === 'approved' ? 'Đã phê duyệt' : event.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}</p>
                                    <div className="grid grid-cols-2 gap-4 mt-4 border p-4">
                                        <p><strong>Ngày diễn ra:</strong> {new Date(event.date).toLocaleString("vi-VN")}</p>
                                        <p><strong>Địa điểm:</strong> {event.location}</p>
                                        <p><strong>Số lượng TNV:</strong> {registrations.length} / {event.volunteersNeeded || "∞"}</p>
                                        <p><strong>Người phụ trách:</strong> {event.contactName || "Quản lý"}</p>
                                    </div>
                                    <div className="mt-4">
                                        <strong className="block mb-2">Mô tả nội dung:</strong>
                                        <p className="whitespace-pre-wrap border p-2 min-h-[100px] text-sm">{event.description}</p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="font-bold border-b border-black mb-2">DANH SÁCH THAM GIA ({registrations.length})</h3>
                                    <table className="w-full text-sm border-collapse border border-black">
                                        <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-black p-2 text-center w-10">STT</th>
                                            <th className="border border-black p-2">Họ và tên</th>
                                            <th className="border border-black p-2">Email / Liên hệ</th>
                                            <th className="border border-black p-2 text-center">Ngày đăng ký</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {registrations.map((r, i) => (
                                            <tr key={i}>
                                                <td className="border border-black p-2 text-center">{i + 1}</td>
                                                <td className="border border-black p-2">{r.user?.full_name || "N/A"}</td>
                                                <td className="border border-black p-2">{r.user?.email || r.userId}</td>
                                                <td className="border border-black p-2 text-center">{new Date(r.registeredAt).toLocaleDateString("vi-VN")}</td>
                                            </tr>
                                        ))}
                                        {registrations.length === 0 && <tr><td colSpan="4" className="border border-black p-2 text-center italic">Chưa có đăng ký nào</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-16 flex justify-between px-10">
                                    <div className="text-center"><p className="font-bold">Người lập báo cáo</p><p className="italic text-sm mt-16">(Ký tên)</p></div>
                                    <div className="text-center"><p className="font-bold">Xác nhận của Ban quản lý</p><p className="italic text-sm mt-16">(Ký và đóng dấu)</p></div>
                                </div>
                            </div>
                        </div>

                        {/* --- GIAO DIỆN WEB --- */}
                        <div className="space-y-6">
                            {/* Info Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        {getStatusBadge(event.status)}
                                        <span className="text-sm text-gray-500">ID: {event.id}</span>
                                    </div>
                                </div>
                                {event.image && (
                                    <img src={event.image} alt="Event" className="w-32 h-20 object-cover rounded-md border shadow-sm" />
                                )}
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Thời gian</p>
                                        <p className="text-sm">{new Date(event.date).toLocaleString("vi-VN")}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Địa điểm</p>
                                        <p className="text-sm">{event.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Người tạo</p>
                                        <p className="text-sm">{event.contactName || "Quản lý sự kiện"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Số lượng</p>
                                        <p className="text-sm">
                                            {registrations.length} / {event.volunteersNeeded > 0 ? event.volunteersNeeded : "Không giới hạn"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4"/> Mô tả nội dung:</h4>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 border rounded-md min-h-[80px]">
                                    {event.description}
                                </div>
                            </div>

                            {/* Participant List Preview */}
                            <div>
                                <h3 className="font-bold text-lg mb-3 border-b pb-1 flex items-center gap-2">
                                    <Users className="h-5 w-5"/> Danh sách tham gia ({registrations.length})
                                </h3>
                                <div className="overflow-x-auto border rounded-md">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="p-2 w-12 text-center">STT</th>
                                            <th className="p-2">Họ và tên</th>
                                            <th className="p-2">Email</th>
                                            <th className="p-2 text-center">Ngày đăng ký</th>
                                            <th className="p-2 text-center">Trạng thái</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {registrations.map((r, index) => (
                                            <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="p-2 text-center">{index + 1}</td>
                                                <td className="p-2 font-medium">{r.user?.full_name || "N/A"}</td>
                                                <td className="p-2 text-gray-600">{r.user?.email || r.userId}</td>
                                                <td className="p-2 text-center">
                                                    {r.registeredAt ? new Date(r.registeredAt).toLocaleDateString("vi-VN") : "N/A"}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge variant="outline" className="text-xs">{r.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {registrations.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-4 text-center text-muted-foreground">Chưa có người đăng ký nào.</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center mt-6 border-t pt-4 gap-2">
                            <div className="flex gap-2 w-full sm:w-auto">
                                {/* Chỉ cho phép Xóa nếu chưa hoàn thành */}
                                <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                                    <Trash2 className="h-4 w-4" /> Xóa
                                </Button>
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    <X className="h-4 w-4 mr-2"/> Đóng
                                </Button>
                                <Button onClick={handlePrint} variant="outline" className="gap-2">
                                    <Printer className="h-4 w-4" /> In Báo Cáo
                                </Button>
                                <Button onClick={handleEdit} className="bg-primary hover:bg-primary/90 gap-2">
                                    <Edit className="h-4 w-4" /> Chỉnh sửa
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="p-6 text-center text-gray-500">Không tìm thấy dữ liệu sự kiện</div>
                )}
            </DialogContent>
        </Dialog>
    );
}