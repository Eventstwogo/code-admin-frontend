// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { DataTable } from "@/components/ui/data-table";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import {
//   Plus,
//   Ticket,
//   ArrowLeft,
//   Trash2,
//   Edit,
//   MoreHorizontal,
//   ArrowUpDown
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { ColumnDef } from "@tanstack/react-table";
// import axiosInstance from "@/lib/axiosInstance";
// import useStore from "@/lib/Zustand";

// interface Coupon {
//   coupon_id: string;
//   event_id: string;
//   coupon_code: string;
//   no_of_tickets: number;
//   percentage: number;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// const CouponsPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const eventId = searchParams.get('eventId');
//   const { userId, isAuthenticated } = useStore();
  
//   const [coupons, setCoupons] = useState<Coupon[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showCreateDialog, setShowCreateDialog] = useState(false);
//   const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
//   const [eventTitle, setEventTitle] = useState<string>("");
  
//   // Form state
//   const [formData, setFormData] = useState({
//     no_of_tickets: "",
//     percentage: ""
//   });

//   // Fetch event details
//   const fetchEventDetails = useCallback(async () => {
//     if (!eventId) return;
    
//     try {
//       const response = await axiosInstance.get(`/api/v1/events/${eventId}`);
//       if (response.data.statusCode === 200) {
//         setEventTitle(response.data.data.event_title || "Unknown Event");
//       }
//     } catch (error) {
//       console.error("Error fetching event details:", error);
//     }
//   }, [eventId]);

//   // Fetch coupons
//   const fetchCoupons = useCallback(async () => {
//     if (!eventId) return;
    
//     try {
//       setLoading(true);
//       const response = await axiosInstance.get(`/api/v1/coupons/event/${eventId}`);
      
//       if (response.data.statusCode === 200) {
//         const couponsData = response.data.data.coupons || [];
//         setCoupons(couponsData);
//         toast.success(`Loaded ${couponsData.length} coupons successfully!`);
//       } else {
//         toast.error(response.data.message || "Failed to fetch coupons");
//         setCoupons([]);
//       }
//     } catch (error: any) {
//       console.error("Error fetching coupons:", error);
      
//       if (error.response?.status === 404) {
//         setCoupons([]); // No coupons found is okay
//       } else {
//         toast.error("Failed to fetch coupons. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [eventId]);

//   // Create or update coupon
//   const handleSubmitCoupon = async () => {
//     if (!formData.no_of_tickets || !formData.percentage) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     if (parseInt(formData.percentage) <= 0 || parseInt(formData.percentage) > 100) {
//       toast.error("Percentage must be between 1 and 100");
//       return;
//     }

//     if (parseInt(formData.no_of_tickets) <= 0) {
//       toast.error("Number of tickets must be greater than 0");
//       return;
//     }

//     try {
//       const payload = {
//         event_id: eventId,
//         no_of_tickets: parseInt(formData.no_of_tickets),
//         percentage: parseInt(formData.percentage)
//       };

//       if (editingCoupon) {
//         // Update existing coupon
//         await axiosInstance.put(`/api/v1/coupons/${editingCoupon.coupon_id}`, payload);
//         toast.success("Coupon updated successfully!");
//       } else {
//         // Create new coupon
//         await axiosInstance.post('/api/v1/coupons', payload);
//         toast.success("Coupon created successfully!");
//       }

//       setShowCreateDialog(false);
//       setEditingCoupon(null);
//       setFormData({ no_of_tickets: "", percentage: "" });
//       fetchCoupons();
//     } catch (error: any) {
//       console.error("Error saving coupon:", error);
//       toast.error(error.response?.data?.message || "Failed to save coupon");
//     }
//   };

//   // Delete coupon
//   const handleDeleteCoupon = async (couponId: string) => {
//     if (!confirm("Are you sure you want to delete this coupon?")) return;
    
//     try {
//       await axiosInstance.delete(`/api/v1/coupons/${couponId}`);
//       toast.success("Coupon deleted successfully");
//       fetchCoupons();
//     } catch (error) {
//       console.error("Error deleting coupon:", error);
//       toast.error("Failed to delete coupon");
//     }
//   };

//   // Edit coupon
//   const handleEditCoupon = (coupon: Coupon) => {
//     setEditingCoupon(coupon);
//     setFormData({
//       no_of_tickets: coupon.no_of_tickets.toString(),
//       percentage: coupon.percentage.toString()
//     });
//     setShowCreateDialog(true);
//   };

