import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "../../components/Layout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Users, Eye, Trash2, Search, Lock, Unlock, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { AdminUserDetailModal } from "./AdminUserDetailModal";
import { useReactToPrint } from "react-to-print";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE CHO PHÂN TRANG & TÌM KIẾM ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;
  // ----------------------------------------

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Danh_sach_nguoi_dung",
  });

  // --- HELPER: Tạo avatar chữ cái đầu và màu nền ---
  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-500";
    const colors = [
      "bg-red-500", "bg-orange-500", "bg-amber-500",
      "bg-green-500", "bg-emerald-500", "bg-teal-500",
      "bg-cyan-500", "bg-blue-500", "bg-indigo-500",
      "bg-violet-500", "bg-purple-500", "bg-pink-500"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  // ------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await userService.getUsers(debouncedSearchTerm, page, pageSize);

      // Xử lý dữ liệu Page object an toàn
      let pageData = response;
      if (response && response.result) {
        pageData = response.result;
      }

      const userList = Array.isArray(pageData.content) ? pageData.content : [];

      const transformedUsers = userList.map((user) => ({
        id: user.id,
        name: user.full_name || "Chưa đặt tên",
        email: user.email || "",
        role: user.roles?.[0] || "USER",
        isActive: user.isActive,
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "N/A",
        // Lấy avatar an toàn (ưu tiên avatar_url từ DB)
        avatar: (user.avatar_url || user.avatarUrl || user.avatar || "").trim()
      }));

      setUsers(transformedUsers);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);

    } catch (err) {
      console.error("Error loading users:", err);
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "MỞ KHÓA" : "KHÓA";
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) return;

    try {
      await userService.updateUserStatus(userId, newStatus);
      setUsers(prevUsers => prevUsers.map(u =>
          u.id === userId ? { ...u, isActive: newStatus } : u
      ));
    } catch (err) {
      alert(`Lỗi: ` + (err.message || "Không xác định"));
      loadUsers();
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


  if (loading && page === 0 && users.length === 0) return <AdminLayout><div className="container mx-auto p-6"><LoadingSpinner /></div></AdminLayout>;
  if (error) return <AdminLayout><div className="p-6 text-destructive text-center">{error}</div></AdminLayout>;

  return (
      <AdminLayout>
        <div className="bg-muted/30 min-h-screen">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

            {/* Header Controls */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                <p className="mt-2 text-muted-foreground">
                  Tổng số: <b>{totalElements}</b> người dùng
                  {debouncedSearchTerm && <span> (Kết quả tìm kiếm: "{debouncedSearchTerm}")</span>}
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                      placeholder="Tìm theo tên, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                  />
                </div>

                <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Printer className="h-4 w-4" /> In danh sách
                </Button>
              </div>
            </div>

            {/* --- BẮT ĐẦU VÙNG IN ẤN --- */}
            <div ref={printRef} className="p-4 bg-transparent print:bg-white print:p-8 text-black">

              <div className="hidden print:block text-center mb-8 border-b-2 pb-4">
                <h1 className="text-2xl font-bold uppercase">Danh sách người dùng hệ thống</h1>
                <p className="text-sm text-gray-500">Trang {page + 1}/{totalPages}</p>
                <p className="text-xs text-gray-400">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
              </div>

              {/* GRID VIEW */}
              <div className="grid gap-4 print:hidden">
                {users.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                          {/* User Info */}
                          <div className="flex items-center gap-4">

                            {/* --- AVATAR LOGIC (Ảnh thật -> Fallback Initials) --- */}
                            <div className="relative h-12 w-12 flex-shrink-0">
                              {user.avatar ? (
                                  <img
                                      src={user.avatar}
                                      alt={user.name}
                                      className="h-full w-full rounded-full object-cover border border-gray-200 shadow-sm"
                                      onError={(e) => {
                                        e.target.style.display = 'none'; // Ẩn ảnh lỗi
                                        e.target.nextSibling.style.display = 'flex'; // Hiện fallback
                                      }}
                                  />
                              ) : null}

                              {/* Fallback: Chữ cái đầu trên nền màu */}
                              <div
                                  className={`absolute inset-0 flex h-full w-full items-center justify-center rounded-full text-white font-bold shadow-sm ${getAvatarColor(user.name)}`}
                                  style={{ display: user.avatar ? 'none' : 'flex' }}
                              >
                                {getInitials(user.name)}
                              </div>
                            </div>
                            {/* ------------------------------------------------ */}

                            <div>
                              <h3 className="text-lg font-semibold">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="uppercase text-[10px]">{user.role}</Badge>
                                <Badge className={user.isActive ? "bg-green-500 hover:bg-green-600" : "bg-destructive hover:bg-destructive"}>
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

              {/* TABLE VIEW (PRINT ONLY) */}
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
                  {users.map((user, idx) => (
                      <tr key={user.id}>
                        <td className="p-2 border border-gray-300 text-center">{(page * pageSize) + idx + 1}</td>
                        <td className="p-2 border border-gray-300">{user.name}</td>
                        <td className="p-2 border border-gray-300">{user.email}</td>
                        <td className="p-2 border border-gray-300">{user.role}</td>
                        <td className="p-2 border border-gray-300">{user.isActive ? "Hoạt động" : "Đã khóa"}</td>
                        <td className="p-2 border border-gray-300">{user.joinDate}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* --- KẾT THÚC VÙNG IN --- */}

            {users.length === 0 && !loading && <p className="text-center text-muted-foreground mt-10">Không tìm thấy người dùng nào.</p>}

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 print:hidden">
                  <Button
                      variant="outline"
                      disabled={page === 0}
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                  </Button>
                  <span className="text-sm font-medium">
                        Trang {page + 1} / {totalPages}
                    </span>
                  <Button
                      variant="outline"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                  >
                    Tiếp <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
            )}

          </div>
        </div>
        <AdminUserDetailModal userId={selectedUserId} open={isDetailModalOpen} onOpenChange={(open) => {setIsDetailModalOpen(open); if(!open) setEditMode(false);}} onUpdate={loadUsers} initialEditMode={editMode} />
      </AdminLayout>
  );
}