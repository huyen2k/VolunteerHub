import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { UserLayout } from "../../components/Layout"; // Đổi Layout
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import postService from "../../services/postService";
import channelService from "../../services/channelService";
import { likeService } from "../../services/likeService";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ComposePostModal from "../../components/modals/ComposePostModal";
import PostItem from "../../components/PostItem";

export default function UserCommunityPage() {
  const { user } = useAuth();

  const [searchParams] = useSearchParams();
  const eventParam = searchParams.get("event");

  // State
  const [feedItems, setFeedItems] = useState([]);
  const [events, setEvents] = useState([]); // Danh sách tất cả sự kiện để filter
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterEventId, setFilterEventId] = useState(eventParam || "all");

  // Set chứa ID các sự kiện User đã tham gia (để lọc "Sự kiện của tôi")
  const [myParticipatedEventIds, setMyParticipatedEventIds] = useState(new Set());

  // Cập nhật filter khi URL thay đổi
  useEffect(() => {
    if (eventParam) {
      setFilterEventId(eventParam);
    } else {
      setFilterEventId("all");
    }
  }, [eventParam]);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Lấy danh sách sự kiện User đã tham gia
      const myEventsData = await eventService.getUserEvents(user.id).catch(() => []);
      const myIds = new Set(myEventsData.map(e => e.id));
      setMyParticipatedEventIds(myIds);

      // 2. Lấy danh sách tất cả sự kiện công khai (để hiển thị trong dropdown filter)
      const publicEventsData = await eventService.getEvents();
      const approvedEvents = (publicEventsData || []).filter(e => e.status === "approved");
      setEvents(approvedEvents.map(e => ({ id: e.id, title: e.title })));

      let allPosts = [];

      // 3. Lấy bài viết từ Global Feed
      try {
        const channels = await channelService.getChannels();
        const global = channels.find(c => c.eventId === "GLOBAL_FEED");
        if (global) {
          const posts = await postService.getPostsByChannel(global.id).catch(()=>[]);
          allPosts.push(...posts.map(p => ({ ...p, eventTitle: "Cộng đồng chung", isGlobal: true })));
        }
      } catch {}

      // 4. Lấy bài viết từ các sự kiện Approved (Public Square)
      const promises = approvedEvents.map(async (event) => {
        try {
          const channel = await channelService.getChannelByEventId(event.id);
          if (channel) {
            const channelPosts = await postService.getPostsByChannel(channel.id);
            return channelPosts.map(p => ({
              ...p,
              eventId: event.id,
              eventTitle: event.title,
              isParticipated: myIds.has(event.id) // Đánh dấu nếu user tham gia event này
            }));
          }
          return [];
        } catch { return []; }
      });

      const results = await Promise.all(promises);
      results.forEach(posts => { if (posts?.length > 0) allPosts.push(...posts); });

      // 5. Enrich Data (User Info + Likes)
      const enriched = await Promise.all(allPosts.map(async (p) => {
        let authorName = p.authorName;
        let authorAvatar = p.authorAvatar;
        let likesCount = p.likes || 0;
        let isLiked = false;

        // Fallback user info
        if (!authorName && p.authorId) {
          try {
            const u = await userService.getUserById(p.authorId);
            authorName = u.full_name;
            authorAvatar = u.avatar_url;
          } catch {}
        }

        // Get Like info
        try { likesCount = await likeService.getLikeCount("post", p.id); } catch {}
        try { isLiked = await likeService.checkUserLike(user.id, "post", p.id); } catch {}

        return { ...p, authorName, authorAvatar, likesCount, isLiked };
      }));

      // Sort mới nhất lên đầu
      setFeedItems(enriched.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));

    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Xóa bài viết này?")) return;
    try {
      await postService.deletePost(postId);
      setFeedItems(prev => prev.filter(p => p.id !== postId));
    } catch (err) { alert(err.message); }
  };

  const handleLikePost = async (postId) => {
    setFeedItems(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 };
      }
      return p;
    }));
    try { await likeService.toggleLike(user.id, "post", postId); } catch (err) { loadData(); }
  };

  // Logic Filter
  const filteredFeed = feedItems.filter((post) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
        post.title?.toLowerCase().includes(term) ||
        post.content?.toLowerCase().includes(term) ||
        post.authorName?.toLowerCase().includes(term) ||
        post.eventTitle?.toLowerCase().includes(term);

    let matchFilter = true;
    if (filterEventId === 'all') matchFilter = true;
    else if (filterEventId === 'global') matchFilter = post.isGlobal;
    else if (filterEventId === 'my_events') matchFilter = post.isParticipated; // Lọc theo sự kiện đã tham gia
    else matchFilter = post.eventId === filterEventId;

    return matchSearch && matchFilter;
  });

  return (
      <UserLayout>
        <div className="bg-gray-50 min-h-screen font-sans pb-10">
          <div className="container mx-auto px-4 py-6 max-w-4xl">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cộng đồng</h1>
                <p className="text-sm text-gray-500">Không gian kết nối và chia sẻ</p>
              </div>
              <Button onClick={() => setComposeOpen(true)} className="bg-primary hover:bg-primary/90 shadow-sm"><Plus className="mr-2 h-4 w-4" /> Đăng bài viết</Button>
            </div>

            {/* FILTER BAR (Giống hệt Manager) */}
            <div className="bg-white p-3 rounded-xl border shadow-sm mb-6 flex flex-col md:flex-row gap-3 sticky top-20 z-10">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Tìm theo nội dung, tác giả, sự kiện..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 border-gray-200" />
              </div>
              <div className="w-full md:w-64">
                <Select value={filterEventId} onValueChange={setFilterEventId}>
                  <SelectTrigger className="border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Filter className="h-4 w-4"/>
                      <span className="truncate">
                            {filterEventId === 'all' ? 'Tất cả bài viết' :
                                filterEventId === 'global' ? 'Cộng đồng chung' :
                                    filterEventId === 'my_events' ? 'Sự kiện đã tham gia' :
                                        events.find(e=>e.id===filterEventId)?.title || filterEventId}
                        </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">Tất cả bài viết</SelectItem>
                    <SelectItem value="global">Cộng đồng chung</SelectItem>
                    <SelectItem value="my_events">Sự kiện đã tham gia</SelectItem>
                    {events.length > 0 && <div className="px-2 py-1.5 text-xs font-semibold text-gray-400">Danh sách sự kiện</div>}
                    {events.map(ev => <SelectItem key={ev.id} value={ev.id}>{ev.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* FEED LIST */}
            {loading ? <div className="flex justify-center py-20"><LoadingSpinner/></div> : (
                <div className="space-y-6">
                  {filteredFeed.map(post => (
                      <PostItem
                          key={post.id}
                          post={post}
                          currentUser={user}
                          onLike={handleLikePost}
                          // User chỉ được xóa bài của chính mình
                          onDelete={(post.authorId === user.id) ? handleDeletePost : undefined}
                      />
                  ))}
                  {filteredFeed.length === 0 && (
                      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">Không tìm thấy bài viết nào phù hợp.</p>
                      </div>
                  )}
                </div>
            )}
          </div>

          {/* COMPOSE MODAL */}
          <ComposePostModal
              open={composeOpen}
              onOpenChange={setComposeOpen}
              onPosted={loadData}
              events={events} // Truyền danh sách sự kiện để User chọn khi đăng bài
              defaultEventId={filterEventId !== 'all' && filterEventId !== 'my_events' && filterEventId !== 'global' ? filterEventId : null}
          />
        </div>
      </UserLayout>
  );
}