//   // Toggle coupon status
//   const handleToggleStatus = async (couponId: string, currentStatus: boolean) => {
//     try {
//       await axiosInstance.patch(`/api/v1/coupons/${couponId}/status`, {
//         is_active: !currentStatus
//       });
//       toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
//       fetchCoupons();
//     } catch (error) {
//       console.error("Error toggling coupon status:", error);
//       toast.error("Failed to update coupon status");
//     }
//   };

//   // Actions cell component
//   const ActionsCell = ({ coupon }: { coupon: Coupon }) => {
//     return (
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="ghost" className="h-8 w-8 p-0">
//             <span className="sr-only">Open menu</span>
//             <MoreHorizontal className="h-4 w-4" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end">
//           <DropdownMenuLabel>Actions</DropdownMenuLabel>
//           <DropdownMenuItem
//             onClick={() => navigator.clipboard.writeText(coupon.coupon_code)}
//           >
//             Copy coupon code
//           </DropdownMenuItem>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem onClick={() => handleEditCoupon(coupon)}>
//             <Edit className="mr-2 h-4 w-4" />
//             Edit coupon
//           </DropdownMenuItem>
//           <DropdownMenuItem
//             onClick={() => handleToggleStatus(coupon.coupon_id, coupon.is_active)}
//           >
//             {coupon.is_active ? "Deactivate" : "Activate"}
//           </DropdownMenuItem>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem
//             onClick={() => handleDeleteCoupon(coupon.coupon_id)}
//             className="text-red-600"
//           >
//             <Trash2 className="mr-2 h-4 w-4" />
//             Delete coupon
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     );
//   };

//   // Table columns
//   const columns: ColumnDef<Coupon>[] = [
//     {
//       accessorKey: "coupon_code",
//       header: ({ column }) => {
//         return (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//           >
//             Coupon Code
//             <ArrowUpDown className="ml-2 h-4 w-4" />
//           </Button>
//         )
//       },
//       cell: ({ row }) => {
//         const coupon = row.original;
//         return (
//           <div className="font-mono font-semibold text-blue-600">
//             {coupon.coupon_code}
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "no_of_tickets",
//       header: ({ column }) => {
//         return (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//           >
//             No. of Tickets
//             <ArrowUpDown className="ml-2 h-4 w-4" />
//           </Button>
//         )
//       },
//       cell: ({ row }) => {
//         return (
//           <div className="text-center font-medium">
//             {row.getValue("no_of_tickets")}
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "percentage",
//       header: ({ column }) => {
//         return (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//           >
//             Discount %
//             <ArrowUpDown className="ml-2 h-4 w-4" />
//           </Button>
//         )
//       },
//       cell: ({ row }) => {
//         return (
//           <div className="text-center font-medium text-green-600">
//             {row.getValue("percentage")}%
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "is_active",
//       header: "Status",
//       cell: ({ row }) => {
//         const coupon = row.original;
//         return (
//           <Badge variant={coupon.is_active ? "default" : "secondary"}>
//             {coupon.is_active ? "Active" : "Inactive"}
//           </Badge>
//         );
//       },
//     },
//     {
//       accessorKey: "created_at",
//       header: ({ column }) => {
//         return (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//           >
//             Created
//             <ArrowUpDown className="ml-2 h-4 w-4" />
//           </Button>
//         )
//       },
//       cell: ({ row }) => {
//         return (
//           <div className="text-sm text-gray-600">
//             {new Date(row.getValue("created_at")).toLocaleDateString()}
//           </div>
//         );
//       },
//     },
//     {
//       id: "actions",
//       enableHiding: false,
//       cell: ({ row }) => {
//         const coupon = row.original;
//         return <ActionsCell coupon={coupon} />;
//       },
//     },
//   ];

//   useEffect(() => {
//     if (!eventId) {
//       toast.error("No event ID provided");
//       router.push('/Events');
//       return;
//     }

//     fetchEventDetails();
//     fetchCoupons();
//   }, [eventId, fetchEventDetails, fetchCoupons, router]);

//   if (!eventId) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
//           <div>
//             <div className="flex items-center gap-4 mb-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => router.push('/Events')}
//                 className="flex items-center gap-2"
//               >
//                 <ArrowLeft className="h-4 w-4" />
//                 Back to Events
//               </Button>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//               Coupons Management
//             </h1>
//             <p className="text-gray-600">
//               Manage coupons for: <span className="font-semibold">{eventTitle}</span>
//             </p>
//             {!loading && (
//               <p className="text-sm text-gray-500 mt-1">
//                 {coupons.length} coupons found
//               </p>
//             )}
//           </div>
          
