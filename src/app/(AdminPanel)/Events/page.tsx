"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";

import { createColumns, Event } from "./columns";
import axiosInstance from "@/lib/axiosInstance";
import useStore from "@/lib/Zustand";
import { toast } from "sonner";
import {
  Plus,
  Calendar,
  RefreshCw
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";



const CreateEventPage = () => {
  const router = useRouter();
  const { userId, isAuthenticated } = useStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFeaturedDialog, setShowFeaturedDialog] = useState(false);
  const [selectedEventForFeatured, setSelectedEventForFeatured] = useState<{
    eventId: string;
    currentStatus: boolean;
  } | null>(null);
  




  // Fetch events - memoized to prevent re-creation
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/v1/events', {
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

  // Handle featured toggle
  const handleFeaturedToggle = useCallback((eventId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      // If not currently featured, show payment dialog
      setSelectedEventForFeatured({ eventId, currentStatus });
      setShowFeaturedDialog(true);
    } else {
      // If currently featured, directly remove from featured
      handleFeaturedUpdate(eventId, false);
    }
  }, []);

  // Handle featured update
  const handleFeaturedUpdate = async (eventId: string, isFeatured: boolean) => {
    try {
      await axiosInstance.patch(`/api/v1/featured-events/featured/${eventId}`, {
        featured_event: isFeatured
      });
      
      if (isFeatured) {
        toast.success("Event added to featured list successfully!");
      } else {
        toast.success("Event removed from featured list successfully!");
      }
      
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast.error("Failed to update featured status");
    }
  };

  // Handle coupons redirect
  const handleCreateCoupons = useCallback((eventId: string) => {
    router.push(`/Coupons?eventId=${eventId}`);
  }, [router]);

  // Handle status toggle
  const handleStatusToggle = useCallback(async (eventId: string, currentStatus: "ACTIVE" | "INACTIVE" | "PENDING") => {
    if (currentStatus === "PENDING") return; // Should not happen, but safety check
    
    try {
      // Toggle between ACTIVE (false) and INACTIVE (true)
      const newStatus = currentStatus === "ACTIVE" ? 'INACTIVE' : 'ACTIVE'; // true = INACTIVE, false = ACTIVE
      
        const formData = new FormData();
    formData.append("event_status", newStatus);

    await axiosInstance.patch(`/api/v1/events/status/${eventId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
      
      const statusText = newStatus=='INACTIVE'? "INACTIVE" : "ACTIVE";
      toast.success(`Event status updated to ${statusText} successfully!`);
      
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error updating event status:", error);
      toast.error("Failed to update event status");
    }
  }, [fetchEvents]);

  // Handle create slots redirect
  const handleCreateSlots = useCallback((eventId: string) => {
    router.push(`/Events/DatesPricing?slot_id=${eventId.slot_id}&event_id=${eventId.event_id}`);
  }, [router]);




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
        (statusFilter === "ACTIVE" && event.event_status === "ACTIVE") ||
        (statusFilter === "INACTIVE" && event.event_status === "INACTIVE") ||
        (statusFilter === "PENDING" && event.event_status === "PENDING");

      // Category filter
      const matchesCategory = categoryFilter === "all" || 
        event.category?.category_slug === categoryFilter;

      return matchesStatus && matchesCategory;
    });
  }, [events, statusFilter, categoryFilter]);

  // Create columns with handlers
  const columns = useMemo(() => createColumns(
    handleDeleteEvent,
    handleFeaturedToggle,
    handleCreateCoupons,
    handleStatusToggle,
    handleCreateSlots
  ), [handleDeleteEvent, handleFeaturedToggle, handleCreateCoupons, handleStatusToggle, handleCreateSlots]);

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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
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
                You haven&apos;t created any events yet. Create your first event to get started!
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

        {/* Featured Payment Dialog */}
        <AlertDialog open={showFeaturedDialog} onOpenChange={setShowFeaturedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add to Featured List</AlertDialogTitle>
              <AlertDialogDescription>
                To add this event to the featured list, you need to pay $50.00. 
                This will make your event more visible to users and increase bookings.
                Do you want to proceed with the payment?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowFeaturedDialog(false);
                setSelectedEventForFeatured(null);
              }}>
                No, Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (selectedEventForFeatured) {
                  handleFeaturedUpdate(selectedEventForFeatured.eventId, true);
                  setShowFeaturedDialog(false);
                  setSelectedEventForFeatured(null);
                }
              }}>
                Yes, Pay $50.00
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};

export default CreateEventPage;