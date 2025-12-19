import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar, MapPin, Printer, FileText } from "lucide-react";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";

export function ManagerEventDetailModal({ eventId, open, onOpenChange, onUpdate }) {
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);

    const printRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Phieu_tom_tat_su_kien_${eventId}`,
        pageStyle: `
          @page { size: A4; margin: 20mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; font-family: 'Times New Roman', Times, serif; }
            .status-badge { border: 1px solid #000; padding: 2px 5px; }
          }
        `,
    });

    useEffect(() => { if (open && eventId) load(); }, [open, eventId]);

    const load = async () => {
        try {
            setLoading(true);
            const eventData = await eventService.getEventById(eventId);
            setEvent(eventData);
            const regs = await registrationService.getRegistrationsByEvent(eventId);
            const regsWithNames = await Promise.all(regs.map(async (r) => {
                try {
                    const u = await userService.getUserById(r.userId);
                    return { ...r, user: { full_name: u.full_name, email: u.email } };
                } catch { return { ...r, user: { full_name: "N/A" } }; }
            }));
            setRegistrations(regsWithNames);
        } catch { } finally { setLoading(false); }
    };

    // Helper map trạng thái sang tiếng Việt và màu sắc
    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved': return { label: "Đã duyệt", class: "bg-green-100 text-green-700" };
            case 'pending': return { label: "Chờ duyệt", class: "bg-yellow-100 text-yellow-700" };
            case 'completed': return { label: "Hoàn thành", class: "bg-blue-100 text-blue-700" };
            case 'rejected': return { label: "Từ chối", class: "bg-red-100 text-red-700" };
            default: return { label: status, class: "bg-gray-100" };
        }
    };

    if (loading) return <Dialog open={open}><DialogContent><LoadingSpinner/></DialogContent></Dialog>;
    if (!event) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Tóm tắt sự kiện</DialogTitle></DialogHeader>

                <div ref={printRef}>
                    {/* 1. Print View */}
                    <div className="hidden print:block p-10 bg-white text-black text-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                        <div className="text-center mb-8 border-b-2 border-black pb-4">
                            <h1 className="text-2xl font-bold uppercase">PHIẾU TÓM TẮT SỰ KIỆN</h1>
                            <p className="italic">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
                        </div>

                        <div className="mb-6 space-y-2">
                            <p><strong>Tên sự kiện:</strong> {event.title}</p>
                            <p><strong>Thời gian:</strong> {new Date(event.date).toLocaleString()}</p>
                            <p><strong>Địa điểm:</strong> {event.location}</p>
                        </div>

                        <div className="mt-4 border-t border-black pt-4">
                            <h3 className="font-bold mb-2">Danh sách tình nguyện viên ({registrations.length})</h3>
                            <table className="w-full border-collapse border border-black text-[12px]">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-black p-2 text-center w-10">STT</th>
                                    <th className="border border-black p-2">Họ tên</th>
                                    <th className="border border-black p-2">Email</th>
                                    <th className="border border-black p-2 text-center">Trạng thái</th>
                                    <th className="border border-black p-2 text-center">Ngày ĐK</th>
                                </tr>
                                </thead>
                                <tbody>
                                {registrations.map((r,i) => (
                                    <tr key={i}>
                                        <td className="border border-black p-2 text-center">{i+1}</td>
                                        <td className="border border-black p-2">{r.user?.full_name}</td>
                                        <td className="border border-black p-2">{r.user?.email}</td>
                                        <td className="border border-black p-2 text-center">{getStatusInfo(r.status).label}</td>
                                        <td className="border border-black p-2 text-center">{new Date(r.registeredAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 2. Web View */}
                    <div className="space-y-6 print:hidden">
                        <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-muted/30">
                            <div><h2 className="text-xl font-bold">{event.title}</h2><p className="text-sm text-muted-foreground">ID: {event.id}</p></div>
                            <div className="text-right"><Badge variant="outline" className="bg-primary/10">{event.status}</Badge></div>
                            <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-primary"/> {new Date(event.date).toLocaleString()}</div>
                            <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary"/> {event.location}</div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2 flex items-center gap-2 text-sm"><FileText className="h-4 w-4"/> Mô tả ngắn:</h4>
                            <div className="p-3 border rounded bg-white text-xs italic line-clamp-3">{event.description}</div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2 flex justify-between items-center text-sm">
                                <span>Danh sách đăng ký ({registrations.length})</span>
                            </h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-3 w-12 text-center">STT</th>
                                        <th className="p-3">Tình nguyện viên</th>
                                        <th className="p-3 text-center">Trạng thái</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {registrations.map((r,i)=>{
                                        const status = getStatusInfo(r.status);
                                        return (
                                            <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                                                <td className="p-3 text-center text-gray-500">{i+1}</td>
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900">{r.user?.full_name}</div>
                                                    <div className="text-[10px] text-gray-500">{r.user?.email}</div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Badge className={`text-[10px] font-normal border-none shadow-none ${status.class}`}>
                                                        {status.label}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {registrations.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-gray-400 italic">Chưa có dữ liệu tình nguyện viên</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <div className="flex gap-2 w-full justify-end">
                        <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> In phiếu</Button>
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Đóng</Button>
                        <Button size="sm" onClick={() => { onOpenChange(false); navigate(`/manager/events/${eventId}`); }}>Quản lý chi tiết</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}