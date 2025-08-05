"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import slugify from "slugify";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Save, 
  Eye, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Edit,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CategoryFormSkeleton } from "@/components/CategoryFormSkeleton";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from 'next/image';

// Constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_META_TITLE_LENGTH = 70;
const MAX_META_DESCRIPTION_LENGTH = 160;

// Types
interface Category {
  category_id: string;
  category_name: string;
  category_slug: string;
  category_description: string;
  category_meta_title: string;
  category_meta_description: string;
  category_img_thumbnail: string;
  featured_category: boolean;
  show_in_menu: boolean;
  subcategory_name?: string;
  subcategory_slug?: string;
  subcategory_description?: string;
  subcategory_meta_title?: string;
  subcategory_meta_description?: string;
  subcategory_img_thumbnail?: string;
  featured_subcategory?: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

type ViewMode = "view" | "edit" | "create";

// Zod Schema
const categorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters")
    .max(50, "Category name must not exceed 50 characters")
    .regex(/^[A-Za-z\s-]+$/, "Only letters, spaces, and hyphens allowed")
    .refine((val) => val.trim().length > 0, {
      message: "Category name cannot be just spaces",
    }),
  slug: z
    .string()
    .min(1, "Slug is required")
    .refine((val) => !/<[^>]*script.*?>|('|--|;|\/\*|\*\/|xp_)/gi.test(val), {
      message: "Slug contains potentially dangerous content",
    }),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  metaTitle: z
    .string()
    .max(MAX_META_TITLE_LENGTH, `Meta title must be less than ${MAX_META_TITLE_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  metaDescription: z
    .string()
    .max(MAX_META_DESCRIPTION_LENGTH, `Meta description must be less than ${MAX_META_DESCRIPTION_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  parent: z.string().optional(),
  features: z.object({
    featured: z.boolean(),
    homepage: z.boolean(),
    promotions: z.boolean(),
  }),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Custom hooks
const useImageUpload = (isViewMode: boolean) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateImage = useCallback((file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPG, PNG, GIF)';
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `Image size should be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  }, []);

  const processImageFile = useCallback((file: File) => {
    const error = validateImage(file);
    if (error) {
      toast.error(error);
      return;
    }

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [validateImage]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  }, [processImageFile]);

  const handleImageRemove = useCallback(() => {
    setImagePreview(null);
    setSelectedImageFile(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isViewMode) return;
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, [isViewMode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (isViewMode) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
  }, [isViewMode, processImageFile]);

  return {
    imagePreview,
    selectedImageFile,
    dragActive,
    handleImageChange,
    handleImageRemove,
    handleDrag,
    handleDrop,
    setImagePreview,
  };
};

const CategoryCreation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");
  const mode = (searchParams.get("mode") || (categoryId ? "view" : "create")) as ViewMode;
  const isViewMode = mode === "view";

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameTouched, setNameTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hooks
  const imageUpload = useImageUpload(isViewMode);

  // Form setup
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
      parent: "none",
      features: {
        featured: false,
        homepage: false,
        promotions: false,
      },
    },
  });

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = form;
  const name = watch("name");

  // Auto-generate slug when name changes
  useEffect(() => {
    if (nameTouched && name) {
      setValue("slug", slugify(name, { lower: true, strict: true }));
    }
  }, [name, nameTouched, setValue]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.push("/Categories");
  }, [router]);

  const handleCancel = useCallback(() => {
    if (categoryId && mode === "edit") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", "view");
      router.push(`/Categories/AddCategory?${params.toString()}`);
    } else {
      router.push("/Categories");
    }
  }, [categoryId, mode, router, searchParams]);

  const handleEditMode = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "edit");
    router.push(`/Categories/AddCategory?${params.toString()}`);
  }, [router, searchParams]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await axiosInstance.get<ApiResponse<Category[]>>("/api/v1/categories?status_filter=false");
        setCategories(categoriesResponse.data.data);

        // Fetch specific category if editing/viewing
        if (categoryId) {
          const categoryResponse = await axiosInstance.get<ApiResponse<Category>>(`/api/v1/category-items/${categoryId}`);
          const category = categoryResponse.data.data;

          // Populate form with category data
          setValue("name", category.category_name || category.subcategory_name || "");
          setValue("slug", category.category_slug || category.subcategory_slug || "");
          setValue("description", category.category_description || category.subcategory_description || "");
          setValue("metaTitle", category.category_meta_title || category.subcategory_meta_title || "");
          setValue("metaDescription", category.category_meta_description || category.subcategory_meta_description || "");
          setValue("parent", category.category_id || "none");
          setValue("features", {
            featured: category.featured_category || category.featured_subcategory || false,
            homepage: category.show_in_menu || false,
            promotions: false,
          });

          setNameTouched(false);

          // Set image preview if exists
          const imageUrl = category.category_img_thumbnail || category.subcategory_img_thumbnail;
          if (imageUrl && imageUpload?.setImagePreview) {
            imageUpload.setImagePreview(imageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [categoryId, setValue]);

  // Handle name input change
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isViewMode) {
      setValue("name", e.target.value);
      setNameTouched(true);
    }
  }, [setValue, isViewMode]);

  // Form submission
  const onSubmit = useCallback(async (data: CategoryFormData) => {
    if (isSubmitting || isViewMode) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append form data
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("description", data.description || "");
      formData.append("meta_title", data.metaTitle || "");
      formData.append("meta_description", data.metaDescription || "");
      formData.append("category_id", data.parent === "none" ? "" : data.parent || "");
      formData.append("featured", String(data.features.featured));
      formData.append("show_in_menu", String(data.features.homepage));

      if (imageUpload.selectedImageFile) {
        formData.append("file", imageUpload.selectedImageFile);
      }

      const endpoint = categoryId
        ? `/api/v1/category-items/${categoryId}`
        : "/api/v1/categories";
      const method = categoryId ? "put" : "post";

      const response = await axiosInstance[method]<ApiResponse<any>>(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        toast.success(response.data.message || `Category ${categoryId ? 'updated' : 'created'} successfully!`);
        router.push("/Categories");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.detail?.message || 
        error?.response?.data?.message ||
        `Failed to ${categoryId ? 'update' : 'create'} category.`;
      
      toast.error(message);
      console.error("Error saving category:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isViewMode, imageUpload.selectedImageFile, categoryId, router]);

  // Feature options configuration
  const featureOptions = useMemo(() => [
    { 
      name: 'features.featured' as const, 
      key: 'featured', 
      label: 'Featured Category', 
      description: 'Show in featured section' 
    },
    { 
      name: 'features.homepage' as const, 
      key: 'homepage', 
      label: 'Show in Menu', 
      description: 'Display in main navigation' 
    },
    { 
      name: 'features.promotions' as const, 
      key: 'promotions', 
      label: 'Promotions', 
      description: 'Enable for promotional content' 
    }
  ], []);

  // Page title and description
  const pageConfig = useMemo(() => {
    switch (mode) {
      case "view":
        return {
          title: "View Category",
          description: "View category information and settings"
        };
      case "edit":
        return {
          title: "Edit Category",
          description: "Update category information and settings"
        };
      default:
        return {
          title: "Create New Category",
          description: "Add a new category to organize your content"
        };
    }
  }, [mode]);

  if (isLoading) {
    return <CategoryFormSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300 custom-scrollbar">
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in-0 duration-700">
        {/* Enhanced Header with better visual hierarchy */}
        <div className="relative mb-12">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl -z-10" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 hover:bg-accent/80 hover:scale-105 transition-all duration-200 border-border/60 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="hidden sm:block w-px h-8 bg-border/60" />
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {pageConfig.title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {pageConfig.description}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {isViewMode ? (
                <>
                  <Button
                    onClick={handleEditMode}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 min-w-[140px]"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Category
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="hover:bg-accent/80 hover:scale-105 transition-all duration-200 border-border/60 shadow-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="submit"
                    form="category-form"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {categoryId ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {categoryId ? "Update Category" : "Save Category"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="hover:bg-accent/80 hover:scale-105 transition-all duration-200 border-border/60 shadow-sm"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {isViewMode && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">View Mode - All fields are read-only</span>
            </div>
          </div>
        )}

        <form
          id="category-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Enhanced Upload Image Card */}
          <Card className="h-fit border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                {isViewMode ? "Category Image" : "Upload Image"}
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">
                {isViewMode ? "Category image" : `Upload a category image (Max ${MAX_IMAGE_SIZE / (1024 * 1024)}MB, JPG/PNG/GIF)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center relative transition-all duration-300 group",
                  isViewMode 
                    ? "border-border/40 bg-muted/20" 
                    : imageUpload.dragActive
                      ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 scale-[1.02] shadow-lg"
                      : "border-border/60 hover:border-primary/60 hover:bg-gradient-to-br hover:from-accent/20 hover:to-primary/5 hover:scale-[1.01] hover:shadow-md"
                )}
                onDragEnter={imageUpload.handleDrag}
                onDragLeave={imageUpload.handleDrag}
                onDragOver={imageUpload.handleDrag}
                onDrop={imageUpload.handleDrop}
              >
                {imageUpload.imagePreview ? (
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-xl border-2 border-border/40 bg-gradient-to-br from-muted/20 to-muted/10">
                      <Image
                        src={imageUpload.imagePreview}
                        alt="Preview"
                        width={400}
                        height={208}
                        className="mx-auto h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    {!isViewMode && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={imageUpload.handleImageRemove}
                        className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 bg-destructive/90 hover:bg-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative">
                      <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground/60 transition-colors duration-300" />
                      {!isViewMode && <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />}
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground/80 font-medium">
                        {isViewMode ? "No image uploaded" : "Drag and drop your image here, or"}
                      </p>
                      {!isViewMode && (
                        <>
                          <Label
                            htmlFor="image-upload"
                            className="inline-flex items-center gap-2 cursor-pointer px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/80 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg font-medium"
                          >
                            <Upload className="h-4 w-4" />
                            Browse Files
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                            className="hidden"
                            onChange={imageUpload.handleImageChange}
                          />
                          <p className="text-xs text-muted-foreground/60 mt-2">
                            Supported formats: JPG, PNG, GIF • Max size: {MAX_IMAGE_SIZE / (1024 * 1024)}MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Category Details */}
          <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold">
                <div className="p-2 bg-accent/10 rounded-lg">
                  {isViewMode ? (
                    <FileText className="h-5 w-5 text-accent-foreground" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                  )}
                </div>
                Category Details
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">
                {isViewMode ? "View category information" : "Basic information about the category"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <div className="space-y-3 group">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Category Name
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder="Enter category name"
                    disabled={isViewMode}
                    className={cn(
                      "form-field-animate bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 pl-4 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60",
                      errors.name && "border-destructive/60 focus:border-destructive focus:ring-destructive/20",
                      isViewMode && "bg-background border-border/40 text-foreground cursor-default"
                    )}
                    onChange={handleNameChange}
                  />
                  {!errors.name && name && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.name && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 p-2 rounded-lg border border-destructive/20">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.name.message}
                  </div>
                )}
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="slug" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Slug
                  <span className="text-xs text-muted-foreground/60 font-normal">(Auto-generated)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="slug"
                    type="text"
                    {...register("slug")}
                    placeholder="Auto-generated from name"
                    disabled
                    className={cn(
                      "border-border/40 pl-4 pr-4 py-3 cursor-not-allowed",
                      isViewMode ? "bg-background text-foreground" : "bg-muted/30 text-muted-foreground"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 bg-muted/50 px-2 py-1 rounded">
                    AUTO
                  </div>
                </div>
                {errors.slug && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 p-2 rounded-lg border border-destructive/20">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.slug.message}
                  </div>
                )}
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Description</span>
                  <span className="text-xs text-muted-foreground/60 font-normal">
                    {watch("description")?.length || 0}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    placeholder="Enter category description..."
                    disabled={isViewMode}
                    className={cn(
                      "resize-none form-field-animate bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 p-4 text-foreground placeholder:text-muted-foreground/60",
                      errors.description && "border-destructive/60 focus:border-destructive focus:ring-destructive/20",
                      isViewMode && "bg-background border-border/40 text-foreground cursor-default"
                    )}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                </div>
                {errors.description && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 p-2 rounded-lg border border-destructive/20">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.description.message}
                  </div>
                )}
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="parent" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Parent Category
                  <span className="text-xs text-muted-foreground/60 font-normal">(Optional)</span>
                </Label>
                <Controller
                  name="parent"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isViewMode}>
                      <SelectTrigger className={cn(
                        "w-full bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 h-12 px-4",
                        isViewMode && "bg-background border-border/40 text-foreground cursor-default"
                      )}>
                        <SelectValue placeholder="Select parent category (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border/60 shadow-xl">
                        <SelectItem value="none" className="hover:bg-accent/80 focus:bg-accent/80">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/60" />
                            None (Root Category)
                          </div>
                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.category_id} value={category.category_id} className="hover:bg-accent/80 focus:bg-accent/80">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-accent/60" />
                              {category.category_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Features */}
          <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Features
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">
                {isViewMode ? "Category display settings" : "Configure category display options"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {featureOptions.map((feature, index) => (
                <div key={feature.key} className="group">
                  <div className="flex items-center justify-between p-5 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/5 transition-all duration-200 hover:shadow-md">
                    <div className="flex-1">
                      <Label htmlFor={feature.key} className="text-sm font-semibold text-foreground cursor-pointer group-hover:text-primary transition-colors duration-200">
                        {feature.label}
                      </Label>
                      <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <Controller
                      name={feature.name}
                      control={control}
                      render={({ field }) => (
                        <div className="ml-6">
                          <Switch
                            id={feature.key}
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            disabled={isViewMode}
                            className={cn(
                              "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-muted/60 transition-all duration-200 hover:scale-105",
                              isViewMode && "cursor-default opacity-80"
                            )}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Enhanced SEO Fields */}
          <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                SEO Optimization
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">
                {isViewMode ? "Search engine optimization settings" : "Improve search engine visibility"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <div className="space-y-3 group">
                <Label htmlFor="metaTitle" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Meta Title</span>
                  <span className={cn(
                    "text-xs font-normal transition-colors",
                    (watch("metaTitle")?.length || 0) > 60 ? "text-orange-500" : "text-muted-foreground/60"
                  )}>
                    {watch("metaTitle")?.length || 0}/{MAX_META_TITLE_LENGTH}
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="metaTitle"
                    type="text"
                    {...register("metaTitle")}
                    placeholder="SEO title (recommended: 50-60 characters)"
                    disabled={isViewMode}
                    className={cn(
                      "bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 pl-4 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60",
                      errors.metaTitle && "border-destructive/60 focus:border-destructive focus:ring-destructive/20",
                      isViewMode && "bg-background border-border/40 text-foreground cursor-default"
                    )}
                    maxLength={MAX_META_TITLE_LENGTH}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {(watch("metaTitle")?.length || 0) >= 50 && (watch("metaTitle")?.length || 0) <= 60 && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                {errors.metaTitle && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 p-2 rounded-lg border border-destructive/20">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.metaTitle.message}
                  </div>
                )}
                <p className="text-xs text-muted-foreground/60">
                  Optimal length: 50-60 characters for better search results
                </p>
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="metaDescription" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Meta Description</span>
                  <span className={cn(
                    "text-xs font-normal transition-colors",
                    (watch("metaDescription")?.length || 0) > 150 ? "text-orange-500" : "text-muted-foreground/60"
                  )}>
                    {watch("metaDescription")?.length || 0}/{MAX_META_DESCRIPTION_LENGTH}
                  </span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="metaDescription"
                    {...register("metaDescription")}
                    rows={3}
                    placeholder="SEO description (recommended: 150-160 characters)"
                    disabled={isViewMode}
                    className={cn(
                      "resize-none bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 p-4 text-foreground placeholder:text-muted-foreground/60",
                      errors.metaDescription && "border-destructive/60 focus:border-destructive focus:ring-destructive/20",
                      isViewMode && "bg-background border-border/40 text-foreground cursor-default"
                    )}
                    maxLength={MAX_META_DESCRIPTION_LENGTH}
                  />
                  <div className="absolute right-3 top-3">
                    {(watch("metaDescription")?.length || 0) >= 150 && (watch("metaDescription")?.length || 0) <= 160 && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                {errors.metaDescription && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 p-2 rounded-lg border border-destructive/20">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.metaDescription.message}
                  </div>
                )}
                <p className="text-xs text-muted-foreground/60">
                  Optimal length: 150-160 characters for better search snippets
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CategoryCreation;
