"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Save,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  FileText,
  Camera,
  Tag as TagIcon,
  ArrowRight,
  Loader2,
  Info,
  Badge
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import slugify from "slugify";
import useStore from "@/lib/Zustand";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_GALLERY_IMAGES = 5;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/jpg,image/png,image/webp";

// Basic Info Schema
const basicInfoSchema = z.object({
  title: z
    .string()
    .min(3, "Event title must be at least 3 characters")
    .max(100, "Event title must not exceed 100 characters"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters"),
  category: z
    .string()
    .min(1, "Please select a category"),
  subcategory: z
    .string()
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  organizer: z
    .string()
    .min(3, "Event organizer details must be at least 3 characters"),
  duration: z
    .string()
    .optional(),
  language: z
    .string()
    .optional(),
  ageRestriction: z
    .string()
    .optional(),
  tags: z
    .string()
    .optional(),
  additionalInfo: z
    .string()
    .optional(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface Category {
  category_id: string;
  category_name: string;
  category_slug: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  subcategory_id: string;
  subcategory_name: string;
  subcategory_slug: string;
}

interface GalleryImage {
  id: string;
  file: File | null;
  preview: string;
  isExisting?: boolean;
}

const BasicInfoPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useStore();

  // URL parameters
  const eventId = searchParams.get('event_id');
  const isEditMode = Boolean(eventId);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEventData, setIsLoadingEventData] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  // Image states
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: "",
      address: "",
      category: "",
      subcategory: "",
      description: "",
      organizer: "",
      duration: "",
      language: "",
      ageRestriction: "",
      tags: "",
      additionalInfo: "",
    },
  });

  const selectedCategory = watch("category");
  const watchedTags = watch("tags");

  // Format tags for preview
  const formattedTags = React.useMemo(() => {
    if (!watchedTags || watchedTags.trim() === "") return [];
    
    return watchedTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
  }, [watchedTags]);

  // Utility Functions
  const generateEventSlug = (title: string): string => {
    return slugify(title, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g 
    });
  };

  const prepareExtraData = (data: BasicInfoFormData) => {
    return JSON.stringify({
      description: data.description,
      organizer: data.organizer,
      address: data.address,
      duration: data.duration || "",
      language: data.language || "",
      ageRestriction: data.ageRestriction || "",
      additionalInfo: data.additionalInfo || ""
    });
  };

  const prepareHashtags = (tags: string) => {
    if (!tags || tags.trim() === "") return JSON.stringify([]);
    
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    
    return JSON.stringify(tagArray);
  };

  const validateImageFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} is too large. Maximum size is 5MB`);
      return false;
    }
    return true;
  };
  // Data Loading Functions
  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const response = await axiosInstance.get("/api/v1/categories/list");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const loadEventData = useCallback(async () => {
    if (!isEditMode || !eventId) return;

    setIsLoadingEventData(true);
    try {
      const response = await axiosInstance.get(`/api/v1/events/${eventId}`);
      const eventData = response.data.data;

      // Set form values
      setValue('title', eventData.event_title || '');
      setValue('address', eventData.extra_data?.address || '');
      setValue('category', eventData.category?.category_id || '');
      setValue('description', eventData.extra_data?.description || '');
      setValue('organizer', eventData.extra_data?.organizer || ''); // Fixed typo
      setValue('duration', eventData.extra_data?.duration || '');
      setValue('language', eventData.extra_data?.language || '');
      setValue('ageRestriction', eventData.extra_data?.ageRestriction || '');
      setValue('additionalInfo', eventData.extra_data?.additionalInfo || '');
      setValue('subcategory', eventData.subcategory?.subcategory_id || '');

      // Handle tags
      if (eventData.hash_tags && Array.isArray(eventData.hash_tags)) {
        setValue('tags', eventData.hash_tags.join(', '));
      }

      // Set image previews if available
      if (eventData.card_image) {
        setMainImagePreview(eventData.card_image);
      }
      if (eventData.banner_image) {
        setBannerImagePreview(eventData.banner_image);
      }
      if (eventData.event_extra_images && Array.isArray(eventData.event_extra_images)) {
        const galleryPreviews = eventData.event_extra_images.map((img: string, index: number) => ({
          id: `existing-${Date.now()}-${index}`,
          file: null,
          preview: img,
          isExisting: true
        }));
        setGalleryImages(galleryPreviews);
      }

      toast.success("Event data loaded successfully");
    } catch (error) {
      console.error("Error loading event data:", error);
      toast.error("Failed to load event data");
    } finally {
      setIsLoadingEventData(false);
    }
  }, [isEditMode, eventId, setValue]);

  // Image Handling Functions
  const handleMainImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      setMainImage(file);
      const reader = new FileReader();
      reader.onload = () => setMainImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleBannerImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onload = () => setBannerImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGalleryImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (galleryImages.length + files.length > MAX_GALLERY_IMAGES) {
      toast.error(`Maximum ${MAX_GALLERY_IMAGES} gallery images allowed`);
      return;
    }

    files.forEach(file => {
      if (!validateImageFile(file)) return;

      const reader = new FileReader();
      reader.onload = () => {
        const newImage: GalleryImage = {
          id: `new-${Date.now()}-${Math.random()}`,
          file,
          preview: reader.result as string,
          isExisting: false
        };
        setGalleryImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  }, [galleryImages.length]);

  const removeGalleryImage = useCallback((id: string) => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const removeMainImage = useCallback(() => {
    setMainImage(null);
    setMainImagePreview("");
  }, []);

  const removeBannerImage = useCallback(() => {
    setBannerImage(null);
    setBannerImagePreview("");
  }, []);

  // Effects
  useEffect(() => {
    if (!userId) {
      toast.error("Please log in to create events");
      router.push('/');
      return;
    }

    fetchCategories();
    
    if (isEditMode) {
      loadEventData();
    }
  }, [userId, router, isEditMode, loadEventData, fetchCategories]);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.category_id === selectedCategory);
      setSubcategories(category?.subcategories || []);
      setValue("subcategory", ""); // Reset subcategory when category changes
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories, setValue]);

  // Form Submission
  const onSubmit = async (data: BasicInfoFormData) => {
    if (!userId) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    // Validate images for create mode
    if (!isEditMode) {
      if (!mainImage) {
        toast.error("Please upload a main event image");
        return;
      }
      if (!bannerImage) {
        toast.error("Please upload a banner image");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Required fields
      formData.append('user_id', userId.toString());
      formData.append('event_title', data.title);
      formData.append('event_slug', generateEventSlug(data.title));
      formData.append('category_id', data.category);
      
      // Optional subcategory
      formData.append('subcategory_id', data.subcategory?.trim() || '');
      
      // Extra data as JSON string
      formData.append('extra_data', prepareExtraData(data));
      
      // Hashtags as JSON string
      formData.append('hash_tags', prepareHashtags(data.tags || ""));
      
      // Images - only append if new files are selected
      if (mainImage) {
        formData.append('card_image', mainImage);
      }
      
      if (bannerImage) {
        formData.append('banner_image', bannerImage);
      }
      
      // Extra images (gallery images) - only append new files
      const newGalleryImages = galleryImages.filter(img => img.file !== null);
      newGalleryImages.forEach((galleryImage) => {
        if (galleryImage.file) {
          formData.append('extra_images', galleryImage.file);
        }
      });

      let response;
      
      if (isEditMode && eventId) {
        // Update existing event
        response = await axiosInstance.patch(`/api/v1/events/${eventId}/update-with-images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.status === 200) {
          toast.success("Event updated successfully! Proceeding to dates and pricing.");
          const newSlotId = response.data.data.slot_id;
          router.push(`/Events/DatesPricing?slot_id=${newSlotId}&event_id=${eventId}`);
        } else {
          toast.error(response.data.message || "Failed to update event");
        }
      } else {
        // Create new event
        response = await axiosInstance.post('/api/v1/events/create-with-images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.status === 201) {
          const newEventId = response.data.data.event_id;
          const newSlotId = response.data.data.slot_id;
          
          toast.success("Event created successfully! Proceeding to dates and pricing.");
          router.push(`/Events/DatesPricing?slot_id=${newSlotId}&event_id=${newEventId}`);
        } else {
          toast.error(response.data.message || "Failed to create event");
        }
      }
    } catch (error: any) {
      console.error("Error processing event:", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if user is not authenticated yet
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div className="h-1 w-8 sm:w-16 bg-gray-300 rounded"></div>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold text-sm">
              2
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 px-4">
            {isEditMode ? 'Edit Event: Basic Information' : 'Step 1: Basic Event Information'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base px-4 max-w-2xl mx-auto">
            {isEditMode 
              ? 'Update your event details - modify the information that helps people discover and understand your event'
              : 'Tell us about your event - the details that will help people discover and understand what you\'re offering'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Form Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                      Please fix the following errors:
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field} className="flex items-center">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2 flex-shrink-0"></span>
                          <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>: {error?.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto space-y-8">
            {/* Core Information Section */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  Core Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Event Title - spans 2 columns on xl screens */}
                  <div className="xl:col-span-2 space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Event Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Summer Music Festival 2024"
                      {...register("title")}
                      className={cn(
                        "h-12 border-2 transition-all duration-200",
                        errors.title 
                          ? "border-red-300 focus:border-red-500" 
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                      )}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Category *</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={cn(
                            "h-12 border-2 transition-all duration-200",
                            errors.category 
                              ? "border-red-300 focus:border-red-500" 
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          )}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.category_id} value={category.category_id}>
                                {category.category_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Venue Address - spans 2 columns */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Venue Address *
                    </Label>
                    <Input
                      id="address"
                      placeholder="e.g., 123 Main Street, New York, NY 10001"
                      {...register("address")}
                      className={cn(
                        "h-12 border-2 transition-all duration-200",
                        errors.address 
                          ? "border-red-300 focus:border-red-500" 
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                      )}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Subcategory */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Subcategory</Label>
                    <Controller
                      name="subcategory"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={subcategories.length === 0}
                        >
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-all duration-200">
                            <SelectValue placeholder={
                              subcategories.length === 0 
                                ? "Select category first" 
                                : "Select subcategory (optional)"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategories.map((subcategory) => (
                              <SelectItem key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                                {subcategory.subcategory_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Details & Specifications Section */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  Event Details & Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Event Description - spans full width */}
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Event Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event in detail. What can attendees expect? What makes it special?"
                      rows={6}
                      {...register("description")}
                      className={cn(
                        "border-2 transition-all duration-200 resize-none",
                        errors.description 
                          ? "border-red-300 focus:border-red-500" 
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                      )}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Organizer Information */}
                  <div className="space-y-2">
                    <Label htmlFor="organizer" className="text-sm font-medium text-gray-700">
                      Event Organizer Details *
                    </Label>
                    <Textarea
                      id="organizer"
                      placeholder="Organization name, contact person, phone number, email, website, social media handles, etc."
                      rows={4}
                      {...register("organizer")}
                      className={cn(
                        "border-2 transition-all duration-200 resize-none",
                        errors.organizer 
                          ? "border-red-300 focus:border-red-500" 
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                      )}
                    />
                    {errors.organizer && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.organizer.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Include organization name, contact details, and any relevant information about the organizer
                    </p>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">
                      Additional Information
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any other important details: dress code, special instructions, etc."
                      rows={4}
                      {...register("additionalInfo")}
                      className="border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Event Specifications Grid */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                      <TagIcon className="h-5 w-5 text-emerald-600" />
                      Event Specifications
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                      {/* Duration */}
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                          Duration / Runtime
                        </Label>
                        <Input
                          id="duration"
                          placeholder="e.g., 2h 30min"
                          {...register("duration")}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500">How long does the event last?</p>
                      </div>

                      {/* Language */}
                      <div className="space-y-2">
                        <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                          Language
                        </Label>
                        <Input
                          id="language"
                          placeholder="e.g., English, Hindi"
                          {...register("language")}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500">Primary language(s)</p>
                      </div>

                      {/* Age Restriction */}
                      <div className="space-y-2">
                        <Label htmlFor="ageRestriction" className="text-sm font-medium text-gray-700">
                          Age Restriction
                        </Label>
                        <Input
                          id="ageRestriction"
                          placeholder="e.g., All Ages, 18+"
                          {...register("ageRestriction")}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500">Who can attend?</p>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                            Tags / Keywords
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Separate tags with commas. Example: music, festival, outdoor</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="tags"
                          placeholder="e.g., music, festival, outdoor"
                          {...register("tags")}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500">Comma-separated keywords to help people find your event</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Images & Media Section */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                  Event Images & Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {/* Card Image (Main Event Image) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        Card Image {!isEditMode ? '*' : ''}
                      </Label>
                      <span className="text-xs text-gray-500">
                        {isEditMode ? 'Optional • Max 5MB' : 'Required • Max 5MB'}
                      </span>
                    </div>
                    
                    {mainImagePreview ? (
                      <div className="relative group">
                        <div className="relative h-48 w-full rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={mainImagePreview}
                            alt="Card image"
                            fill
                            className="object-cover"
                          />
                          {isEditMode && !mainImage && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                              Current Image
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={removeMainImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {isEditMode && !mainImage && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-black/50 text-white px-2 py-1 rounded text-xs text-center">
                              Upload a new image to replace this one
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors group">
                        <input
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES}
                          onChange={handleMainImageChange}
                          className="hidden"
                          id="main-image-upload"
                          aria-describedby="main-image-help"
                        />
                        <label htmlFor="main-image-upload" className="cursor-pointer block">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4 group-hover:text-gray-500 transition-colors" />
                          <p className="text-sm text-gray-600 mb-2 group-hover:text-gray-700 transition-colors">
                            Upload card image
                          </p>
                          <p id="main-image-help" className="text-xs text-gray-500">
                            Square/Portrait format • Recommended: 400x600px
                          </p>
                        </label>
                      </div>
                    )}

                    {/* Card Image Tip */}
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Card Image Tip:</p>
                      <p className="text-xs text-gray-400">This image appears on event cards and listings. Use portrait or square format for best results.</p>
                    </div>
                  </div>

                  {/* Banner Image - spans 2 columns on xl */}
                  <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        Banner Image {!isEditMode ? '*' : ''}
                      </Label>
                      <span className="text-xs text-gray-500">
                        {isEditMode ? 'Optional • Max 5MB' : 'Required • Max 5MB'}
                      </span>
                    </div>
                    
                    {bannerImagePreview ? (
                      <div className="relative group">
                        <div className="relative h-40 w-full rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={bannerImagePreview}
                            alt="Banner image"
                            fill
                            className="object-cover"
                          />
                          {isEditMode && !bannerImage && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                              Current Image
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={removeBannerImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {isEditMode && !bannerImage && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-black/50 text-white px-2 py-1 rounded text-xs text-center">
                              Upload a new image to replace this one
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors group">
                        <input
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES}
                          onChange={handleBannerImageChange}
                          className="hidden"
                          id="banner-image-upload"
                          aria-describedby="banner-image-help"
                        />
                        <label htmlFor="banner-image-upload" className="cursor-pointer block">
                          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4 group-hover:text-gray-500 transition-colors" />
                          <p className="text-lg text-gray-600 mb-2 group-hover:text-gray-700 transition-colors">
                            Click to upload banner image
                          </p>
                          <p id="banner-image-help" className="text-sm text-gray-500">
                            Wide format • Recommended: 1920x540px or 1200x400px
                          </p>
                        </label>
                      </div>
                    )}

                    {/* Banner Image Tip */}
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Banner Image Tip:</p>
                      <p className="text-xs text-gray-400">This wide image appears at the top of your event page. Use landscape format with 16:9 or 3:1 aspect ratio.</p>
                    </div>
                  </div>

                  {/* Gallery Images - spans full width */}
                  <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium text-gray-700">
                        Gallery Images ({galleryImages.length}/{MAX_GALLERY_IMAGES})
                      </Label>
                      <span className="text-sm text-gray-500">Optional • Max 5MB each</span>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {galleryImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <div className="relative h-24 w-full rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={image.preview}
                              alt={`Gallery image ${image.isExisting ? '(existing)' : '(new)'}`}
                              fill
                              className="object-cover"
                            />
                            {image.isExisting && (
                              <div className="absolute top-1 left-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-medium">
                                Current
                              </div>
                            )}
                            {!image.isExisting && (
                              <div className="absolute top-1 left-1 bg-green-500 text-white px-1 py-0.5 rounded text-xs font-medium">
                                New
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(image.id)}
                            aria-label={`Remove ${image.isExisting ? 'existing' : 'new'} gallery image`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      {/* Add Gallery Image Button */}
                      {galleryImages.length < MAX_GALLERY_IMAGES && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors group">
                          <input
                            type="file"
                            accept={ACCEPTED_IMAGE_TYPES}
                            multiple
                            onChange={handleGalleryImageChange}
                            className="hidden"
                            id="gallery-images-upload"
                            aria-describedby="gallery-help"
                          />
                          <label htmlFor="gallery-images-upload" className="cursor-pointer block">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:text-gray-500 transition-colors" />
                            <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Add Images</p>
                            <p id="gallery-help" className="text-xs text-gray-500">
                              {MAX_GALLERY_IMAGES - galleryImages.length} more • Multiple files OK
                            </p>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Empty State */}
                    {galleryImages.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg text-gray-600 mb-2">No gallery images uploaded yet</p>
                        <p className="text-sm text-gray-500 mb-4">Upload images to showcase your event (optional)</p>
                        <input
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES}
                          multiple
                          onChange={handleGalleryImageChange}
                          className="hidden"
                          id="gallery-images-upload-empty"
                          aria-describedby="gallery-empty-help"
                        />
                        <label htmlFor="gallery-images-upload-empty">
                          <Button type="button" variant="outline" className="cursor-pointer hover:bg-gray-50">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Gallery Images
                          </Button>
                        </label>
                        <p id="gallery-empty-help" className="text-xs text-gray-400 mt-2">
                          You can upload up to {MAX_GALLERY_IMAGES} images • JPEG, PNG, WebP • Max 5MB each
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/Dashboard')}
              disabled={isSubmitting}
              className="px-8 py-3 h-12 border-2 hover:scale-105 transition-transform disabled:hover:scale-100 disabled:opacity-50"
              aria-label="Cancel and return to dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            {isLoadingEventData ? (
              <Button
                disabled
                className="px-8 py-3 h-12 bg-gray-400 text-white border-0"
              >
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Event Data...
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || isLoadingCategories}
                className="px-8 py-3 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 hover:scale-105 transition-transform disabled:hover:scale-100 disabled:opacity-50"
                aria-label={isEditMode ? "Update event and continue to dates and pricing" : "Create event and continue to dates and pricing"}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditMode ? 'Update & Continue' : 'Save & Continue'}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            )}
          </div>

          {/* Form Progress Indicator */}
          {isSubmitting && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {isEditMode ? 'Updating your event...' : 'Creating your event...'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please don't close this page while we process your request.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BasicInfoPage;