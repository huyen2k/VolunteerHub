import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowLeft, FileText, Shield } from "lucide-react";
import { VolunteerLogoWithText } from "../components/VolunteerLogo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2">
            <VolunteerLogoWithText logoSize="lg" textSize="xl" />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">
              Điều khoản sử dụng
            </h1>
          </div>
          <p className="text-muted-foreground">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Điều khoản sử dụng VolunteerHub</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">
                  1. Chấp nhận điều khoản
                </h2>
                <p className="text-muted-foreground">
                  Bằng việc sử dụng dịch vụ VolunteerHub, bạn đồng ý tuân thủ và
                  bị ràng buộc bởi các điều khoản và điều kiện sử dụng này. Nếu
                  bạn không đồng ý với bất kỳ phần nào của các điều khoản này,
                  bạn không được phép sử dụng dịch vụ của chúng tôi.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Mô tả dịch vụ</h2>
                <p className="text-muted-foreground">
                  VolunteerHub là một nền tảng kết nối các tình nguyện viên với
                  các tổ chức và sự kiện tình nguyện. Chúng tôi cung cấp các
                  công cụ để:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                  <li>
                    Tìm kiếm và đăng ký tham gia các hoạt động tình nguyện
                  </li>
                  <li>Quản lý hồ sơ tình nguyện viên</li>
                  <li>Theo dõi lịch sử hoạt động và thành tích</li>
                  <li>Kết nối với cộng đồng tình nguyện</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">
                  3. Tài khoản người dùng
                </h2>
                <p className="text-muted-foreground">
                  Để sử dụng một số tính năng của dịch vụ, bạn cần tạo tài
                  khoản. Bạn có trách nhiệm:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                  <li>Cung cấp thông tin chính xác và cập nhật</li>
                  <li>Bảo mật mật khẩu và tài khoản của bạn</li>
                  <li>
                    Thông báo ngay lập tức về bất kỳ việc sử dụng trái phép nào
                  </li>
                  <li>
                    Chịu trách nhiệm cho tất cả hoạt động xảy ra dưới tài khoản
                    của bạn
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">
                  4. Quy tắc ứng xử
                </h2>
                <p className="text-muted-foreground">
                  Khi sử dụng VolunteerHub, bạn đồng ý:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                  <li>Tôn trọng các tình nguyện viên và tổ chức khác</li>
                  <li>
                    Không sử dụng ngôn ngữ thô tục hoặc hành vi không phù hợp
                  </li>
                  <li>Không spam hoặc gửi nội dung không mong muốn</li>
                  <li>Tuân thủ các quy định pháp luật hiện hành</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">
                  5. Quyền sở hữu trí tuệ
                </h2>
                <p className="text-muted-foreground">
                  Tất cả nội dung trên VolunteerHub, bao gồm nhưng không giới
                  hạn ở văn bản, đồ họa, logo, hình ảnh, âm thanh và phần mềm,
                  là tài sản của VolunteerHub hoặc các đối tác cấp phép của
                  chúng tôi.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">
                  6. Miễn trừ trách nhiệm
                </h2>
                <p className="text-muted-foreground">
                  VolunteerHub không chịu trách nhiệm cho bất kỳ thiệt hại trực
                  tiếp, gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào phát
                  sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng
                  tôi.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">
                  7. Thay đổi điều khoản
                </h2>
                <p className="text-muted-foreground">
                  Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào.
                  Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là
                  chấp nhận các điều khoản mới.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Liên hệ</h2>
                <p className="text-muted-foreground">
                  Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng
                  liên hệ với chúng tôi tại:
                </p>
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <p>
                    <strong>Email:</strong> support@volunteerhub.com
                  </p>
                  <p>
                    <strong>Điện thoại:</strong> 0123-456-789
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP.HCM
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
