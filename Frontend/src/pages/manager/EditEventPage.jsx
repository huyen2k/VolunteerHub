import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ManagerLayout } from "../../components/Layout";
import { ArrowLeft, AlertCircle, Calendar, MapPin, FileText, Type, Tag, Users, Image as ImageIcon, UploadCloud } from "lucide-react";
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
  const [isUploading, setIsUploading] = useState(false); // Trạng thái upload ảnh riêng biệt

  // State hệ thống
  const [event, setEvent] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const eventData = await eventService.getEventById(id);
      setEvent(eventData);

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

  // ✅ XỬ LÝ UPLOAD ẢNH LÊN CLOUDINARY NGAY KHI CHỌN FILE
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setImageFile(file);

    // Hiển thị preview tạm thời từ phía client
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // ✅ Đẩy ảnh lên Cloudinary ngay lập tức bằng service đã sửa
    try {
      setIsUploading(true);
      const uploadedUrl = await eventService.uploadEventImage(id, file);

      // Cập nhật URL mới vào formData sau khi upload thành công
      setFormData(prev => ({ ...prev, image: uploadedUrl }));
      setImagePreview(uploadedUrl);
      alert("Đã tải ảnh lên Cloud thành công!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Lỗi khi tải ảnh lên Cloud. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
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

    if (isUploading) {
      alert("Vui lòng đợi ảnh tải lên hoàn tất!");
      return;
    }

    const eventData = {
      ...formData,
      date: formData.date ? new Date(formData.date) : null
    };

    const validation = validateEvent(eventData);
    if (!validation.isValid) {
      setErrors(getValidationErrors(eventData));
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        location: formData.location.trim(),
        category: formData.category?.trim(),
        volunteersNeeded: formData.maxVolunteers ? parseInt(formData.maxVolunteers) : undefined,
        image: formData.image // Sử dụng URL đã lưu trong formData
      };

      await eventService.updateEvent(id, submitData);
      alert("Cập nhật thành công! Sự kiện sẽ chờ được duyệt lại.");
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
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
              </Link>
            </div>

            <Card className="max-w-3xl mx-auto shadow-md border-t-4 border-t-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">Chỉnh sửa sự kiện</CardTitle>
                  {event && <Badge className="bg-primary/10 text-primary border-primary/20">{event.status}</Badge>}
                </div>
                <CardDescription>Cập nhật thông tin chi tiết cho sự kiện này.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{submitError}</AlertDescription></Alert>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Info */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="flex items-center gap-2 font-semibold"><Type className="h-4 w-4 text-primary" /> Tiêu đề *</Label>
                        <Input id="title" name="title" value={formData.title} onChange={handleChange} onBlur={handleBlur} required />
                        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2 font-semibold"><Calendar className="h-4 w-4 text-primary" /> Thời gian *</Label>
                        <Input id="date" name="date" type="datetime-local" value={formData.date} onChange={handleChange} onBlur={handleBlur} required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> Địa điểm *</Label>
                        <Input id="location" name="location" value={formData.location} onChange={handleChange} onBlur={handleBlur} required />
                      </div>
                    </div>

                    {/* Right Column: Image & Settings */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold"><ImageIcon className="h-4 w-4 text-primary" /> Ảnh bìa sự kiện</Label>
                        <div className="relative group overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 aspect-video bg-muted/50">
                          {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <ImageIcon className="h-8 w-8 mb-2" />
                                <span className="text-xs">Chưa có ảnh</span>
                              </div>
                          )}

                          {/* Overlay Upload Button */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Label htmlFor="imageFile" className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2">
                              {isUploading ? <LoadingSpinner size="sm" /> : <><UploadCloud className="h-4 w-4" /> Thay đổi ảnh</>}
                            </Label>
                          </div>
                          <Input id="imageFile" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={isUploading} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxVolunteers" className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-primary" /> Số lượng tối đa</Label>
                        <Input id="maxVolunteers" name="maxVolunteers" type="number" value={formData.maxVolunteers} onChange={handleChange} placeholder="Ví dụ: 20" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4 text-primary" /> Nội dung chi tiết *</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} rows={5} required />
                  </div>

                  <div className="flex gap-4 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => navigate("/manager/events")} disabled={saving}>Hủy</Button>
                    <Button type="submit" disabled={saving || isUploading} className="flex-1 bg-primary hover:bg-primary/90">
                      {saving ? <><LoadingSpinner className="mr-2 h-4 w-4" /> Đang lưu...</> : "Cập nhật sự kiện"}
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