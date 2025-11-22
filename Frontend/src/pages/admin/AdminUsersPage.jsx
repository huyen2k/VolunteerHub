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
import { Input } from "../../components/ui/input";
import {
  Users,
  Calendar,
  Building2,
  AlertCircle,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { AdminUserDetailModal } from "./AdminUserDetailModal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
        name: user.full_name || "Unknown",
        email: user.email || "",
        role: user.roles?.[0] || "volunteer",
        status: user.is_active ? "active" : "inactive",
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "",
        eventsJoined: 0, // Will be fetched separately if needed
      }));
      
      setUsers(transformedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? false : true;
      await userService.updateUserStatus(userId, newStatus);
      await loadUsers();
    } catch (err) {
      alert("Không thể cập nhật trạng thái: " + (err.message || "Lỗi không xác định"));
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }
    try {
      await userService.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      alert("Không thể xóa người dùng: " + (err.message || "Lỗi không xác định"));
    }
  };

  const [editMode, setEditMode] = useState(false);

  const handleViewDetails = (userId) => {
    setSelectedUserId(userId);
    setEditMode(false);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (userId) => {
    setSelectedUserId(userId);
    setEditMode(true);
    setIsDetailModalOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });


  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadUsers} className="mt-4">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
            <p className="mt-2 text-muted-foreground">
              Quản lý tất cả người dùng trong hệ thống
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full max-w-md"
              />
            </div>
          </div>

          <div className="grid gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                          >
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Tham gia: {user.joinDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(user.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Chi tiết
                        </Button>
                        {/* Bỏ nút Sửa theo yêu cầu */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.status)}
                        >
                          {user.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Không tìm thấy người dùng nào phù hợp"
                    : "Không có người dùng nào"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <AdminUserDetailModal
        userId={selectedUserId}
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          setIsDetailModalOpen(open);
          if (!open) {
            setEditMode(false);
          }
        }}
        onUpdate={loadUsers}
        initialEditMode={editMode}
      />
    </AdminLayout>
  );
}
