import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ManagerLayout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import postService from "../../services/postService";
import { likeService } from "../../services/likeService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ComposePostModal from "../../components/modals/ComposePostModal";
import PostItem from "../../components/PostItem";

export default function ManagerCommunityPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const eventParam = searchParams.get("event");

  // --- STATE ---
  const [allPosts, setAllPosts] = useState([]);
  const [events, setEvents] = useState([]); // List event cho Dropdown
  const [myEventIds, setMyEventIds] = useState(new Set());
  const [eventMap, setEventMap] = useState({}); // Map ID -> Title

  // --- PAGINATION ---
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  // --- FILTER ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterEventId, setFilterEventId] = useState(eventParam || "all");
  const [composeOpen, setComposeOpen] = useState(false);

  // 1. Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Sync URL
  useEffect(() => {
    if (eventParam) setFilterEventId(eventParam);
  }, [eventParam]);

  // 3. LOAD METADATA (SỬA ĐỔI QUAN TRỌNG)
  useEffect(() => {
    const loadMetadata = async () => {
      if (!user?.id) return;
      try {
        // Tải danh sách sự kiện của tôi VÀ sự kiện công khai (Lấy nhiều để map đủ tên)
        const [myEventsRes, publicEventsRes] = await Promise.all([
          eventService.getMyEvents().catch(() => []),
          eventService.getEvents(0, 100).catch(() => []) // Thử lấy 100 event
        ]);

        // -- Xử lý My Events --
        const myEventsData = Array.isArray(myEventsRes) ? myEventsRes : (myEventsRes?.result || []);
        const myIds = new Set(myEventsData.map(e => e.id));
        setMyEventIds(myIds);

        // -- Xử lý Public Events --
        const publicEventsData = Array.isArray(publicEventsRes) ? publicEventsRes : (publicEventsRes?.result?.content || publicEventsRes?.result || []);

        // -- TẠO MAP (Gộp cả 2 nguồn để đảm bảo có tên cho Test 20) --
        const combinedEvents = [...myEventsData, ...publicEventsData];
        const map = {};
        const uniqueEvents = [];
        const seenIds = new Set();

        combinedEvents.forEach(ev => {
          if (ev.id && !seenIds.has(ev.id)) {
            map[ev.id] = ev.title; // Map ID -> Title
            seenIds.add(ev.id);
            uniqueEvents.push({ id: ev.id, title: ev.title }); // List cho Dropdown
          }
        });

        setEventMap(map);
        setEvents(uniqueEvents); // Dropdown bây giờ sẽ có cả "Test 20"

      } catch (err) {
        console.error("Lỗi tải metadata:", err);
      }
    };
    loadMetadata();
  }, [user]);

  // 4. RESET FETCH
  useEffect(() => {
    setPage(0);
    setAllPosts([]);
    setHasMore(true);
    fetchPosts(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterEventId, user]);

  // 5. FETCH POSTS
  const fetchPosts = async (pageIndex, isReset = false) => {
    if (!user?.id) return;
    if (isReset) setLoadingInitial(true);
    else setLoadingMore(true);

    try {
      // Logic xác định ID gửi xuống API
      const apiEventId = filterEventId === 'my_events' ? 'all' : filterEventId;

      const res = await postService.searchPosts(pageIndex, PAGE_SIZE, debouncedSearch, apiEventId);

      let newPosts = [];
      if (res?.result?.content) newPosts = res.result.content;
      else if (res?.content) newPosts = res.content;
      else if (Array.isArray(res)) newPosts = res;

      // Map thêm thông tin quản lý
      const enrichedPosts = newPosts.map(p => ({
        ...p,
        isManagedByMe: p.eventId ? myEventIds.has(p.eventId) : false
      }));

      // --- LOGIC FILTER CLIENT-SIDE ---
      let finalPosts = enrichedPosts;

      if (filterEventId === 'my_events') {
        // Trường hợp 1: Lọc bài viết thuộc sự kiện của tôi
        finalPosts = enrichedPosts.filter(p => p.isManagedByMe);
      }
      else if (filterEventId !== 'all' && filterEventId !== 'global') {
        // Trường hợp 2: Lọc bài viết theo ID sự kiện cụ thể (Đây là phần bạn bị thiếu)
        // Nếu filterEventId là "123" (ID sự kiện), chỉ giữ lại bài có eventId == "123"
        finalPosts = enrichedPosts.filter(p => p.eventId === filterEventId);
      }

      if (newPosts.length < PAGE_SIZE) setHasMore(false);

      if (isReset) setAllPosts(finalPosts);
      else setAllPosts(prev => [...prev, ...finalPosts]);

    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, false);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Xóa bài viết này?")) return;
    try {
      await postService.deletePost(postId);
      setAllPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) { alert("Lỗi xóa: " + err.message); }
  };

  const handleLikePost = async (postId) => {
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 } : p));
    try { await likeService.toggleLike(user.id, "post", postId); } catch (e) {}
  };

  return (
      <ManagerLayout>
        <div className="bg-gray-50/50 min-h-screen font-sans pb-10">
          <div className="container mx-auto px-4 py-8 max-w-3xl">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cộng đồng</h1>
                <p className="text-gray-500 mt-1">Kênh thảo luận và thông báo sự kiện</p>
              </div>
              <Button onClick={() => setComposeOpen(true)} className="bg-primary hover:bg-primary/90 shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Đăng bài viết
              </Button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 sticky top-4 z-20">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                      placeholder="Tìm kiếm nội dung..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 bg-gray-50 border-gray-200"
                  />
                  {/* Ghi chú nhỏ để user hiểu tại sao không tìm được tên sự kiện bằng text */}
                </div>
                <div className="w-full md:w-64">
                  <Select value={filterEventId} onValueChange={setFilterEventId}>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <div className="flex items-center gap-2 text-gray-700 overflow-hidden">
                        <Filter className="h-4 w-4 shrink-0"/>
                        <span className="truncate">
                            {filterEventId === 'all' ? 'Tất cả chủ đề' :
                                filterEventId === 'global' ? 'Cộng đồng chung' :
                                    filterEventId === 'my_events' ? 'Sự kiện của tôi' :
                                        eventMap[filterEventId] || "Đang tải..."} {/* Hiển thị tên từ Map */}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">Tất cả chủ đề</SelectItem>
                      <SelectItem value="global">Cộng đồng chung</SelectItem>
                      <SelectItem value="my_events">Sự kiện của tôi</SelectItem>

                      {events.length > 0 && <div className="px-2 py-2 text-xs font-bold text-gray-400 uppercase bg-gray-50">Danh sách sự kiện</div>}
                      {/* Dropdown giờ đã có Test 20 */}
                      {events.map(ev => (
                          <SelectItem key={ev.id} value={ev.id}>{ev.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Feed List */}
            {loadingInitial ? (
                <div className="flex justify-center p-20"><LoadingSpinner/></div>
            ) : (
                <div className="space-y-6">
                  {allPosts.map(post => {
                    // --- LOGIC HIỂN THỊ TÊN  ---
                    let displayTitle;

                    if (!post.eventId || post.eventId === "global") {
                      displayTitle = "Cộng đồng chung"; // 1. Không có ID -> Cộng đồng chung
                    } else if (eventMap[post.eventId]) {
                      displayTitle = eventMap[post.eventId]; // 2. Có trong Map -> Hiển thị tên (VD: Test 20)
                    } else {
                      // 3. Có ID nhưng chưa load được tên -> Placeholder hoặc Cộng đồng chung (tùy bạn chọn)
                      // Mình để fallback về Cộng đồng chung để tránh hiện "..." xấu
                      displayTitle = "Cộng đồng chung";
                    }

                    const postWithTitle = { ...post, eventTitle: displayTitle };
                    const canDelete = (post.authorId === user.id) || post.isManagedByMe;

                    return (
                        <PostItem
                            key={post.id}
                            post={postWithTitle}
                            currentUser={user}
                            onLike={handleLikePost}
                            onDelete={canDelete ? handleDeletePost : undefined}
                        />
                    );
                  })}

                  {/* Empty State */}
                  {allPosts.length === 0 && (
                      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400">Không tìm thấy bài viết nào.</p>
                      </div>
                  )}

                  {/* Load More */}
                  {allPosts.length > 0 && hasMore && (
                      <div className="flex justify-center pt-4">
                        <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                          {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Đang tải...</> : "Xem thêm bài viết cũ hơn"}
                        </Button>
                      </div>
                  )}
                </div>
            )}
          </div>
          <ComposePostModal open={composeOpen} onOpenChange={setComposeOpen} onPosted={() => { setPage(0); fetchPosts(0, true); }} events={events}/>
        </div>
      </ManagerLayout>
  );
}