import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Image as ImageIcon, MapPin, Smile, Users, Tag } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import channelService from "../../services/channelService";
import postService from "../../services/postService";
import eventService from "../../services/eventService";


export default function ComposePostModal({ open, onOpenChange, defaultType = "exchange", onPosted, events: propEvents = [] }) {
  const { user } = useAuth();
  const [postType, setPostType] = useState(defaultType);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [eventId, setEventId] = useState("");

  const [internalEvents, setInternalEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);


  const eventList = propEvents.length > 0 ? propEvents : internalEvents;

  useEffect(() => {
    if (open && propEvents.length === 0 && user?.role !== 'volunteer') {
      loadEvents();
    }
  }, [open, user, propEvents]);

  const loadEvents = async () => {
    try {
      let eventsData = [];
      if (user.role === 'manager') {

        eventsData = await eventService.getMyEvents().catch(() => []);
      } else {
        eventsData = await eventService.getEvents().catch(() => []);
      }

      const approved = (eventsData || []).filter(e => e.status === "approved");
      setInternalEvents(approved.map(e => ({ id: e.id, title: e.title })));
    } catch (e) {
      console.error("Lỗi load events trong modal:", e);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);

    try {
      let channelId;

      if (postType === "event") {
        if (!eventId) {
          alert("Vui lòng chọn sự kiện!");
          setSubmitting(false);
          return;
        }

        // 1. Tìm kênh
        let channel = await channelService.getChannelByEventId(eventId).catch(() => null);

        // 2. Nếu chưa có -> Tạo mới
        if (!channel) {
          try {
            const selectedEvent = eventList.find(e => e.id === eventId);
            const channelName = selectedEvent ? `Thảo luận: ${selectedEvent.title}` : "Kênh sự kiện";

            channel = await channelService.createChannel({
              eventId: eventId,
              name: channelName
            });

          } catch (createErr) {
            console.error("Lỗi tạo kênh:", createErr);
            if (createErr?.response?.status === 403) {
              alert("Bạn không có quyền tạo kênh cho sự kiện này.");
              setSubmitting(false);
              return;
            }
            // Nếu lỗi khác, thử tiếp tục (có thể BE đã tạo rồi nhưng FE không nhận được)
          }
        }

        if (channel) channelId = channel.id;
        else throw new Error("Không tìm thấy kênh thảo luận.");

      } else {
        // Xử lý Global Feed
        const channels = await channelService.getChannels().catch(()=>[]);
        let globalChannel = channels.find(c => !c.eventId || c.eventId === "GLOBAL_FEED");

        if (!globalChannel) {
          try {
            globalChannel = await channelService.createChannel({ eventId: "GLOBAL_FEED", name: "Cộng đồng chung" });
          } catch (err) {
            alert("Không tìm thấy kênh cộng đồng chung.");
            setSubmitting(false);
            return;
          }
        }
        channelId = globalChannel.id;
      }

      // 3. Tạo bài viết
      if (channelId) {
        await postService.createPost({ content, images, channelId });
        setContent("");
        setImages([]);
        onOpenChange(false);
        if (onPosted) onPosted();
        alert("Đăng bài thành công!");
      }

    } catch (err) {
      console.error("Đăng bài thất bại:", err);
      alert("Đăng bài thất bại: " + (err.message || "Lỗi không xác định"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const readers = files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));
    const dataUrls = await Promise.all(readers);
    setImages(prev => [...prev, ...dataUrls]);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle>Tạo bài viết</DialogTitle>
            <DialogDescription className="hidden" />
          </DialogHeader>
          <div className="px-4 py-3 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar || "/avatars/default.jpg"} alt="avatar" />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{user?.name || user?.email || "Người dùng"}</div>
                <div className="text-xs text-muted-foreground">
                  <select className="bg-transparent" defaultValue="public">
                    <option value="public">Công khai</option>
                    <option value="friends">Bạn bè</option>
                    <option value="only_me">Chỉ mình tôi</option>
                  </select>
                </div>
              </div>
            </div>

            <Textarea
                placeholder={`${user?.name?.split(" ").slice(-1)} ơi, bạn đang nghĩ gì thế?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Loại bài</label>
                <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
                >
                  <option value="exchange">Bài trao đổi</option>
                  <option value="event">Bài sự kiện</option>
                </select>
              </div>
              {postType === "event" && (
                  <div>
                    <label className="text-sm font-medium">Sự kiện</label>
                    <select
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
                    >
                      <option value="">Chọn sự kiện</option>
                      {eventList.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                      ))}
                    </select>
                  </div>
              )}
            </div>

            <div className="flex items-center justify-between border rounded-md px-3 py-2">
              <div className="flex items-center gap-3 text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
                <Users className="h-5 w-5" />
                <Smile className="h-5 w-5" />
                <MapPin className="h-5 w-5" />
                <Tag className="h-5 w-5" />
              </div>
              <div className="text-xs text-muted-foreground">Thêm vào bài viết của bạn</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ảnh đính kèm</label>
              <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesSelected}
              />
              {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {images.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img src={src} alt="preview" className="w-full h-24 object-cover rounded" />
                          <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100"
                          >
                            Xóa
                          </button>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
          <div className="px-4 py-3 border-t">
            <Button className="w-full" onClick={handleSubmit} disabled={submitting || !content.trim()}>
              Đăng bài
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}