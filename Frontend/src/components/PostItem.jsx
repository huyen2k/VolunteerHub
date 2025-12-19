import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Heart, MessageCircle, Share2, Trash2, MoreHorizontal, User } from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function PostItem({ post, onDelete, onLike, currentUser }) {
    const navigate = useNavigate();

    // Điều hướng thông minh dựa trên Role
    const handleDetail = () => {
        let path = `/community/posts/${post.id}`;
        if (currentUser?.role === "admin") path = `/admin/community/posts/${post.id}`;
        else if (currentUser?.role === "manager") path = `/manager/community/posts/${post.id}`;

        navigate(path);
    };

    // Xử lý Like (Chặn click lan ra ngoài Card để không bị nhảy trang)
    const handleLikeClick = (e) => {
        e.stopPropagation();
        if (onLike) onLike(post.id);
    };

    // Xử lý Xóa (Chặn click lan)
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(post.id);
    };

    // Grid ảnh thông minh
    const renderImages = () => {
        if (!post.images || post.images.length === 0) return null;
        const displayImages = post.images.slice(0, 4);
        const remain = post.images.length - 4;

        // Class grid tùy theo số lượng ảnh
        let gridClass = "grid-cols-1 h-64";
        if (displayImages.length === 2) gridClass = "grid-cols-2 h-64";
        else if (displayImages.length === 3) gridClass = "grid-cols-2 h-80";
        else if (displayImages.length >= 4) gridClass = "grid-cols-2 h-80";

        return (
            <div className={`grid gap-1 mt-3 rounded-lg overflow-hidden ${gridClass}`} onClick={(e) => e.stopPropagation()}>
                {displayImages.map((img, idx) => (
                    <div
                        key={idx}
                        className={`relative w-full h-full bg-gray-100 ${
                            displayImages.length === 3 && idx === 0 ? "row-span-2" : ""
                        }`}
                    >
                        <img src={img} alt="post" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
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
                            <AvatarFallback><User className="h-5 w-5 text-gray-400"/></AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-bold text-sm text-gray-900 hover:underline">{post.authorName || "Người dùng ẩn danh"}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{new Date(post.createdAt).toLocaleDateString("vi-VN", {day: "numeric", month: "long", hour:"2-digit", minute:"2-digit"})}</span>
                                {post.eventTitle && <Badge variant="secondary" className="text-[10px] h-5 font-normal bg-gray-100 text-gray-600 px-2">{post.eventTitle}</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* Menu Actions (Chỉ hiện khi có quyền xóa) */}
                    {onDelete && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 focus:text-red-600 cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa bài viết
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    {post.title && <h3 className="font-bold text-lg text-gray-900 leading-tight">{post.title}</h3>}
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed line-clamp-4">{post.content}</p>
                </div>

                {/* Images */}
                {renderImages()}
            </div>

            {/* Footer Actions */}
            <div className="px-2 py-2 border-t flex justify-between items-center bg-gray-50/50">
                <div className="flex gap-1">
                    {/* Nút Like */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 h-9 px-3 rounded-full hover:bg-red-50 ${post.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-500'}`}
                        onClick={handleLikeClick}
                    >
                        <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{post.likesCount || 0}</span>
                    </Button>

                    {/* Nút Comment */}
                    <Button variant="ghost" size="sm" className="gap-2 h-9 px-3 rounded-full text-gray-600 hover:bg-blue-50 hover:text-blue-600">
                        <MessageCircle className="h-5 w-5" />
                        <span className="font-medium">{post.commentsCount || 0}</span>
                    </Button>
                </div>

                {/* Nút Share */}
                <Button variant="ghost" size="sm" className="gap-2 text-gray-500 rounded-full h-9 w-9 p-0 md:w-auto md:px-3">
                    <Share2 className="h-4 w-4" /> <span className="hidden md:inline">Chia sẻ</span>
                </Button>
            </div>
        </Card>
    );
}