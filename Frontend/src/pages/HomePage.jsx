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

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    if (!events || events.length === 0) return [];
    // Ưu tiên sự kiện có nhiều likes, nếu không có thì lấy 3 sự kiện đầu
    const withLikes = [...events].sort(
      (a, b) => (b.likes || 0) - (a.likes || 0)
    );
    return withLikes.slice(0, 3);
  }, [events]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
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
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <Link to={isAuthenticated ? "/user/events" : "/events"}>
                    Khám phá sự kiện
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                {!isAuthenticated ? (
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/register">Đăng ký ngay</Link>
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                )}
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-primary">5000+</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Tình nguyện viên
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">1200+</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Sự kiện
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Tổ chức
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="/happy-volunteer-with-yellow-background.jpg"
                    alt="Volunteer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="/volunteers-planting-trees.jpg"
                    alt="Volunteers"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="/volunteer-with-pink-background.jpg"
                    alt="Volunteer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="/volunteers-helping-community-with-blue-background.jpg"
                    alt="Community"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold">6K+</div>
              <div className="mt-2 text-sm opacity-90">
                Tình nguyện viên đăng ký
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">12K+</div>
              <div className="mt-2 text-sm opacity-90">Giờ tình nguyện</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">108K+</div>
              <div className="mt-2 text-sm opacity-90">Người được hỗ trợ</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">210+</div>
              <div className="mt-2 text-sm opacity-90">Dự án hoàn thành</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
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
            <Card className="border-none bg-background shadow-sm">
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

            <Card className="border-none bg-background shadow-sm">
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

            <Card className="border-none bg-background shadow-sm">
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

      {/* Featured Events */}
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
                <ArrowRight className="ml-2 h-4 w-4" />
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
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                    <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground">
                      {event.category || "Sự kiện"}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-balance text-lg font-semibold">
                      {event.title}
                    </h3>
                    {event.organization && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {event.organization}
                      </p>
                    )}

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
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

      {/* Testimonials */}
      <section className="bg-muted py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Câu chuyện từ tình nguyện viên
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Những chia sẻ chân thành từ cộng đồng VolunteerHub
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Nguyễn Minh Anh",
                role: "Tình nguyện viên",
                avatar: "/young-woman-smiling.png",
                content:
                  "VolunteerHub đã giúp tôi tìm được nhiều sự kiện ý nghĩa. Tôi đã có cơ hội đóng góp cho cộng đồng và gặp gỡ nhiều người tuyệt vời.",
                rating: 5,
              },
              {
                name: "Trần Văn Bình",
                role: "Tình nguyện viên",
                avatar: "/young-man-smiling.png",
                content:
                  "Nền tảng rất dễ sử dụng và có nhiều sự kiện đa dạng. Tôi đã tham gia được 10 sự kiện trong 3 tháng qua và cảm thấy rất hài lòng.",
                rating: 5,
              },
              {
                name: "Lê Thị Hương",
                role: "Quản lý sự kiện",
                avatar: "/professional-woman.png",
                content:
                  "Là người tổ chức sự kiện, tôi thấy VolunteerHub rất hữu ích trong việc tìm kiếm và quản lý tình nguyện viên. Công cụ quản lý rất tiện lợi.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-none bg-background shadow-sm">
                <CardContent className="p-8">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {testimonial.content}
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              className="bg-background text-foreground"
            />
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Đăng ký
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
