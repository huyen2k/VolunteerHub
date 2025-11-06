import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../hooks/useTheme";

export default function ThemeTestPage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Theme Test Page</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Current theme: <Badge variant="secondary">{theme}</Badge>
            </span>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Background Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background border rounded">
                <p className="text-sm">bg-background</p>
              </div>
              <div className="p-4 bg-card border rounded">
                <p className="text-sm">bg-card</p>
              </div>
              <div className="p-4 bg-muted border rounded">
                <p className="text-sm">bg-muted</p>
              </div>
            </CardContent>
          </Card>

          {/* Text Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Text Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">text-foreground</p>
              <p className="text-muted-foreground">text-muted-foreground</p>
              <p className="text-primary">text-primary</p>
              <p className="text-secondary">text-secondary</p>
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Primary Button</Button>
              <Button variant="secondary" className="w-full">
                Secondary Button
              </Button>
              <Button variant="outline" className="w-full">
                Outline Button
              </Button>
              <Button variant="ghost" className="w-full">
                Ghost Button
              </Button>
            </CardContent>
          </Card>

          {/* Borders */}
          <Card>
            <CardHeader>
              <CardTitle>Borders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-border rounded">
                <p className="text-sm">border-border</p>
              </div>
              <div className="p-4 border-2 border-primary rounded">
                <p className="text-sm">border-primary</p>
              </div>
              <div className="p-4 border-2 border-destructive rounded">
                <p className="text-sm">border-destructive</p>
              </div>
            </CardContent>
          </Card>

          {/* Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                placeholder="Input field"
                className="w-full p-2 border border-input rounded bg-background text-foreground"
              />
              <textarea
                placeholder="Textarea"
                className="w-full p-2 border border-input rounded bg-background text-foreground"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Theme Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Current Theme:</h4>
                <p className="text-muted-foreground">{theme}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">CSS Variables:</h4>
                <p className="text-muted-foreground">
                  Using HSL color format with CSS custom properties
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
