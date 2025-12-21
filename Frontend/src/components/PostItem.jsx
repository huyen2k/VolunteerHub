import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge"; // Đảm bảo đã import Badge
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  MoreHorizontal,
  User,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import postService from "../services/postService";
import reportService from "../services/reportService";

export default function PostItem({ post, onDelete, currentUser }) {
  const navigate = useNavigate();

  // --- STATE ---
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- LOGIC ---
  const handleDetail = () => {
    let path = `/community/posts/${post.id}`;
    if (currentUser?.roles?.includes("ADMIN"))
      path = `/admin/community/posts/${post.id}`;
    else if (currentUser?.roles?.includes("MANAGER"))
      path = `/manager/community/posts/${post.id}`;
    navigate(path);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (!currentUser) return alert("Vui lòng đăng nhập!");

    const prevLiked = isLiked;
    const prevCount = likeCount;

    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      if (prevLiked) await postService.unlikePost(post.id);
      else await postService.likePost(post.id);
    } catch (error) {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      if (onDelete) onDelete(post.id);
    } catch (error) {
      alert("Lỗi xóa bài: " + error.message);
      setIsDeleting(false);
    }
  };

  const handleReportClick = async (e) => {
    e.stopPropagation();
    if (!currentUser) return alert("Vui lòng đăng nhập!");

    const reason = window.prompt("Nhập lý do báo cáo bài viết này:");
    if (!reason) return;

    try {
      await reportService.createReport({
        type: "post",
        targetId: post.id,
        title: `Báo cáo bài viết: ${post.title || "Không tiêu đề"}`,
        description: reason,
      });
      alert("Đã gửi báo cáo thành công!");
    } catch (error) {
      alert("Lỗi gửi báo cáo: " + (error.message || "Không xác định"));
    }
  };

  const userRoles = currentUser?.roles || [];
  const isAdmin = userRoles.includes("ADMIN");
  const isOwner = currentUser?.id === post.authorId;
  const canDelete = isAdmin || isOwner;

  // --- RENDER IMAGES ---
  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null;
    const displayImages = post.images.slice(0, 4);
    const remain = post.images.length - 4;

    let gridClass = "grid-cols-1 h-64";
    if (displayImages.length === 2) gridClass = "grid-cols-2 h-64";
    else if (displayImages.length === 3) gridClass = "grid-cols-2 h-80";
    else if (displayImages.length >= 4) gridClass = "grid-cols-2 h-80";

    return (
      <div
        className={`grid gap-1 mt-3 rounded-lg overflow-hidden ${gridClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {displayImages.map((img, idx) => (
          <div
            key={idx}
            className={`relative w-full h-full bg-gray-100 ${
              displayImages.length === 3 && idx === 0 ? "row-span-2" : ""
            }`}
          >
            <img
              src={img}
              alt="post"
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {idx === 3 && remain > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">
                +{remain}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isDeleting)
    return (
      <Card className="p-6 mb-4 text-center text-gray-400 bg-gray-50 border-dashed">
        Đang xóa...
      </Card>
    );

  // --- RENDER MAIN ---
  return (
    <Card
      className="mb-4 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white group"
      onClick={handleDetail}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-gray-200">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback>
                <User className="h-5 w-5 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm text-gray-900 hover:underline">
                {post.authorName || "Người dùng ẩn danh"}
              </div>

              {/* 👇 PHẦN ĐÃ BỔ SUNG LẠI: NGÀY GIỜ + TÊN SỰ KIỆN 👇 */}
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Vừa xong"}
                </span>

                {/* Kiểm tra: Nếu có eventTitle thì hiển thị Badge */}
                {(post.eventTitle || post.eventName) && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 px-2 font-normal bg-gray-100 text-gray-600 hover:bg-gray-200 border-0"
                  >
                    {post.eventTitle || post.eventName}
                  </Badge>
                )}
              </div>
              {/* 👆 KẾT THÚC PHẦN BỔ SUNG 👆 */}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-600"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canDelete && (
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa bài viết
                </DropdownMenuItem>
              )}
              {!isOwner && (
                <DropdownMenuItem onClick={handleReportClick}>
                  <Flag className="mr-2 h-4 w-4" /> Báo cáo
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          {post.title && (
            <h3 className="font-bold text-lg text-gray-900 leading-tight">
              {post.title}
            </h3>
          )}
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed line-clamp-4">
            {post.content}
          </p>
        </div>

        {renderImages()}
      </div>

      <div className="px-2 py-2 border-t flex justify-between items-center bg-gray-50/50">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeClick}
            className={`gap-2 h-9 px-3 rounded-full hover:bg-red-50 transition-colors ${
              isLiked ? "text-red-600" : "text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="font-medium">{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 h-9 px-3 rounded-full text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">{post.commentsCount || 0}</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-500 rounded-full h-9 w-9 p-0 md:w-auto md:px-3"
        >
          <Share2 className="h-4 w-4" />{" "}
          <span className="hidden md:inline">Chia sẻ</span>
        </Button>
      </div>
    </Card>
  );
}
