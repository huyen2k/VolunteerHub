import React from "react";
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
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar role="guest" />

      <main className="flex-1">
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Liên hệ với chúng tôi
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Có câu hỏi hoặc góp ý? Chúng tôi luôn sẵn sàng lắng nghe!
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn</h2>
                <Card>
                  <CardContent className="p-6">
                    <form className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="name">Họ tên</Label>
                          <Input id="name" placeholder="Nhập họ tên của bạn" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subject">Chủ đề</Label>
                        <Input id="subject" placeholder="Chủ đề tin nhắn" />
                      </div>
                      <div>
                        <Label htmlFor="message">Nội dung</Label>
                        <Textarea
                          id="message"
                          placeholder="Nhập nội dung tin nhắn của bạn..."
                          rows={6}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Gửi tin nhắn
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Email</h3>
                      <p className="text-muted-foreground">
                        contact@volunteerhub.vn
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Điện thoại</h3>
                      <p className="text-muted-foreground">+84 123 456 789</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Địa chỉ</h3>
                      <p className="text-muted-foreground">
                        123 Đường ABC, Quận 1<br />
                        TP. Hồ Chí Minh, Việt Nam
                      </p>
                    </CardContent>
                  </Card>
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
