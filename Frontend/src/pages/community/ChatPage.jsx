// demo

import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import { Input } from "../../components/ui/input.jsx";
import { UserLayout } from "../../components/Layout.jsx";
import { MessageSquare, Send, ArrowLeft, Users, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import chatService from "../../services/chatService.js";
import channelService from "../../services/channelService.js";
import eventService from "../../services/eventService.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar.jsx";
import { Badge } from "../../components/ui/badge.jsx";

export default function ChatPage() {
  const { channelId } = useParams();
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (channelId) {
      loadChannelAndMessages(channelId);
    } else if (channels.length > 0) {
      loadChannelAndMessages(channels[0].id);
    }
  }, [channelId, channels]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling for new messages every 3 seconds
  useEffect(() => {
    if (!selectedChannel) return;

    const interval = setInterval(() => {
      loadMessages(selectedChannel.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChannel]);

  const loadChannels = async () => {
    try {
      setLoading(true);
      setError("");

      // Load events and their channels
      const events = await eventService.getEvents();
      const approvedEvents = (events || []).filter(
        (e) => e.status === "approved"
      );

      const channelsData = [];
      for (const event of approvedEvents) {
        try {
          const channel = await channelService
            .getChannelByEventId(event.id)
            .catch(() => null);
          if (channel) {
            channelsData.push({
              ...channel,
              eventId: event.id,
              eventTitle: event.title,
            });
          }
        } catch (err) {
          console.error(`Error loading channel for event ${event.id}:`, err);
        }
      }

      setChannels(channelsData);

      if (channelId) {
        const channel = channelsData.find((c) => c.id === parseInt(channelId));
        if (channel) {
          setSelectedChannel(channel);
        }
      } else if (channelsData.length > 0) {
        setSelectedChannel(channelsData[0]);
      }
    } catch (err) {
      console.error("Error loading channels:", err);
      setError(err.message || "Không thể tải danh sách kênh chat");
    } finally {
      setLoading(false);
    }
  };

  const loadChannelAndMessages = async (id) => {
    try {
      const channel =
        channels.find((c) => c.id === parseInt(id)) ||
        (await channelService.getChannel(id));
      setSelectedChannel(channel);
      await loadMessages(id);
      await chatService.markAsRead(id).catch(() => {});
    } catch (err) {
      console.error("Error loading channel:", err);
      setError(err.message || "Không thể tải kênh chat");
    }
  };

  const loadMessages = async (channelId) => {
    try {
      const messagesData = await chatService.getMessages(channelId);
      setMessages(messagesData || []);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChannel || sending) return;

    try {
      setSending(true);
      await chatService.sendMessage(selectedChannel.id, newMessage.trim());
      setNewMessage("");
      await loadMessages(selectedChannel.id);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Không thể gửi tin nhắn: " + (err.message || "Lỗi không xác định"));
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) return "Vừa xong";
      if (minutes < 60) return `${minutes} phút trước`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const filteredChannels = channels.filter((channel) =>
    (channel.eventTitle || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <UserLayout>
        <div className="container mx-auto p-6">
          <LoadingSpinner />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="bg-muted/30 h-[calc(100vh-4rem)]">
        <div className="container mx-auto h-full flex">
          {/* Sidebar - Channels List */}
          <div className="w-80 border-r bg-background flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Kênh chat</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/community">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kênh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredChannels.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Không có kênh chat nào</p>
                </div>
              ) : (
                filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => loadChannelAndMessages(channel.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                      selectedChannel?.id === channel.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {channel.eventTitle || `Kênh ${channel.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Sự kiện chat
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-background">
            {selectedChannel ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedChannel.eventTitle ||
                          `Kênh ${selectedChannel.id}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Chat về sự kiện
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.author?.id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            isOwnMessage ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.author?.avatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(
                                message.author?.full_name || message.author
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`flex flex-col ${
                              isOwnMessage ? "items-end" : "items-start"
                            } max-w-[70%]`}
                          >
                            <div
                              className={`rounded-lg p-3 ${
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {message.author?.full_name ||
                                  message.author ||
                                  "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Chọn một kênh chat để bắt đầu
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