//           <Button
//             onClick={() => {
//               setEditingCoupon(null);
//               setFormData({ no_of_tickets: "", percentage: "" });
//               setShowCreateDialog(true);
//             }}
//             className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-200"
//           >
//             <Plus className="h-5 w-5 mr-2" />
//             Create New Coupon
//           </Button>
//         </div>

//         {/* Coupons Table */}
//         {loading ? (
//           <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
//             <CardContent className="p-6">
//               <div className="space-y-4">
//                 {[...Array(5)].map((_, index) => (
//                   <div key={index} className="flex items-center space-x-4">
//                     <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
//                     <div className="flex-1 space-y-2">
//                       <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
//                       <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
//                     </div>
//                     <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         ) : coupons.length === 0 ? (
//           <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
//             <CardContent className="p-12 text-center">
//               <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No Coupons Found</h3>
//               <p className="text-gray-500 mb-6">
//                 You haven&apos;t created any coupons for this event yet. Create your first coupon to get started!
//               </p>
//               <Button
//                 onClick={() => {
//                   setEditingCoupon(null);
//                   setFormData({ no_of_tickets: "", percentage: "" });
//                   setShowCreateDialog(true);
//                 }}
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Create Your First Coupon
//               </Button>
//             </CardContent>
//           </Card>
//         ) : (
//           <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
//             <CardContent className="p-6">
//               <DataTable 
//                 columns={columns} 
//                 data={coupons} 
//                 searchKey="coupon_code"
//                 searchPlaceholder="Search coupons..."
//               />
//             </CardContent>
//           </Card>
//         )}

//         {/* Create/Edit Coupon Dialog */}
//         <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
//           <DialogContent className="sm:max-w-[425px]">
//             <DialogHeader>
//               <DialogTitle>
//                 {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
//               </DialogTitle>
//               <DialogDescription>
//                 {editingCoupon 
//                   ? "Update the coupon details below." 
//                   : "Enter the details to create a new coupon for this event."
//                 }
//               </DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="no_of_tickets" className="text-right">
//                   No. of Tickets *
//                 </Label>
//                 <Input
//                   id="no_of_tickets"
//                   type="number"
//                   min="1"
//                   placeholder="Enter number of tickets"
//                   value={formData.no_of_tickets}
//                   onChange={(e) => setFormData(prev => ({ ...prev, no_of_tickets: e.target.value }))}
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="percentage" className="text-right">
//                   Discount % *
//                 </Label>
//                 <Input
//                   id="percentage"
//                   type="number"
//                   min="1"
//                   max="100"
//                   placeholder="Enter discount percentage"
//                   value={formData.percentage}
//                   onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
//                   className="col-span-3"
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setShowCreateDialog(false);
//                   setEditingCoupon(null);
//                   setFormData({ no_of_tickets: "", percentage: "" });
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button type="button" onClick={handleSubmitCoupon}>
//                 {editingCoupon ? "Update Coupon" : "Create Coupon"}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// };

// export default CouponsPage;


"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Ticket,
  ArrowLeft,
  Trash2,
  Edit,
  MoreHorizontal,
  ArrowUpDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";

interface Coupon {
  coupon_id: string;
  event_id: string;
  coupon_code: string;
  no_of_tickets: number;
  percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock coupon data
const mockCoupons: Coupon[] = [
  {
    coupon_id: "1",
    event_id: "123",
    coupon_code: "WELCOME10",
    no_of_tickets: 5,
    percentage: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    coupon_id: "2",
    event_id: "123",
    coupon_code: "SUMMER20",
    no_of_tickets: 3,
    percentage: 20,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const CouponsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || "123";

  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [eventTitle, setEventTitle] = useState<string>("Sample Event");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    no_of_tickets: "",
    percentage: ""
  });

  // Add / Edit coupon locally
  const handleSubmitCoupon = () => {
    if (!formData.no_of_tickets || !formData.percentage) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseInt(formData.percentage) <= 0 || parseInt(formData.percentage) > 100) {
      toast.error("Percentage must be between 1 and 100");
      return;
    }

    if (parseInt(formData.no_of_tickets) <= 0) {
      toast.error("Number of tickets must be greater than 0");
      return;
    }

