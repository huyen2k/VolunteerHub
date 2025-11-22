import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Heart, MessageCircle, Eye } from "lucide-react";

export function PostCard({ post }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
              // Người đăng bài - thông tin cần: ảnh + tên
                src={post.author_avatar || "/placeholder.svg"}
                alt={post.author}
              />
              <AvatarFallback>{post.author[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
          <Badge variant="secondary">{post.category}</Badge>
        </div>

        <Link to={`/community/posts/${post.id}`}>
          <h3 className="mb-2 text-lg font-bold text-balance hover:text-primary">
            {post.title}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
          {post.content}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.views}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
