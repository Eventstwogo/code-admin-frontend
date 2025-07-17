"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  EyeOff, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2
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

// Zod Schema
const categorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters")
    .max(50, "Category name must not exceed 50 characters")
    .regex(/^[A-Za-z\s-]+$/, "Only letters,  spaces, and hyphens allowed")
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
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  metaTitle: z
    .string()
    .max(70, "Meta title must be less than 70 characters")
    .optional()
    .or(z.literal("")),
  metaDescription: z
    .string()
    .max(160, "Meta description must be less than 160 characters")
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

const CategoryCreation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CategoryFormData>({
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

  const name = watch("name");

  // Auto-generate slug *only* if user has touched name
  useEffect(() => {
    if (nameTouched) {
      setValue("slug", slugify(name || "", { lower: true, strict: true }));
    }
  }, [name, nameTouched, setValue]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMountedRef.current) return;
    
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isMountedRef.current) {
          setImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageRemove = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setImagePreview(null);
    setSelectedImageFile(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    if (!isMountedRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!isMountedRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isMountedRef.current) {
          setImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleBack = useCallback(() => {
    router.push("/Categories");
  }, [router]);

  const fetchCategories = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const response = await axiosInstance.get("/api/v1/categories/?status_filter=false");
      if (isMountedRef.current) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      if (isMountedRef.current) {
        toast.error("Failed to load categories");
      }
    }
  }, []);

  const fetchCategory = useCallback(async (id: string) => {
    if (!isMountedRef.current) return;
    
    try {
      const response = await axiosInstance.get(`api/v1/category-items/${id}`);
      const category = response.data.data;

      if (isMountedRef.current) {
        setValue("name", category.category_name || category.subcategory_name || "");
        setValue("slug", category.category_slug || category.subcategory_slug || "");
        setValue("description", category.category_description || category.subcategory_description || "");
        setValue("metaTitle", category.category_meta_title || category.subcategory_meta_titl || "");
        setValue("metaDescription", category.category_meta_description || category.subcategory_meta_description || "");
        setValue("parent", category.category_id || "none");
        setValue("features", {
          featured: category.featured_category || category.featured_subcategory,
          homepage: category.show_in_menu,
          promotions: false,
        });

        setNameTouched(false);

        if (category.category_img_thumbnail || category.subcategory_img_thumbnail) {
          setImagePreview(`${category.category_img_thumbnail || category.subcategory_img_thumbnail}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch category:", error);
      if (isMountedRef.current) {
        toast.error("Failed to load category details");
      }
    }
  }, [setValue]);

  useEffect(() => {
    const loadData = async () => {
      if (!isMountedRef.current) return;
      
      setIsLoading(true);
      try {
        await fetchCategories();
        if (categoryId) {
          await fetchCategory(categoryId);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [categoryId, fetchCategories, fetchCategory]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMountedRef.current) return;
    setValue("name", e.target.value);
    setNameTouched(true);
  }, [setValue]);

  const onSubmit = useCallback(async (data: CategoryFormData) => {
    if (isSubmitting || !isMountedRef.current) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("description", data.description || "");
      formData.append("meta_title", data.metaTitle || "");
      formData.append("meta_description", data.metaDescription || "");
      formData.append("category_id", data.parent === "none" ? "" : data.parent || "");
      formData.append("featured", String(data.features.featured));
      formData.append("show_in_menu", String(data.features.homepage));

      if (selectedImageFile) {
        formData.append("file", selectedImageFile);
      }

      const endpoint = categoryId
        ? `/api/v1/category-items/${categoryId}`
        : "/api/v1/categories/";
      const method = categoryId ? "put" : "post";

      const response = await axiosInstance[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        if (isMountedRef.current) {
          toast.success(response.data.message || `Category ${categoryId ? 'updated' : 'created'} successfully!`);
          router.push("/Categories");
        }
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.detail?.message || 
        error?.response?.data?.message ||
        `Failed to ${categoryId ? 'update' : 'create'} category.`;
      
      if (isMountedRef.current) {
        toast.error(message);
      }
      console.error("Error saving category:", error);
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [isSubmitting, selectedImageFile, categoryId, router]);

  if (isLoading) {
    return <CategoryFormSkeleton />;
  }

  // Define feature options as a tuple with explicit name values
  const featureOptions = React.useMemo(() => [
    { name: 'features.featured' as const, key: 'featured', label: 'Featured Category', description: 'Show in featured section' },
    { name: 'features.homepage' as const, key: 'homepage', label: 'Show in Menu', description: 'Display in main navigation' },
    { name: 'features.promotions' as const, key: 'promotions', label: 'Promotions', description: 'Enable for promotional content' }
  ] as const, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 custom-scrollbar">
      <div className="container mx-auto px-4 py-6 max-w-7xl animate-in fade-in-0 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              type="submit"
              form="category-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
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
              onClick={handleBack}
              disabled={isSubmitting}
              className="hover:bg-accent transition-colors"
            >
              Cancel
            </Button>
          </div>
        </div>

        <form
          id="category-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Upload Image Card */}
          <Card className="h-fit border-border/50 shadow-sm card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ImageIcon className="h-5 w-5" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Upload a category image (Max 5MB, JPG/PNG/GIF)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center relative transition-all duration-200",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent/20"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {imagePreview && (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={208}
                      className="mx-auto mb-4 h-52 w-full object-contain rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleImageRemove}
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {imagePreview === null && (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-16 w-16 text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your image here, or
                      </p>
                      <Label
                        htmlFor="image-upload"
                        className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Browse Files
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Details */}
          <Card className="border-border/50 shadow-sm card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground">Category Details</CardTitle>
              <CardDescription>
                Basic information about the category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Category Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  {...register("name")}
                  placeholder="Enter category name"
                  className={cn(
                    "form-field-animate",
                    errors.name && "border-destructive focus:border-destructive"
                  )}
                  onChange={handleNameChange}
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium text-foreground">
                  Slug
                </Label>
                <Input
                  id="slug"
                  type="text"
                  {...register("slug")}
                  placeholder="Auto-generated from name"
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                {errors.slug && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.slug.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={4}
                  placeholder="Enter category description"
                  className={cn(
                    "resize-none form-field-animate",
                    errors.description && "border-destructive focus:border-destructive"
                  )}
                  maxLength={500}
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent" className="text-sm font-medium text-foreground">
                  Parent Category
                </Label>
                <Controller
                  name="parent"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select parent category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Root Category)</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.category_id} value={category.category_id}>
                            {category.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-border/50 shadow-sm card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-5 w-5" />
                Features
              </CardTitle>
              <CardDescription>
                Configure category display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureOptions.map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                  <div className="flex-1">
                    <Label htmlFor={feature.key} className="text-sm font-medium text-foreground cursor-pointer">
                      {feature.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                  <Controller
                    name={feature.name}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id={feature.key}
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        className="ml-4"
                      />
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SEO Fields */}
          <Card className="border-border/50 shadow-sm card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground">SEO Optimization</CardTitle>
              <CardDescription>
                Improve search engine visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="metaTitle" className="text-sm font-medium text-foreground">
                  Meta Title
                </Label>
                <Input
                  id="metaTitle"
                  type="text"
                  {...register("metaTitle")}
                  placeholder="SEO title (recommended: 50-60 characters)"
                  className={cn(
                    "transition-colors",
                    errors.metaTitle && "border-destructive focus:border-destructive"
                  )}
                  maxLength={70}
                />
                <div className="flex justify-between items-center">
                  {errors.metaTitle && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.metaTitle.message}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {watch("metaTitle")?.length || 0}/70
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription" className="text-sm font-medium text-foreground">
                  Meta Description
                </Label>
                <Textarea
                  id="metaDescription"
                  {...register("metaDescription")}
                  rows={3}
                  placeholder="SEO description (recommended: 150-160 characters)"
                  className={cn(
                    "resize-none transition-colors",
                    errors.metaDescription && "border-destructive focus:border-destructive"
                  )}
                  maxLength={160}
                />
                <div className="flex justify-between items-center">
                  {errors.metaDescription && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.metaDescription.message}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {watch("metaDescription")?.length || 0}/160
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CategoryCreation;
