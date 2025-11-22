// App constants
export const APP_CONFIG = {
  APP_NAME: "VolunteerHub",
  APP_VERSION: "1.0.0",
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  UPLOAD_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  SUPPORTED_FILE_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  DASHBOARD: "/dashboard",
  EVENTS: "/events",
  COMMUNITY: "/community",
  NOTIFICATIONS: "/notifications",
  ABOUT: "/about",
  CONTACT: "/contact",
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    EVENTS: "/admin/events",
    REPORTS: "/admin/reports",
  },
  MANAGER: {
    DASHBOARD: "/manager/dashboard",
    EVENTS: "/manager/events",
    VOLUNTEERS: "/manager/volunteers",
    COMMUNITY: "/manager/community",
  },
};

export const USER_ROLES = {
  VOLUNTEER: "volunteer",
  MANAGER: "manager",
  ADMIN: "admin",
};

export const EVENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const EVENT_CATEGORIES = [
  "Môi trường",
  "Giáo dục",
  "Cộng đồng",
  "Y tế",
  "Thể thao",
  "Văn hóa",
  "Công nghệ",
  "Khác",
];

export const NOTIFICATION_TYPES = {
  EVENT_UPDATE: "event_update",
  EVENT_CANCELLED: "event_cancelled",
  EVENT_REMINDER: "event_reminder",
  VOLUNTEER_APPROVED: "volunteer_approved",
  VOLUNTEER_REJECTED: "volunteer_rejected",
  SYSTEM: "system",
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  API: "YYYY-MM-DD",
  DATETIME: "DD/MM/YYYY HH:mm",
  TIME: "HH:mm",
};
