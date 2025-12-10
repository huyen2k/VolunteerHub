import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "../../components/Layout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Users, Eye, Trash2, Search, Lock, Unlock, Download, Printer } from "lucide-react";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { AdminUserDetailModal } from "./AdminUserDetailModal";
import { useReactToPrint } from "react-to-print";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef, // Syntax mới của react-to-print
    documentTitle: "Danh_sach_nguoi_dung",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getUsers();

      const transformedUsers = (data || []).map((user) => ({
        id: user.id,
        name: user.full_name || "Chưa đặt tên",
        email: user.email || "",
        role: user.roles?.[0] || "USER",
        // Đảm bảo lấy đúng trường isActive từ API
        isActive: user.isActive,
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "N/A",
      }));

      setUsers(transformedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleExportUsers = () => {
    if (users.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }
    const headers = ["ID", "Tên", "Email", "Vai trò", "Trạng thái", "Ngày tham gia"];
    const csvRows = [headers.join(",")];

    users.forEach(user => {
      const row = [
        `"${user.id}"`,
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.role}"`,
        `"${user.isActive ? "Hoạt động" : "Đã khóa"}"`,
        `"${user.joinDate}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvString = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "MỞ KHÓA" : "KHÓA";

    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) return;

    try {
      // Gọi API
      await userService.updateUserStatus(userId, newStatus);

      // Cập nhật State ngay lập tức (Optimistic UI)
      setUsers(prevUsers => prevUsers.map(u =>
          u.id === userId ? { ...u, isActive: newStatus } : u
      ));

    } catch (err) {
      alert(`Lỗi: ` + (err.message || "Không xác định"));
      loadUsers(); // Nếu lỗi thì load lại data cũ
    }
  };

  const handleDelete = async (userId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("CẢNH BÁO: Xóa vĩnh viễn người dùng này?")) return;
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert("Không thể xóa: " + (err.message || "Lỗi không xác định"));
    }
  };

  const handleViewDetails = (userId) => {
    setSelectedUserId(userId);
    setEditMode(false);
    setIsDetailModalOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <AdminLayout><div className="container mx-auto p-6"><LoadingSpinner /></div></AdminLayout>;
  if (error) return <AdminLayout><div className="p-6 text-destructive text-center">{error}</div></AdminLayout>;

  return (
      <AdminLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

            {/* Header Controls */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                <p className="mt-2 text-muted-foreground">Quản lý tất cả người dùng trong hệ thống</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>

                {/* Nút Export Excel */}
                <Button onClick={handleExportUsers} variant="outline" className="gap-2 bg-white text-slate-900 border">
                  <Download className="h-4 w-4" /> Excel
                </Button>

                {/* NÚT IN MỚI */}
                <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Printer className="h-4 w-4" /> In danh sách người dùng
                </Button>
              </div>
            </div>

            {/* --- BẮT ĐẦU VÙNG IN ẤN --- */}
            <div ref={printRef} className="p-4 bg-transparent print:bg-white print:p-8 text-black">

              {/* Header chỉ hiện khi in */}
              <div className="hidden print:block text-center mb-8 border-b-2 pb-4">
                <h1 className="text-2xl font-bold uppercase">Danh sách người dùng hệ thống</h1>
                <p className="text-sm text-gray-500">VolunteerHub Management Report</p>
                <p className="text-xs text-gray-400">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
              </div>

              {/* Grid hiển thị trên Web (Giữ nguyên giao diện card cũ) */}
              <div className="grid gap-4 print:hidden">
                {filteredUsers.map((user) => (
                    // ... (Giữ nguyên code hiển thị Card của bạn ở đây) ...
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* User Info */}
                          <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${user.isActive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                              <Users className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="uppercase text-[10px]">{user.role}</Badge>
                                <Badge className={user.isActive ? "bg-green-500" : "bg-destructive"}>
                                  {user.isActive ? "Hoạt động" : "Đã khóa"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex flex-col items-end gap-3">
                            <div className="text-sm text-muted-foreground">Tham gia: {user.joinDate}</div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(user.id)}><Eye className="mr-2 h-4 w-4" /> Chi tiết</Button>
                              <Button variant={user.isActive ? "secondary" : "default"} size="sm" onClick={() => handleToggleStatus(user.id, user.isActive)} className={user.isActive ? "text-orange-600 bg-orange-50" : "bg-green-600 text-white"}>
                                {user.isActive ? <><Lock className="mr-2 h-4 w-4" /> Khóa</> : <><Unlock className="mr-2 h-4 w-4" /> Mở khóa</>}
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>

              {/* Table hiển thị khi IN (Thay thế cho Card grid khi in) */}
              <div className="hidden print:block w-full">
                <table className="w-full text-sm text-left border-collapse border border-gray-300">
                  <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border border-gray-300">STT</th>
                    <th className="p-2 border border-gray-300">Họ tên</th>
                    <th className="p-2 border border-gray-300">Email</th>
                    <th className="p-2 border border-gray-300">Vai trò</th>
                    <th className="p-2 border border-gray-300">Trạng thái</th>
                    <th className="p-2 border border-gray-300">Ngày tham gia</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredUsers.map((user, idx) => (
                      <tr key={user.id}>
                        <td className="p-2 border border-gray-300 text-center">{idx + 1}</td>
                        <td className="p-2 border border-gray-300">{user.name}</td>
                        <td className="p-2 border border-gray-300">{user.email}</td>
                        <td className="p-2 border border-gray-300">{user.role}</td>
                        <td className="p-2 border border-gray-300">{user.isActive ? "Hoạt động" : "Đã khóa"}</td>
                        <td className="p-2 border border-gray-300">{user.joinDate}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
                <div className="flex justify-between mt-10 px-10">
                  <div className="text-center"><p className="font-bold">Người lập biểu</p></div>
                  <div className="text-center"><p className="font-bold">Xác nhận của Admin</p></div>
                </div>
              </div>

            </div>
            {/* --- KẾT THÚC VÙNG IN --- */}

            {filteredUsers.length === 0 && <p className="text-center text-muted-foreground mt-10">Không tìm thấy người dùng nào.</p>}
          </div>
        </div>
        <AdminUserDetailModal userId={selectedUserId} open={isDetailModalOpen} onOpenChange={(open) => {setIsDetailModalOpen(open); if(!open) setEditMode(false);}} onUpdate={loadUsers} initialEditMode={editMode} />
      </AdminLayout>
  );
}