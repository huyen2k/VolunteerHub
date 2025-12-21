import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ManagerLayout } from "../../components/Layout";
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  MapPin,
  FileText,
  Type,
  Users,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import eventService from "../../services/eventService";
import {
  validateEvent,
  getValidationErrors,
} from "../../utils/eventValidation";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    image: "",
    maxVolunteers: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const uploadImageIfNeeded = async () => {
    if (!imageFile) return null;
    try {
      return await eventService.uploadImage(imageFile);
    } catch (error) {
      throw new Error(error.message || "Tải ảnh thất bại");
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate single field on blur
    const validation = validateEvent({ ...formData, [name]: value });
    if (validation.error) {
      const fieldError = validation.error.details.find(
        (d) => d.path[0] === name
      );
      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          [name]: fieldError.message,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== 1. BẮT ĐẦU SUBMIT FORM ===");

    setSubmitError("");
    setErrors({});

    // Chuẩn bị dữ liệu để validate
    const eventData = {
      ...formData,
      date: formData.date ? new Date(formData.date) : null,
      image: imageFile
        ? "https://waiting-for-upload.com/temp.jpg"
        : formData.image,
    };

    console.log("2. Dữ liệu chuẩn bị validate:", eventData);

    // Validate
    const validation = validateEvent(eventData);
    console.log("3. Kết quả validate:", validation);

    if (!validation.isValid) {
      const validationErrors = getValidationErrors(eventData);
      console.warn("4. Validate THẤT BẠI. Lỗi chi tiết:", validationErrors);
      setErrors(validationErrors);
      return; // <--- Code sẽ dừng ở đây nếu validate sai
    }

    console.log("5. Validate THÀNH CÔNG. Bắt đầu xử lý upload ảnh...");
    setLoading(true);

    try {
      // Logic upload ảnh
      let imageUrl = null;
      try {
        // Gọi hàm uploadImageIfNeeded (để hết lỗi unused)
        if (imageFile) {
          console.log("6. Đang upload ảnh...");
          imageUrl = await uploadImageIfNeeded();
          console.log("7. Upload ảnh thành công. URL:", imageUrl);
        } else {
          console.log("6. Người dùng không chọn ảnh, bỏ qua upload.");
        }
      } catch (uploadErr) {
        console.warn("Lỗi upload ảnh (không nghiêm trọng):", uploadErr);
      }

      // Chuẩn bị payload gửi về Backend
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(), // Format ISO chuẩn cho Backend
        location: formData.location.trim(),
        category: formData.category?.trim() || undefined,
        image: imageUrl || formData.image?.trim() || undefined,
        volunteersNeeded: formData.maxVolunteers
          ? parseInt(formData.maxVolunteers, 10)
          : undefined,
      };

      console.log("8. Dữ liệu cuối cùng gửi đi (Payload):", submitData);

      // Gọi API createEvent (để hết lỗi unused eventService)
      console.log("9. Đang gọi API createEvent...");
      await eventService.createEvent(submitData);

      console.log("10. TẠO SỰ KIỆN THÀNH CÔNG! Chuyển trang...");
      navigate("/manager/events", { replace: true });
    } catch (err) {
      console.error("❌ LỖI XẢY RA (Catch Block):", err);
      setSubmitError(err.message || "Không thể tạo sự kiện. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      console.log("=== KẾT THÚC SUBMIT ===");
    }
  };

  return (
    <ManagerLayout>
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              to="/manager/events"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách sự kiện
            </Link>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Tạo sự kiện mới
              </CardTitle>
              <CardDescription>
                Điền thông tin để tạo sự kiện mới. Sự kiện sẽ cần được duyệt bởi
                admin trước khi hiển thị.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error message */}
                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Tiêu đề <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Ví dụ: Dọn dẹp bãi biển Vũng Tàu"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.title ? "border-destructive" : ""}
                    required
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Mô tả <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Mô tả chi tiết về sự kiện..."
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.description ? "border-destructive" : ""}
                    rows={6}
                    required
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/2000 ký tự
                  </p>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ngày diễn ra <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.date ? "border-destructive" : ""}
                    required
                  />
                  {errors.date && (
                    <p className="text-sm text-destructive">{errors.date}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa điểm <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Ví dụ: Bãi biển Vũng Tàu, TP. Vũng Tàu"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.location ? "border-destructive" : ""}
                    required
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Danh mục
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    type="text"
                    placeholder="Ví dụ: Môi trường, Giáo dục"
                    value={formData.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.category ? "border-destructive" : ""}
                  />
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Ảnh bìa (tải lên)
                  </Label>
                  <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="mt-2 h-40 rounded object-cover"
                    />
                  )}
                </div>

                {/* Max Volunteers */}
                <div className="space-y-2">
                  <Label
                    htmlFor="maxVolunteers"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Số người tối đa
                  </Label>
                  <Input
                    id="maxVolunteers"
                    name="maxVolunteers"
                    type="number"
                    min={1}
                    placeholder="Ví dụ: 50"
                    value={formData.maxVolunteers}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.maxVolunteers ? "border-destructive" : ""}
                  />
                  {errors.maxVolunteers && (
                    <p className="text-sm text-destructive">
                      {errors.maxVolunteers}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/manager/events")}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Đang tạo...
                      </>
                    ) : (
                      "Tạo sự kiện"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
