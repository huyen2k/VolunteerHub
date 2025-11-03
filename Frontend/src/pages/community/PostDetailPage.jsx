import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function PostDetailPage() {
  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Trang chi tiết bài viết đang được phát triển...
            </p>
            <Button asChild>
              <Link to="/community/posts">Về danh sách bài viết</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
