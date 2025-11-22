import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import eventService from "../../services/eventService";
import {
  validateEvent,
  getValidationErrors,
} from "../../utils/eventValidation";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });
  const [event, setEvent] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const eventData = await eventService.getEventById(id);
      setEvent(eventData);

      // Check if event can be edited
      if (eventData.status !== "pending" && eventData.status !== "rejected") {
        setSubmitError(
          "Chỉ có thể chỉnh sửa sự kiện có trạng thái 'Chờ duyệt' hoặc 'Từ chối'"
        );
        return;
      }

      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      const eventDate = eventData.date ? new Date(eventData.date) : null;
      const formattedDate = eventDate
        ? new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        : "";

      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        date: formattedDate,
        location: eventData.location || "",
      });
    } catch (err) {
      console.error("Error loading event:", err);
      setSubmitError(err.message || "Không thể tải thông tin sự kiện.");
    } finally {
      setLoading(false);
    }
  };

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
    setSubmitError("");
    setErrors({});

    // Convert date string to Date object for validation
    const eventData = {
      ...formData,
      date: formData.date ? new Date(formData.date) : null,
    };

    // Validate entire form
    const validation = validateEvent(eventData);
    if (!validation.isValid) {
      const validationErrors = getValidationErrors(eventData);
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    try {
      // Format date for backend (ISO string)
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        location: formData.location.trim(),
      };

      await eventService.updateEvent(id, submitData);
      navigate("/manager/events", { replace: true });
    } catch (err) {
      console.error("Error updating event:", err);
      setSubmitError(
        err.message || "Không thể cập nhật sự kiện. Vui lòng thử lại."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="container mx-auto p-6">
          <LoadingSpinner />
        </div>
      </ManagerLayout>
    );
  }

  const canEdit =
    event && (event.status === "pending" || event.status === "rejected");

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
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                Chỉnh sửa sự kiện
                {!canEdit && <Lock className="h-5 w-5 text-muted-foreground" />}
              </CardTitle>
              <CardDescription>
                {canEdit
                  ? "Cập nhật thông tin sự kiện. Sự kiện sẽ cần được duyệt lại bởi admin sau khi chỉnh sửa."
                  : "Chỉ có thể chỉnh sửa sự kiện có trạng thái 'Chờ duyệt' hoặc 'Từ chối'."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canEdit ? (
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Sự kiện này có trạng thái "
                    {event?.status === "approved" ? "Đã duyệt" : event?.status}
                    ". Chỉ có thể chỉnh sửa sự kiện có trạng thái "Chờ duyệt"
                    hoặc "Từ chối".
                  </AlertDescription>
                </Alert>
              ) : (
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
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-2"
                    >
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

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/manager/events")}
                      disabled={saving}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
