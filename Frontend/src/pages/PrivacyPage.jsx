import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";
import { VolunteerLogoWithText } from "../components/VolunteerLogo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2">
            <VolunteerLogoWithText logoSize="lg" textSize="xl" />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">
              Chính sách bảo mật
            </h1>
          </div>
          <p className="text-muted-foreground">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Chính sách bảo mật VolunteerHub</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  1. Thông tin chúng tôi thu thập
                </h2>
                <p className="text-muted-foreground mb-3">
                  Chúng tôi thu thập các loại thông tin sau:
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Thông tin cá nhân
                    </h3>
                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                      <li>Họ tên, email, số điện thoại</li>
                      <li>Địa chỉ và thông tin liên hệ</li>
                      <li>Ảnh đại diện và tiểu sử</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Thông tin hoạt động
                    </h3>
                    <ul className="list-disc list-inside text-green-800 space-y-1">
                      <li>Lịch sử tham gia sự kiện</li>
                      <li>Đánh giá và phản hồi</li>
                      <li>Thành tích và điểm tích lũy</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      Thông tin kỹ thuật
                    </h3>
                    <ul className="list-disc list-inside text-purple-800 space-y-1">
                      <li>Địa chỉ IP và thông tin trình duyệt</li>
                      <li>Dữ liệu sử dụng và tương tác</li>
                      <li>Cookies và công nghệ theo dõi</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  2. Cách chúng tôi sử dụng thông tin
                </h2>
                <p className="text-muted-foreground mb-3">
                  Chúng tôi sử dụng thông tin của bạn để:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                  <li>Cung cấp và cải thiện dịch vụ VolunteerHub</li>
                  <li>Kết nối bạn với các hoạt động tình nguyện phù hợp</li>
                  <li>Gửi thông báo về sự kiện và cập nhật</li>
                  <li>Theo dõi và phân tích việc sử dụng dịch vụ</li>
                  <li>Đảm bảo an ninh và ngăn chặn gian lận</li>
                  <li>Tuân thủ các nghĩa vụ pháp lý</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  3. Bảo mật thông tin
                </h2>
                <p className="text-muted-foreground mb-3">
                  Chúng tôi cam kết bảo vệ thông tin của bạn thông qua:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Mã hóa dữ liệu
                    </h3>
                    <p className="text-red-800 text-sm">
                      Sử dụng mã hóa SSL/TLS để bảo vệ dữ liệu truyền tải
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      Kiểm soát truy cập
                    </h3>
                    <p className="text-orange-800 text-sm">
                      Chỉ nhân viên được ủy quyền mới có thể truy cập thông tin
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      Giám sát liên tục
                    </h3>
                    <p className="text-yellow-800 text-sm">
                      Theo dõi và phát hiện các hoạt động bất thường
                    </p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-teal-900 mb-2">
                      Sao lưu định kỳ
                    </h3>
                    <p className="text-teal-800 text-sm">
                      Thực hiện sao lưu và khôi phục dữ liệu định kỳ
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">
                  4. Chia sẻ thông tin
                </h2>
                <p className="text-muted-foreground mb-3">
                  Chúng tôi có thể chia sẻ thông tin của bạn trong các trường
                  hợp sau:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                  <li>
                    <strong>Với tổ chức:</strong> Để kết nối bạn với các hoạt
                    động tình nguyện
                  </li>
                  <li>
                    <strong>Nhà cung cấp dịch vụ:</strong> Các bên thứ ba hỗ trợ
                    hoạt động của chúng tôi
                  </li>
                  <li>
                    <strong>Yêu cầu pháp lý:</strong> Khi được yêu cầu bởi cơ
                    quan có thẩm quyền
                  </li>
                  <li>
                    <strong>Bảo vệ quyền lợi:</strong> Để bảo vệ quyền và tài
                    sản của chúng tôi
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Quyền của bạn</h2>
                <p className="text-muted-foreground mb-3">
                  Bạn có các quyền sau đối với thông tin cá nhân:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">Truy cập thông tin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">Chỉnh sửa thông tin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">Xóa tài khoản</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">Xuất dữ liệu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">Hạn chế xử lý</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">Khiếu nại</span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">
                  6. Cookies và công nghệ theo dõi
                </h2>
                <p className="text-muted-foreground">
                  Chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng,
                  phân tích lưu lượng truy cập và cá nhân hóa nội dung. Bạn có
                  thể kiểm soát cookies thông qua cài đặt trình duyệt của mình.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">
                  7. Thay đổi chính sách
                </h2>
                <p className="text-muted-foreground">
                  Chúng tôi có thể cập nhật chính sách bảo mật này định kỳ.
                  Chúng tôi sẽ thông báo về những thay đổi quan trọng qua email
                  hoặc thông báo trên trang web.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Liên hệ</h2>
                <p className="text-muted-foreground mb-3">
                  Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên
                  hệ:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> privacy@volunteerhub.com
                  </p>
                  <p>
                    <strong>Điện thoại:</strong> 0123-456-789
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP.HCM
                  </p>
                  <p>
                    <strong>Giờ làm việc:</strong> Thứ 2 - Thứ 6, 8:00 - 17:00
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link to="/register" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng ký
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
