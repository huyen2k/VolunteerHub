import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Trương Mạnh Khiêm",
      role: "Thuyền trưởng",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80",
      bio: "Người sáng lập với niềm đam mê kết nối cộng đồng và công nghệ.",
    },
    {
      name: "Huyền Nguyễn 2k",
      role: "Thuyền phó",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80",
      bio: "5 năm kinh nghiệm quản lý các dự án phi chính phủ và từ thiện.",
    },
    {
      name: "Hiếu Hay Ho",
      role: "Hoa tiêu",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80",
      bio: "Chịu trách nhiệm xây dựng nền tảng an toàn, bảo mật và dễ sử dụng.",
    },
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80", // Tình nguyện viên trồng cây
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80", // Nhóm tình nguyện
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80", // Trao quà
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80", // Dạy học
    "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&q=80", // Dọn rác bãi biển
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === galleryImages.length - 1 ? 0 : prev + 1
      );
    }, 2000); // 2000ms

    return () => clearInterval(slideInterval);
  }, [galleryImages.length]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Về VolunteerHub
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Chúng tôi kết nối những người có tấm lòng với các sự kiện tình
                nguyện ý nghĩa.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tạo ra một cộng đồng tình nguyện mạnh mẽ...
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Trở thành nền tảng tình nguyện hàng đầu...
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Minh bạch, tin cậy và cam kết...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Khoảnh khắc đẹp
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Hình ảnh thực tế từ các chiến dịch tình nguyện
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto overflow-hidden rounded-xl shadow-xl aspect-[16/9] bg-gray-100">
              <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {galleryImages.map((img, index) => (
                  <div key={index} className="min-w-full h-full relative">
                    <img
                      src={img}
                      alt={`Slide ${index}`}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <p className="text-white text-lg font-medium">
                        Hoạt động tình nguyện #{index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      currentSlide === index
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" asChild>
                <Link to="/events">Tham gia ngay cùng chúng tôi</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Thêm items-start để căn chỉnh nếu chiều cao khác nhau, 
                nhưng ở đây ta dùng h-full trong Card để chúng bằng nhau */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* CỘT TRÁI: CÂU CHUYỆN */}
              <Card className="h-full flex flex-col justify-between border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">
                    Câu chuyện của chúng tôi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-justify leading-relaxed text-muted-foreground">
                  <p>
                    VolunteerHub ra đời từ khát vọng thu hẹp khoảng cách giữa
                    những trái tim thiện nguyện và những hoàn cảnh cần sự giúp
                    đỡ. Chúng tôi nhận thấy rằng, có rất nhiều người sẵn sàng sẻ
                    chia, nhưng lại gặp khó khăn trong việc tìm kiếm các tổ chức
                    uy tín hay sự kiện phù hợp. VolunteerHub không chỉ là một
                    trang web, mà là chiếc cầu nối vững chắc giúp lòng tốt được
                    trao đi đúng nơi, đúng lúc.
                  </p>
                  <p>
                    Với hệ thống duyệt sự kiện nghiêm ngặt và quy trình minh
                    bạch, chúng tôi loại bỏ những rào cản trong công tác quản lý
                    thiện nguyện. Từ việc đăng ký tham gia chỉ với một cú chạm,
                    theo dõi lịch sử hoạt động, cho đến hệ thống đánh giá uy tín
                    hai chiều, VolunteerHub cam kết mang lại trải nghiệm an
                    toàn, hiệu quả và đầy cảm hứng.
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Tại sao chọn VolunteerHub?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="4"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Quản lý chuyên sâu
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Công cụ mạnh mẽ giúp Tổ chức tạo, duyệt và thống kê
                          tình nguyện viên minh bạch.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Cộng đồng gắn kết
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Không gian để chia sẻ câu chuyện, bình luận và lan tỏa
                          cảm hứng tích cực.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Thông báo tức thì
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cập nhật trạng thái đăng ký và tin tức mới nhất qua hệ
                          thống Real-time.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="8" r="7" />
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Hồ sơ năng lực
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Lưu trữ lịch sử tham gia và chứng nhận điện tử
                          (Certificate) tự động.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Đội ngũ thực hiện
              </h2>
              <p className="mt-4 text-muted-foreground">
                Những con người tâm huyết đứng sau dự án.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden text-center pt-6">
                  <div className="flex justify-center">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-32 w-32 rounded-full object-cover border-4 border-background shadow-sm"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <div className="text-sm font-medium text-primary">
                      {member.role}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* --- ZIG-ZAG SECTION: IMPACT / PARTNERS / FAQ --- */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
            {/* --- BLOCK 1: TÁC ĐỘNG XÃ HỘI (Ảnh Trái - Chữ Phải) --- */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Cột Ảnh */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-video md:aspect-auto md:h-[400px] group">
                <img
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80"
                  alt="Social Impact"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Một chút overlay để ảnh có chiều sâu */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>

              {/* Cột Nội Dung */}
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                  Impact
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Tác động thực tế
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Chúng tôi không chỉ đếm số lượng người tham gia, mà đo lường
                  giá trị thực sự tạo ra cho cộng đồng. Mỗi giờ tình nguyện là
                  một viên gạch xây dựng xã hội tốt đẹp hơn.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Hệ thống đo lường giờ cống hiến minh bạch.</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Báo cáo tác động hàng tháng gửi về email.</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Vinh danh Top tình nguyện viên xuất sắc.</span>
                  </li>
                </ul>
                <Button variant="outline" size="lg">
                  Xem báo cáo năm nay
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 space-y-6">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  Partners
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Mạng lưới kết nối rộng khắp
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Sức mạnh của VolunteerHub đến từ sự cộng hưởng. Chúng tôi hợp
                  tác với các tổ chức uy tín để đa dạng hóa cơ hội cho tình
                  nguyện viên.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="border rounded-lg p-4 bg-background shadow-sm">
                    <div className="text-3xl font-bold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground">
                      Tổ chức NGO
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-background shadow-sm">
                    <div className="text-3xl font-bold text-primary">20+</div>
                    <div className="text-sm text-muted-foreground">
                      Doanh nghiệp CSR
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2 relative overflow-hidden rounded-2xl shadow-lg aspect-video md:aspect-auto md:h-[400px] group">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
                  alt="Partners"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Cột Ảnh */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-video md:aspect-auto md:h-[400px] group">
                <img
                  src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=800&q=80"
                  alt="FAQ & Support"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>

              {/* Cột Nội Dung */}
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                  Support
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Luôn sẵn sàng hỗ trợ
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Đừng ngần ngại đặt câu hỏi. Đội ngũ CSKH của chúng tôi túc
                  trực 24/7 để đảm bảo trải nghiệm tình nguyện của bạn luôn suôn
                  sẻ.
                </p>

                <div className="space-y-4">
                  <div className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold text-foreground">
                      Tôi cần kỹ năng gì để tham gia?
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Hầu hết sự kiện chào đón tất cả mọi người, chỉ cần nhiệt
                      huyết.
                    </p>
                  </div>
                  <div className="border-l-2 border-muted pl-4 hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground">
                      Làm sao nhận chứng chỉ (Certificate)?
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Hệ thống sẽ tự động gửi chứng chỉ điện tử vào hồ sơ của
                      bạn sau khi hoàn thành sự kiện.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button size="lg">Truy cập Trung tâm trợ giúp</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
