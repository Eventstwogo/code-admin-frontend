// "use client";

// import React, { useEffect, useState,useCallback } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { 
//   ArrowLeft, 
//   X, 
//   Calendar,
//   DollarSign,
//   Sparkles,
//   Plus
// } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import axiosInstance from "@/lib/axiosInstance";
// import useStore from "@/lib/Zustand";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";

// interface TimeSlot {
//   id: string;
//   startTime: string;
//   endTime: string;
//   price: number;
//   ticketCount: number;
//   duration: number; // Duration in minutes for this specific slot
// }

// interface EventDate {
//   id: string;
//   date: string;
//   timeSlots: TimeSlot[];
// }

// interface Step2Data {
//   eventDates: EventDate[];
//   currency: string;
//   isPublic: boolean;
//   isFeatured: boolean;
//   allowWaitlist: boolean;
//   requireApproval: boolean;
// }

// const CreateEventDatesPricing = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { userId } = useStore();
//   const [eventDates, setEventDates] = useState<EventDate[]>([]);
//   const [currency, setCurrency] = useState("AUD");
//   const [isPublic, setIsPublic] = useState(true);
//   const [isFeatured, setIsFeatured] = useState(false);
//   const [allowWaitlist, setAllowWaitlist] = useState(true);
//   const [requireApproval, setRequireApproval] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   // Get slot_id and event_id from URL parameters
//   const slotId = searchParams.get('slot_id');
//   const eventId = searchParams.get('event_id');
  
//   // Default duration for new time slots
//   const [defaultDuration, setDefaultDuration] = useState<number>(120); // Default 2 hours in minutes

//   // Load existing slot data when in edit mode
//   const loadSlotData = useCallback(async () => {
//     if (!slotId) return;

//     try {
//       console.log('Loading slot data for ID:', slotId);
//       const response = await axiosInstance.get(`/api/v1/slots/get/${slotId}`);
//       const slotData = response.data.data;

//       console.log('Loaded slot data:', slotData);

//       // Transform API slot data back to component format
//       if (slotData.slot_data) {
//         const transformedDates: EventDate[] = [];
        
//         Object.entries(slotData.slot_data).forEach(([date, slots]: [string, any]) => {
//           const timeSlots: TimeSlot[] = [];
          
//           Object.entries(slots).forEach(([slotKey, slotInfo]: [string, any]) => {
//             timeSlots.push({
//               id: Date.now() + Math.random(),
//               startTime: slotInfo.start_time,
//               endTime: slotInfo.end_time,
//               duration: slotInfo.duration,
//               ticketCount: slotInfo.capacity,
//               price: slotInfo.price
//             });
//           });

//           transformedDates.push({
//             id: Date.now() + Math.random(),
//             date: date,
//             timeSlots: timeSlots
//           });
//         });

//         setEventDates(transformedDates);
//         toast.success("Existing slot data loaded successfully");
//       }
//     } catch (error) {
//       console.error("Error loading slot data:", error);
//       // Don't show error toast as this might be a new event without slots yet
//       console.log("No existing slot data found, starting fresh");
//     }
//   }, [slotId]);

//   // Validate URL parameters on component mount
//   useEffect(() => {
//     if (!slotId || !eventId) {
//       toast.error("Missing slot ID or event ID. Please complete Step 1 first.");
//       router.push('/Events/BasicInfo');
//       return;
//     }
    
//     console.log('DatesPricing loaded with:');
//     console.log('Event ID:', eventId);
//     console.log('Slot ID:', slotId);

//     // Load existing slot data if available
//     loadSlotData();
//   }, [slotId, eventId, router, loadSlotData]);
  
//   // Date range selection
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
  
//   // Event details for API

//   const [isOnlineEvent, setIsOnlineEvent] = useState(false);
  
//   // Bulk time slot creation
//   const [showBulkSlots, setShowBulkSlots] = useState(false);
//   const [bulkStartTime, setBulkStartTime] = useState("");
//   const [bulkDuration, setBulkDuration] = useState<number>(120); // Default 2 hours
//   const [bulkPrice, setBulkPrice] = useState("");
//   const [bulkTickets, setBulkTickets] = useState("");
//   const [selectedDatesForBulk, setSelectedDatesForBulk] = useState<string[]>([]);

//   // Parse duration string to minutes
  



//   // Calculate end time based on start time and duration
//   const calculateEndTime = (startTime: string, durationMinutes: number): string => {
//     if (!startTime) return "";
    
//     const [hours, minutes] = startTime.split(':').map(Number);
//     const startDate = new Date();
//     startDate.setHours(hours, minutes, 0, 0);
    
//     const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
//     return endDate.toTimeString().slice(0, 5); // Format as HH:MM
//   };

//   // Check if basic info exists and optionally load duration as default


//   // Generate dates between start and end date
//   const generateDateRange = async () => {
//     if (!startDate || !endDate) {
//       toast.error("Please select both start and end dates");
//       return;
//     }

//     if (new Date(startDate) > new Date(endDate)) {
//       toast.error("Start date cannot be after end date");
//       return;
//     }

//     if (!eventId || !userId) {
//       toast.error("Missing required information (Event ID or User ID)");
//       return;
//     }

//     const dates: EventDate[] = [];
//     const currentDate = new Date(startDate);
//     const lastDate = new Date(endDate);

//     while (currentDate <= lastDate) {
//       const dateString = currentDate.toISOString().split('T')[0];
      
//       // Check if date already exists
//       const existingDate = eventDates.find(ed => ed.date === dateString);
//       if (!existingDate) {
//         dates.push({
//           id: Date.now().toString() + Math.random(),
//           date: dateString,
//           timeSlots: []
//         });
//       }
      
//       currentDate.setDate(currentDate.getDate() + 1);
//     }

//     if (dates.length === 0) {
//       toast.error("All selected dates already exist");
//       return;
//     }

//     try {
//       // Call the API to update event details
//       const formData = new FormData();
//       formData.append('user_id', userId);
//       formData.append('start_date', startDate);
//       formData.append('end_date', endDate);
      
//       // Add location if provided
  
      
//       // Add is_online boolean
//       formData.append('is_online', isOnlineEvent.toString());

//       const response = await axiosInstance.patch(
//         `/api/v1/events/${eventId}/update-event-details`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//           },
//         }
//       );

//       if (response.data.statusCode === 200) {
//         // Update local state only after successful API call
//         setEventDates(prev => [...prev, ...dates]);
//         setStartDate("");
//         setEndDate("");
//         toast.success(`Added ${dates.length} date(s) and updated event details successfully!`);
//       } else {
//         toast.error(response.data.message || "Failed to update event details");
//       }
//     } catch (error: any) {
//       console.error("Error updating event details:", error);
//       if (error.response?.status === 404) {
//         toast.error("Event not found");
//       } else if (error.response?.status === 401) {
//         toast.error("Authentication required");
//       } else if (error.response?.status === 403) {
//         toast.error("You don't have permission to update this event");
//       } else {
//         toast.error("Failed to update event details. Please try again.");
//       }
//     }
//   };

//   // Add single date
//   const addSingleDate = () => {
//     const newDate: EventDate = {
//       id: Date.now().toString(),
//       date: "",
//       timeSlots: []
//     };
//     setEventDates(prev => [...prev, newDate]);
//   };

//   // Remove date
//   const removeEventDate = (dateId: string) => {
//     setEventDates(prev => prev.filter(date => date.id !== dateId));
//     setSelectedDatesForBulk(prev => prev.filter(id => id !== dateId));
//   };

//   // Update date
//   const updateEventDate = (dateId: string, newDate: string) => {
//     setEventDates(prev => prev.map(date => 
//       date.id === dateId ? { ...date, date: newDate } : date
//     ));
//   };

