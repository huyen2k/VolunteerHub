import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import SettingsPage from "./pages/SettingsPage";
import DashboardPage from "./pages/DashboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ThemeTestPage from "./pages/ThemeTestPage";
import UserHistoryPage from "./pages/UserHistoryPage";
import LoginTestPage from "./pages/LoginTestPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

// Event Pages
import EventsPage from "./pages/events/EventsPage";
import UserEventsPage from "./pages/events/UserEventsPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import CreateEventPage from "./pages/events/CreateEventPage";

// Community Pages
import CommunityPage from "./pages/community/CommunityPage";
import ChatPage from "./pages/community/ChatPage";
import PostsPage from "./pages/community/PostsPage";
import PostDetailPage from "./pages/community/PostDetailPage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";

// Manager Pages
import ManagerLoginPage from "./pages/manager/ManagerLoginPage";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import ManagerEventsPage from "./pages/manager/ManagerEventsPage";
import ManagerEventDetailPage from "./pages/manager/ManagerEventDetailPage";
import ManagerVolunteersPage from "./pages/manager/ManagerVolunteersPage";
import ManagerCommunityPage from "./pages/manager/ManagerCommunityPage";
import ManagerProfilePage from "./pages/manager/ManagerProfilePage";

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
                <Route path="/theme-test" element={<ThemeTestPage />} />
                <Route path="/login-test" element={<LoginTestPage />} />

                {/* Guest-only Routes */}
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
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
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
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/create"
                  element={
                    <ProtectedRoute>
                      <CreateEventPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Community Routes */}
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
                  path="/community/posts"
                  element={
                    <ProtectedRoute>
                      <PostsPage />
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

                {/* Admin Routes */}
                <Route
                  path="/admin/login"
                  element={
                    <GuestRoute>
                      <AdminLoginPage />
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

                {/* Manager Routes */}
                <Route
                  path="/manager/login"
                  element={
                    <GuestRoute>
                      <ManagerLoginPage />
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

                {/* Utility Routes */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* 404 Route */}
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
