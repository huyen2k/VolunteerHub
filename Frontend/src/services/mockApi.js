// test

const API_BASE_URL = "http://localhost:3001/api"; // Mock server sẽ chạy trên port 3001
const MOCK_DELAY = 500;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data
const mockUsers = [
  {
    id: "1",
    email: "admin@volunteerhub.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    avatar: "/avatars/admin.jpg",
    phone: "0123456789",
    address: "Hà Nội",
    bio: "Quản trị viên hệ thống",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-10-22T10:00:00Z",
    permissions: ["read", "write", "delete", "manage_users", "manage_events"],
    totalHours: 0,
    points: 0,
    achievements: [],
    organization: null,
  },
  {
    id: "2",
    email: "manager@volunteerhub.com",
    password: "manager123",
    name: "Event Manager",
    role: "manager",
    avatar: "/avatars/manager.jpg",
    phone: "0987654321",
    address: "TP.HCM",
    bio: "Quản lý sự kiện tình nguyện",
    isActive: true,
    createdAt: "2024-01-15T00:00:00Z",
    lastLogin: "2024-10-22T09:30:00Z",
    permissions: ["read", "write", "manage_events"],
    totalHours: 0,
    points: 0,
    achievements: [],
    organization: "Tổ chức Tình nguyện ABC",
  },
  {
    id: "3",
    email: "volunteer@volunteerhub.com",
    password: "volunteer123",
    name: "Nguyễn Văn Tình nguyện",
    role: "volunteer",
    avatar: "/avatars/volunteer.jpg",
    phone: "0369852147",
    address: "Đà Nẵng",
    bio: "Tình nguyện viên nhiệt tình",
    isActive: true,
    createdAt: "2024-02-01T00:00:00Z",
    lastLogin: "2024-10-22T08:45:00Z",
    permissions: ["read", "join_events"],
    totalHours: 45,
    points: 120,
    achievements: ["Tình nguyện viên tích cực", "Tham gia 10 sự kiện"],
    organization: null,
  },
];

const mockEvents = [
  {
    id: "1",
    title: "Dọn dẹp bãi biển Đà Nẵng",
    description:
      "Tham gia dọn dẹp rác thải tại bãi biển Mỹ Khê, Đà Nẵng để bảo vệ môi trường biển.",
    date: "2024-11-15T08:00:00Z",
    location: "Bãi biển Mỹ Khê, Đà Nẵng",
    status: "active",
    createdBy: "2",
    approvedBy: "1",
    createdAt: "2024-10-01T00:00:00Z",
    updatedAt: "2024-10-15T00:00:00Z",
    category: "Môi trường",
    image: "/images/beach-cleanup.jpg",
    likes: 25,
    comments: 8,
    volunteers: ["3"],
    maxVolunteers: 50,
    registeredCount: 1,
  },
  {
    id: "2",
    title: "Dạy học cho trẻ em nghèo",
    description:
      "Tổ chức lớp học miễn phí cho trẻ em có hoàn cảnh khó khăn tại quận 1, TP.HCM.",
    date: "2024-11-20T14:00:00Z",
    location: "Trung tâm cộng đồng Quận 1, TP.HCM",
    status: "active",
    createdBy: "2",
    approvedBy: "1",
    createdAt: "2024-10-05T00:00:00Z",
    updatedAt: "2024-10-10T00:00:00Z",
    category: "Giáo dục",
    image: "/images/teaching.jpg",
    likes: 42,
    comments: 15,
    volunteers: [],
    maxVolunteers: 20,
    registeredCount: 0,
  },
  {
    id: "3",
    title: "Phát quà cho người già neo đơn",
    description:
      "Thăm hỏi và phát quà cho các cụ già neo đơn tại viện dưỡng lão Hà Nội.",
    date: "2024-11-25T09:00:00Z",
    location: "Viện dưỡng lão Hà Nội",
    status: "active",
    createdBy: "2",
    approvedBy: "1",
    createdAt: "2024-10-10T00:00:00Z",
    updatedAt: "2024-10-20T00:00:00Z",
    category: "Xã hội",
    image: "/images/elderly-care.jpg",
    likes: 38,
    comments: 12,
    volunteers: ["3"],
    maxVolunteers: 30,
    registeredCount: 1,
  },
];

const mockEventRegistrations = [
  {
    id: "1",
    user: "3",
    event: "1",
    registrationDate: "2024-10-15T10:00:00Z",
    status: "confirmed",
    userRating: null,
    userReview: null,
    completedAt: null,
  },
  {
    id: "2",
    user: "3",
    event: "3",
    registrationDate: "2024-10-20T14:30:00Z",
    status: "confirmed",
    userRating: null,
    userReview: null,
    completedAt: null,
  },
];

const mockPosts = [
  {
    id: "1",
    title: "Cảm nhận sau buổi dọn dẹp bãi biển",
    content:
      "Hôm nay tôi đã tham gia buổi dọn dẹp bãi biển và cảm thấy rất vui khi được góp phần bảo vệ môi trường...",
    author: "3",
    createdAt: "2024-10-16T15:00:00Z",
    likes: 12,
    comments: 5,
    tags: ["môi trường", "tình nguyện", "bãi biển"],
  },
  {
    id: "2",
    title: "Chia sẻ kinh nghiệm dạy học tình nguyện",
    content:
      "Sau nhiều năm tham gia dạy học tình nguyện, tôi muốn chia sẻ một số kinh nghiệm...",
    author: "2",
    createdAt: "2024-10-18T10:30:00Z",
    likes: 28,
    comments: 8,
    tags: ["giáo dục", "kinh nghiệm", "dạy học"],
  },
];

// Mock API Functions
export const mockApi = {
  // Authentication APIs
  async login(email, password) {
    await delay(MOCK_DELAY);

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Simulate JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    return {
      token,
      type: "Bearer",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        permissions: user.permissions,
        totalHours: user.totalHours,
        points: user.points,
        achievements: user.achievements,
        organization: user.organization,
      },
    };
  },

  async register(userData) {
    await delay(MOCK_DELAY);

    const existingUser = mockUsers.find((u) => u.email === userData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const newUser = {
      id: String(mockUsers.length + 1),
      ...userData,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      permissions: ["read", "join_events"],
      totalHours: 0,
      points: 0,
      achievements: [],
      organization: null,
    };

    mockUsers.push(newUser);

    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;

    return {
      token,
      type: "Bearer",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
        phone: newUser.phone,
        address: newUser.address,
        bio: newUser.bio,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
        lastLogin: newUser.lastLogin,
        permissions: newUser.permissions,
        totalHours: newUser.totalHours,
        points: newUser.points,
        achievements: newUser.achievements,
        organization: newUser.organization,
      },
    };
  },

  async getCurrentUser(token) {
    await delay(MOCK_DELAY);

    // Extract user ID from mock token
    const userId = token.split("-")[3];
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      permissions: user.permissions,
      totalHours: user.totalHours,
      points: user.points,
      achievements: user.achievements,
      organization: user.organization,
    };
  },

  async getEvents(filters = {}) {
    await delay(MOCK_DELAY);

    let filteredEvents = [...mockEvents];

    // Apply filters
    if (filters.category) {
      filteredEvents = filteredEvents.filter(
        (e) => e.category === filters.category
      );
    }

    if (filters.status) {
      filteredEvents = filteredEvents.filter(
        (e) => e.status === filters.status
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredEvents = filteredEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(searchTerm) ||
          e.description.toLowerCase().includes(searchTerm)
      );
    }

    return filteredEvents;
  },

  async getEventById(id) {
    await delay(MOCK_DELAY);

    const event = mockEvents.find((e) => e.id === id);
    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  },

  async getUserEvents(userId) {
    await delay(MOCK_DELAY);

    const userRegistrations = mockEventRegistrations.filter(
      (r) => r.user === userId
    );
    const userEvents = userRegistrations.map((reg) => {
      const event = mockEvents.find((e) => e.id === reg.event);
      return {
        ...event,
        registrationStatus: reg.status,
        registrationDate: reg.registrationDate,
        userRating: reg.userRating,
        userReview: reg.userReview,
      };
    });

    return userEvents;
  },

  async registerForEvent(userId, eventId) {
    await delay(MOCK_DELAY);

    const event = mockEvents.find((e) => e.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.registeredCount >= event.maxVolunteers) {
      throw new Error("Event is full");
    }

    const existingRegistration = mockEventRegistrations.find(
      (r) => r.user === userId && r.event === eventId
    );

    if (existingRegistration) {
      throw new Error("Already registered for this event");
    }

    // Create new registration
    const newRegistration = {
      id: String(mockEventRegistrations.length + 1),
      user: userId,
      event: eventId,
      registrationDate: new Date().toISOString(),
      status: "confirmed",
      userRating: null,
      userReview: null,
      completedAt: null,
    };

    mockEventRegistrations.push(newRegistration);

    event.registeredCount += 1;
    event.volunteers.push(userId);

    return newRegistration;
  },

  async cancelEventRegistration(userId, eventId) {
    await delay(MOCK_DELAY);

    const registrationIndex = mockEventRegistrations.findIndex(
      (r) => r.user === userId && r.event === eventId
    );

    if (registrationIndex === -1) {
      throw new Error("Registration not found");
    }

    mockEventRegistrations.splice(registrationIndex, 1);

    const event = mockEvents.find((e) => e.id === eventId);
    if (event) {
      event.registeredCount -= 1;
      event.volunteers = event.volunteers.filter((v) => v !== userId);
    }

    return { success: true };
  },

  // Post APIs
  async getPosts() {
    await delay(MOCK_DELAY);
    return mockPosts;
  },

  async getPostById(id) {
    await delay(MOCK_DELAY);

    const post = mockPosts.find((p) => p.id === id);
    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  },

  async createPost(postData) {
    await delay(MOCK_DELAY);

    const newPost = {
      id: String(mockPosts.length + 1),
      ...postData,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    mockPosts.unshift(newPost);
    return newPost;
  },

  // User APIs
  async getUsers() {
    await delay(MOCK_DELAY);
    return mockUsers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      totalHours: user.totalHours,
      points: user.points,
      achievements: user.achievements,
      organization: user.organization,
    }));
  },

  async updateUser(userId, userData) {
    await delay(MOCK_DELAY);

    const userIndex = mockUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    return mockUsers[userIndex];
  },
};

export default mockApi;