//   // Add time slot to a date
//   const addTimeSlot = (dateId: string) => {
//     const newTimeSlot: TimeSlot = {
//       id: Date.now().toString(),
//       startTime: "",
//       endTime: "",
//       price: 0,
//       ticketCount: 100,
//       duration: defaultDuration
//     };
//     setEventDates(prev => prev.map(date => 
//       date.id === dateId 
//         ? { ...date, timeSlots: [...date.timeSlots, newTimeSlot] }
//         : date
//     ));
//   };

//   // Remove time slot
//   const removeTimeSlot = (dateId: string, slotId: string) => {
//     setEventDates(prev => prev.map(date => 
//       date.id === dateId 
//         ? { ...date, timeSlots: date.timeSlots.filter(slot => slot.id !== slotId) }
//         : date
//     ));
//   };

//   // Update time slot
//   const updateTimeSlot = (dateId: string, slotId: string, field: keyof TimeSlot, value: string | number) => {
//     setEventDates(prev => prev.map(date => 
//       date.id === dateId 
//         ? {
//             ...date, 
//             timeSlots: date.timeSlots.map(slot => {
//               if (slot.id === slotId) {
//                 const updatedSlot = { ...slot, [field]: value };
                
//                 // Auto-calculate end time when start time or duration changes
//                 if (field === 'startTime' && typeof value === 'string') {
//                   updatedSlot.endTime = calculateEndTime(value, slot.duration);
//                 } else if (field === 'duration' && typeof value === 'number') {
//                   if (slot.startTime) {
//                     updatedSlot.endTime = calculateEndTime(slot.startTime, value);
//                   }
//                 }
                
//                 return updatedSlot;
//               }
//               return slot;
//             })
//           }
//         : date
//     ));
//   };

//   // Bulk add time slots to selected dates
//   const addBulkTimeSlots = () => {
//     if (!bulkStartTime || !bulkPrice || !bulkTickets) {
//       toast.error("Please fill in all bulk slot details");
//       return;
//     }

//     if (selectedDatesForBulk.length === 0) {
//       toast.error("Please select at least one date");
//       return;
//     }

//     const calculatedEndTime = calculateEndTime(bulkStartTime, bulkDuration);

//     const newTimeSlot: Omit<TimeSlot, 'id'> = {
//       startTime: bulkStartTime,
//       endTime: calculatedEndTime,
//       price: parseFloat(bulkPrice),
//       ticketCount: parseInt(bulkTickets),
//       duration: bulkDuration
//     };

//     setEventDates(prev => prev.map(date => 
//       selectedDatesForBulk.includes(date.id)
//         ? {
//             ...date,
//             timeSlots: [...date.timeSlots, { ...newTimeSlot, id: Date.now().toString() + Math.random() }]
//           }
//         : date
//     ));

//     // Reset bulk form
//     setBulkStartTime("");
//     setBulkDuration(120);
//     setBulkPrice("");
//     setBulkTickets("");
//     setSelectedDatesForBulk([]);
//     setShowBulkSlots(false);
    
//     toast.success(`Added time slot to ${selectedDatesForBulk.length} date(s)`);
//   };

//   // Toggle date selection for bulk operations
//   const toggleDateForBulk = (dateId: string) => {
//     setSelectedDatesForBulk(prev => 
//       prev.includes(dateId) 
//         ? prev.filter(id => id !== dateId)
//         : [...prev, dateId]
//     );
//   };





//   // Transform event dates to the required API format
//   const transformEventDatesToApiFormat = () => {
//     if (!slotId) {
//       throw new Error('Slot ID is required');
//     }

//     const slotData: Record<string, Record<string, any>> = {};
    
//     eventDates.forEach(eventDate => {
//       if (eventDate.date && eventDate.timeSlots.length > 0) {
//         const dateSlots: Record<string, any> = {};
        
//         eventDate.timeSlots.forEach((slot, index) => {
//           const slotKey = `slot_${index + 1}`;
//           dateSlots[slotKey] = {
//             start_time: slot.startTime,
//             end_time: slot.endTime,
//             duration: slot.duration,
//             capacity: slot.ticketCount,
//             price: parseFloat(slot.price.toString())
//           };
//         });
        
//         slotData[eventDate.date] = dateSlots;
//       }
//     });
    
//     return {
//       slot_id: slotId, // Use slot_id from URL parameter
//       slot_data: slotData
//     };
//   };

//   // Handle form submission
//   const handleSubmit = async () => {
//     if (eventDates.length === 0) {
//       toast.error("Please add at least one event date");
//       return;
//     }

//     const hasEmptyDates = eventDates.some(date => !date.date);
//     if (hasEmptyDates) {
//       toast.error("Please fill in all event dates");
//       return;
//     }

//     const hasEmptySlots = eventDates.some(date => 
//       date.timeSlots.some(slot => !slot.startTime || slot.price <= 0 || slot.ticketCount <= 0)
//     );
//     if (hasEmptySlots) {
//       toast.error("Please fill in all time slots with valid start time, price, and ticket count");
//       return;
//     }

//     // Ensure all slots have valid end times (auto-calculated)
//     eventDates.forEach(date => {
//       date.timeSlots.forEach(slot => {
//         if (slot.startTime && !slot.endTime) {
//           slot.endTime = calculateEndTime(slot.startTime, slot.duration);
//         }
//       });
//     });

//     setIsSubmitting(true);

//     try {
//       // Validate that we have the required slot_id
//       if (!slotId) {
//         toast.error("Missing slot ID. Please complete Step 1 first.");
//         return;
//       }

//       // Transform event dates to the required API format
//       const apiSlotData = transformEventDatesToApiFormat();

//       // Prepare the JSON payload - only slot data and settings
//       const jsonPayload = {
//         // Slot data in the required format
//         slot_id: apiSlotData.slot_id,
//         slot_data: apiSlotData.slot_data,
        
  
//         currency,
//         isPublic,
//         isFeatured,
//         allowWaitlist,
//         requireApproval
//       };

//       // Debug: Log the payload
//       console.log('Slot data payload being sent:', jsonPayload);
//       console.log('Using Slot ID from URL:', slotId);
//       console.log('Event ID:', eventId);

//       // Check if we're updating existing slots or creating new ones
//       let response;
      
//       try {
//         // First try to get existing slot data to determine if we should update or create
//         await axiosInstance.get(`/api/v1/slots/get/${slotId}`);
        
//         // If we get here, slots exist, so update them
//         response = await axiosInstance.put(`/api/v1/slots/update/${slotId}`, jsonPayload, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
        
//         console.log('Slots updated successfully');
//       } catch (getError) {
//         // If getting slots fails, they don't exist yet, so create them
//         response = await axiosInstance.post("/api/v1/slots/create", jsonPayload, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
        
//         console.log('Slots created successfully');
//       }

//       if (response.status === 201 || response.status === 200) {
//         const isUpdate = response.status === 200;
//         toast.success(isUpdate ? "Event slots updated successfully!" : "Event slots created successfully!");
        
//         // Clear localStorage
//         localStorage.removeItem('eventBasicInfo');
//         localStorage.removeItem('eventFiles');
        
//         // Redirect to events list or success page
//         router.push("/Events");
//       }
//     } catch (error: any) {
//       console.error("Error creating event:", error);
//       toast.error(error.response?.data?.message || "Failed to create event");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const goBackToBasicInfo = () => {
//     router.push('/Events/BasicInfo');
//   };

//   // Preview the API data structure (for debugging)
//   const previewApiData = () => {
//     if (!slotId) {
//       toast.error("No slot ID found in URL. Please complete Step 1 first.");
//       return;
//     }

//     try {
//       const apiSlotData = transformEventDatesToApiFormat();

//       const jsonPayload = {
//         // Slot data in the required format
//         slot_id: apiSlotData.slot_id,
//         slot_data: apiSlotData.slot_data,
        
