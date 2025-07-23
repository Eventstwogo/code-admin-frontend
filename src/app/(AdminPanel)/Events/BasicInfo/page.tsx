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
  ArrowRight
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
    .min(3, "Organizer details must be at least 3 characters"),
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
  file: File;
  preview: string;
}

const BasicInfoPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useStore();

  

  const eventId = searchParams.get('event_id');

  const isEditMode = Boolean(eventId);
  
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
console.log(isEditMode)
  // Load existing event data when in edit mode
  const loadEventData = useCallback(async () => {
    if (!isEditMode || !eventId) return;

    try {
      console.log('Loading event data for ID:', eventId);
      const response = await axiosInstance.get(`/api/v1/events/${eventId}`);
      const eventData = response.data.data;
console.log('Response data:', response.data);
      console.log('Loaded event data:', eventData);

      // Set form values
      setValue('title', eventData.event_title || '');
      setValue('address', eventData.extra_data.address || '');
      setValue('category', eventData.category.category_id || '');
      setValue('description', eventData.extra_data.description || '');
      setValue('organizer', eventData.extra_data.oragnizer || '');
      setValue('duration', eventData.extra_data.duration || '');
      setValue('language', eventData.extra_data.language || '');
      setValue('ageRestriction', eventData.extra_data.ageRestriction || '');
      setValue('additionalInfo', eventData.extra_data.additionalInfo || '');
      
      

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
        const galleryPreviews = eventData.event_extra_images.map((img: any, index: number) => ({
          id: Date.now() + index,
          file: null, // We can't recreate the File object
          preview: img
        }));
        setGalleryImages(galleryPreviews);
      }
      setValue('subcategory', eventData.subcategory?.subcategory_id || '');
      toast.success("Event data loaded successfully");
    } catch (error) {
      console.error("Error loading event data:", error);
      toast.error("Failed to load event data");
    }
  }, [isEditMode, eventId, setValue]);

  // Check authentication and fetch categories on component mount
  useEffect(() => {
    // if (!userId) {
    //   toast.error("Please log in to create events");
    //   router.push('/');
    //   return;
    // }

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/categories/list");
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
    
    // Load event data if in edit mode
    if (isEditMode) {
      loadEventData();
    }
  }, [userId, router, isEditMode, loadEventData]);

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

  // Image handling functions
  const handleMainImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setMainImage(file);
      const reader = new FileReader();
      reader.onload = () => setMainImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleBannerImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setBannerImage(file);
      const reader = new FileReader();
      reader.onload = () => setBannerImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGalleryImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (galleryImages.length + files.length > 5) {
      toast.error("Maximum 5 gallery images allowed");
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newImage: GalleryImage = {
          id: Date.now().toString() + Math.random(),
          file,
          preview: reader.result as string
        };
        setGalleryImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  }, [galleryImages.length]);

  const removeGalleryImage = useCallback((id: string) => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview("");
  };

  const removeBannerImage = () => {
    setBannerImage(null);
    setBannerImagePreview("");
  };

  // Utility function to generate event slug
  const generateEventSlug = (title: string): string => {
    return slugify(title, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g 
    });
  };

  // Utility function to prepare extra_data JSON
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

  // Utility function to prepare hashtags JSON
  const prepareHashtags = (tags: string) => {
    if (!tags || tags.trim() === "") return JSON.stringify([]);
    
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    
    return JSON.stringify(tagArray);
  };

  // Form submission
  const onSubmit = async (data: BasicInfoFormData) => {
    if (!userId) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    // In create mode, images are required. In edit mode, they're optional
    if (!isEditMode) {
      if (!mainImage) {
        toast.error("Please upload a main event image");
        return;
      }

      if (!bannerImage) {
        toast.error("Please upload a banner image");
        return;
      }
    } else {
      // In edit mode, only validate if user is trying to upload new images
      // If no new images are uploaded, we'll keep the existing ones
      console.log('Edit mode: Images are optional');
      console.log('Main image file:', mainImage ? 'New file selected' : 'Using existing image');
      console.log('Banner image file:', bannerImage ? 'New file selected' : 'Using existing image');
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData for the API
      const formData = new FormData();
      
      // Required fields
      formData.append('user_id', userId.toString());
      formData.append('event_title', data.title);
      formData.append('event_slug', generateEventSlug(data.title));
      formData.append('category_id', data.category);
      
      // Optional subcategory
      if (data.subcategory && data.subcategory.trim() !== "") {
        formData.append('subcategory_id', data.subcategory);
      } else {
        formData.append('subcategory_id', '');
      }
      
      // Extra data as JSON string
      formData.append('extra_data', prepareExtraData(data));
      
      // Hashtags as JSON string
      formData.append('hash_tags', prepareHashtags(data.tags || ""));
      
      // Images - only append if new files are selected
      if (mainImage) {
        formData.append('card_image', mainImage);
        console.log('Appending new main image');
      } else if (isEditMode) {
        console.log('No new main image - keeping existing');
      }
      
      if (bannerImage) {
        formData.append('banner_image', bannerImage);
        console.log('Appending new banner image');
      } else if (isEditMode) {
        console.log('No new banner image - keeping existing');
      }
      
      // Extra images (gallery images) - only append new files
      const newGalleryImages = galleryImages.filter(img => img.file !== null);
      if (newGalleryImages.length > 0) {
        newGalleryImages.forEach((galleryImage, index) => {
          formData.append('extra_images', galleryImage.file);
        });
        console.log(`Appending ${newGalleryImages.length} new gallery images`);
      } else if (isEditMode) {
        console.log('No new gallery images - keeping existing');
      }

      let response;
      
      if (isEditMode && eventId) {
        // Update existing event
        response = await axiosInstance.patch(`/api/v1/events/${eventId}/update-with-images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Update response:', response);
        
        if (response.status === 200) {
          console.log('Event updated successfully!');
          toast.success("Event updated successfully! Proceeding to dates and pricing.");
            const newSlotId = response.data.data.slot_id; // Get slot_id from API response
          
          // Use existing slot_id for edit mode
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
        
        console.log('Create response:', response);
        
        if (response.status === 201) {
          // Get event ID and slot_id from API response
          const newEventId = response.data.data.event_id;
          const newSlotId = response.data.data.slot_id; // Get slot_id from API response
          
          console.log('Event created successfully!');
          console.log('Event ID:', newEventId);
          console.log('Slot ID:', newSlotId);
          
          toast.success("Event created successfully! Proceeding to dates and pricing.");
          
          // Pass slot_id via URL query parameter
          router.push(`/Events/DatesPricing?slot_id=${newSlotId}&event_id=${newEventId}`);
        } else {
          toast.error(response.data.message || "Failed to create event");
        }
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error("Failed to create event. Please try again.");
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div className="h-1 w-16 bg-gray-300 rounded"></div>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold text-sm">
              2
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isEditMode ? 'Edit Event: Basic Information' : 'Step 1: Basic Event Information'}
          </h1>
          <p className="text-gray-600">
            {isEditMode 
              ? 'Update your event details - modify the information that helps people discover and understand your event'
              : 'Tell us about your event - the details that will help people discover and understand what you\'re offering'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                      Organizer Name *
                    </Label>
                    <Textarea
                      id="organizer"
                      placeholder="Who is organizing this event? Include contact details, organization name, website, etc."
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
                        <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                          Tags / Keywords
                        </Label>
                        <Input
                          id="tags"
                          placeholder="e.g., music, festival"
                          {...register("tags")}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500">Comma-separated tags</p>
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
                  {/* Main Event Image - spans 2 columns on xl */}
                  <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        Main Event Image {!isEditMode ? '*' : ''}
                      </Label>
                      <span className="text-xs text-gray-500">
                        {isEditMode ? 'Optional • Max 5MB' : 'Required • Max 5MB'}
                      </span>
                    </div>
                    
                    {mainImagePreview ? (
                      <div className="relative group">
                        <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={mainImagePreview}
                            alt="Main event image"
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="hidden"
                          id="main-image-upload"
                        />
                        <label htmlFor="main-image-upload" className="cursor-pointer">
                          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg text-gray-600 mb-2">Click to upload main event image</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Banner Image */}
                  <div className="space-y-4">
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
                        <div className="relative h-32 w-full rounded-lg overflow-hidden border-2 border-gray-200">
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerImageChange}
                          className="hidden"
                          id="banner-image-upload"
                        />
                        <label htmlFor="banner-image-upload" className="cursor-pointer">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-sm text-gray-600 mb-2">Upload banner image</p>
                          <p className="text-xs text-gray-500">Wide format recommended</p>
                        </label>
                      </div>
                    )}

                    {/* Additional upload area for banner if needed */}
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-xs text-gray-500 mb-2">Banner Tip:</p>
                      <p className="text-xs text-gray-400">Use 1920x1080 or similar wide aspect ratio for best results</p>
                    </div>
                  </div>

                  {/* Gallery Images - spans full width */}
                  <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium text-gray-700">
                        Gallery Images ({galleryImages.length}/5)
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
                              alt="Gallery image"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      {/* Add Gallery Image Button */}
                      {galleryImages.length < 5 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryImageChange}
                            className="hidden"
                            id="gallery-images-upload"
                          />
                          <label htmlFor="gallery-images-upload" className="cursor-pointer">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">Add Images</p>
                            <p className="text-xs text-gray-500">
                              {5 - galleryImages.length} more
                            </p>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Empty State */}
                    {galleryImages.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg text-gray-600 mb-2">No gallery images uploaded yet</p>
                        <p className="text-sm text-gray-500 mb-4">Upload images to showcase your event</p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryImageChange}
                          className="hidden"
                          id="gallery-images-upload-empty"
                        />
                        <label htmlFor="gallery-images-upload-empty">
                          <Button type="button" variant="outline" className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Gallery Images
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Section */}
          <div className="flex justify-center gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/Dashboard')}
              className="px-8 py-3 h-12 border-2 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 hover:scale-105 transition-transform"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save & Continue
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicInfoPage;