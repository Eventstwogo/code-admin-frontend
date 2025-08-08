"use client"

import React, { useEffect, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "@/lib/axiosInstance"
type ContactUsType = {
  contact_us_id: number
  firstname: string
  lastname: string
  email: string
  phone_number: string
  message: string
  contact_us_status: "pending" | "in_progress" | "resolved" | "closed"
  created_at: string
  updated_at: string
}

type StatusFilter = "all" | "pending" | "in_progress" | "resolved" | "closed"

const toTitleCase = (str: string) => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "secondary"
    case "in_progress":
      return "default"
    case "resolved":
      return "outline"
    case "closed":
      return "destructive"
    default:
      return "secondary"
  }
}

const ContactDetailDialog = ({ 
  contact, 
  onStatusUpdate
}: { 
  contact: ContactUsType
  onStatusUpdate: (id: number, status: string) => void
}) => {
  const [selectedStatus, setSelectedStatus] = useState(contact.contact_us_status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async () => {
    if (selectedStatus === contact.contact_us_status) return
    
    setIsUpdating(true)
    try {
      await onStatusUpdate(contact.contact_us_id, selectedStatus)
      toast.success("Status updated successfully")
    } catch (error) {
      toast.error("Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }



  return (
    <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader className="pb-4 sm:pb-6 border-b border-gray-200">
        <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <span className="truncate">Contact Details</span>
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
        {/* Personal Information Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span>Personal Information</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">First Name</label>
              <p className="text-sm sm:text-base font-medium text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-200 break-words">{toTitleCase(contact.firstname)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Last Name</label>
              <p className="text-sm sm:text-base font-medium text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-200 break-words">{toTitleCase(contact.lastname)}</p>
            </div>
          </div>
        </div>
        
        {/* Contact Information Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 sm:p-6 border border-green-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex-shrink-0"></div>
            <span>Contact Information</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Email Address</label>
              <p className="text-sm sm:text-base font-medium text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-200 break-all">{contact.email}</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Phone Number</label>
              <p className="text-sm sm:text-base font-medium text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-200 break-words">{contact.phone_number}</p>
            </div>
          </div>
        </div>

        {/* Message Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 sm:p-6 border border-purple-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex-shrink-0"></div>
            <span>Message</span>
          </h3>
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
            <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{contact.message}</p>
          </div>
        </div>

        {/* Timestamps Section */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 sm:p-6 border border-orange-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 rounded-full flex-shrink-0"></div>
            <span>Timeline</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Submitted On</label>
              <p className="text-sm sm:text-base font-medium text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-200 break-words">{new Date(contact.created_at).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Last Updated</label>
              <p className="text-sm sm:text-base font-medium text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-200 break-words">{new Date(contact.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Status Management Section */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-500 rounded-full flex-shrink-0"></div>
            <span>Status Management</span>
          </h3>
          <div className="flex flex-col gap-4">
            {/* Current Status */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Current Status:
              </label>
              <Badge variant={getStatusBadgeVariant(contact.contact_us_status)} className="text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit">
                {contact.contact_us_status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            
            {/* Status Update Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 sm:flex-initial">
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ContactUsType["contact_us_status"])}>
                  <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">🟡 Pending</SelectItem>
                    <SelectItem value="in_progress">🔵 In Progress</SelectItem>
                    <SelectItem value="resolved">🟢 Resolved</SelectItem>
                    <SelectItem value="closed">🔴 Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedStatus !== contact.contact_us_status && (
                <Button 
                  onClick={handleStatusUpdate} 
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-md transition-colors duration-200 shadow-sm w-full sm:w-auto text-sm sm:text-base"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="hidden sm:inline">Updating...</span>
                      <span className="sm:hidden">Updating</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Update Status</span>
                      <span className="sm:hidden">Update</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

const createColumns = (
  onStatusUpdate: (id: number, status: string) => void
): ColumnDef<ContactUsType>[] => [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "firstname",
    header: "First Name",
    cell: ({ row }) => toTitleCase(row.original.firstname),
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
    cell: ({ row }) => toTitleCase(row.original.lastname),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div
        className="max-w-xs truncate text-gray-700"
        title={row.original.message}
      >
        {row.original.message}
      </div>
    ),
  },
  {
    accessorKey: "contact_us_status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.contact_us_status)}>
        {row.original.contact_us_status.replace("_", " ").toUpperCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Submitted On",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-colors duration-200 shadow-sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </DialogTrigger>
        <ContactDetailDialog 
          contact={row.original} 
          onStatusUpdate={onStatusUpdate}
        />
      </Dialog>
    ),
  },
]

const DataTable = ({
  data,
  columns,
  onStatusUpdate,
}: {
  data: ContactUsType[]
  columns: ColumnDef<ContactUsType>[]
  onStatusUpdate: (id: number, status: string) => void
}) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 xl:px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-xs whitespace-nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Eye className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">No enquiries found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or check back later</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <tr key={row.id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 xl:px-6 py-4 text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {table.getRowModel().rows.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No enquiries found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or check back later</p>
            </div>
          </div>
        ) : (
          table.getRowModel().rows.map((row, index) => (
            <div key={row.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <Badge variant={getStatusBadgeVariant(row.original.contact_us_status)} className="text-xs">
                        {row.original.contact_us_status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {toTitleCase(row.original.firstname)} {toTitleCase(row.original.lastname)}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <span className="break-all">{row.original.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Phone:</span>
                        <span>{row.original.phone_number}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-colors duration-200 shadow-sm w-full sm:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <ContactDetailDialog 
                        contact={row.original} 
                        onStatusUpdate={onStatusUpdate}
                      />
                    </Dialog>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                    <p className="text-sm text-gray-600 overflow-hidden" 
                       style={{
                         display: '-webkit-box',
                         WebkitLineClamp: 2,
                         WebkitBoxOrient: 'vertical'
                       }}
                       title={row.original.message}>
                      {row.original.message}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                    <span>Submitted: {new Date(row.original.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(row.original.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg border border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Showing entries info */}
          <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md text-center lg:text-left">
            <span className="hidden sm:inline">
              Showing <span className="font-semibold text-gray-900">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{" "}
              of <span className="font-semibold text-gray-900">{table.getFilteredRowModel().rows.length}</span> entries
            </span>
            <span className="sm:hidden">
              <span className="font-semibold text-gray-900">{table.getFilteredRowModel().rows.length}</span> total entries
            </span>
          </div>
          
          {/* Pagination controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm px-2 sm:px-3"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            {/* Page indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Page</span>
              <div className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium">
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AdminEnquiriesPage = () => {
  const [formData, setFormData] = useState<ContactUsType[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [skip, setSkip] = useState(0)
  const [limit] = useState(100)
  const [totalCount, setTotalCount] = useState(0)

  const fetchData = async (filter: StatusFilter = statusFilter, skipValue: number = skip) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        skip: skipValue.toString(),
        limit: limit.toString(),
      })
      
      if (filter !== "all") {
        params.append("status_filter", filter)
      }

      const response = await axiosInstance.get(`/api/v1/admin/contact-us?${params}`)
      const data = response.data.data
      setFormData(data)
      setTotalCount(data.length)
      console.log("data", data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch enquiries")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await axiosInstance.put(`/api/v1/admin/contact-us/${id}`, {
        contact_us_status: status
      })
      
      // Update the local state
      setFormData(prev => 
        prev.map(item => 
          item.contact_us_id === id 
            ? { ...item, contact_us_status: status as ContactUsType["contact_us_status"], updated_at: new Date().toISOString() }
            : item
        )
      )
    } catch (error) {
      console.error("Error updating status:", error)
      throw error
    }
  }



  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter)
    setSkip(0)
    fetchData(filter, 0)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns = createColumns(handleStatusUpdate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <CardHeader className="bg-white rounded-t-xl shadow-sm border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    Customer Enquiries
                  </CardTitle>
                  <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">
                    Manage and respond to customer inquiries
                  </p>
                </div>
              </div>
              
              {/* Controls Section */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Filter Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-gray-50 p-3 sm:px-4 sm:py-2 rounded-lg border border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                    Filter by Status:
                  </span>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-full sm:w-44 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🔍 All Status</SelectItem>
                      <SelectItem value="pending">🟡 Pending</SelectItem>
                      <SelectItem value="in_progress">🔵 In Progress</SelectItem>
                      <SelectItem value="resolved">🟢 Resolved</SelectItem>
                      <SelectItem value="closed">🔴 Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Refresh Button */}
                <Button 
                  onClick={() => fetchData(statusFilter, skip)} 
                  variant="outline"
                  disabled={loading}
                  className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm w-full sm:w-auto"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh Data</span>
                </Button>
              </div>
            </div>
            
            {/* Total Count Badge */}
            {totalCount > 0 && (
              <div className="flex justify-center sm:justify-start">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 inline-flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-xs sm:text-sm font-medium text-blue-800">
                    Total {totalCount} enquiries found
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="bg-white rounded-b-xl shadow-sm p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600">Loading enquiries...</p>
            </div>
          ) : (
            <div className="p-6">
              <DataTable columns={columns} data={formData} onStatusUpdate={handleStatusUpdate} />
            </div>
          )}
        </CardContent>
      </div>
    </div>
  )
}

export default AdminEnquiriesPage
