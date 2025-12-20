import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Heart,
  Users,
  Calendar,
  MapPin,
  Star,
  Search,
  ArrowRight,
} from "lucide-react";
import { VolunteerLogoWithText } from "../components/VolunteerLogo";
import { useAuth } from "../hooks/useAuth";
import eventService from "../services/eventService";
import LoadingSpinner from "../components/LoadingSpinner";

const defaultEventImage =
  "https://images.unsplash.com/photo-1543269825-724376c69816?w=800&q=80";

const AnimatedNumber = ({ target, duration = 2500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - percentage, 3);

      setCount(Math.floor(easeOutCubic * target));

      if (percentage < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return <span>{count}</span>;
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const heroImages = {
    img1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", // Tình nguyện viên vui vẻ
    img2: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80", // Nhóm trồng cây
    img3: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80", // Làm việc nhóm
    img4: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80", // Hỗ trợ cộng đồng
  };

  const testimonialAvatars = [
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop",
  ];
  const defaultEventImage =
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80";
  // -------------------

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await eventService.getEvents();
        setEvents(data || []);
      } catch (e) {
        setError(e?.message || "Không thể tải danh sách sự kiện");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const featuredEvents = useMemo(() => {
    if (!Array.isArray(events) || !events || events.length === 0) return [];
    const withLikes = [...events].sort(
      (a, b) => (b.likes || 0) - (a.likes || 0)
    );
    return withLikes.slice(0, 3);
  }, [events]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="mb-8">
                <VolunteerLogoWithText logoSize="xl" textSize="3xl" />
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Tham gia tình nguyện hôm nay,{" "}
                <span className="text-primary">tạo tác động ngày mai</span>
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground leading-relaxed">
                Kết nối với hàng ngàn sự kiện tình nguyện ý nghĩa. Đóng góp thời
                gian của bạn, tạo nên sự khác biệt trong cộng đồng.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
                  asChild
                >
                  <Link to={isAuthenticated ? "/user/events" : "/events"}>
                    Khám phá sự kiện
                  </Link>
                </Button>
                {!isAuthenticated ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    asChild
                  >
                    <Link to="/register">Đăng ký ngay</Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    asChild
                  >
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                )}
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-primary flex items-baseline">
                    <AnimatedNumber target={5000} duration={2000} />+
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Tình nguyện viên
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary flex items-baseline">
                    <AnimatedNumber target={1200} duration={2000} />+
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Sự kiện
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary flex items-baseline">
                    <AnimatedNumber target={50} duration={2000} />+
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Tổ chức
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-[1.02]">
                  <img
                    src={heroImages.img1}
                    alt="Volunteer smiling"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-[1.02]">
                  <img
                    src={heroImages.img2}
                    alt="Volunteers planting trees"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-[1.02]">
                  <img
                    src={heroImages.img3}
                    alt="Teamwork volunteering"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-[1.02]">
                  <img
                    src={heroImages.img4}
                    alt="Community support"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold flex justify-center items-baseline">
                <AnimatedNumber target={6} />
                K+
              </div>
              <div className="mt-2 text-sm opacity-90">
                Tình nguyện viên đăng ký
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold flex justify-center items-baseline">
                <AnimatedNumber target={12} />
                K+
              </div>
              <div className="mt-2 text-sm opacity-90">Giờ tình nguyện</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold flex justify-center items-baseline">
                <AnimatedNumber target={108} />
                K+
              </div>
              <div className="mt-2 text-sm opacity-90">Người được hỗ trợ</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold flex justify-center items-baseline">
                <AnimatedNumber target={210} />+
              </div>
              <div className="mt-2 text-sm opacity-90">Dự án hoàn thành</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Cách thức hoạt động
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Chỉ với 3 bước đơn giản để bắt đầu hành trình tình nguyện của bạn
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card className="border-none bg-background shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">
                  1. Đăng ký tài khoản
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Tạo hồ sơ cá nhân và chia sẻ sở thích, kỹ năng của bạn để tìm
                  được sự kiện phù hợp nhất.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-background shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">2. Tìm sự kiện</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Khám phá hàng trăm sự kiện tình nguyện theo lĩnh vực, địa điểm
                  và thời gian phù hợp với bạn.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-background shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">
                  3. Tham gia & Đóng góp
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Đăng ký tham gia sự kiện và bắt đầu tạo nên những tác động
                  tích cực cho cộng đồng.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Sự kiện nổi bật
              </h2>
              <p className="mt-2 text-muted-foreground">
                Các sự kiện tình nguyện đang được quan tâm nhất
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="hidden sm:flex bg-transparent"
            >
              <Link to={isAuthenticated ? "/user/events" : "/events"}>
                Xem tất cả
              </Link>
            </Button>
          </div>

          {loading && (
            <div className="mt-12 flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          )}
          {!loading && error && (
            <div className="mt-12 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={event.image || defaultEventImage}
                      alt={event.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = defaultEventImage;
                      }}
                    />
                    <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {event.category || "Sự kiện"}
                    </Badge>
                  </div>

                  <CardContent className="p-6 flex flex-col flex-1">
                    <h3 className="text-balance text-lg font-semibold line-clamp-2 min-h-[3rem]">
                      {event.title}
                    </h3>
                    {event.organization && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                        {event.organization}
                      </p>
                    )}

                    <div className="mt-4 space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>
                          {event.registeredCount ??
                            (event.volunteers ? event.volunteers.length : 0)}
                          /{event.maxVolunteers} tình nguyện viên
                        </span>
                      </div>
                    </div>

                    <Button
                      className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      asChild
                    >
                      <Link to={`/events/${event.id}`}>
                        {isAuthenticated ? "Đăng ký tham gia" : "Xem chi tiết"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to={isAuthenticated ? "/user/events" : "/events"}>
                Xem tất cả sự kiện
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground sm:py-24">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Đăng ký nhận thông tin về sự kiện mới
          </h2>
          <p className="mt-4 text-pretty text-lg opacity-90">
            Nhận thông báo về các sự kiện tình nguyện mới nhất phù hợp với bạn
          </p>
          <div className="mx-auto mt-8 flex max-w-md gap-2">
            <Input
              type="email"
              placeholder="Nhập email của bạn"
              className="bg-background text-foreground border-primary-foreground/30 focus-visible:ring-primary-foreground"
            />
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all hover:-translate-y-1 hover:shadow-lg">
              Đăng ký
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
