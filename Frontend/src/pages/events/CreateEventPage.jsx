import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Tạo sự kiện mới</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Trang tạo sự kiện đang được phát triển...
            </p>
            <Button asChild>
              <Link to="/events">Về danh sách sự kiện</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
