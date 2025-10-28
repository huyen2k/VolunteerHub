import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

const Image = ({ src, alt, fill, className, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`${fill ? "w-full h-full object-cover" : ""} ${
        className || ""
      }`}
      {...props}
    />
  );
};

export function EventCard({ event }) {
  const progress =
    (event.volunteers_registered / event.volunteers_needed) * 100;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <Badge className="absolute right-3 top-3 bg-primary">
          {event.category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-balance">
          {event.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {event.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString("vi-VN")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              Tình nguyện viên
            </span>
            <span className="font-medium">
              {event.volunteers_registered}/{event.volunteers_needed}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link to={`/events/${event.id}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