//         // Additional settings
//         currency,
//         isPublic,
//         isFeatured,
//         allowWaitlist,
//         requireApproval
//       };

//       console.log("=== URL PARAMETERS ===");
//       console.log("Event ID from URL:", eventId);
//       console.log("Slot ID from URL:", slotId);
      
//       console.log("=== SLOT DATA PAYLOAD ===");
//       console.log("Slot Data Payload:", JSON.stringify(jsonPayload, null, 2));
      
//       toast.success("Slot data payload logged to console - check browser console");
//     } catch (error) {
//       console.error("Error generating preview:", error);
//       toast.error("Error generating preview. Please check console.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-4 mb-4">
//             <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
//               ✓
//             </div>
//             <div className="h-1 w-16 bg-green-500 rounded"></div>
//             <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
//               2
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">
//             {eventDates.length > 0 ? 'Edit Event: Dates, Times & Pricing' : 'Step 2: Dates, Times & Pricing'}
//           </h1>
//           <p className="text-gray-600 mb-4">
//             {eventDates.length > 0 
//               ? 'Update your event schedule and pricing - modify dates, times, and ticket prices'
//               : 'Configure when your event will happen and set pricing for different time slots'
//             }
//           </p>
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
//             <Calendar className="h-4 w-4 text-blue-600" />
//             <span className="text-sm text-blue-700">
//               Set individual duration for each time slot - end times will be calculated automatically
//             </span>
//           </div>
//         </div>

//         <div className="max-w-4xl mx-auto space-y-6">
//           {/* Date Range Selector */}
//           <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
//             <CardHeader className="pb-4">
//               <CardTitle className="flex items-center gap-3 text-xl">
//                 <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
//                   <Calendar className="h-4 w-4 text-white" />
//                 </div>
//                 Add Event Dates
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium text-gray-700">Start Date</Label>
//                   <Input
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                     className="h-12 border-2 border-gray-200 focus:border-purple-500"
//                     min={new Date().toISOString().split('T')[0]}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium text-gray-700">End Date</Label>
//                   <Input
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                     className="h-12 border-2 border-gray-200 focus:border-purple-500"
//                     min={startDate || new Date().toISOString().split('T')[0]}
//                   />
//                 </div>
//                 <Button
//                   type="button"
//                   onClick={generateDateRange}
//                   className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                 >
//                   Add Date Range
//                 </Button>
//               </div>
              
//               {/* Event Details Section */}
//               <div className="border-t pt-4 mt-4">
//                 <h3 className="text-lg font-medium text-gray-800 mb-4">Event Details (Optional)</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* <div className="space-y-2">
//                     <Label className="text-sm font-medium text-gray-700">Event Location</Label>
//                     <Input
//                       type="text"
//                       placeholder="Enter event location (e.g., Conference Hall A, 123 Main St)"
//                       value={eventLocation}
//                       onChange={(e) => setEventLocation(e.target.value)}
//                       className="h-11 border-2 border-gray-200 focus:border-purple-500"
//                     />
//                     <p className="text-xs text-gray-500">
//                       Leave empty if location will be provided later
//                     </p>
//                   </div> */}
                  
//                   <div className="space-y-2">
//                     <Label className="text-sm font-medium text-gray-700">Event Type</Label>
//                     <div className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg">
//                       <div>
//                         <p className="font-medium text-gray-800">Online Event</p>
//                         <p className="text-sm text-gray-500">
//                           {isOnlineEvent ? "This event will be held online" : "This event will be held in-person"}
//                         </p>
//                       </div>
//                       <Switch
//                         checked={isOnlineEvent}
//                         onCheckedChange={setIsOnlineEvent}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="text-center">
//                 <div className="text-sm text-gray-500 mb-2">OR</div>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={addSingleDate}
//                   className="border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50"
//                 >
//                   + Add Single Date
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Bulk Time Slot Creator */}
//           {eventDates.length > 0 && (
//             <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
//               <CardHeader className="pb-4">
//                 <CardTitle className="flex items-center justify-between">
//                   <div className="flex items-center gap-3 text-xl">
//                     <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
//                       <Sparkles className="h-4 w-4 text-white" />
//                     </div>
//                     Quick Time Slot Creator
//                   </div>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setShowBulkSlots(!showBulkSlots)}
//                     className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
//                   >
//                     {showBulkSlots ? "Hide" : "Show"} Quick Creator
//                   </Button>
//                 </CardTitle>
//               </CardHeader>
//               {showBulkSlots && (
//                 <CardContent className="space-y-6">
//                   <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
//                     <h3 className="text-sm font-medium text-emerald-800 mb-2">💡 Quick Tip</h3>
//                     <p className="text-sm text-emerald-700">
//                       Use this to add the same time slot to multiple dates at once. Perfect for recurring events!
//                     </p>
//                   </div>

