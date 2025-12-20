import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Image as ImageIcon, MapPin, Smile, Users, Tag, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import channelService from "../../services/channelService";
import postService from "../../services/postService";
import eventService from "../../services/eventService";

export default function ComposePostModal({ open, onOpenChange, defaultType = "exchange", onPosted, events: propEvents = [], onSubmitOptimistic }) {
  const { user } = useAuth();
  const [postType, setPostType] = useState(defaultType);
  const [content, setContent] = useState("");

  const [images, setImages] = useState([]);
  const [rawFiles, setRawFiles] = useState([]);

  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // --- LOGIC LOAD EVENTS ---
  useEffect(() => {
    if (open) {
      if (propEvents && propEvents.length > 0) {
        setEvents(propEvents);
      }
      else if (user?.role === 'ADMIN' || user?.authorities?.some(a => a.authority === 'ROLE_ADMIN')) {
        loadEventsForAdmin();
      }
      // Reset form
      if (!content) {
        setRawFiles([]);
        setImages([]);
        setPostType(defaultType);
      }
    }
  }, [open, propEvents, user]);

  const loadEventsForAdmin = async () => {
    try {
      const res = await eventService.getEventsForAdmin().catch(() => []);
      const data = Array.isArray(res) ? res : (res?.result || []);
      setEvents(data.filter(e => e.status === 'approved'));
    } catch (error) {
      console.error("Modal load events error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    if (onSubmitOptimistic) {
      const isGlobal = postType === 'exchange';
      onSubmitOptimistic({
        content,
        imageFiles: rawFiles,
        eventId: isGlobal ? null : eventId,
        isGlobal,
        postType
      });
      handleClose();
      return;
    }

    setSubmitting(true);
    try {
      // --- KHAI BÁO BIẾN channelId Ở ĐÂY ĐỂ DÙNG CHUNG ---
      let channelId;

      if (postType === "event") {
        if (!eventId) {
          alert("Vui lòng chọn sự kiện!");
          setSubmitting(false);
          return;
        }

        let channel = await channelService.getChannelByEventId(eventId).catch(() => null);
        // Fallback
        if (!channel) {
          const all = await channelService.getChannels().catch(()=>[]);
          channel = (Array.isArray(all) ? all : (all?.result || [])).find(c => c.eventId === eventId);
        }

        if (channel) {
          channelId = channel.id;
        } else {
          alert("Sự kiện này chưa có kênh thảo luận.");
          setSubmitting(false);
          return;
        }

      } else {
        // --- LOGIC TÌM KÊNH GLOBAL ĐÃ FIX ---
        // 1. Gọi API tìm chính xác ID (nhanh hơn)
        let globalChannel = await channelService.getChannelByEventId("GLOBAL_FEED").catch(() => null);

        // 2. Fallback: Nếu API trên lỗi (404), tìm thủ công trong list
        if (!globalChannel) {
          const allChannels = await channelService.getChannels().catch(()=>[]);
          globalChannel = (Array.isArray(allChannels) ? allChannels : (allChannels?.result || [])).find(c => c.eventId === "GLOBAL_FEED");
        }

        if (!globalChannel) {
          alert("Hệ thống chưa có kênh Cộng đồng chung (GLOBAL_FEED). Hãy báo Backend chạy script tạo dữ liệu.");
          setSubmitting(false);
          return;
        }

        channelId = globalChannel.id;
      }

      // --- GỬI API ---
      // Lúc này biến channelId chắc chắn đã có giá trị
      await postService.createPost({ content, images, channelId });

      alert("Đăng bài thành công!");
      handleClose();
      if (onPosted) setTimeout(() => onPosted(), 500);

    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setContent(""); setImages([]); setRawFiles([]); }, 300);
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setRawFiles(prev => [...prev, ...files]);
    const readers = files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));
    const newImages = await Promise.all(readers);
    setImages(prev => [...prev, ...newImages]);
  };

  return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg p-0 bg-white">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle>Tạo bài viết</DialogTitle>
            <DialogDescription className="sr-only">New Post</DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar || user?.avatarUrl} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">{user?.name || user?.fullName || "Bạn"}</div>
                <div className="flex gap-2 mt-1">
                  <select className="text-xs border rounded px-1 py-0.5 bg-gray-50" value={postType} onChange={e => setPostType(e.target.value)}>
                    <option value="exchange">Cộng đồng chung</option>
                    <option value="event">Thảo luận Sự kiện</option>
                  </select>
                  {postType === 'event' && (
                      <select className="text-xs border rounded px-1 py-0.5 bg-blue-50 text-blue-700 font-medium max-w-[150px] truncate" value={eventId} onChange={e => setEventId(e.target.value)}>
                        <option value="">-- Chọn sự kiện --</option>
                        {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                      </select>
                  )}
                </div>
              </div>
            </div>
            <Textarea placeholder="Bạn đang nghĩ gì?" className="min-h-[100px] border-none focus-visible:ring-0 text-base resize-none p-0" value={content} onChange={e => setContent(e.target.value)} />

            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((src, i) => (
                      <div key={i} className="relative aspect-square group">
                        <img src={src} className="w-full h-full object-cover rounded-md border" alt="preview" />
                        <button onClick={() => {
                          setImages(prev => prev.filter((_, idx) => idx !== i));
                          setRawFiles(prev => prev.filter((_, idx) => idx !== i));
                        }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                      </div>
                  ))}
                </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex gap-1 text-gray-500">
                <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"><ImageIcon className="w-5 h-5 text-green-600" /><input type="file" multiple accept="image/*" className="hidden" onChange={handleFilesSelected} /></label>
                <button className="p-2 hover:bg-gray-100 rounded-full"><Users className="w-5 h-5 text-blue-500" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full"><Smile className="w-5 h-5 text-yellow-500" /></button>
              </div>
              <Button onClick={handleSubmit} disabled={submitting || !content.trim()}>{submitting ? "Đang đăng..." : "Đăng bài"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}