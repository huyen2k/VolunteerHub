import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Filter, Plus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import postService from "../../services/postService";
import channelService from "../../services/channelService";
import { likeService } from "../../services/likeService";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ComposePostModal from "../../components/modals/ComposePostModal";
import PostItem from "../../components/PostItem";

export default function AdminCommunityPage() {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEventId, setFilterEventId] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allEvents = await eventService.getEventsForAdmin();
      const approvedEvents = (allEvents || []).filter(e => e.status === 'approved');
      setEvents(approvedEvents.map(e => ({ id: e.id, title: e.title })));

      let allPosts = [];

      // 1. Global Feed
      try {
        const channels = await channelService.getChannels();
        const global = channels.find(c => c.eventId === "GLOBAL_FEED");
        if (global) {
          const posts = await postService.getPostsByChannel(global.id).catch(()=>[]);
          allPosts.push(...posts.map(p => ({ ...p, eventTitle: "Cộng đồng chung", isGlobal: true })));
        }
      } catch {}

      // 2. Event Posts
      const promises = approvedEvents.map(async (event) => {
        try {
          const channel = await channelService.getChannelByEventId(event.id);
          if (channel) {
            const posts = await postService.getPostsByChannel(channel.id);
            return posts.map(p => ({ ...p, eventId: event.id, eventTitle: event.title }));
          }
          return [];
        } catch { return []; }
      });

      const results = await Promise.all(promises);
      results.forEach(p => { if (p?.length) allPosts.push(...p); });

      // 3. Enrich Data
      const enriched = await Promise.all(allPosts.map(async (p) => {
        let authorName = p.authorName;
        let authorAvatar = p.authorAvatar;
        let likesCount = p.likes || 0;
        let isLiked = false;

        if (!authorName && p.authorId) {
          try {
            const u = await userService.getUserById(p.authorId);
            authorName = u.full_name;
            authorAvatar = u.avatar_url;
          } catch {}
        }
        try { likesCount = await likeService.getLikeCount("post", p.id); } catch {}
        try { isLiked = await likeService.checkUserLike(user.id, "post", p.id); } catch {}

        return { ...p, authorName, authorAvatar, likesCount, isLiked };
      }));

      setFeedItems(enriched.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));

    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Admin xóa bài này?")) return;
    try {
      await postService.deletePost(postId);
      setFeedItems(prev => prev.filter(p => p.id !== postId));
    } catch (err) { alert(err.message); }
  };

  const handleLikePost = async (postId) => {
    setFeedItems(prev => prev.map(p => p.id === postId ? {...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1} : p));
    try { await likeService.toggleLike(user.id, "post", postId); } catch { loadData(); }
  };

  // --- FILTER LOGIC (ĐÃ TỐI ƯU TÌM KIẾM ĐA TRƯỜNG GIỐNG MANAGER) ---
  const filteredFeed = feedItems.filter((post) => {
    const term = searchTerm.toLowerCase();

    // Tìm kiếm: Tiêu đề OR Nội dung OR Tên tác giả OR Tên sự kiện
    const matchSearch =
        post.title?.toLowerCase().includes(term) ||
        post.content?.toLowerCase().includes(term) ||
        post.authorName?.toLowerCase().includes(term) ||
        post.eventTitle?.toLowerCase().includes(term);

    let matchFilter = true;
    if (filterEventId === 'all') matchFilter = true;
    else if (filterEventId === 'global') matchFilter = post.isGlobal;
    else matchFilter = post.eventId === filterEventId;

    return matchSearch && matchFilter;
  });

  return (
      <AdminLayout>
        <div className="bg-gray-50 min-h-screen font-sans pb-10">
          <div className="container mx-auto px-4 py-6 max-w-4xl">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản trị Cộng đồng</h1>
                <p className="text-sm text-gray-500">Theo dõi và quản lý toàn bộ thảo luận</p>
              </div>
              <Button onClick={() => setComposeOpen(true)} className="bg-primary hover:bg-primary/90 shadow-sm"><Plus className="mr-2 h-4 w-4" /> Đăng bài viết</Button>
            </div>

            {/* Filter Bar (Giao diện đồng bộ Manager) */}
            <div className="bg-white p-3 rounded-xl border shadow-sm mb-6 flex flex-col md:flex-row gap-3 sticky top-20 z-10">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Tìm theo nội dung, tác giả, sự kiện..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 border-gray-200" />
              </div>
              <div className="w-full md:w-64">
                <Select value={filterEventId} onValueChange={setFilterEventId}>
                  <SelectTrigger className="border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600"><Filter className="h-4 w-4"/> <span className="truncate">{filterEventId === 'all' ? 'Tất cả bài viết' : events.find(e=>e.id===filterEventId)?.title || filterEventId}</span></div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">Tất cả bài viết</SelectItem>
                    <SelectItem value="global">Cộng đồng chung</SelectItem>
                    {events.length > 0 && <div className="px-2 py-1.5 text-xs font-semibold text-gray-400">Danh sách sự kiện</div>}
                    {events.map(ev => <SelectItem key={ev.id} value={ev.id}>{ev.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Feed List */}
            {loading ? <div className="flex justify-center p-10"><LoadingSpinner/></div> : (
                <div className="space-y-6">
                  {filteredFeed.map(post => (
                      <PostItem key={post.id} post={post} currentUser={user} onLike={handleLikePost} onDelete={handleDeletePost} />
                  ))}
                  {filteredFeed.length === 0 && (
                      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">Không tìm thấy bài viết nào phù hợp.</p>
                      </div>
                  )}
                </div>
            )}
          </div>
          <ComposePostModal open={composeOpen} onOpenChange={setComposeOpen} onPosted={loadData} />
        </div>
      </AdminLayout>
  );
}