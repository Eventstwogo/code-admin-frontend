"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axiosInstance from "@/lib/axiosInstance";
import useStore from "@/lib/Zustand";
import { toast } from "sonner";
import Image from "next/image";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  category_id: string;
  category_name: string;
  category_slug: string;
  category_img_thumbnail: string;
}

interface Subcategory {
  id: string;
  subcategory_id: string;
  subcategory_name: string;
  subcategory_slug: string;
  subcategory_img_thumbnail: string;
}

interface Organizer {
  user_id: string;
  username: string;
  profile_picture: string | null;
}

interface ExtraData {
  address?: string;
  duration?: string;
  language?: string;
  organizer?: string;
  description?: string;
  additionalInfo?: string;
  ageRestriction?: string;
}

interface Event {
  event_id: string;
  event_title: string;
  event_slug: string;
  category: Category | null;
  subcategory: Subcategory | null;
  organizer: Organizer | null;
  card_image: string | null;
  banner_image: string | null;
  event_extra_images: string[] | null;
  extra_data: ExtraData | null;
  hash_tags: string[] | null;
  event_status: boolean;
  created_at: string;
  updated_at: string;
}

const CreateEventPage = () => {
  const router = useRouter();
  const { userId, isAuthenticated } = useStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch events - memoized to prevent re-creation
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/v1/events', {
        timeout: 10000, // 10 second timeout
      });
      
      console.log("📡 Full API Response:", response);
      console.log("📊 Response Data:", response.data);
      console.log("📈 Response Status:", response.status);
      
      if (response.data.statusCode === 200) {
        const eventsData = response.data.data.events || [];
        console.log("✅ Events loaded successfully:", eventsData.length);
        console.log("📋 First event:", eventsData[0]);
        setEvents(eventsData);
        toast.success(`Loaded ${eventsData.length} events successfully!`);
      } else {
        console.log("❌ API Error:", response.data.message);
        toast.error(response.data.message || "Failed to fetch events");
        setEvents([]);
      }
    } catch (error: any) {
      console.error("💥 Error fetching events:", error);
      console.log("🔍 Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      });
      
      if (error.response?.status === 404) {
        console.log("🔍 Endpoint not found, showing empty state");
        toast.error("Events endpoint not found. Please check the API.");
        setEvents([]);
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please check your connection.");
      } else if (error.response?.status === 401) {
        toast.error("Authentication required. Please log in again.");
        // router.push('/');
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(`API Error: ${error.message}`);
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
      // Search filter using debounced term
      const matchesSearch = debouncedSearchTerm === "" || 
        event.event_title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        event.extra_data?.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        event.organizer?.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "true" && event.event_status) ||
        (statusFilter === "false" && !event.event_status);

      // Category filter
      const matchesCategory = categoryFilter === "all" || 
        event.category?.category_slug === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [events, debouncedSearchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    // Temporarily bypass auth check for debugging
    console.log("🔍 Auth check:", { isAuthenticated, userId });
    
    if (!isAuthenticated || !userId) {
      console.log("❌ Not authenticated, but continuing for debug...");
      // toast.error("Please log in to view events");
      // router.push('/');
      // return;
    }
    
    // Always try to fetch events for debugging
    fetchEvents();
  }, [userId, isAuthenticated, router, fetchEvents]);

 console.log(filteredEvents)

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
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="false">Active</SelectItem>
                  <SelectItem value="true">Inactive</SelectItem>
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

        {/* Events Table */}
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
        ) : filteredEvents.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? "No events match your current filters. Try adjusting your search criteria."
                  : events.length === 0 
                    ? "You haven't created any events yet. Create your first event to get started!"
                    : "No events match your current filters. Try adjusting your search criteria."
                }
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
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Event Details</TableHead>
                    <TableHead className="w-32">Category</TableHead>
                    <TableHead className="w-32">Organizer</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Created</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.event_id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Event Image */}
                      <TableCell className="p-4">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-200">
                          {event.card_image ? (
                            <Image
                              src={event.card_image}
                              alt={event.event_title}
                              fill
                              sizes="48px"
                              className="object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Calendar className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Event Details */}
                      <TableCell className="p-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-800 line-clamp-1">
                            {event.event_title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            {event.extra_data?.address && (
                              <>
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="line-clamp-1">{event.extra_data.address}</span>
                              </>
                            )}
                          </div>
                          {event.extra_data?.duration && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.extra_data.duration}
                            </div>
                          )}
                          {/* Hashtags */}
                          {event.hash_tags && event.hash_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {event.hash_tags.slice(0, 2).map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {event.hash_tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{event.hash_tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="p-4">
                        {event.category && (
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {event.category.category_name}
                            </Badge>
                            {event.subcategory && (
                              <div className="text-xs text-gray-500">
                                {event.subcategory.subcategory_name}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Organizer */}
                      <TableCell className="p-4">
                        {event.organizer && (
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 line-clamp-1">
                              {event.organizer.username}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="p-4">
                        <Badge variant={event.event_status ? "default" : "secondary"}>
                          {event.event_status ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="p-4">
                        <div className="text-sm text-gray-600">
                          {new Date(event.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/events/${event.event_slug}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/Events/BasicInfo?edit=${event.event_id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvent(event.event_id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateEventPage;