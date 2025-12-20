import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { UserLayout } from "../../components/Layout";
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

export default function UserCommunityPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const eventParam = searchParams.get("event");

  // --- STATE ---
  const [allPosts, setAllPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());
  const [eventMap, setEventMap] = useState({});

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

  // 1. Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Sync URL
  useEffect(() => {
    if (eventParam) setFilterEventId(eventParam);
  }, [eventParam]);

  // 3. LOAD METADATA
  useEffect(() => {
    const loadMetadata = async () => {
      if (!user?.id) return;

      try {
        const [joinedRes, publicEventsRes] = await Promise.all([
          eventService.getUserEvents(user.id).catch(() => []),
          eventService.getEvents(0, 100).catch(() => [])
        ]);

        const joinedRegs = Array.isArray(joinedRes)
            ? joinedRes
            : joinedRes?.result || [];

        const joinedIds = new Set(joinedRegs.map(r => String(r.eventId)));
        setJoinedEventIds(joinedIds);

        const eventsFromRegs = joinedRegs.map(r => r.event).filter(Boolean);
        const publicEventsData = Array.isArray(publicEventsRes)
            ? publicEventsRes
            : publicEventsRes?.result?.content || publicEventsRes?.result || [];

        const combinedEvents = [...eventsFromRegs, ...publicEventsData];

        const map = {};
        const uniqueEvents = [];
        const seenIds = new Set();

        combinedEvents.forEach(ev => {
          if (ev?.id && !seenIds.has(ev.id)) {
            seenIds.add(ev.id);
            map[ev.id] = ev.title;
            uniqueEvents.push({ id: ev.id, title: ev.title });
          }
        });

        setEventMap(map);
        setEvents(uniqueEvents);

      } catch (err) {
        console.error("Lỗi tải metadata:", err);
      }
    };

    loadMetadata();
  }, [user]);

  // 4. FETCH POSTS (MEMOIZED)
  const fetchPosts = useCallback(
      async (pageIndex, isReset = false) => {
        if (!user?.id) return;

        if (filterEventId === "joined_events" && joinedEventIds.size === 0) {
          setLoadingInitial(false);
          return;
        }

        isReset ? setLoadingInitial(true) : setLoadingMore(true);

        try {
          const apiEventId =
              filterEventId === "joined_events" ? "all" : filterEventId;

          const res = await postService.searchPosts(
              pageIndex,
              PAGE_SIZE,
              debouncedSearch,
              apiEventId
          );

          let newPosts = [];
          if (res?.result?.content) newPosts = res.result.content;
          else if (res?.content) newPosts = res.content;
          else if (Array.isArray(res)) newPosts = res;

          let finalPosts = newPosts;

          if (filterEventId === "joined_events") {
            finalPosts = newPosts.filter(p =>
                joinedEventIds.has(String(p.eventId))
            );
          } else if (filterEventId !== "all" && filterEventId !== "global") {
            finalPosts = newPosts.filter(
                p => String(p.eventId) === String(filterEventId)
            );
          }

          if (newPosts.length < PAGE_SIZE) setHasMore(false);

          setAllPosts(prev =>
              isReset ? finalPosts : [...prev, ...finalPosts]
          );

        } catch (err) {
          console.error("Lỗi tải bài viết:", err);
        } finally {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      },
      [user?.id, debouncedSearch, filterEventId, joinedEventIds]
  );

  // 5. RESET FETCH
  useEffect(() => {
    setPage(0);
    setAllPosts([]);
    setHasMore(true);
    fetchPosts(0, true);
  }, [debouncedSearch, filterEventId, user, fetchPosts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Xóa bài viết này?")) return;
    try {
      await postService.deletePost(postId);
      setAllPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert("Lỗi xóa: " + err.message);
    }
  };

  const handleLikePost = async (postId) => {
    setAllPosts(prev =>
        prev.map(p =>
            p.id === postId
                ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likesCount: p.isLiked
                      ? p.likesCount - 1
                      : p.likesCount + 1
                }
                : p
        )
    );

    try {
      await likeService.toggleLike(user.id, "post", postId);
    } catch {
      // rollback
      setAllPosts(prev =>
          prev.map(p =>
              p.id === postId
                  ? {
                    ...p,
                    isLiked: !p.isLiked,
                    likesCount: p.isLiked
                        ? p.likesCount - 1
                        : p.likesCount + 1
                  }
                  : p
          )
      );
    }
  };


  return (
      <UserLayout>
        <div className="bg-gray-50/50 min-h-screen font-sans pb-10">
          <div className="container mx-auto px-4 py-8 max-w-3xl">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cộng đồng</h1>
                <p className="text-gray-500 mt-1">Kênh thảo luận và sự kiện đã tham gia</p>
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
                </div>
                <div className="w-full md:w-64">
                  <Select value={filterEventId} onValueChange={setFilterEventId}>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <div className="flex items-center gap-2 text-gray-700 overflow-hidden">
                        <Filter className="h-4 w-4 shrink-0"/>
                        <span className="truncate">
                            {filterEventId === 'all' ? 'Tất cả chủ đề' :
                                filterEventId === 'global' ? 'Cộng đồng chung' :
                                    filterEventId === 'joined_events' ? 'Sự kiện của tôi' :
                                        eventMap[filterEventId] || "Đang tải..."}
                        </span>
                      </div>
                    </SelectTrigger>

                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">Tất cả chủ đề</SelectItem>
                      <SelectItem value="global">Cộng đồng chung</SelectItem>
                      <SelectItem value="joined_events">Sự kiện của tôi</SelectItem>

                      {events.length > 0 && <div className="px-2 py-2 text-xs font-bold text-gray-400 uppercase bg-gray-50">Danh sách sự kiện</div>}

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
                    // Logic hiển thị tên Badge
                    let displayTitle;
                    if (!post.eventId || post.eventId === "global") {
                      displayTitle = "Cộng đồng chung";
                    }
                    else if (eventMap[post.eventId]) {
                      displayTitle = eventMap[post.eventId];
                    }
                    else if (post.eventName || post.eventTitle || post.event?.title) {
                      displayTitle = post.eventName || post.eventTitle || post.event?.title;
                    }
                    else {
                      displayTitle = "Cộng đồng chung";
                    }

                    const postWithTitle = { ...post, eventTitle: displayTitle };
                    const canDelete = post.authorId === user.id;

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

                  {allPosts.length === 0 && (
                      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400">Không tìm thấy bài viết nào.</p>
                      </div>
                  )}

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
      </UserLayout>
  );
}