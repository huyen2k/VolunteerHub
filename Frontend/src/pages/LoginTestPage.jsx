import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";

export default function LoginTestPage() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Login Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Authentication Status:</h3>
            <p>Is Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}</p>
            {user && (
              <div className="mt-2 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold">User Info:</h4>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <p>ID: {user.id}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Go to Register</Link>
            </Button>
            <Button asChild>
              <Link to="/manager/login">Manager Login</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/login">Admin Login</Link>
            </Button>
            {isAuthenticated && (
              <Button onClick={logout} variant="destructive">
                Logout
              </Button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Test Accounts:</h4>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Volunteer:</strong> volunteer1@example.com /
                volunteer123
              </p>
              <p>
                <strong>Manager:</strong> manager1@example.com / manager123
              </p>
              <p>
                <strong>Admin:</strong> admin@example.com / admin123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

