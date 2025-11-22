import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { UserLayout } from "../../components/Layout";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Flag,
  Trash2,
  Share2,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { useAuth } from "../../hooks/useAuth";
import postService from "../../services/postService";
import userService from "../../services/userService";
import { likeService } from "../../services/likeService";
import reportService from "../../services/reportService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // States cho Report & Menu
  const [reportText, setReportText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // State để toggle menu "..."
  const menuRef = useRef(null); // Ref để click outside đóng menu

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) loadPostData();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Lấy Post Detail
      const postData = await postService.getPostById(id);

      if (!postData.authorName && postData.authorId) {
        try {
          const u = await userService.getUserById(postData.authorId);
          postData.authorName = u.full_name;
          postData.authorAvatar = u.avatar;
        } catch {}
      }

      if (user?.id) {
        try {
          postData.isLiked = await likeService.checkUserLike(
            user.id,
            "post",
            id
          );
        } catch {}
      }
      if (postData.likesCount === undefined) {
        try {
          postData.likesCount = await likeService.getLikeCount("post", id);
        } catch {}
      }

      setPost(postData);

      // 2. Lấy Comments
      const commentsData = await postService.getComments(id).catch(() => []);
      const enrichedComments = await Promise.all(
        commentsData.map(async (c) => {
          if (!c.authorName && c.authorId) {
            try {
              const u = await userService.getUserById(c.authorId);
              c.authorName = u.full_name;
              c.authorAvatar = u.avatar;
            } catch {}
          }
          return c;
        })
      );

      setComments(
        enrichedComments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (err) {
      console.error("Error loading post data:", err);
      setError(err.message || "Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    if (!user) return alert("Vui lòng đăng nhập");
    try {
      await likeService.toggleLike(user.id, "post", id);
      setPost((prev) => ({
        ...prev,
        isLiked: !prev.isLiked,
        likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
      }));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const commentRes = await postService.createComment(id, {
        content: newComment,
      });

      const newCommentObj = {
        ...commentRes,
        authorName: user.name || user.full_name,
        authorAvatar: user.avatar,
        createdAt: new Date().toISOString(),
      };

      setComments([newCommentObj, ...comments]);
      setNewComment("");
      // Update comment count in post UI only
      setPost((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1,
      }));
    } catch (err) {
      alert("Không thể tạo bình luận: " + (err.message || "Lỗi mạng"));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      await postService.deleteComment(id, commentId); // Giả sử API cần postId
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPost((prev) => ({
        ...prev,
        commentsCount: Math.max(0, (prev.commentsCount || 0) - 1),
      }));
    } catch (err) {
      alert("Không thể xóa bình luận");
    }
  };

  const handleCreateReport = async () => {
    if (!reportText.trim()) return;
    try {
      await reportService.createReport({
        type: "post",
        targetId: id,
        title: "Báo cáo bài viết vi phạm",
        description: reportText.trim(),
      });
      setReportText("");
      setReportOpen(false);
      alert("Đã gửi báo cáo thành công. Admin sẽ xem xét.");
    } catch (err) {
      alert("Lỗi gửi báo cáo: " + err.message);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading)
    return (
      <UserLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </UserLayout>
    );
  if (error || !post)
    return (
      <UserLayout>
        <div className="container mx-auto p-6 max-w-2xl text-center">
          <p className="text-red-500 mb-4">
            {error || "Không tìm thấy bài viết"}
          </p>
          <Button onClick={() => navigate("/community")}>
            Quay lại cộng đồng
          </Button>
        </div>
      </UserLayout>
    );

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen pb-10">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 text-gray-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>

          <Card className="mb-6 overflow-hidden border-gray-200 shadow-sm bg-white">
            <div className="p-5 flex items-start justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <img
                  src={
                    post.authorAvatar ||
                    `https://ui-avatars.com/api/?name=${post.authorName}&background=random`
                  }
                  alt={post.authorName}
                  className="h-10 w-10 rounded-full object-cover border"
                />
                <div>
                  <div className="font-bold text-gray-900 text-base">
                    {post.authorName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(post.createdAt)}
                    </span>
                    {post.category && (
                      <>
                        •{" "}
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 h-5 text-[10px] bg-gray-100 text-gray-600"
                        >
                          {post.category}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-full h-8 w-8"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-500" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => {
                        setReportOpen(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Flag className="h-4 w-4" /> Báo cáo bài viết
                    </button>
                    {/* Nếu là admin hoặc chủ bài viết thì hiện nút xóa */}
                    {(user?.role === "admin" || user?.id === post.authorId) && (
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        onClick={() => alert("Chức năng xóa bài viết")}
                      >
                        <Trash2 className="h-4 w-4" /> Xóa bài viết
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5">
              {post.title && (
                <h1 className="text-2xl font-bold mb-3 text-gray-900">
                  {post.title}
                </h1>
              )}

              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base mb-4">
                {post.content}
              </p>

              {post.images && post.images.length > 0 && (
                <div
                  className={`grid gap-2 ${
                    post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {post.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Content ${idx}`}
                      className="w-full h-auto rounded-lg border border-gray-100 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLikePost}
                  className={
                    post.isLiked
                      ? "text-red-600 bg-red-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                >
                  <Heart
                    className={`mr-2 h-5 w-5 ${
                      post.isLiked ? "fill-current" : ""
                    }`}
                  />
                  {post.likesCount || 0}{" "}
                  <span className="hidden sm:inline ml-1">Thích</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {comments.length}{" "}
                  <span className="hidden sm:inline ml-1">Bình luận</span>
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* --- COMMENTS SECTION --- */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" /> Bình luận
            </h3>

            {/* Input Area */}
            {user && (
              <div className="flex gap-3 mb-6">
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${user.name}&background=random`
                  }
                  alt="My Avatar"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Viết bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] pr-2 resize-y bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      onClick={handleCreateComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="mr-2 h-3 w-3" /> Gửi
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comment List */}
            <div className="space-y-5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <img
                    src={
                      comment.authorAvatar ||
                      `https://ui-avatars.com/api/?name=${comment.authorName}&background=random`
                    }
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover mt-1"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2.5 inline-block max-w-full">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-bold text-sm text-gray-900">
                          {comment.authorName}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-1 ml-2">
                      <button className="text-xs font-semibold text-gray-500 hover:underline">
                        Thích
                      </button>
                      <button className="text-xs font-semibold text-gray-500 hover:underline">
                        Phản hồi
                      </button>
                      {user &&
                        (comment.authorId === user.id ||
                          user.role === "admin") && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs font-semibold text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Xóa
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm italic">
                  Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Báo cáo bài viết</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Hãy cho chúng tôi biết lý do bạn báo cáo bài viết này. Admin sẽ
                xem xét trong vòng 24h.
              </p>
              <Textarea
                placeholder="Nhập lý do (ví dụ: Nội dung spam, ngôn từ thù ghét...)"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={4}
                className="bg-gray-50"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleCreateReport}
                disabled={!reportText.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                <Flag className="mr-2 h-4 w-4" /> Gửi báo cáo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
}
