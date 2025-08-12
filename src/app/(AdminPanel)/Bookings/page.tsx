"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import Image from "next/image";
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  DollarSign,
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Booking data interface based on the API response
interface BookingData {
  booking_id: number;
  num_seats: number;
  price_per_seat: number;
  total_price: number;
  slot: string;
  booking_date: string;
  booking_status: "approved" | "pending" | "cancelled" | "rejected";
  payment_status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  paypal_order_id: string | null;
  created_at: string;
  updated_at: string;
  username: string;
  organizer_name: string;
  event: {
    event_id: string;
    event_title: string;
    event_slug: string;
    start_date: string;
    end_date: string;
    location: string | null;
    card_image: string;
  };
}

interface BookingsResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  method: string;
  path: string;
  data: {
    bookings: BookingData[];
    total_items: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  approvedBookings: number;
  pendingBookings: number;
  completedPayments: number;
  averageBookingValue: number;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    totalRevenue: 0,
    approvedBookings: 0,
    pendingBookings: 0,
    completedPayments: 0,
    averageBookingValue: 0,
  });
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Load bookings data
  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<BookingsResponse>('/api/v1/bookings/all', {
        params: {
          page: currentPage,
          per_page: perPage,
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== 'all' && { booking_status: statusFilter }),
          ...(paymentFilter !== 'all' && { payment_status: paymentFilter }),
        }
      });

      const { bookings: bookingsData, total_items, total_pages } = response.data.data;
  
      setBookings(bookingsData);
      setTotalItems(total_items);
      setTotalPages(total_pages);
console.log('Bookings loaded:', bookingsData);
      // Calculate stats
      const totalRevenue = bookingsData.reduce((sum, booking) => sum + booking.total_price, 0);
      const approvedBookings = bookingsData.filter(b => b.booking_status === 'approved').length;
      const pendingBookings = bookingsData.filter(b => b.booking_status === 'pending').length;
      const completedPayments = bookingsData.filter(b => b.payment_status === 'COMPLETED').length;
      const averageBookingValue = bookingsData.length > 0 ? totalRevenue / bookingsData.length : 0;

      setStats({
        totalBookings: total_items,
        totalRevenue,
        approvedBookings,
        pendingBookings,
        completedPayments,
        averageBookingValue,
      });

    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, statusFilter, paymentFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { variant: "default" as const, color: "text-green-700 bg-green-100", icon: CheckCircle },
      pending: { variant: "secondary" as const, color: "text-yellow-700 bg-yellow-100", icon: Clock },
      cancelled: { variant: "destructive" as const, color: "text-red-700 bg-red-100", icon: XCircle },
      rejected: { variant: "destructive" as const, color: "text-red-700 bg-red-100", icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { variant: "default" as const, color: "text-green-700 bg-green-100" },
      PENDING: { variant: "secondary" as const, color: "text-yellow-700 bg-yellow-100" },
      FAILED: { variant: "destructive" as const, color: "text-red-700 bg-red-100" },
      REFUNDED: { variant: "outline" as const, color: "text-gray-700 bg-gray-100" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePaymentFilter = (value: string) => {
    setPaymentFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewBooking = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            
            {/* Table skeleton */}
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600 mt-2">View and manage all event bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadBookings}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold">{stats.totalBookings.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-400/30 rounded-full">
                  <Ticket className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-400/30 rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Approved Bookings</p>
                  <p className="text-3xl font-bold">{stats.approvedBookings}</p>
                </div>
                <div className="p-3 bg-purple-400/30 rounded-full">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg. Booking Value</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats.averageBookingValue)}</p>
                </div>
                <div className="p-3 bg-orange-400/30 rounded-full">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by event title, username, or booking ID..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Booking Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={handlePaymentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-600" />
              Bookings ({totalItems})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">No bookings match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[100px]">Booking ID</TableHead>
                      <TableHead className="min-w-[250px]">Event Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Price/Seat</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Booking Status</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Booking Date</TableHead>
                      <TableHead>Slot</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.booking_id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          #{booking.booking_id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {booking.event.card_image ? (
                                <Image
                                  src={booking.event.card_image}
                                  alt={booking.event.event_title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 truncate">
                                {booking.event.event_title}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                by {booking.organizer_name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {booking.event.location || 'Location TBD'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{booking.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-600" />
                            <span className="font-medium">{booking.num_seats}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(booking.price_per_seat)}
                        </TableCell>
                        <TableCell className="text-green-700 font-bold">
                          {formatCurrency(booking.total_price)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.booking_status)}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(booking.payment_status)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(booking.booking_date)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {booking.slot}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={() => handleViewBooking(booking)}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} bookings
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Booking Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Booking Details - #{selectedBooking?.booking_id}
              </DialogTitle>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-6">
                {/* Event Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Event Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {selectedBooking.event.card_image ? (
                              <Image
                                src={selectedBooking.event.card_image}
                                alt={selectedBooking.event.event_title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Calendar className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">
                              {selectedBooking.event.event_title}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              Organized by {selectedBooking.organizer_name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Event ID: {selectedBooking.event.event_id}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Location</label>
                          <p className="text-gray-900">{selectedBooking.event.location || 'Location TBD'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Event Duration</label>
                          <p className="text-gray-900">
                            {formatDate(selectedBooking.event.start_date)} - {formatDate(selectedBooking.event.end_date)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Slot</label>
                          <p className="text-gray-900">{selectedBooking.slot}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Customer Name</label>
                        <p className="text-gray-900 font-medium">{selectedBooking.username}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Booking Date</label>
                        <p className="text-gray-900">{formatDate(selectedBooking.booking_date)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-purple-600" />
                      Booking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Number of Seats</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-xl font-bold text-gray-900">{selectedBooking.num_seats}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Price per Seat</label>
                        <p className="text-xl font-bold text-green-600 mt-1">
                          {formatCurrency(selectedBooking.price_per_seat)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total Amount</label>
                        <p className="text-2xl font-bold text-green-700 mt-1">
                          {formatCurrency(selectedBooking.total_price)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">PayPal Order ID</label>
                        <p className="text-sm text-gray-900 mt-1 break-all">
                          {selectedBooking.paypal_order_id || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      Status Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Booking Status</label>
                        {getStatusBadge(selectedBooking.booking_status)}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Payment Status</label>
                        {getPaymentStatusBadge(selectedBooking.payment_status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">Booking Created</p>
                          <p className="text-sm text-gray-500">{formatDate(selectedBooking.created_at)}</p>
                        </div>
                      </div>
                      {selectedBooking.updated_at !== selectedBooking.created_at && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">Last Updated</p>
                            <p className="text-sm text-gray-500">{formatDate(selectedBooking.updated_at)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BookingsPage;