import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { UserLayout } from "../../components/Layout";
import {
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Search,
  Filter,
  Pin,
  Edit,
  Trash2,
  Calendar,
  Users,
  Eye,
} from "lucide-react";

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    eventId: "",
  });

  const events = [
    { id: 1, title: "Dọn dẹp bãi biển Vũng Tàu", status: "approved" },
    { id: 2, title: "Trồng cây xanh tại công viên", status: "approved" },
    { id: 3, title: "Dạy học cho trẻ em nghèo", status: "approved" },
    {
      id: 4,
      title: "Phân phát thức ăn cho người vô gia cư",
      status: "pending",
    },
  ];

  const posts = [
    {
      id: 1,
      title: "Chia sẻ kinh nghiệm từ sự kiện dọn dẹp bãi biển",
      content:
        "Hôm qua tôi đã tham gia sự kiện dọn dẹp bãi biển Vũng Tàu. Đây là một trải nghiệm rất ý nghĩa! Tôi đã học được nhiều điều về bảo vệ môi trường và gặp gỡ những người bạn mới cùng chí hướng.",
      author: "Nguyễn Thị Lan",
      authorRole: "Tình nguyện viên",
      eventId: 1,
      eventTitle: "Dọn dẹp bãi biển Vũng Tàu",
      createdAt: "2 giờ trước",
      likes: 24,
      comments: 8,
      isPinned: false,
      attachments: ["beach-cleanup.jpg"],
      isLiked: true,
    },
    {
      id: 2,
      title: "Cảm nhận sau chương trình trồng cây",
      content:
        "Sự kiện trồng cây tại công viên Thống Nhất rất thành công! Chúng tôi đã trồng được hơn 100 cây xanh. Cảm ơn ban tổ chức và tất cả các tình nguyện viên đã tham gia.",
      author: "Trần Văn Minh",
      authorRole: "Tình nguyện viên",
      eventId: 2,
      eventTitle: "Trồng cây xanh tại công viên",
      createdAt: "5 giờ trước",
      likes: 18,
      comments: 5,
      isPinned: false,
      attachments: [],
      isLiked: false,
    },
    {
      id: 3,
      title: "Thông báo về sự kiện dạy học sắp tới",
      content:
        "Sự kiện dạy học cho trẻ em nghèo sẽ diễn ra vào ngày 25/02. Chúng tôi cần thêm tình nguyện viên có kinh nghiệm giảng dạy. Hãy đăng ký tham gia nhé!",
      author: "Manager One",
      authorRole: "Quản lý sự kiện",
      eventId: 3,
      eventTitle: "Dạy học cho trẻ em nghèo",
      createdAt: "1 ngày trước",
      likes: 15,
      comments: 12,
      isPinned: true,
      attachments: ["schedule.pdf"],
      isLiked: true,
    },
    {
      id: 4,
      title: "Chia sẻ kinh nghiệm tình nguyện",
      content:
        "Sau khi tham gia nhiều hoạt động tình nguyện, tôi nhận ra rằng việc giúp đỡ người khác không chỉ mang lại niềm vui mà còn giúp bản thân trưởng thành hơn. Hãy cùng nhau lan tỏa tình yêu thương!",
      author: "Phạm Thị Hoa",
      authorRole: "Tình nguyện viên",
      eventId: 1,
      eventTitle: "Dọn dẹp bãi biển Vũng Tàu",
      createdAt: "2 ngày trước",
      likes: 32,
      comments: 18,
      isPinned: false,
      attachments: [],
      isLiked: false,
    },
  ];

  const comments = [
    {
      id: 1,
      postId: 1,
      author: "Lê Văn Tuấn",
      content: "Cảm ơn bạn đã chia sẻ! Tôi cũng muốn tham gia sự kiện này.",
      createdAt: "1 giờ trước",
      likes: 3,
    },
    {
      id: 2,
      postId: 1,
      author: "Nguyễn Thị Mai",
      content: "Sự kiện rất ý nghĩa, hy vọng sẽ có nhiều hoạt động tương tự.",
      createdAt: "2 giờ trước",
      likes: 5,
    },
    {
      id: 3,
      postId: 2,
      author: "Trần Văn Đức",
      content: "Chúc mừng sự kiện thành công!",
      createdAt: "4 giờ trước",
      likes: 2,
    },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEvent =
      filterEvent === "all" || post.eventId === parseInt(filterEvent);

    return matchesSearch && matchesEvent;
  });

  const handleCreatePost = () => {
    if (newPost.title && newPost.content && newPost.eventId) {
      console.log("Create post:", newPost);
      // TODO: Implement create post logic
      setNewPost({ title: "", content: "", eventId: "" });
    }
  };

  const handleLikePost = (postId) => {
    console.log("Like post:", postId);
    // TODO: Implement like logic
  };

  const handleSharePost = (postId) => {
    console.log("Share post:", postId);
    // TODO: Implement share logic
  };

  const getPostComments = (postId) => {
    return comments.filter((comment) => comment.postId === postId);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "Quản lý sự kiện":
        return <Badge className="bg-blue-500 text-white">Manager</Badge>;
      case "Tình nguyện viên":
        return <Badge variant="outline">Volunteer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <UserLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Kênh trao đổi</h1>
            <p className="mt-2 text-muted-foreground">
              Chia sẻ kinh nghiệm, thảo luận và kết nối với cộng đồng tình
              nguyện viên
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng bài viết
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {posts.length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng lượt thích
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {posts.reduce((sum, post) => sum + post.likes, 0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng bình luận
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {posts.reduce((sum, post) => sum + post.comments, 0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Bài viết ghim
                    </p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      {posts.filter((post) => post.isPinned).length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <Pin className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Post */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Tạo bài viết mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tiêu đề</label>
                <Input
                  placeholder="Nhập tiêu đề bài viết..."
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nội dung</label>
                <Textarea
                  placeholder="Chia sẻ kinh nghiệm, cảm nhận hoặc thảo luận về sự kiện..."
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sự kiện liên quan</label>
                <select
                  value={newPost.eventId}
                  onChange={(e) =>
                    setNewPost({ ...newPost, eventId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
                >
                  <option value="">Chọn sự kiện (tùy chọn)</option>
                  {events
                    .filter((event) => event.status === "approved")
                    .map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                </select>
              </div>
              <Button onClick={handleCreatePost} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Đăng bài
              </Button>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">Tất cả sự kiện</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredPosts.length} / {posts.length} bài viết
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Post Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">
                            {post.title}
                          </h3>
                          {post.isPinned && (
                            <Badge className="bg-yellow-500 text-white">
                              <Pin className="mr-1 h-3 w-3" />
                              Ghim
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Bởi {post.author}</span>
                          {getRoleBadge(post.authorRole)}
                          <span>{post.createdAt}</span>
                          {post.eventId && (
                            <Badge variant="outline">{post.eventTitle}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-muted-foreground">{post.content}</p>

                    {/* Attachments */}
                    {post.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.attachments.map((attachment, index) => (
                          <Badge key={index} variant="outline">
                            {attachment}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        variant={post.isLiked ? "default" : "outline"}
                        onClick={() => handleLikePost(post.id)}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        {post.likes}
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {post.comments}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSharePost(post.id)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Chia sẻ
                      </Button>
                    </div>

                    {/* Comments */}
                    {getPostComments(post.id).length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Bình luận:</h4>
                        <div className="space-y-3">
                          {getPostComments(post.id).map((comment) => (
                            <div
                              key={comment.id}
                              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {comment.author}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {comment.createdAt}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Heart className="h-4 w-4" />
                                {comment.likes}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Không có bài viết nào
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterEvent !== "all"
                    ? "Không có bài viết nào phù hợp với bộ lọc của bạn"
                    : "Chưa có bài viết nào được đăng"}
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bài viết đầu tiên
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
