"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { createColumns, Event } from "./columns";
import axiosInstance from "@/lib/axiosInstance";
import useStore from "@/lib/Zustand";
import { toast } from "sonner";
import Image from "next/image";
import {
  Plus,
  Search,
  Calendar,
  RefreshCw,
  X,
  Clock,
  MapPin,
  User,
  Tag,
  Users,
  DollarSign,
  Globe,
  Star,
  UserCheck,
  Clock3,
  Image as ImageIcon,
  Edit,
  Eye
} from "lucide-react";



// Event view modal interfaces - matching the actual API response
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



const CreateEventPage = () => {
  const router = useRouter();
  const { userId, isAuthenticated } = useStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);



  // Fetch events - memoized to prevent re-creation
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/v1/events/', {
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data.statusCode === 200) {
        const eventsData = response.data.data.events || [];
        setEvents(eventsData);
        toast.success(`Loaded ${eventsData.length} events successfully!`);
      } else {
        toast.error(response.data.message || "Failed to fetch events");
        setEvents([]);
      }
    } catch (error: any) {
      console.error("Error fetching events:", error);
      
      if (error.response?.status === 404) {
        toast.error("Events endpoint not found. Please check the API.");
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please check your connection.");
      }  else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Failed to fetch events. Please try again.");
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Delete event - memoized to prevent re-creation
  const handleDeleteEvent = useCallback(async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await axiosInstance.delete(`/api/v1/events/${eventId}`);
      toast.success("Event deleted successfully");
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  }, [fetchEvents]);

  // View event modal functions
  const handleViewEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    setViewModalOpen(true);
    loadEventData(eventId);
  }, []);

  const loadEventData = async (eventId: string) => {
    if (!eventId) return;

    setModalLoading(true);
    try {
      // Load event data with slots included
      const eventResponse = await axiosInstance.get(`/api/v1/events/${eventId}`);
      const event = eventResponse.data.data;
      setEventData(event);
    } catch (error) {
      console.error("Error loading event data:", error);
      toast.error("Failed to load event details");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditFromModal = () => {
    if (eventData) {
      router.push(`/Events/BasicInfo?event_id=${eventData.event_id}&slot_id=${eventData.slot_id}`);
      setViewModalOpen(false);
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get unique categories - memoized for performance
  const uniqueCategories = useMemo(() => {
    const categories = events
      .map(event => event.category)
      .filter(category => category != null); // Filter out null categories
    return categories.filter((category, index, self) => 
      index === self.findIndex(c => c.category_id === category.category_id)
    );
  }, [events]);

  // Filter events - memoized for performance
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Status filter
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "true" && event.event_status) ||
        (statusFilter === "false" && !event.event_status);

      // Category filter
      const matchesCategory = categoryFilter === "all" || 
        event.category?.category_slug === categoryFilter;

      return matchesStatus && matchesCategory;
    });
  }, [events, statusFilter, categoryFilter]);

  // Create columns with delete and view handlers
  const columns = useMemo(() => createColumns(handleDeleteEvent, handleViewEvent), [handleDeleteEvent, handleViewEvent]);

  useEffect(() => {
   
    
    fetchEvents();
  }, [userId, isAuthenticated, router, fetchEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
      

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Events Management</h1>
            <p className="text-gray-600">Create, manage, and track your events</p>
            {!loading && (
              <p className="text-sm text-gray-500 mt-1">
                {filteredEvents.length} of {events.length} events
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={fetchEvents}
              variant="outline"
              className="px-4 py-2"
              disabled={loading}
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {loading ? "Loading..." : "Refresh"}
            </Button>
            <Button
              onClick={() => router.push('/Events/BasicInfo')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Event
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category.category_id} value={category.category_slug}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events DataTable */}
        {loading ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredEvents.length === 0 && events.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
              <p className="text-gray-500 mb-6">
                You haven't created any events yet. Create your first event to get started!
              </p>
              <Button
                onClick={() => router.push('/Events/BasicInfo')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <DataTable 
                columns={columns} 
                data={filteredEvents} 
                searchKey="event_title"
                searchPlaceholder="Search events..."
              />
            </CardContent>
          </Card>
        )}

        {/* Event View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-7xl max-h-[95vh] w-[95vw] p-0 overflow-hidden">
            <DialogHeader className="p-4 sm:p-6 pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  Event Details
                </DialogTitle>
                <div className="flex items-center gap-2">
                  {eventData && (
                    <Button 
                      onClick={handleEditFromModal}
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit Event</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  )}
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(95vh-80px)]">
              <div className="p-4 sm:p-6 pt-0">
                {modalLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading event details...</p>
                    </div>
                  </div>
                ) : eventData ? (
                  <div className="space-y-6">
                    {/* Event Header */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{eventData.event_title}</h1>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Start: {formatDate(eventData.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>End: {formatDate(eventData.end_date)}</span>
                            </div>
                            {eventData.is_online && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Online Event
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant="secondary" className="w-fit">
                            {eventData.category.category_name}
                          </Badge>
                          <Badge variant="outline" className="w-fit">
                            {eventData.subcategory?.subcategory_name}
                          </Badge>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        {eventData.slots && eventData.slots.length > 0 && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Calendar className="h-3 w-3 mr-1" />
                            {eventData.slots.length} Slot{eventData.slots.length > 1 ? 's' : ''} Available
                          </Badge>
                        )}
                        {eventData.slots && eventData.slots.some(slot => slot.slot_status) && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Star className="h-3 w-3 mr-1" />
                            Active Slots
                          </Badge>
                        )}
                        {eventData.location && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <MapPin className="h-3 w-3 mr-1" />
                            Physical Location
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Images Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* Main Image */}
                      <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" />
                          Event Images
                        </h3>
                        
                        {/* Main Display Image */}
                        <div className="relative h-48 sm:h-64 w-full rounded-lg overflow-hidden border-2 border-gray-200">
                          {(eventData.card_image || eventData.banner_image || (eventData.event_extra_images && eventData.event_extra_images.length > 0)) ? (
                            <Image
                              src={activeImageIndex === 0 ? eventData.card_image : 
                                    activeImageIndex === 1 ? eventData.banner_image :
                                    eventData.event_extra_images?.[activeImageIndex - 2] || eventData.card_image}
                              alt="Event image"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100">
                              <ImageIcon className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Image Thumbnails */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {/* Card Image Thumbnail */}
                          <button
                            onClick={() => setActiveImageIndex(0)}
                            className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                              activeImageIndex === 0 ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          >
                            <Image
                              src={eventData.card_image}
                              alt="Card image"
                              fill
                              className="object-cover"
                            />
                          </button>

                          {/* Banner Image Thumbnail */}
                          <button
                            onClick={() => setActiveImageIndex(1)}
                            className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                              activeImageIndex === 1 ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          >
                            <Image
                              src={eventData.banner_image}
                              alt="Banner image"
                              fill
                              className="object-cover"
                            />
                          </button>

                          {/* Extra Images Thumbnails */}
                          {eventData.event_extra_images && eventData.event_extra_images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveImageIndex(index + 2)}
                              className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                                activeImageIndex === index + 2 ? 'border-blue-500' : 'border-gray-200'
                              }`}
                            >
                              <Image
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Event Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-gray-600">
                                  {eventData.location || eventData.extra_data.address || (eventData.is_online ? 'Online Event' : 'Location not specified')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Organizer</p>
                                <p className="text-sm text-gray-600">{eventData.organizer.username}</p>
                              </div>
                            </div>

                            {eventData.extra_data.duration && (
                              <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">Duration</p>
                                  <p className="text-sm text-gray-600">{eventData.extra_data.duration}</p>
                                </div>
                              </div>
                            )}

                            {eventData.extra_data.language && (
                              <div className="flex items-start gap-2">
                                <Globe className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">Language</p>
                                  <p className="text-sm text-gray-600">{eventData.extra_data.language}</p>
                                </div>
                              </div>
                            )}

                            {eventData.extra_data.ageRestriction && (
                              <div className="flex items-start gap-2">
                                <UserCheck className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">Age Restriction</p>
                                  <p className="text-sm text-gray-600">{eventData.extra_data.ageRestriction}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Event Type</p>
                                <p className="text-sm text-gray-600">
                                  {eventData.is_online ? 'Online Event' : 'Physical Event'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Tags */}
                        {eventData.hash_tags && eventData.hash_tags.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Tags
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {eventData.hash_tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    {eventData.extra_data.description && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Description</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{eventData.extra_data.description}</p>
                        </div>
                        
                        {eventData.extra_data.additionalInfo && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Additional Information</h4>
                            <div className="bg-blue-50 rounded-lg p-4">
                              <p className="text-gray-700 whitespace-pre-wrap">{eventData.extra_data.additionalInfo}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dates & Pricing */}
                    {eventData.slots && eventData.slots.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Dates & Pricing
                          </h3>
                          
                          <div className="grid gap-4">
                            {eventData.slots.map((slotInfo, slotIndex) => (
                              <div key={slotInfo.slot_id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-800">
                                    Slot {slotIndex + 1} - {slotInfo.slot_id}
                                  </h4>
                                  <Badge variant={slotInfo.slot_status ? "default" : "secondary"}>
                                    {slotInfo.slot_status ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                
                                {Object.entries(slotInfo.slot_data).map(([date, slots]) => (
                                  <Card key={date} className="border-l-4 border-l-blue-500">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-base flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(date)}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid gap-3">
                                        {Object.entries(slots).map(([slotKey, slot]) => (
                                          <div key={slotKey} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                                              <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span className="font-semibold text-gray-800">
                                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Badge variant="outline" className="text-xs">
                                                  {slot.duration} minutes
                                                </Badge>
                                              </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                              <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-purple-600" />
                                                <span className="font-medium">{slot.capacity} seats</span>
                                              </div>
                                              <div className="flex items-center gap-2 text-lg font-bold">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                                <span className="text-green-600">
                                                  ${slot.price}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                                
                                {/* Slot metadata */}
                                <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                                  <div className="flex flex-wrap gap-4">
                                    <span>Created: {formatDate(slotInfo.created_at)}</span>
                                    <span>Updated: {formatDate(slotInfo.updated_at)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Failed to load event details</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreateEventPage;