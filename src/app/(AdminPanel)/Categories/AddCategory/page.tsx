"use client";

import React, { useEffect, useState, useCallback } from "react";
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
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageRemove = useCallback(() => {
    setImagePreview(null);
    setSelectedImageFile(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
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
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleBack = useCallback(() => {
    router.push("/Categories");
  }, [router]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/v1/categories/?status_filter=false");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    }
  }, []);

  const fetchCategory = useCallback(async (id: string) => {
    try {
      const response = await axiosInstance.get(`api/v1/category-items/${id}`);
      const category = response.data.data;

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
    } catch (error) {
      console.error("Failed to fetch category:", error);
      toast.error("Failed to load category details");
    }
  }, [setValue]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchCategories();
        if (categoryId) {
          await fetchCategory(categoryId);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [categoryId, fetchCategories, fetchCategory]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value);
    setNameTouched(true);
  }, [setValue]);
console.log(categoryId)
  const onSubmit = useCallback(async (data: CategoryFormData) => {
    if (isSubmitting) return;
      setIsSubmitting(true); // ✅ Add this line

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
console.log('hello')
      const endpoint = categoryId
        ? `/api/v1/category-items/${categoryId}`
        : "/api/v1/categories/";
      const method = categoryId ? "put" : "post";

      const response = await axiosInstance[method](endpoint, formData, {
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
  }, [isSubmitting, selectedImageFile, categoryId, router]);

  // Define feature options as a tuple with explicit name values
  const featureOptions = React.useMemo(() => [
    { name: 'features.featured' as const, key: 'featured', label: 'Featured Category', description: 'Show in featured section' },
    { name: 'features.homepage' as const, key: 'homepage', label: 'Show in Menu', description: 'Display in main navigation' },
    { name: 'features.promotions' as const, key: 'promotions', label: 'Promotions', description: 'Enable for promotional content' }
  ] as const, []);

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
                  {categoryId ? "Edit Category" : "Create New Category"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {categoryId ? "Update category information and settings" : "Add a new category to organize your content"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
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
                onClick={handleBack}
                disabled={isSubmitting}
                className="hover:bg-accent/80 hover:scale-105 transition-all duration-200 border-border/60 shadow-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

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
                Upload Image
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">
                Upload a category image (Max 5MB, JPG/PNG/GIF)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center relative transition-all duration-300 group",
                  dragActive
                    ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 scale-[1.02] shadow-lg"
                    : "border-border/60 hover:border-primary/60 hover:bg-gradient-to-br hover:from-accent/20 hover:to-primary/5 hover:scale-[1.01] hover:shadow-md"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {imagePreview && (
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-xl border-2 border-border/40 bg-gradient-to-br from-muted/20 to-muted/10">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={400}
                        height={208}
                        className="mx-auto h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleImageRemove}
                      className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 bg-destructive/90 hover:bg-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {imagePreview === null && (
                  <div className="space-y-6">
                    <div className="relative">
                      <Upload className="mx-auto h-16 w-16 text-muted-foreground/60 group-hover:text-primary/80 transition-colors duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground/80 font-medium">
                        Drag and drop your image here, or
                      </p>
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
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        Supported formats: JPG, PNG, GIF • Max size: 5MB
                      </p>
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
                  <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                </div>
                Category Details
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">
                Basic information about the category
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
                    className={cn(
                      "form-field-animate bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 pl-4 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60",
                      errors.name && "border-destructive/60 focus:border-destructive focus:ring-destructive/20"
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
                    className="bg-muted/30 text-muted-foreground border-border/40 pl-4 pr-4 py-3 cursor-not-allowed"
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
                    {watch("description")?.length || 0}/500
                  </span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    placeholder="Enter category description..."
                    className={cn(
                      "resize-none form-field-animate bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 p-4 text-foreground placeholder:text-muted-foreground/60",
                      errors.description && "border-destructive/60 focus:border-destructive focus:ring-destructive/20"
                    )}
                    maxLength={500}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 h-12 px-4">
                        <SelectValue placeholder="Select parent category (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border/60 shadow-xl">
                        <SelectItem value="none" className="hover:bg-accent/80 focus:bg-accent/80">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/60" />
                            None (Root Category)
                          </div>
                        </SelectItem>
                        {categories.map((category: any) => (
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
                Configure category display options
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
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-muted/60 transition-all duration-200 hover:scale-105"
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
                Improve search engine visibility
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
                    {watch("metaTitle")?.length || 0}/70
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="metaTitle"
                    type="text"
                    {...register("metaTitle")}
                    placeholder="SEO title (recommended: 50-60 characters)"
                    className={cn(
                      "bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 pl-4 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60",
                      errors.metaTitle && "border-destructive/60 focus:border-destructive focus:ring-destructive/20"
                    )}
                    maxLength={70}
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
                    {watch("metaDescription")?.length || 0}/160
                  </span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="metaDescription"
                    {...register("metaDescription")}
                    rows={3}
                    placeholder="SEO description (recommended: 150-160 characters)"
                    className={cn(
                      "resize-none bg-background/50 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-primary/40 p-4 text-foreground placeholder:text-muted-foreground/60",
                      errors.metaDescription && "border-destructive/60 focus:border-destructive focus:ring-destructive/20"
                    )}
                    maxLength={160}
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
