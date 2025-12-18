import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { AdminLayout, ManagerLayout, UserLayout } from "../../components/Layout";
import {
  ArrowLeft, Heart, MessageCircle, Send, MoreHorizontal, Flag, Trash2, Share2, Clock,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
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
  const [reportText, setReportText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const Layout = user?.role === "admin" ? AdminLayout
      : user?.role === "manager" ? ManagerLayout
          : UserLayout;

  useEffect(() => {
    if (id) loadPostData();
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  const loadPostData = async () => {
    try {
      setLoading(true);

      // Lấy thông tin bài viết
      const postData = await postService.getPostById(id);

      // Chạy song song các tác vụ lấy dữ liệu phụ (User info, Like status, Like count)
      const [userInfo, likeStatus, likeCountRes, commentsRes] = await Promise.all([
        // Lấy thông tin tác giả nếu thiếu
        (!postData.authorName && postData.authorId) ? userService.getUserById(postData.authorId).catch(()=>null) : null,

        // Kiểm tra mình đã like chưa
        user?.id ? likeService.checkUserLike(user.id, "post", id).catch(()=>false) : false,

        // Lấy tổng số like mới nhất
        likeService.getLikeCount("post", id).catch(()=>0),

        // Lấy comment
        postService.getComments(id).catch(()=>[])
      ]);

      // Gộp dữ liệu (Merge Data)
      if (userInfo) {
        postData.authorName = userInfo.full_name;
        postData.authorAvatar = userInfo.avatar || userInfo.avatar_url;
      }


      const realLikeCount = parseInt(likeCountRes) || 0;
      const isLiked = !!likeStatus;

      // Logic "Self-Healing": Nếu mình đã like mà tổng like server trả về = 0 -> Force nó thành 1
      postData.isLiked = isLiked;
      postData.likesCount = (isLiked && realLikeCount === 0) ? 1 : realLikeCount;

      setPost(postData);

      // Xử lý Comment
      const enrichedComments = await Promise.all(commentsRes.map(async (c) => {
        if (!c.authorName && c.authorId) {
          try {
            const u = await userService.getUserById(c.authorId);
            c.authorName = u.full_name;
            c.authorAvatar = u.avatar || u.avatar_url;
          } catch {}
        }
        return c;
      }));
      setComments(enrichedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

    } catch (err) {
      console.error(err);
      setError("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    if (!user) return alert("Vui lòng đăng nhập");

    // Optimistic Update (Cập nhật giao diện ngay lập tức)
    setPost((prev) => {
      const isNowLiked = !prev.isLiked;
      let newCount = prev.likesCount;

      if (isNowLiked) {
        newCount = newCount + 1;
      } else {

        newCount = Math.max(0, newCount - 1);
      }

      return {
        ...prev,
        isLiked: isNowLiked,
        likesCount: newCount,
      };
    });

    // Gọi API
    try {
      await likeService.toggleLike(user.id, "post", id);
    } catch (err) {
      console.error("Lỗi like:", err);
      // Revert lại nếu lỗi (gọi lại hàm loadData để lấy số chuẩn từ server)
      loadPostData();
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !user) return;
    try {
      const commentRes = await postService.createComment(id, { content: newComment });
      const newCommentObj = {
        ...commentRes,
        authorName: user.name || user.full_name,
        authorAvatar: user.avatar,
        createdAt: new Date().toISOString(),
      };
      setComments([newCommentObj, ...comments]);
      setNewComment("");
    } catch (err) { alert(err.message); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Xóa bình luận này?")) return;
    try {
      await postService.deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) { alert("Lỗi xóa bình luận"); }
  };

  const handleDeletePost = async () => {
    if (!confirm("Xóa bài viết này?")) return;
    try {
      await postService.deletePost(id);
      navigate(-1);
    } catch(e) { alert(e.message); }
  }

  const formatTime = (date) => date ? new Date(date).toLocaleString("vi-VN") : "";

  if (loading) return <Layout><div className="flex justify-center py-20"><LoadingSpinner /></div></Layout>;
  if (error || !post) return <Layout><div className="text-center p-10 text-red-500">{error || "Không tìm thấy bài viết"}</div></Layout>;

  return (
      <Layout>
        <div className="bg-gray-50 min-h-screen pb-10">
          <div className="container mx-auto px-4 py-6 max-w-3xl">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:bg-transparent text-gray-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>

            <Card className="mb-6 overflow-hidden border-gray-200 shadow-sm bg-white">
              <div className="p-5 flex items-start justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <img src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}`} alt="ava" className="h-10 w-10 rounded-full border" />
                  <div>
                    <div className="font-bold text-gray-900">{post.authorName}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" /> {formatTime(post.createdAt)}
                      {post.eventTitle && <Badge variant="secondary" className="bg-gray-100 text-gray-600">{post.eventTitle}</Badge>}
                    </div>
                  </div>
                </div>

                <div className="relative" ref={menuRef}>
                  <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)}><MoreHorizontal className="h-5 w-5 text-gray-500" /></Button>
                  {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100 py-1">
                        <button onClick={() => setReportOpen(true)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Flag className="h-4 w-4" /> Báo cáo</button>
                        {(user?.role === "admin" || user?.role === "manager" || user?.id === post.authorId) && (
                            <button onClick={handleDeletePost} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="h-4 w-4" /> Xóa bài viết</button>
                        )}
                      </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                {post.title && <h1 className="text-2xl font-bold mb-3">{post.title}</h1>}
                <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>
                {post.images?.length > 0 && (
                    <div className={`grid gap-2 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {post.images.map((img, idx) => <img key={idx} src={img} className="w-full rounded-lg border object-cover" />)}
                    </div>
                )}
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t flex justify-between">
                <div className="flex gap-3">
                  {/* NÚT LIKE ĐÃ FIX */}
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLikePost}
                      className={post.isLiked ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-gray-600 hover:bg-gray-100"}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
                    {post.likesCount} Thích
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <MessageCircle className="mr-2 h-5 w-5" /> {comments.length} Bình luận
                  </Button>
                </div>
                <Button variant="ghost" size="sm"><Share2 className="h-5 w-5" /></Button>
              </div>
            </Card>

            {/* Comments Section */}
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <h3 className="font-bold mb-4 flex gap-2"><MessageCircle className="h-5 w-5 text-blue-600"/> Bình luận</h3>
              {user && (
                  <div className="flex gap-3 mb-6">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="h-9 w-9 rounded-full" />
                    <div className="flex-1 text-right">
                      <Textarea placeholder="Viết bình luận..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[80px] bg-gray-50" />
                      <Button size="sm" onClick={handleCreateComment} disabled={!newComment.trim()} className="mt-2"><Send className="mr-2 h-3 w-3"/> Gửi</Button>
                    </div>
                  </div>
              )}
              <div className="space-y-5">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.authorName}`} className="h-8 w-8 rounded-full mt-1" />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2.5 inline-block">
                          <div className="flex justify-between gap-4"><span className="font-bold text-sm">{comment.authorName}</span><span className="text-[10px] text-gray-500">{formatTime(comment.createdAt)}</span></div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                        {(user?.role === 'admin' || user?.id === comment.authorId) && (
                            <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-500 ml-2 hover:underline">Xóa</button>
                        )}
                      </div>
                    </div>
                ))}
                {comments.length === 0 && <div className="text-center text-gray-400 italic py-4">Chưa có bình luận nào.</div>}
              </div>
            </div>
          </div>
        </div>
      </Layout>
  );
}