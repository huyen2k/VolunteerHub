import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ManagerLayout } from "../../components/Layout";
import { ArrowLeft, AlertCircle, Calendar, MapPin, FileText, Type, Tag, Users, Image as ImageIcon } from "lucide-react";
import eventService from "../../services/eventService";
import { validateEvent, getValidationErrors } from "../../utils/eventValidation";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Badge } from "../../components/ui/badge";

export default function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // State form
  const [formData, setFormData] = useState({
    title: "", description: "", date: "", location: "", category: "", maxVolunteers: "", image: ""
  });

  // State quản lý ảnh
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // State hệ thống
  const [event, setEvent] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lấy API URL từ biến môi trường
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

  useEffect(() => {
    if (id) loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const eventData = await eventService.getEventById(id);
      setEvent(eventData); // Lưu event để hiển thị trạng thái (Fix lỗi ESLint event unused)

      // Format date cho input datetime-local
      const eventDate = eventData.date ? new Date(eventData.date) : null;
      const formattedDate = eventDate
          ? new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
          : "";

      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        date: formattedDate,
        location: eventData.location || "",
        category: eventData.category || "",
        maxVolunteers: eventData.volunteersNeeded || "",
        image: eventData.image || ""
      });

      // Set preview ảnh cũ nếu có
      if (eventData.image) {
        setImagePreview(eventData.image);
      }

    } catch (err) {
      console.error("Error loading event:", err);
      setSubmitError(err.message || "Không thể tải thông tin sự kiện.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn ảnh mới
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      // Nếu bỏ chọn ảnh thì quay về ảnh cũ (nếu có) hoặc rỗng
      setImagePreview(formData.image || "");
    }
  };

  // Hàm upload ảnh lên server (Giống trang Create)
  const uploadImageIfNeeded = async () => {
    if (!imageFile) return null; // Không có file mới thì trả về null
    const form = new FormData();
    form.append("file", imageFile);

    const resp = await fetch(`${API_BASE_URL}/uploads/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: form,
    });

    const data = await resp.json();
    if (!resp.ok || data.code !== 1000) {
      throw new Error(data.message || "Tải ảnh thất bại");
    }
    return data.result?.url || null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Bỏ qua validate image ở onBlur vì nó là URL hoặc File
    if (name === "imageFile") return;

    const validation = validateEvent({ ...formData, [name]: value });
    if (validation.error) {
      const fieldError = validation.error.details.find((d) => d.path[0] === name);
      if (fieldError) setErrors((prev) => ({ ...prev, [name]: fieldError.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    // Validate dữ liệu cơ bản
    const eventData = {
      ...formData,
      date: formData.date ? new Date(formData.date) : null,
      // Fake URL để bypass validate nếu đang chọn file mới
      image: imageFile ? "https://waiting-upload.com" : formData.image
    };

    const validation = validateEvent(eventData);
    if (!validation.isValid) {
      setErrors(getValidationErrors(eventData));
      return;
    }

    setSaving(true);

    try {
      // 1. Upload ảnh mới nếu có
      let newImageUrl = formData.image; // Mặc định dùng ảnh cũ
      if (imageFile) {
        try {
          newImageUrl = await uploadImageIfNeeded();
        } catch (uploadErr) {
          console.warn("Lỗi upload ảnh:", uploadErr);
          alert("Không thể tải ảnh lên. Vui lòng thử lại.");
          setSaving(false);
          return;
        }
      }

      // 2. Gửi dữ liệu update
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        location: formData.location.trim(),
        category: formData.category?.trim(),
        volunteersNeeded: formData.maxVolunteers ? parseInt(formData.maxVolunteers) : undefined,
        image: newImageUrl // Gửi URL ảnh (mới hoặc cũ)
      };

      await eventService.updateEvent(id, submitData);
      alert("Cập nhật thành công! Sự kiện sẽ chuyển về trạng thái chờ duyệt.");
      navigate("/manager/events", { replace: true });
    } catch (err) {
      console.error("Error updating event:", err);
      setSubmitError(err.message || "Không thể cập nhật sự kiện.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ManagerLayout><div className="container mx-auto p-6"><LoadingSpinner /></div></ManagerLayout>;

  return (
      <ManagerLayout>
        <div className="bg-muted/30">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link to="/manager/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách sự kiện
              </Link>
            </div>

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">Chỉnh sửa sự kiện</CardTitle>
                  {/* Sử dụng biến event để hiển thị status -> Fix lỗi ESLint */}
                  {event && <Badge variant="outline">{event.status}</Badge>}
                </div>
                <CardDescription>Cập nhật thông tin sự kiện. Lưu ý: Sự kiện sẽ cần được duyệt lại sau khi chỉnh sửa.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{submitError}</AlertDescription></Alert>}

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2"><Type className="h-4 w-4" /> Tiêu đề <span className="text-destructive">*</span></Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} onBlur={handleBlur} className={errors.title ? "border-destructive" : ""} required />
                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Mô tả <span className="text-destructive">*</span></Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} className={errors.description ? "border-destructive" : ""} rows={6} required />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Ngày diễn ra <span className="text-destructive">*</span></Label>
                    <Input id="date" name="date" type="datetime-local" value={formData.date} onChange={handleChange} onBlur={handleBlur} className={errors.date ? "border-destructive" : ""} required />
                    {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Địa điểm <span className="text-destructive">*</span></Label>
                    <Input id="location" name="location" value={formData.location} onChange={handleChange} onBlur={handleBlur} className={errors.location ? "border-destructive" : ""} required />
                    {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="flex items-center gap-2"><Tag className="h-4 w-4" /> Danh mục</Label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="Ví dụ: Môi trường" />
                  </div>

                  {/* ✅ THÊM: Image Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Ảnh bìa (Chọn để thay đổi)</Label>
                    <Input id="imageFile" name="imageFile" type="file" accept="image/*" onChange={handleImageSelect} />
                    {imagePreview && (
                        <div className="mt-2 relative">
                          <img src={imagePreview} alt="Preview" className="h-48 w-full object-cover rounded-md border" />
                          <p className="text-xs text-muted-foreground mt-1">Ảnh hiện tại / Xem trước</p>
                        </div>
                    )}
                  </div>

                  {/* Max Volunteers */}
                  <div className="space-y-2">
                    <Label htmlFor="maxVolunteers" className="flex items-center gap-2"><Users className="h-4 w-4" /> Số người tối đa</Label>
                    <Input id="maxVolunteers" name="maxVolunteers" type="number" min="1" value={formData.maxVolunteers} onChange={handleChange} placeholder="Không giới hạn nếu để trống" />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/manager/events")} disabled={saving}>Hủy</Button>
                    <Button type="submit" disabled={saving} className="flex-1">{saving ? <><LoadingSpinner className="mr-2 h-4 w-4" /> Đang lưu...</> : "Lưu thay đổi"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </ManagerLayout>
  );
}