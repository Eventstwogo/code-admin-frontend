"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiptapEditor } from "./components/TiptapEditor";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";

interface AboutUsData {
  id?: string;
  content: string;
  updatedAt?: string;
}

export default function AboutUsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Fetch current About Us content
  const fetchAboutUsContent = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/v1/about-us");
      console.log("About Us API Response:", response.data);
      
      if (response.data && response.data.data ) {
        const aboutUsData = response.data.data;
        const content = aboutUsData.about_us_data?.additonalprop1 || "";
        console.log("Fetched About Us Content:", content);
        setContent(content);
        setLastSaved(aboutUsData.updatedAt || aboutUsData.created_at);
      } else {
        // No data exists yet
        setContent("");
      }
    } catch (error: any) {
      console.error("Error fetching About Us content:", error);
      // If no content exists yet, start with empty content
      if (error.response?.status === 404) {
        setContent("");
      } else {
        toast.error("Failed to load About Us content");
      }
    } finally {
      setLoading(false);
    }
  };

  // Save About Us content
  const saveContent = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content before saving");
      return;
    }

    try {
      setSaving(true);
      const response = await axiosInstance.post("/api/v1/about-us", {
        about_us_data: {
          additonalprop1:content
        }
      });
      
      if (response.status === 200 || response.status === 201) {
        setLastSaved(new Date().toISOString());
        toast.success("About Us content saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving About Us content:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          "Failed to save About Us content";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save functionality (optional)
  const handleContentChange = (value: string) => {
    setContent(value);
  };

  useEffect(() => {
    fetchAboutUsContent();
  }, []);
console.log(content)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Us</h1>
          <p className="text-muted-foreground">
            Manage your company's About Us content
          </p>
          {lastSaved && (
            <p className="text-sm text-muted-foreground mt-1">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2"
          >
            {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            onClick={fetchAboutUsContent}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={saveContent}
            disabled={saving || !content.trim()}
            className="flex items-center gap-2"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Content Editor/Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isPreview ? "Preview" : "About Us Content"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPreview ? (
            <div className="min-h-[400px] p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <p className="text-muted-foreground italic">
                    No content to preview. Please add some content first.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Label htmlFor="about-content">Content</Label>
              <TiptapEditor
                value={content}
                onChange={handleContentChange}
                placeholder="Enter your About Us content here..."
                disabled={saving}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Writing Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Keep your About Us content engaging and authentic to connect with your audience.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Include your company's mission, vision, and values to build trust.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Tell your story - how your company started and what makes you unique.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Use the Preview mode to see how your content will appear to visitors.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}