    const newCoupon: Coupon = {
      coupon_id: editingCoupon ? editingCoupon.coupon_id : Date.now().toString(),
      event_id: eventId,
      coupon_code: editingCoupon
        ? editingCoupon.coupon_code
        : `COUPON${Math.floor(Math.random() * 1000)}`,
      no_of_tickets: parseInt(formData.no_of_tickets),
      percentage: parseInt(formData.percentage),
      is_active: editingCoupon ? editingCoupon.is_active : true,
      created_at: editingCoupon ? editingCoupon.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingCoupon) {
      // Update existing coupon
      setCoupons(prev =>
        prev.map(c => (c.coupon_id === editingCoupon.coupon_id ? newCoupon : c))
      );
      toast.success("Coupon updated successfully!");
    } else {
      // Add new coupon
      setCoupons(prev => [...prev, newCoupon]);
      toast.success("Coupon created successfully!");
    }

    setShowCreateDialog(false);
    setEditingCoupon(null);
    setFormData({ no_of_tickets: "", percentage: "" });
  };

  // Delete coupon locally
  const handleDeleteCoupon = (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setCoupons(prev => prev.filter(c => c.coupon_id !== couponId));
    toast.success("Coupon deleted successfully");
  };

  // Edit coupon locally
  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      no_of_tickets: coupon.no_of_tickets.toString(),
      percentage: coupon.percentage.toString()
    });
    setShowCreateDialog(true);
  };

  // Toggle coupon status locally
  const handleToggleStatus = (couponId: string, currentStatus: boolean) => {
    setCoupons(prev =>
      prev.map(c =>
        c.coupon_id === couponId
          ? { ...c, is_active: !currentStatus, updated_at: new Date().toISOString() }
          : c
      )
    );
    toast.success(`Coupon ${!currentStatus ? "activated" : "deactivated"} successfully`);
  };

  // Actions dropdown for each row
  const ActionsCell = ({ coupon }: { coupon: Coupon }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(coupon.coupon_code)}
          >
            Copy coupon code
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleEditCoupon(coupon)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit coupon
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleToggleStatus(coupon.coupon_id, coupon.is_active)}
          >
            {coupon.is_active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleDeleteCoupon(coupon.coupon_id)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete coupon
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Table columns
  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "coupon_code",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Coupon Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <div className="font-mono font-semibold text-blue-600">
            {coupon.coupon_code}
          </div>
        );
      },
    },
    {
      accessorKey: "no_of_tickets",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No. of Tickets
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue("no_of_tickets")}
        </div>
      ),
    },
    {
      accessorKey: "percentage",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Discount %
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium text-green-600">
          {row.getValue("percentage")}%
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <Badge variant={coupon.is_active ? "default" : "secondary"}>
            {coupon.is_active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const coupon = row.original;
        return <ActionsCell coupon={coupon} />;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/Events")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Coupons Management
            </h1>
            <p className="text-gray-600">
              Manage coupons for:{" "}
              <span className="font-semibold">{eventTitle}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {coupons.length} coupons found
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingCoupon(null);
              setFormData({ no_of_tickets: "", percentage: "" });
              setShowCreateDialog(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Coupon
          </Button>
        </div>

        {/* Coupons Table */}
        {coupons.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Coupons Found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven&apos;t created any coupons for this event yet. Create your first coupon to get started!
              </p>
              <Button
                onClick={() => {
                  setEditingCoupon(null);
                  setFormData({ no_of_tickets: "", percentage: "" });
                  setShowCreateDialog(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Coupon
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <DataTable
                columns={columns}
                data={coupons}
                searchKey="coupon_code"
                searchPlaceholder="Search coupons..."
              />
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Coupon Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
              <DialogDescription>
                {editingCoupon
                  ? "Update the coupon details below."
                  : "Enter the details to create a new coupon for this event."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="no_of_tickets" className="text-right">
                  No. of Tickets *
                </Label>
                <Input
                  id="no_of_tickets"
                  type="number"
                  min="1"
                  placeholder="Enter number of tickets"
                  value={formData.no_of_tickets}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      no_of_tickets: e.target.value
                    }))
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="percentage" className="text-right">
                  Discount % *
                </Label>
                <Input
                  id="percentage"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Enter discount percentage"
                  value={formData.percentage}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      percentage: e.target.value
                    }))
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingCoupon(null);
                  setFormData({ no_of_tickets: "", percentage: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmitCoupon}>
                {editingCoupon ? "Update Coupon" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CouponsPage;
