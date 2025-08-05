"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Tag,
  Users,
  DollarSign,
  Globe,
  UserCheck,
  Image as ImageIcon,
  Edit,
  Eye} from "lucide-react";

// Event data interface - matching the actual API response
interface EventData {
  event_id: string;
  event_title: string;
  event_slug: string;
  start_date: string;
  end_date: string;
  location: string | null;
  is_online: boolean;
  slot_id: string;
  category: {
    category_id: string;
    category_name: string;
    category_slug: string;
    category_img_thumbnail: string;
  };
  subcategory: {
    subcategory_id: string;
    subcategory_name: string;
    subcategory_slug: string;
    subcategory_img_thumbnail: string;
  };
  organizer: {
    user_id: string;
    username: string;
    profile_picture: string | null;
  };
  slots: {
    slot_id: string;
    slot_data: {
      [date: string]: {
        [slotKey: string]: {
          price: number;
          capacity: number;
          duration: number;
          end_time: string;
          start_time: string;
        };
      };
    };
    slot_status: boolean;
    created_at: string;
    updated_at: string;
  }[];
  card_image: string;
  banner_image: string;
  event_extra_images: string[] | null;
  extra_data: {
    address: string;
    duration: string;
    language: string;
    organizer: string;
    description: string;
    additionalInfo: string;
    ageRestriction: string;
  };
  hash_tags: string[];
}

