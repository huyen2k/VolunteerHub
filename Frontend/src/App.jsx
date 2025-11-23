import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

// Event Pages (Public)
import EventsPage from "./pages/events/EventsPage";
import EventDetailPage from "./pages/events/EventDetailPage";

// User Pages
import UserDashboardPage from "./pages/user/DashboardPage";
import UserProfilePage from "./pages/user/ProfilePage";
import UserSettingsPage from "./pages/user/SettingsPage";
import UserHistoryPage from "./pages/user/HistoryPage";
import UserEventsPage from "./pages/user/EventsPage";
import CommunityPage from "./pages/user/CommunityPage";
import ChatPage from "./pages/user/ChatPage";
import PostDetailPage from "./pages/user/PostDetailPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminCommunityPage from "./pages/admin/AdminCommunityPage";

// Manager Pages
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import ManagerEventsPage from "./pages/manager/ManagerEventsPage";
import ManagerEventDetailPage from "./pages/manager/ManagerEventDetailPage";
import ManagerVolunteersPage from "./pages/manager/ManagerVolunteersPage";
import ManagerCommunityPage from "./pages/manager/ManagerCommunityPage";
import ManagerProfilePage from "./pages/manager/ManagerProfilePage";
import ManagerCreateEventPage from "./pages/manager/CreateEventPage";
import ManagerEditEventPage from "./pages/manager/EditEventPage";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" enableSystem>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />

                {/* Guest Routes */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />

                {/* Event Routes - Public for guests, Protected for authenticated users */}
                <Route path="/events" element={<EventsPage />} />
                <Route
                  path="/user/events"
                  element={
                    <ProtectedRoute>
                      <UserEventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/events/:id" element={<EventDetailPage />} />

                {/* Protected User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <UserSettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/history"
                  element={
                    <ProtectedRoute>
                      <UserHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/events"
                  element={
                    <ProtectedRoute>
                      <UserEventsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/community"
                  element={
                    <ProtectedRoute>
                      <CommunityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/chat"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/chat/:channelId"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/community/posts/:id"
                  element={
                    <ProtectedRoute>
                      <PostDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminEventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/profile"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/community"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminCommunityPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/manager/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/manager/dashboard"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/events"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerEventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/events/create"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerCreateEventPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/events/:id/edit"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerEditEventPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/events/:id"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerEventDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/volunteers"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerVolunteersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/community"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerCommunityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/profile"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ManagerProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                <Route path="*" element={<div>404 - Page Not Found</div>} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
