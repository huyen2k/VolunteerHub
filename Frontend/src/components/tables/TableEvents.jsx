import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function TableEvents({
  events,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) {
  const getStatusBadge = (status) => {
    if (status === "upcoming") {
      return <Badge className="bg-blue-500">Sắp diễn ra</Badge>;
    }
    if (status === "ongoing") {
      return <Badge className="bg-green-500">Đang diễn ra</Badge>;
    }
    if (status === "completed") {
      return <Badge variant="outline">Đã hoàn thành</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sự kiện</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Địa điểm</TableHead>
            <TableHead>Tình nguyện viên</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.organizer}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{event.category}</Badge>
              </TableCell>
              <TableCell>
                {new Date(event.date).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {event.location}
              </TableCell>
              <TableCell>
                {event.volunteers_registered}/{event.volunteers_needed}
              </TableCell>
              <TableCell>{getStatusBadge(event.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(event)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(event)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                    )}
                    {onApprove && (
                      <DropdownMenuItem onClick={() => onApprove(event)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Duyệt
                      </DropdownMenuItem>
                    )}
                    {onReject && (
                      <DropdownMenuItem onClick={() => onReject(event)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Từ chối
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(event)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