const EventViewPage = () => {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Load event data
  const loadEventData = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const eventResponse = await axiosInstance.get(`/api/v1/events/${eventId}`);
      const event = eventResponse.data.data;
      setEventData(event);
    } catch (error) {
      console.error("Error loading event data:", error);
      toast.error("Failed to load event details");
      router.push('/Events');
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  const handleEditEvent = () => {
    if (eventData) {
      router.push(`/Events/BasicInfo?event_id=${eventData.event_id}&slot_id=${eventData.slot_id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // const formatCurrency = (amount: number, currency: string = 'USD') => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: currency
  //   }).format(amount);
  // };

  // Get all available images
  const getAllImages = () => {
    const images = [];
    if (eventData?.card_image) images.push({ src: eventData.card_image, type: 'Card Image' });
    if (eventData?.banner_image) images.push({ src: eventData.banner_image, type: 'Banner Image' });
    if (eventData?.event_extra_images) {
      eventData.event_extra_images.forEach((img, index) => {
        images.push({ src: img, type: `Gallery Image ${index + 1}` });
      });
    }
    return images;
  };

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="animate-pulse space-y-6 lg:space-y-8">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-8 sm:h-10 w-24 sm:w-32 bg-gray-200 rounded"></div>
              <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-200 rounded"></div>
            </div>
            
            {/* Main content skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                <div className="h-48 sm:h-64 bg-gray-200 rounded-lg"></div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-4 sm:h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="h-32 sm:h-48 bg-gray-200 rounded"></div>
                <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
            <p className="text-gray-600 mb-6">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Button onClick={() => router.push('/Events')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <Button
              onClick={() => router.push('/Events')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Back to Events</span>
              <span className="xs:hidden">Back</span>
            </Button>
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Event Details</h1>
              <p className="text-sm sm:text-base text-gray-600">View and manage event information</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleEditEvent}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden xs:inline">Edit Event</span>
              <span className="xs:hidden">Edit</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Event Header */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4 lg:space-y-6">
                  {/* Title and Basic Info */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex flex-col gap-4">
                      <div className="space-y-3">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight break-words">
                          {eventData.event_title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Badge variant="default" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                            {eventData.category.category_name}
                          </Badge>
                          {eventData.subcategory && (
                            <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                              {eventData.subcategory.subcategory_name}
                            </Badge>
                          )}
                          {eventData.is_online && (
                            <Badge variant="secondary" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                              <Globe className="h-3 w-3 mr-1" />
                              Online Event
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date and Time Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-700">Start Date</p>
                          <p className="text-sm sm:text-base text-gray-900 font-semibold break-words">{formatDate(eventData.start_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-700">End Date</p>
                          <p className="text-sm sm:text-base text-gray-900 font-semibold break-words">{formatDate(eventData.end_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images Gallery */}
            {allImages.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Event Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Main Image Display */}
                  <div className="relative h-48 sm:h-64 lg:h-80 w-full rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                    <Image
                      src={allImages[activeImageIndex]?.src || allImages[0].src}
                      alt={allImages[activeImageIndex]?.type || "Event image"}
                      fill
                      className="object-cover transition-all duration-300"
                      priority
                    />
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
                      {allImages[activeImageIndex]?.type || allImages[0].type}
                    </div>
                  </div>

                  {/* Image Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
                            activeImageIndex === index 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={image.src}
                            alt={image.type}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {eventData.extra_data.description && (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl font-bold">Description</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="prose max-w-none">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                      {eventData.extra_data.description}
                    </p>
                  </div>
                  
                  {eventData.extra_data.additionalInfo && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Additional Information</h4>
                      <p className="text-sm sm:text-base text-blue-800 whitespace-pre-wrap break-words">
                        {eventData.extra_data.additionalInfo}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dates & Pricing */}
            {eventData.slots && eventData.slots.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Dates & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {eventData.slots.map((slotInfo, slotIndex) => (
                    <div key={slotInfo.slot_id} className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <h4 className="font-semibold text-gray-800 text-base sm:text-lg">
                          Slot {slotIndex + 1}
                        </h4>
                        <Badge variant={!slotInfo.slot_status ? "default" : "destructive"} className="px-2 sm:px-3 py-1 text-xs sm:text-sm w-fit">
                          {!slotInfo.slot_status ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      {Object.entries(slotInfo.slot_data).map(([date, slots]) => (
                        <Card key={date} className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-white">
                          <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-green-800">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="break-words">{formatDate(date)}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 sm:p-4">
                            <div className="grid gap-3 sm:gap-4">
                              {Object.entries(slots).map(([slotKey, slot]) => (
                                <div key={slotKey} className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Time</p>
                                        <p className="font-semibold text-gray-800 text-sm break-words">
                                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Duration</p>
                                        <p className="font-semibold text-gray-800 text-sm">{slot.duration} min</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Capacity</p>
                                        <p className="font-semibold text-gray-800 text-sm">{slot.capacity} seats</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Price</p>
                                        <p className="font-bold text-green-600 text-base sm:text-lg">${slot.price}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Slot metadata */}
                      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border">
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
                          <span className="break-words">Created: {formatDate(slotInfo.created_at)}</span>
                          <span className="break-words">Updated: {formatDate(slotInfo.updated_at)}</span>
                          <span className="break-all">Slot ID: {slotInfo.slot_id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Event Details Card */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-bold">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm sm:text-base text-gray-900 break-words">
                      {eventData.location || eventData.extra_data.address || (eventData.is_online ? 'Online Event' : 'Location not specified')}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-2 sm:gap-3">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Organizer</p>
                    <p className="text-sm sm:text-base text-gray-900 font-semibold break-words">{eventData?.extra_data?.organizer||'Not Disclosed'}</p>
                  </div>
                </div>

               

                {eventData.extra_data.language && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Language</p>
                        <p className="text-sm sm:text-base text-gray-900 break-words">{eventData.extra_data.language}</p>
                      </div>
                    </div>
                  </>
                )}

                {eventData.extra_data.ageRestriction && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 sm:gap-3">
                      <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Age Restriction</p>
                        <p className="text-sm sm:text-base text-gray-900 break-words">{eventData.extra_data.ageRestriction}</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex items-start gap-2 sm:gap-3">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Event Type</p>
                    <p className="text-sm sm:text-base text-gray-900">
                      {eventData.is_online ? 'Online Event' : 'Physical Event'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {eventData.hash_tags && eventData.hash_tags.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="w-full">
                    <div className="flex flex-wrap gap-2 w-full max-w-full break-words">
                      {eventData.hash_tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm whitespace-normal break-words inline-block max-w-full"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-bold text-blue-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm sm:text-base text-blue-700 min-w-0 flex-1">Total Slots</span>
                  <Badge variant="secondary" className="text-xs sm:text-sm flex-shrink-0">{eventData.slots?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm sm:text-base text-blue-700 min-w-0 flex-1">Active Slots</span>
                  <Badge variant="default" className="text-xs sm:text-sm flex-shrink-0">
                    {eventData.slots?.filter(slot => !slot.slot_status).length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm sm:text-base text-blue-700 min-w-0 flex-1">Event ID</span>
                  <Badge variant="outline" className="font-mono text-xs break-all flex-shrink-0">
                    {eventData.event_id.slice(-8)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventViewPage;