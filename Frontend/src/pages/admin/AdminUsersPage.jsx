import React from "react";
import { AdminLayout } from "../../components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Users,
  Calendar,
  Building2,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminUsersPage() {
  const users = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "user1@example.com",
      role: "volunteer",
      status: "active",
      joinDate: "15/01/2024",
      eventsJoined: 5,
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "user2@example.com",
      role: "manager",
      status: "active",
      joinDate: "20/01/2024",
      eventsJoined: 12,
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "user3@example.com",
      role: "volunteer",
      status: "inactive",
      joinDate: "10/01/2024",
      eventsJoined: 2,
    },
  ];

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

          <div className="grid gap-6">
            {users.map((user) => (
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
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Tham gia: {user.joinDate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sự kiện: {user.eventsJoined}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