//                   {/* Common Time Presets */}
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <h3 className="text-sm font-medium text-blue-800 mb-3">⚡ Quick Time Presets</h3>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                       {[
//                         { label: "Morning", time: "09:00" },
//                         { label: "Afternoon", time: "14:00" },
//                         { label: "Evening", time: "18:00" },
//                         { label: "Night", time: "20:00" }
//                       ].map((preset) => (
//                         <Button
//                           key={preset.time}
//                           type="button"
//                           variant="outline"
//                           size="sm"
//                           onClick={() => setBulkStartTime(preset.time)}
//                           className="text-xs bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
//                         >
//                           {preset.label}<br/>{preset.time}
//                         </Button>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     {/* Time Slot Details */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-medium text-gray-800">Time Slot Details</h3>
                      
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                           <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Time</Label>
//                           <Input
//                             type="time"
//                             value={bulkStartTime}
//                             onChange={(e) => setBulkStartTime(e.target.value)}
//                             className="h-11 border-2 border-gray-200 focus:border-emerald-500"
//                           />
//                         </div>
//                         <div>
//                           <Label className="text-sm font-medium text-gray-700 mb-2 block">Duration</Label>
//                           <Select
//                             value={bulkDuration.toString()}
//                             onValueChange={(value) => setBulkDuration(parseInt(value))}
//                           >
//                             <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-emerald-500">
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="30">30 min</SelectItem>
//                               <SelectItem value="60">1 hour</SelectItem>
//                               <SelectItem value="90">1.5 hours</SelectItem>
//                               <SelectItem value="120">2 hours</SelectItem>
//                               <SelectItem value="150">2.5 hours</SelectItem>
//                               <SelectItem value="180">3 hours</SelectItem>
//                               <SelectItem value="240">4 hours</SelectItem>
//                               <SelectItem value="300">5 hours</SelectItem>
//                               <SelectItem value="360">6 hours</SelectItem>
//                               <SelectItem value="480">8 hours</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                         <div>
//                           <Label className="text-sm font-medium text-gray-700 mb-2 block">End Time</Label>
//                           <div className="h-11 px-3 py-2 border-2 border-gray-200 rounded-md bg-emerald-50 flex items-center text-sm text-gray-700">
//                             <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
//                             {bulkStartTime ? calculateEndTime(bulkStartTime, bulkDuration) : "--:--"}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <Label className="text-sm font-medium text-gray-700 mb-2 block">Price ({currency})</Label>
//                           <div className="relative">
//                             <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                             <Input
//                               type="number"
//                               min="0"
//                               step="0.01"
//                               value={bulkPrice}
//                               onChange={(e) => setBulkPrice(e.target.value)}
//                               className="h-11 pl-10 border-2 border-gray-200 focus:border-green-500"
//                               placeholder="0.00"
//                             />
//                           </div>
//                         </div>
//                         <div>
//                           <Label className="text-sm font-medium text-gray-700 mb-2 block">Tickets Available</Label>
//                           <Input
//                             type="number"
//                             min="1"
//                             value={bulkTickets}
//                             onChange={(e) => setBulkTickets(e.target.value)}
//                             className="h-11 border-2 border-gray-200 focus:border-purple-500"
//                             placeholder="100"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Date Selection */}
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <h3 className="text-lg font-medium text-gray-800">Select Dates</h3>
//                         <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
//                           {selectedDatesForBulk.length} selected
//                         </span>
//                       </div>
                      
//                       <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
//                         <div className="grid grid-cols-1 gap-1 p-2">
//                           {eventDates.map((date) => (
//                             <div
//                               key={date.id}
//                               className={cn(
//                                 "flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-200",
//                                 selectedDatesForBulk.includes(date.id)
//                                   ? "bg-emerald-100 border-2 border-emerald-300 shadow-sm"
//                                   : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200"
//                               )}
//                               onClick={() => toggleDateForBulk(date.id)}
//                             >
//                               <div className="flex items-center space-x-3">
//                                 <input
//                                   type="checkbox"
//                                   checked={selectedDatesForBulk.includes(date.id)}
//                                   onChange={() => toggleDateForBulk(date.id)}
//                                   className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
//                                 />
//                                 <span className="text-sm font-medium">
//                                   {date.date ? new Date(date.date).toLocaleDateString('en-AU', {
//                                     weekday: 'short',
//                                     month: 'short', 
//                                     day: 'numeric'
//                                   }) : 'No date set'}
//                                 </span>
//                               </div>
//                               <div className="text-xs text-gray-500">
//                                 {date.timeSlots.length} slot(s)
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-3">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => {
//                         setSelectedDatesForBulk([]);
//                         setBulkStartTime("");
//                         setBulkDuration(120);
//                         setBulkPrice("");
//                         setBulkTickets("");
//                       }}
//                       className="flex-1"
//                     >
//                       Clear All
//                     </Button>
//                     <Button
//                       type="button"
//                       onClick={addBulkTimeSlots}
//                       disabled={!bulkStartTime || !bulkPrice || !bulkTickets || selectedDatesForBulk.length === 0}
//                       className="flex-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
//                     >
//                       Add Time Slot to {selectedDatesForBulk.length} Date(s)
//                     </Button>
//                   </div>
//                 </CardContent>
//               )}
//             </Card>
//           )}

//           {/* Event Dates & Time Slots */}
//           <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
//             <CardHeader className="pb-4">
//               <CardTitle className="flex items-center gap-3 text-xl">
//                 <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
//                   <Calendar className="h-4 w-4 text-white" />
//                 </div>
//                 Event Schedule ({eventDates.length} dates)
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {eventDates.map((eventDate, dateIndex) => (
//                 <div key={eventDate.id} className="border-2 border-gray-200 rounded-xl p-6 space-y-4">
//                   <div className="flex items-center gap-4">
//                     <div className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={selectedDatesForBulk.includes(eventDate.id)}
//                         onChange={() => toggleDateForBulk(eventDate.id)}
//                         className="rounded border-gray-300"
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <Label className="text-sm font-medium text-gray-700 mb-2 block">
//                         Event Date {dateIndex + 1}
//                         {eventDate.date && (
//                           <span className="ml-2 text-blue-600 font-semibold">
//                             ({new Date(eventDate.date).toLocaleDateString('en-AU', { 
//                               weekday: 'short', 
//                               month: 'short', 
//                               day: 'numeric' 
//                             })})
//                           </span>
//                         )}
//                       </Label>
//                       <Input
//                         type="date"
//                         value={eventDate.date}
//                         onChange={(e) => updateEventDate(eventDate.id, e.target.value)}
//                         className="h-12 border-2 border-gray-200 focus:border-blue-500"
//                         min={new Date().toISOString().split('T')[0]}
//                       />
//                     </div>
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       size="icon"
//                       onClick={() => removeEventDate(eventDate.id)}
//                       className="mt-6"
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>

//                   {/* Time Slots for this date */}
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <Label className="text-lg font-medium text-gray-700">
//                         Time Slots & Pricing ({eventDate.timeSlots.length} slots)
//                       </Label>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => addTimeSlot(eventDate.id)}
//                         className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
//                       >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add Time Slot
//                       </Button>
//                     </div>

//                     {/* Time Slots Grid */}
//                     {eventDate.timeSlots.length === 0 ? (
//                       <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
//                         <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
//                         <p className="text-gray-600 mb-2">No time slots added yet</p>
//                         <p className="text-sm text-gray-500 mb-4">Add time slots to specify when your event will run</p>
//                         <Button
//                           type="button"
//                           variant="outline"
//                           onClick={() => addTimeSlot(eventDate.id)}
//                           className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
//                         >
//                           <Plus className="h-4 w-4 mr-2" />
//                           Add First Time Slot
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="space-y-3">
//                         {eventDate.timeSlots.map((slot, slotIndex) => (
//                           <div key={slot.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
//                             <div className="flex items-center justify-between mb-3">
//                               <h4 className="text-sm font-medium text-gray-800">
//                                 Slot {slotIndex + 1}
//                               </h4>
//                               <Button
//                                 type="button"
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => removeTimeSlot(eventDate.id, slot.id)}
//                                 className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                               >
//                                 <X className="h-4 w-4" />
//                               </Button>
//                             </div>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//                               <div>
//                                 <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Time</Label>
//                                 <Input
//                                   type="time"
//                                   value={slot.startTime}
//                                   onChange={(e) => updateTimeSlot(eventDate.id, slot.id, 'startTime', e.target.value)}
//                                   className="h-11 text-sm border-2 border-gray-200 focus:border-blue-500"
//                                 />
//                               </div>
                              
//                               <div>
//                                 <Label className="text-sm font-medium text-gray-700 mb-2 block">Duration</Label>
//                                 <Select
//                                   value={slot.duration.toString()}
//                                   onValueChange={(value) => updateTimeSlot(eventDate.id, slot.id, 'duration', parseInt(value))}
//                                 >
//                                   <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-orange-500">
//                                     <SelectValue />
//                                   </SelectTrigger>
//                                   <SelectContent>
//                                     <SelectItem value="30">30 min</SelectItem>
//                                     <SelectItem value="60">1 hour</SelectItem>
//                                     <SelectItem value="90">1.5 hours</SelectItem>
//                                     <SelectItem value="120">2 hours</SelectItem>
//                                     <SelectItem value="150">2.5 hours</SelectItem>
//                                     <SelectItem value="180">3 hours</SelectItem>
//                                     <SelectItem value="240">4 hours</SelectItem>
//                                     <SelectItem value="300">5 hours</SelectItem>
//                                     <SelectItem value="360">6 hours</SelectItem>
//                                     <SelectItem value="480">8 hours</SelectItem>
//                                   </SelectContent>
//                                 </Select>
//                               </div>
                              
//                               <div>
//                                 <Label className="text-sm font-medium text-gray-700 mb-2 block">End Time</Label>
//                                 <div className="h-11 px-3 py-2 border-2 border-gray-200 rounded-md bg-blue-50 flex items-center text-sm text-gray-700">
//                                   <Calendar className="h-4 w-4 mr-2 text-blue-600" />
//                                   {slot.startTime ? slot.endTime : "--:--"}
//                                 </div>
//                               </div>
                              
//                               <div>
//                                 <Label className="text-sm font-medium text-gray-700 mb-2 block">Price ({currency})</Label>
//                                 <div className="relative">
//                                   <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                                   <Input
//                                     type="number"
//                                     min="0"
//                                     step="0.01"
//                                     value={slot.price}
//                                     onChange={(e) => updateTimeSlot(eventDate.id, slot.id, 'price', parseFloat(e.target.value) || 0)}
//                                     className="h-11 text-sm pl-10 border-2 border-gray-200 focus:border-green-500"
//                                     placeholder="0.00"
//                                   />
//                                 </div>
//                               </div>
                              
//                               <div>
//                                 <Label className="text-sm font-medium text-gray-700 mb-2 block">Tickets Available</Label>
//                                 <Input
//                                   type="number"
//                                   min="1"
//                                   value={slot.ticketCount}
//                                   onChange={(e) => updateTimeSlot(eventDate.id, slot.id, 'ticketCount', parseInt(e.target.value) || 1)}
//                                   className="h-11 text-sm border-2 border-gray-200 focus:border-purple-500"
//                                   placeholder="100"
//                                 />
//                               </div>
//                             </div>
                            
//                             {/* Time Slot Summary */}
//                             {slot.startTime && slot.price > 0 && (
//                               <div className="mt-3 p-3 bg-gray-50 rounded-md border">
//                                 <div className="flex items-center justify-between text-sm">
//                                   <span className="text-gray-600">
//                                     <strong>{slot.startTime}</strong> - <strong>{slot.endTime}</strong>
//                                     <span className="text-xs text-gray-500 ml-2">
//                                       ({Math.floor(slot.duration / 60)}h {slot.duration % 60}m)
//                                     </span>
//                                   </span>
//                                   <span className="text-green-600 font-medium">
//                                     {currency} {slot.price} × {slot.ticketCount} tickets
//                                   </span>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {/* Quick Add Multiple Slots */}
//                     {eventDate.timeSlots.length > 0 && eventDate.timeSlots.length < 5 && (
//                       <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50">
//                         <div className="text-center">
//                           <p className="text-sm text-blue-700 mb-2">Need multiple time slots for this day?</p>
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={() => addTimeSlot(eventDate.id)}
//                             className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
//                           >
//                             <Plus className="h-4 w-4 mr-2" />
//                             Add Another Time Slot
//                           </Button>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                     {eventDate.timeSlots.length === 0 && (
//                       <div className="text-center py-4 text-gray-500 text-sm">
//                         No time slots added yet. Click "Add Time Slot" to get started.
//                       </div>
//                     )}
//                   </div>
                
//               ))}

//               {eventDates.length === 0 && (
//                 <div className="text-center py-8 text-gray-500">
//                   No event dates added yet. Use the date selector above to add dates.
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Currency & Settings */}
//           <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
//             <CardHeader className="pb-4">
//               <CardTitle className="flex items-center gap-3 text-xl">
//                 <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
//                   <DollarSign className="h-4 w-4 text-white" />
//                 </div>
//                 Currency & Settings
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium text-gray-700">Currency</Label>
//                   <Select value={currency} onValueChange={setCurrency}>
//                     <SelectTrigger className="h-12">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="AUD">AUD ($)</SelectItem>
//                       <SelectItem value="EUR">EUR (€)</SelectItem>
//                       <SelectItem value="GBP">GBP (£)</SelectItem>
//                       <SelectItem value="INR">INR (₹)</SelectItem>
//                       <SelectItem value="CAD">CAD (C$)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold text-gray-800">Event Settings</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       id="isPublic"
//                       checked={isPublic}
//                       onChange={(e) => setIsPublic(e.target.checked)}
//                       className="rounded border-gray-300"
//                     />
//                     <Label htmlFor="isPublic" className="text-sm">Make event public</Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       id="isFeatured"
//                       checked={isFeatured}
//                       onChange={(e) => setIsFeatured(e.target.checked)}
//                       className="rounded border-gray-300"
//                     />
//                     <Label htmlFor="isFeatured" className="text-sm">Feature this event</Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       id="allowWaitlist"
//                       checked={allowWaitlist}
//                       onChange={(e) => setAllowWaitlist(e.target.checked)}
//                       className="rounded border-gray-300"
//                     />
//                     <Label htmlFor="allowWaitlist" className="text-sm">Allow waitlist when sold out</Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       id="requireApproval"
//                       checked={requireApproval}
//                       onChange={(e) => setRequireApproval(e.target.checked)}
//                       className="rounded border-gray-300"
//                     />
//                     <Label htmlFor="requireApproval" className="text-sm">Require approval for bookings</Label>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Submit Section */}
//           <div className="flex justify-center gap-4 pt-8">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={goBackToBasicInfo}
//               className="px-8 py-3 h-12 border-2 hover:scale-105 transition-transform"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Step 1
//             </Button>
//             {/* Preview API Data Button (for debugging) */}
//             {eventDates.length > 0 && (
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={previewApiData}
//                 className="px-6 py-3 h-12 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:scale-105 transition-transform"
//               >
//                 Preview API Data
//               </Button>
//             )}
//             <Button
//               onClick={handleSubmit}
//               disabled={isSubmitting}
//               className="px-8 py-3 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 hover:scale-105 transition-transform"
//             >
//               {isSubmitting ? (
//                 <div className="flex items-center gap-2">
//                   <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Creating Event...
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <Sparkles className="h-4 w-4" />
//                   Create Event
//                 </div>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateEventDatesPricing;

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  X, 
  Calendar,
  DollarSign,
  Sparkles,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import axiosInstance from "@/lib/axiosInstance";
import useStore from "@/lib/Zustand";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: string;
  ticketCount: string;
  duration: number; // Duration in minutes for this specific slot
}

interface EventDate {
  id: string;
  date: string;
  timeSlots: TimeSlot[];
}

interface Step2Data {
  eventDates: EventDate[];
  currency: string;
  isPublic: boolean;
  isFeatured: boolean;
  allowWaitlist: boolean;
  requireApproval: boolean;
}

const CreateEventDatesPricing = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStore();
  const [eventDates, setEventDates] = useState<EventDate[]>([]);
  const [currency, setCurrency] = useState("AUD");
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [allowWaitlist, setAllowWaitlist] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {userId} = useStore()
  // Get slot_id and event_id from URL parameters
  const slotId = searchParams.get('slot_id');
  const eventId = searchParams.get('event_id');
  
  // Default duration for new time slots
  const [defaultDuration, setDefaultDuration] = useState<number>(120); // Default 2 hours in minutes

  // Load existing slot data when in edit mode
  const loadSlotData = useCallback(async () => {
    if (!slotId) return;

    try {
      console.log('Loading slot data for ID:', slotId);
      const response = await axiosInstance.get(`/api/v1/slots/get/${slotId}`);
      const slotData = response.data.data;

      console.log('Loaded slot data:', slotData);

      // Transform API slot data back to component format
      if (slotData.slot_data) {
        const transformedDates: EventDate[] = [];
        
        Object.entries(slotData.slot_data).forEach(([date, slots]: [string, any]) => {
          const timeSlots: TimeSlot[] = [];
          
          Object.entries(slots).forEach(([slotKey, slotInfo]: [string, any]) => {
            timeSlots.push({
              id: (Date.now() + Math.random()).toString(),
              startTime: slotInfo.start_time,
              endTime: slotInfo.end_time,
              duration: slotInfo.duration,
              ticketCount: slotInfo.capacity,
              price: slotInfo.price
            });
          });

          transformedDates.push({
            id: (Date.now() + Math.random()).toString(),
            date: date,
            timeSlots: timeSlots
          });
        });

        setEventDates(transformedDates);
        toast.success("Existing slot data loaded successfully");
      }
    } catch (error) {
      console.error("Error loading slot data:", error);
      // Don't show error toast as this might be a new event without slots yet
      console.log("No existing slot data found, starting fresh");
    }
  }, [slotId]);

  // Validate URL parameters on component mount
  useEffect(() => {
    if (!slotId || !eventId) {
      toast.error("Missing slot ID or event ID. Please complete Step 1 first.");
      router.push('/Events/BasicInfo');
      return;
    }
    
    console.log('DatesPricing loaded with:');
    console.log('Event ID:', eventId);
    console.log('Slot ID:', slotId);

    // Load existing slot data if available
    loadSlotData();
  }, [slotId, eventId, router, loadSlotData]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Date range selection
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Event details for API
  const [eventLocation, setEventLocation] = useState("");
  const [isOnlineEvent, setIsOnlineEvent] = useState(false);
  
  // Bulk time slot creation
  const [showBulkSlots, setShowBulkSlots] = useState(false);
  const [bulkStartTime, setBulkStartTime] = useState("");
  const [bulkDuration, setBulkDuration] = useState<number>(120); // Default 2 hours
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkTickets, setBulkTickets] = useState("");
  const [selectedDatesForBulk, setSelectedDatesForBulk] = useState<string[]>([]);

  // Debounce timer ref for API calls
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to update event details via API
  const updateEventDetailsAPI = async (startDate?: string, endDate?: string) => {
    if (!eventId || !userId) {
      console.warn("Missing eventId or userId for API call");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      
      if (startDate) formData.append('start_date', startDate);
      if (endDate) formData.append('end_date', endDate);
      
      // Add is_online boolean
      formData.append('is_online', isOnlineEvent.toString());

      const response = await axiosInstance.patch(
        `/api/v1/events/${eventId}/update-event-details`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.statusCode === 200) {
        toast.success("Event details updated successfully!");
        return { success: true };
      } else {
        toast.error(response.data.message || "Failed to update event details");
        return { success: false };
      }
    } catch (error: any) {
      console.error("Error updating event details:", error);
      if (error.response?.status === 404) {
        toast.error("Event not found");
      } else if (error.response?.status === 401) {
        toast.error("Authentication required");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to update this event");
      } else {
        toast.error("Failed to update event details. Please try again.");
      }
      return { success: false };
    }
  };

  // Parse duration string to minutes
  const parseDurationToMinutes = (durationStr: string): number => {
    if (!durationStr) return 120; // Default 2 hours
    
    const str = durationStr.toLowerCase();
    let totalMinutes = 0;
    
    // Extract hours
    const hoursMatch = str.match(/(\d+)\s*h/);
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    
    // Extract minutes
    const minutesMatch = str.match(/(\d+)\s*m/);
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1]);
    }
    
    // If no specific format found, try to extract just numbers and assume minutes
    if (totalMinutes === 0) {
      const numberMatch = str.match(/(\d+)/);
      if (numberMatch) {
        const num = parseInt(numberMatch[1]);
        // If number is less than 10, assume hours, otherwise minutes
        totalMinutes = num < 10 ? num * 60 : num;
      }
    }
    
    return totalMinutes || 120; // Default to 2 hours if parsing fails
  };



  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    if (!startTime) return "";
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    return endDate.toTimeString().slice(0, 5); // Format as HH:MM
  };

  // Check if basic info exists and optionally load duration as default


  // Generate dates between start and end date
  const generateDateRange = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    if (!eventId || !userId) {
      toast.error("Missing required information (Event ID or User ID)");
      return;
    }

    const dates: EventDate[] = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check if date already exists
      const existingDate = eventDates.find(ed => ed.date === dateString);
      if (!existingDate) {
        dates.push({
          id: (Date.now() + Math.random()).toString(),
          date: dateString,
          timeSlots: []
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (dates.length === 0) {
      toast.error("All selected dates already exist");
      return;
    }

    try {
      // Call the API to update event details
      const formData = new FormData();
      formData.append('user_id', userId || '');
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      
      // Add location if provided
  
      
      // Add is_online boolean
      formData.append('is_online', isOnlineEvent.toString());

      const response = await axiosInstance.patch(
        `/api/v1/events/${eventId}/update-event-details`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.statusCode === 200) {
        // Update local state only after successful API call
        setEventDates(prev => [...prev, ...dates]);
        setStartDate("");
        setEndDate("");
        toast.success(`Added ${dates.length} date(s) and updated event details successfully!`);
      } else {
        toast.error(response.data.message || "Failed to update event details");
      }
    } catch (error: any) {
      console.error("Error updating event details:", error);
      if (error.response?.status === 404) {
        toast.error("Event not found");
      } else if (error.response?.status === 401) {
        toast.error("Authentication required");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to update this event");
      } else {
        toast.error("Failed to update event details. Please try again.");
      }
    }
  };

  // Add single date
  const addSingleDate = async () => {
    const newDate: EventDate = {
      id: Date.now().toString(),
      date: "",
      timeSlots: []
    };
    
    // Add the date to local state first
    setEventDates(prev => [...prev, newDate]);
    
    // Call API to update event details (without specific dates since this is just adding an empty date slot)
    await updateEventDetailsAPI();
  };

  // Remove date
  const removeEventDate = (dateId: string) => {
    setEventDates(prev => prev.filter(date => date.id !== dateId));
    setSelectedDatesForBulk(prev => prev.filter(id => id !== dateId));
  };

  // Update date with debouncing
  const updateEventDate = (dateId: string, newDate: string) => {
    // Update local state first
    setEventDates(prev => prev.map(date => 
      date.id === dateId ? { ...date, date: newDate } : date
    ));

    // Debounce the API call to avoid too many requests
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      // If we have a valid date, call the API to update event details
      if (newDate) {
        // Find the updated dates to determine start and end dates
        const updatedDates = eventDates.map(date => 
          date.id === dateId ? { ...date, date: newDate } : date
        ).filter(date => date.date); // Only include dates that have values

        if (updatedDates.length > 0) {
          const sortedDates = updatedDates.map(d => d.date).sort();
          const startDate = sortedDates[0];
          const endDate = sortedDates[sortedDates.length - 1];

          await updateEventDetailsAPI(startDate, endDate);
        }
      }
    }, 1000); // Wait 1 second after user stops typing
  };

  // Add time slot to a date
  const addTimeSlot = (dateId: string) => {
    const newTimeSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: "",
      endTime: "",
      price: "",
      ticketCount: "",
      duration: defaultDuration
    };
    setEventDates(prev => prev.map(date => 
      date.id === dateId 
        ? { ...date, timeSlots: [...date.timeSlots, newTimeSlot] }
        : date
    ));
  };

  // Remove time slot
  const removeTimeSlot = (dateId: string, slotId: string) => {
    setEventDates(prev => prev.map(date => 
      date.id === dateId 
        ? { ...date, timeSlots: date.timeSlots.filter(slot => slot.id !== slotId) }
        : date
    ));
  };

  // Update time slot
  const updateTimeSlot = (dateId: string, slotId: string, field: keyof TimeSlot, value: string | number) => {
    setEventDates(prev => prev.map(date => 
      date.id === dateId 
        ? {
            ...date, 
            timeSlots: date.timeSlots.map(slot => {
              if (slot.id === slotId) {
                const updatedSlot = { ...slot, [field]: value };
                
                // Auto-calculate end time when start time or duration changes
                if (field === 'startTime' && typeof value === 'string') {
                  updatedSlot.endTime = calculateEndTime(value, slot.duration);
                } else if (field === 'duration' && typeof value === 'number') {
                  if (slot.startTime) {
                    updatedSlot.endTime = calculateEndTime(slot.startTime, value);
                  }
                }
                
                return updatedSlot;
              }
              return slot;
            })
          }
        : date
    ));
  };

  // Bulk add time slots to selected dates
  const addBulkTimeSlots = () => {
    if (!bulkStartTime || !bulkPrice || !bulkTickets) {
      toast.error("Please fill in all bulk slot details");
      return;
    }

    if (selectedDatesForBulk.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    const calculatedEndTime = calculateEndTime(bulkStartTime, bulkDuration);

    const newTimeSlot: Omit<TimeSlot, 'id'> = {
      startTime: bulkStartTime,
      endTime: calculatedEndTime,
      price: parseFloat(bulkPrice),
      ticketCount: parseInt(bulkTickets),
      duration: bulkDuration
    };

    setEventDates(prev => prev.map(date => 
      selectedDatesForBulk.includes(date.id)
        ? {
            ...date,
            timeSlots: [...date.timeSlots, { ...newTimeSlot, id: (Date.now() + Math.random()).toString() }]
          }
        : date
    ));

    // Reset bulk form
    setBulkStartTime("");
    setBulkDuration(120);
    setBulkPrice("");
    setBulkTickets("");
    setSelectedDatesForBulk([]);
    setShowBulkSlots(false);
    
    toast.success(`Added time slot to ${selectedDatesForBulk.length} date(s)`);
  };

  // Toggle date selection for bulk operations
  const toggleDateForBulk = (dateId: string) => {
    setSelectedDatesForBulk(prev => 
      prev.includes(dateId) 
        ? prev.filter(id => id !== dateId)
        : [...prev, dateId]
    );
  };





  // Transform event dates to the required API format
  const transformEventDatesToApiFormat = () => {
    if (!slotId) {
      throw new Error('Slot ID is required');
    }

    const slotData: Record<string, Record<string, any>> = {};
    
    eventDates.forEach(eventDate => {
      if (eventDate.date && eventDate.timeSlots.length > 0) {
        const dateSlots: Record<string, any> = {};
        
        eventDate.timeSlots.forEach((slot, index) => {
          const slotKey = `slot_${index + 1}`;
          dateSlots[slotKey] = {
            start_time: slot.startTime,
            end_time: slot.endTime,
            duration: slot.duration,
            capacity: slot.ticketCount,
            price: parseFloat(slot.price.toString())
          };
        });
        
        slotData[eventDate.date] = dateSlots;
      }
    });
    
    return {
      slot_id: slotId, // Use slot_id from URL parameter
      slot_data: slotData
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (eventDates.length === 0) {
      toast.error("Please add at least one event date");
      return;
    }

    const hasEmptyDates = eventDates.some(date => !date.date);
    if (hasEmptyDates) {
      toast.error("Please fill in all event dates");
      return;
    }

    const hasEmptySlots = eventDates.some(date => 
      date.timeSlots.some(slot => !slot.startTime || slot.price <= 0 || slot.ticketCount <= 0)
    );
    if (hasEmptySlots) {
      toast.error("Please fill in all time slots with valid start time, price, and ticket count");
      return;
    }

    // Ensure all slots have valid end times (auto-calculated)
    eventDates.forEach(date => {
      date.timeSlots.forEach(slot => {
        if (slot.startTime && !slot.endTime) {
          slot.endTime = calculateEndTime(slot.startTime, slot.duration);
        }
      });
    });

    setIsSubmitting(true);

    try {
      // Validate that we have the required slot_id
      if (!slotId) {
        toast.error("Missing slot ID. Please complete Step 1 first.");
        return;
      }

      // Transform event dates to the required API format
      const apiSlotData = transformEventDatesToApiFormat();

      // Prepare the JSON payload - only slot data and settings
      const jsonPayload = {
        // Slot data in the required format
        slot_id: apiSlotData.slot_id,
        slot_data: apiSlotData.slot_data,
        
  
        currency,
        isPublic,
        isFeatured,
        allowWaitlist,
        requireApproval
      };

      // Debug: Log the payload
      console.log('Slot data payload being sent:', jsonPayload);
      console.log('Using Slot ID from URL:', slotId);
      console.log('Event ID:', eventId);

      // Check if we're updating existing slots or creating new ones
      let response;
      
      try {
        // First try to get existing slot data to determine if we should update or create
        await axiosInstance.get(`/api/v1/slots/get/${slotId}`);
        
        // If we get here, slots exist, so update them
        response = await axiosInstance.put(`/api/v1/slots/update/${slotId}`, jsonPayload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        console.log('Slots updated successfully');
      } catch (getError) {
        // If getting slots fails, they don't exist yet, so create them
        response = await axiosInstance.post("/api/v1/slots/create", jsonPayload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        console.log('Slots created successfully');
      }

      if (response.status === 201 || response.status === 200) {
        const isUpdate = response.status === 200;
        toast.success(isUpdate ? "Event slots updated successfully!" : "Event slots created successfully!");
        
        // Clear localStorage
        localStorage.removeItem('eventBasicInfo');
        localStorage.removeItem('eventFiles');
        
        // Redirect to events list or success page
        router.push("/Events");
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToBasicInfo = () => {
   if (eventId) {
      router.push(`/Events/BasicInfo?event_id=${eventId}`);
    } else {
      router.push('/Events/BasicInfo');
    }
  };

  // Preview the API data structure (for debugging)
  const previewApiData = () => {
    if (!slotId) {
      toast.error("No slot ID found in URL. Please complete Step 1 first.");
      return;
    }

    try {
      const apiSlotData = transformEventDatesToApiFormat();

      const jsonPayload = {
        // Slot data in the required format
        slot_id: apiSlotData.slot_id,
        slot_data: apiSlotData.slot_data,
        
        // Additional settings
        currency,
        isPublic,
        isFeatured,
        allowWaitlist,
        requireApproval
      };

      console.log("=== URL PARAMETERS ===");
      console.log("Event ID from URL:", eventId);
      console.log("Slot ID from URL:", slotId);
      
      console.log("=== SLOT DATA PAYLOAD ===");
      console.log("Slot Data Payload:", JSON.stringify(jsonPayload, null, 2));
      
      toast.success("Slot data payload logged to console - check browser console");
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Error generating preview. Please check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
              ✓
            </div>
            <div className="h-1 w-16 bg-green-500 rounded"></div>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {eventDates.length > 0 ? 'Edit Event: Dates, Times & Pricing' : 'Step 2: Dates, Times & Pricing'}
          </h1>
          <p className="text-gray-600 mb-4">
            {eventDates.length > 0 
              ? 'Update your event schedule and pricing - modify dates, times, and ticket prices'
              : 'Configure when your event will happen and set pricing for different time slots'
            }
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Set individual duration for each time slot - end times will be calculated automatically
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Date Range Selector */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                Add Event Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-purple-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-purple-500"
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <Button
                  type="button"
                  onClick={generateDateRange}
                  className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Add Date Range
                </Button>
              </div>
              
              {/* Event Details Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Event Details (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Event Location</Label>
                    <Input
                      type="text"
                      placeholder="Enter event location (e.g., Conference Hall A, 123 Main St)"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500">
                      Leave empty if location will be provided later
                    </p>
                  </div> */}
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Event Type</Label>
                    <div className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Online Event</p>
                        <p className="text-sm text-gray-500">
                          {isOnlineEvent ? "This event will be held online" : "This event will be held in-person"}
                        </p>
                      </div>
                      <Switch
                        checked={isOnlineEvent}
                        onCheckedChange={setIsOnlineEvent}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">OR</div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSingleDate}
                  className="border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                >
                  + Add Single Date
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Time Slot Creator */}
          {eventDates.length > 0 && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xl">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    Quick Time Slot Creator
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkSlots(!showBulkSlots)}
                    className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  >
                    {showBulkSlots ? "Hide" : "Show"} Quick Creator
                  </Button>
                </CardTitle>
              </CardHeader>
              {showBulkSlots && (
                <CardContent className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-emerald-800 mb-2">💡 Quick Tip</h3>
                    <p className="text-sm text-emerald-700">
                      Use this to add the same time slot to multiple dates at once. Perfect for recurring events!
                    </p>
                  </div>

                  {/* Common Time Presets */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-3">⚡ Quick Time Presets</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: "Morning", time: "09:00" },
                        { label: "Afternoon", time: "14:00" },
                        { label: "Evening", time: "18:00" },
                        { label: "Night", time: "20:00" }
                      ].map((preset) => (
                        <Button
                          key={preset.time}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setBulkStartTime(preset.time)}
                          className="text-xs bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          {preset.label}<br/>{preset.time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Time Slot Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">Time Slot Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Time</Label>
                          <Input
                            type="time"
                            value={bulkStartTime}
                            onChange={(e) => setBulkStartTime(e.target.value)}
                            className="h-11 border-2 border-gray-200 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Duration</Label>
                          <Select
                            value={bulkDuration.toString()}
                            onValueChange={(value) => setBulkDuration(parseInt(value))}
                          >
                            <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-emerald-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="90">1.5 hours</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                              <SelectItem value="150">2.5 hours</SelectItem>
                              <SelectItem value="180">3 hours</SelectItem>
                              <SelectItem value="240">4 hours</SelectItem>
                              <SelectItem value="300">5 hours</SelectItem>
                              <SelectItem value="360">6 hours</SelectItem>
                              <SelectItem value="480">8 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">End Time</Label>
                          <div className="h-11 px-3 py-2 border-2 border-gray-200 rounded-md bg-emerald-50 flex items-center text-sm text-gray-700">
                            <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                            {bulkStartTime ? calculateEndTime(bulkStartTime, bulkDuration) : "--:--"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Price ({currency})</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={bulkPrice}
                              onChange={(e) => setBulkPrice(e.target.value)}
                              className="h-11 pl-10 border-2 border-gray-200 focus:border-green-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Tickets Available</Label>
                          <Input
                            type="number"
                            min="1"
                            value={bulkTickets}
                            onChange={(e) => setBulkTickets(e.target.value)}
                            className="h-11 border-2 border-gray-200 focus:border-purple-500"
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Select Dates</h3>
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {selectedDatesForBulk.length} selected
                        </span>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 gap-1 p-2">
                          {eventDates.map((date) => (
                            <div
                              key={date.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-200",
                                selectedDatesForBulk.includes(date.id)
                                  ? "bg-emerald-100 border-2 border-emerald-300 shadow-sm"
                                  : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200"
                              )}
                              onClick={() => toggleDateForBulk(date.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedDatesForBulk.includes(date.id)}
                                  onChange={() => toggleDateForBulk(date.id)}
                                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium">
                                  {date.date ? new Date(date.date).toLocaleDateString('en-AU', {
                                    weekday: 'short',
                                    month: 'short', 
                                    day: 'numeric'
                                  }) : 'No date set'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {date.timeSlots.length} slot(s)
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedDatesForBulk([]);
                        setBulkStartTime("");
                        setBulkDuration(120);
                        setBulkPrice("");
                        setBulkTickets("");
                      }}
                      className="flex-1"
                    >
                      Clear All
                    </Button>
                    <Button
                      type="button"
                      onClick={addBulkTimeSlots}
                      disabled={!bulkStartTime || !bulkPrice || !bulkTickets || selectedDatesForBulk.length === 0}
                      className="flex-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
                    >
                      Add Time Slot to {selectedDatesForBulk.length} Date(s)
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Event Dates & Time Slots */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                Event Schedule ({eventDates.length} dates)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {eventDates.map((eventDate, dateIndex) => (
                <div key={eventDate.id} className="border-2 border-gray-200 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDatesForBulk.includes(eventDate.id)}
                        onChange={() => toggleDateForBulk(eventDate.id)}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Event Date {dateIndex + 1}
                        {eventDate.date && (
                          <span className="ml-2 text-blue-600 font-semibold">
                            ({new Date(eventDate.date).toLocaleDateString('en-AU', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })})
                          </span>
                        )}
                      </Label>
                      <Input
                        type="date"
                        value={eventDate.date}
                        onChange={(e) => updateEventDate(eventDate.id, e.target.value)}
                        className="h-12 border-2 border-gray-200 focus:border-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeEventDate(eventDate.id)}
                      className="mt-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Time Slots for this date */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium text-gray-700">
                        Time Slots & Pricing ({eventDate.timeSlots.length} slots)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeSlot(eventDate.id)}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    </div>

                    {/* Time Slots Grid */}
                    {eventDate.timeSlots.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 mb-2">No time slots added yet</p>
                        <p className="text-sm text-gray-500 mb-4">Add time slots to specify when your event will run</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addTimeSlot(eventDate.id)}
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Time Slot
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {eventDate.timeSlots.map((slot, slotIndex) => (
                          <div key={slot.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-800">
                                Slot {slotIndex + 1}
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTimeSlot(eventDate.id, slot.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Time</Label>
                                <Input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => updateTimeSlot(eventDate.id, slot.id, 'startTime', e.target.value)}
                                  className="h-11 text-sm border-2 border-gray-200 focus:border-blue-500"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Duration</Label>
                                <Select
                                  value={slot.duration.toString()}
                                  onValueChange={(value) => updateTimeSlot(eventDate.id, slot.id, 'duration', parseInt(value))}
                                >
                                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-orange-500">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="30">30 min</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="90">1.5 hours</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                    <SelectItem value="150">2.5 hours</SelectItem>
                                    <SelectItem value="180">3 hours</SelectItem>
                                    <SelectItem value="240">4 hours</SelectItem>
                                    <SelectItem value="300">5 hours</SelectItem>
                                    <SelectItem value="360">6 hours</SelectItem>
                                    <SelectItem value="480">8 hours</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">End Time</Label>
                                <div className="h-11 px-3 py-2 border-2 border-gray-200 rounded-md bg-blue-50 flex items-center text-sm text-gray-700">
                                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                                  {slot.startTime ? slot.endTime : "--:--"}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Price ({currency})</Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={slot.price}
                                    onChange={(e) => updateTimeSlot(eventDate.id, slot.id, 'price', parseFloat(e.target.value) || 0)}
                                    className="h-11 text-sm pl-10 border-2 border-gray-200 focus:border-green-500"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Tickets Available</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={slot.ticketCount}
                                  onChange={(e) => updateTimeSlot(eventDate.id, slot.id, 'ticketCount', parseInt(e.target.value) || 1)}
                                  className="h-11 text-sm border-2 border-gray-200 focus:border-purple-500"
                                  placeholder="100"
                                />
                              </div>
                            </div>
                            
                            {/* Time Slot Summary */}
                            {slot.startTime && slot.price > 0 && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">
                                    <strong>{slot.startTime}</strong> - <strong>{slot.endTime}</strong>
                                    <span className="text-xs text-gray-500 ml-2">
                                      ({Math.floor(slot.duration / 60)}h {slot.duration % 60}m)
                                    </span>
                                  </span>
                                  <span className="text-green-600 font-medium">
                                    {currency} {slot.price} × {slot.ticketCount} tickets
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Add Multiple Slots */}
                    {eventDate.timeSlots.length > 0 && eventDate.timeSlots.length < 5 && (
                      <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="text-center">
                          <p className="text-sm text-blue-700 mb-2">Need multiple time slots for this day?</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeSlot(eventDate.id)}
                            className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Time Slot
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                    {eventDate.timeSlots.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No time slots added yet. Click "Add Time Slot" to get started.
                      </div>
                    )}
                  </div>
                
              ))}

              {eventDates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No event dates added yet. Use the date selector above to add dates.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Currency & Settings */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                Currency & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUD">AUD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Event Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isPublic" className="text-sm">Make event public</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isFeatured" className="text-sm">Feature this event</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowWaitlist"
                      checked={allowWaitlist}
                      onChange={(e) => setAllowWaitlist(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="allowWaitlist" className="text-sm">Allow waitlist when sold out</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requireApproval"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="requireApproval" className="text-sm">Require approval for bookings</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <div className="flex justify-center gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={goBackToBasicInfo}
              className="px-8 py-3 h-12 border-2 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Step 1
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 hover:scale-105 transition-transform"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Event...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Create Event
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventDatesPricing;