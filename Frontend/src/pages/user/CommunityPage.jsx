import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { UserLayout } from "../../components/Layout";
import {
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Bookmark,
  Eye,
  Search,
  Filter,
  Plus,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import postService from "../../services/postService";
import channelService from "../../services/channelService";
import userService from "../../services/userService";
import { likeService } from "../../services/likeService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ComposePostModal from "../../components/modals/ComposePostModal";

export default function CommunityPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const eventIdParam = searchParams.get("event");

  // --- State ---
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Categories
  const categories = [
    "All",
    "Hỏi đáp",
    "Chia sẻ kinh nghiệm",
    "Tin tức",
    "Tuyển thành viên",
  ];

  useEffect(() => {
    loadData();
  }, [eventIdParam]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Lấy Channels
      const channels = await channelService.getChannels().catch(() => []);
      let allPosts = [];

      // 2. Lấy Posts từ các channel
      for (const ch of channels) {
        const posts = await postService
          .getPostsByChannel(ch.id)
          .catch(() => []);
        allPosts = [...allPosts, ...posts];
      }

      // 3. Enrich data: likesCount + isLiked + authorName fallback
      allPosts = await Promise.all(
        (allPosts || []).map(async (p) => {
          try { if (p.likesCount === undefined) { p.likesCount = await likeService.getLikeCount("post", p.id); } } catch {}
          if (user?.id) { try { p.isLiked = await likeService.checkUserLike(user.id, "post", p.id); } catch {} }
          if (!p.authorName && p.authorId) {
            try {
              const u = await userService.getUserById(p.authorId);
              p.authorName = u.full_name;
              p.authorAvatar = u.avatar_url || u.avatar;
            } catch {}
          }
          return p;
        })
      );

      // 4. Sắp xếp mới nhất
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFeedItems(allPosts);
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Filter Logic ---
  const filteredFeed = feedItems.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // --- Handlers ---
  const handleLike = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return alert("Vui lòng đăng nhập");

    // Optimistic Update
    setFeedItems((prev) =>
      prev.map((item) => {
        if (item.id === postId) {
          return {
            ...item,
            isLiked: !item.isLiked,
            likesCount: item.isLiked
              ? item.likesCount - 1
              : item.likesCount + 1,
          };
        }
        return item;
      })
    );

    try {
      await likeService.toggleLike(user.id, "post", postId);
    } catch (err) {
      console.error("Like error:", err);
      loadData(); // Re-sync nếu lỗi
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-md hover:bg-blue-100 cursor-pointer font-medium"
          >
            #{tag.replace(/^#/, "")}
          </span>
        ))}
      </div>
    );
  };

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen font-sans">
        <div className="container mx-auto px-4 py-6">
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 max-w-5xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cộng đồng</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Không gian trao đổi, chia sẻ kinh nghiệm tình nguyện
              </p>
            </div>
            <Button
              onClick={() => setComposeOpen(true)}
              className="shadow-sm bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Viết bài mới
            </Button>
          </div>

          <div className="flex justify-center gap-6 max-w-6xl mx-auto">
            {/* --- LEFT SIDEBAR (Sticky Filter) --- */}
            <div className="hidden lg:block w-60 sticky top-24 h-fit space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-gray-200 focus:border-blue-500 text-sm h-10"
                />
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <Filter className="w-4 h-4 text-blue-500" /> Chủ đề
                </h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- CENTER FEED --- */}
            <div className="w-full max-w-2xl">
              {loading ? (
                <div className="flex justify-center py-16">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredFeed.map((post) => (
                    <Card
                      key={post.id}
                      className="group border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden bg-white"
                    >
                      {/* 1. Header (Author Info) */}
                      <div className="p-4 flex items-start justify-between border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <Link to={`/community/posts/${post.id}`}>
                            <img
                              src={
                                post.authorAvatar ||
                                `https://ui-avatars.com/api/?name=${post.authorName}&background=random`
                              }
                              alt={post.authorName}
                              className="h-10 w-10 rounded-full object-cover border border-gray-200 hover:opacity-90 transition-opacity"
                            />
                          </Link>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                to={`/community/posts/${post.id}`}
                                className="font-bold text-sm text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {post.authorName}
                              </Link>
                              {post.category && (
                                <Badge
                                  variant="secondary"
                                  className="font-normal text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
                                >
                                  {post.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {formatTime(post.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-gray-600 rounded-full h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 2. Clickable Content Area */}
                      <Link
                        to={`/community/posts/${post.id}`}
                        className="block"
                      >
                        <div className="px-4 py-3">
                          {/* Title */}
                          {post.title && (
                            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                              {post.title}
                            </h3>
                          )}

                          {/* Content (Description) - Trước hình ảnh */}
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-3 mb-2">
                            {post.content}
                          </p>

                          {/* Tags */}
                          {renderTags(post.tags)}
                        </div>

                        {/* Images Grid - Sau nội dung */}
                        {post.images && post.images.length > 0 && (
                          <div
                            className={`w-full ${
                              post.images.length > 1
                                ? "grid grid-cols-2 gap-0.5"
                                : ""
                            }`}
                          >
                            {post.images.slice(0, 4).map((img, idx) => (
                              <div
                                key={idx}
                                className={`relative bg-gray-100 overflow-hidden ${
                                  post.images.length === 1
                                    ? "aspect-video"
                                    : post.images.length === 3 && idx === 0
                                    ? "row-span-2 h-full"
                                    : "aspect-[4/3]"
                                }`}
                              >
                                <img
                                  src={img}
                                  alt="post content"
                                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />

                                {/* Hiển thị số ảnh còn lại nếu > 4 */}
                                {post.images.length > 4 && idx === 3 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                                    +{post.images.length - 4}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Link>

                      {/* 3. Footer Actions */}
                      <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {/* Like Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleLike(e, post.id)}
                              className={`flex items-center gap-1.5 px-3 h-9 transition-colors ${
                                post.isLiked
                                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-red-500"
                              }`}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  post.isLiked ? "fill-current" : ""
                                }`}
                              />
                              <span className="font-medium text-sm">
                                {post.likesCount || 0}
                              </span>
                            </Button>

                            {/* Comment Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="flex items-center gap-1.5 px-3 h-9 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Link to={`/community/posts/${post.id}`}>
                                <MessageCircle className="w-4 h-4" />
                                <span className="font-medium text-sm">
                                  {post.commentsCount || 0}
                                </span>
                              </Link>
                            </Button>

                            {/* Views */}
                            {post.views > 0 && (
                              <div className="hidden sm:flex items-center gap-1.5 px-3 text-gray-400 text-xs select-none">
                                <Eye className="w-3.5 h-3.5" /> {post.views}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-blue-600 h-9 w-9"
                            >
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-green-600 h-9 w-9"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty States */}
              {!loading && filteredFeed.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">
                    Chưa có bài viết nào phù hợp.
                  </p>
                  <Button
                    onClick={() => setComposeOpen(true)}
                    variant="link"
                    className="mt-1 h-auto p-0 text-sm"
                  >
                    Tạo bài viết đầu tiên
                  </Button>
                </div>
              )}

              {!loading && filteredFeed.length > 0 && (
                <div className="text-center py-10">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                    Bạn đã xem hết nội dung 🎉
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compose Modal */}
        <ComposePostModal
          open={composeOpen}
          onOpenChange={setComposeOpen}
          onPosted={loadData}
        />
      </div>
    </UserLayout>
  );
}
