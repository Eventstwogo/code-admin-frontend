"use client"

import { useState, useEffect } from "react"
import axiosInstance from "@/lib/axiosInstance"
import {User} from "lucide-react"
import { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  RefreshCw,
  Search,
  MoreHorizontal,
  Send,
  MessageSquare,
  XCircle,
  Calendar,
  Reply,Clock
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import useStore from "@/lib/Zustand"
import { toast } from "sonner"
interface ThreadMessage {
  type: "query" | "response" | "followup"
  sender_type: "organizer" | "admin"
  user_id: string
  username: string
  message: string
  timestamp: string
}

interface Query {
  id: number
  sender_user_id: string
  receiver_user_id: string
  title: string
  category: string
  thread: ThreadMessage[]
  query_status: "pending" | "resolved" | "closed" | "in-progress"
  created_at: string
  updated_at: string
  last_message: string
  unread_count: number
}

interface ApiResponse {
  statusCode: number
  message: string
  timestamp: string
  method: string
  path: string
  data: {
    queries: Query[]
    status_filter: string
    pagination: {
      current_page: number
      total_pages: number
      total_items: number
      items_per_page: number
      has_next: boolean
      has_prev: boolean
    }
  }
}

// Legacy interface for backward compatibility
interface LegacyQuery {
  id: string
  title: string
  category: string
  status: "pending" | "in-progress" | "resolved" | "closed"
  description: string
  vendorEmail: string
  vendorName: string
  createdAt: string
  updatedAt: string
  adminResponse?: string
  adminName?: string
  followUps: FollowUp[]
}

interface FollowUp {
  id: string
  message: string
  sender: "vendor" | "admin"
  senderName: string
  createdAt: string
}

// Skeleton Components
const QueryListSkeleton = () => {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Title</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Vendor</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Category</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Created</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-4 px-6">
                    <Skeleton className="h-8 w-8 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

const QueryDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Query Info Skeleton */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-80" />
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Response Skeleton */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-32 w-full rounded" />
                </div>
                <Skeleton className="h-10 w-32 rounded" />
              </div>
            </CardContent>
          </Card>

          {/* Follow-ups Skeleton */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <div className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AdminEnquiryManagement() {
  const [currentView, setCurrentView] = useState<"list" | "details">("list")
  const [selectedQuery, setSelectedQuery] = useState<LegacyQuery | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [responseMessage, setResponseMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queries, setQueries] = useState<LegacyQuery[]>([])
  const [apiQueries, setApiQueries] = useState<Query[]>([])
  const { userId } = useStore()
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20,
    has_next: false,
    has_prev: false
  })

  // API Functions
  const fetchQueries = async (status: string = "all", page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const endpoint = `/api/v1/organizers/queries/all/by-status`
      const params = {
        ...(status !== "all" && { status }),
        page,
        limit: 20
      }
      
      console.log('Fetching queries from:', endpoint, 'with params:', params)
      
      const response = await axiosInstance.get(endpoint, { params })
      const data: ApiResponse = response.data
      
      console.log('API Response:', data)
      
      if (data.statusCode === 200) {
        setApiQueries(data.data.queries)
        setPagination(data.data.pagination)
        
        // Transform API data to legacy format for existing UI
        const transformedQueries = transformApiQueriesToLegacy(data.data.queries)
        console.log('Transformed queries:', transformedQueries)
        setQueries(transformedQueries)
      } else {
        throw new Error(data.message || 'Failed to fetch queries')
      }
    } catch (err) {
      console.error('Error fetching queries:', err)
      
      // Handle axios error response
      if (err instanceof AxiosError) {
        if (err.response) {
          // Server responded with error status
          const errorMessage = err.response.data?.message || `HTTP error! status: ${err.response.status}`
          setError(errorMessage)
        } else if (err.request) {
          // Request was made but no response received
          setError('Network error: Unable to connect to server')
        } else {
          // Something else happened in setting up the request
          setError(err.message || 'Failed to fetch queries')
        }
      } else {
        // Non-axios error
        setError(err instanceof Error ? err.message : 'Failed to fetch queries')
      }
    } finally {
      setLoading(false)
    }
  }

  // Transform API data to legacy format
  const transformApiQueriesToLegacy = (apiQueries: Query[]): LegacyQuery[] => {
    return apiQueries.map((query) => {
      const firstMessage = query.thread.find(msg => msg.type === "query")
      
      // Get the first admin response for the main adminResponse field
      const firstAdminResponse = query.thread.find(msg => msg.sender_type === "admin" && msg.type === "response")
      
      // Create followUps from all messages after the initial query
      // Sort by timestamp to ensure chronological order
      const followUps = query.thread
        .slice(1) // Skip the first message (initial query)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((msg, index) => ({
          id: `MSG-${query.id}-${index}`,
          message: msg.message,
          sender: msg.sender_type === "admin" ? "admin" as const : "vendor" as const,
          senderName: msg.username,
          createdAt: msg.timestamp,
        }))

      console.log(`Query ${query.id} transformation:`, {
        originalThread: query.thread,
        firstMessage,
        firstAdminResponse,
        followUps
      })

      // Map API status to legacy status
      const statusMap: Record<string, "pending" | "in-progress" | "resolved" | "closed"> = {
        "pending": "pending",
        "resolved": "resolved",
        "closed": "closed",
        "in-progress": "in-progress"
      }

      return {
        id: `QRY-${query.id.toString().padStart(3, '0')}`,
        title: query.title,
        category: query.category,
        status: statusMap[query.query_status] || "pending",
        description: firstMessage?.message || query.last_message,
        vendorEmail: `${firstMessage?.username}@example.com`, // API doesn't provide email
        vendorName: firstMessage?.username || "Unknown User",
        createdAt: query.created_at,
        updatedAt: query.updated_at,
        adminResponse: firstAdminResponse?.message,
        adminName: firstAdminResponse?.username,
        followUps: followUps,
      }
    })
  }

  // Fetch queries on component mount and when status filter changes
  useEffect(() => {
    fetchQueries(statusFilter, 1)
  }, [statusFilter])

  // Refresh function
  const handleRefresh = () => {
    fetchQueries(statusFilter, pagination.current_page)
  }

  const categories = [
    { value: "technical", label: "Technical" },
    { value: "payment", label: "Payment" },
    { value: "feature-request", label: "Feature Request" },
    { value: "account", label: "Account" },
    { value: "billing", label: "Billing" },
    { value: "other", label: "Other" },
  ]



  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const filteredQueries = queries.filter((query) => {
    const matchesSearch =
      query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || query.status === statusFilter

    return matchesSearch && matchesStatus
  })





  const handleSubmitResponse = async () => {
    if (!responseMessage.trim() || !selectedQuery) return

    setIsSubmitting(true)

    try {
      // Extract the numeric ID from the query ID (remove QRY- prefix)
      const numericId = selectedQuery.id.replace('QRY-', '').replace(/^0+/, '') || '1'
      const endpoint = `/api/v1/organizers/queries/${numericId}/messages`
      
      // Get current admin user ID from session storage or use a default
     
      
      const payload = {
        user_id: userId,
        message: responseMessage.trim(),
        message_type: "response"
      }

      console.log('Sending response to:', endpoint, 'with payload:', payload)

      const response = await axiosInstance.post(endpoint, payload)
      const data = response.data

      console.log('Response API result:', data)

      if (data.statusCode === 200 || data.statusCode === 201) {
        // Update the local state with the new response
        const updatedQuery = {
          ...selectedQuery,
          adminResponse: responseMessage,
          adminName: "Current Admin",
          status: "in-progress" as const,
          updatedAt: new Date().toISOString(),
        }

        setQueries(queries.map((query) => (query.id === selectedQuery.id ? updatedQuery : query)))
        setSelectedQuery(updatedQuery)
        setResponseMessage("")
        
        // Optionally refresh the queries to get the latest data
        await fetchQueries(statusFilter, pagination.current_page)
      } else {
        throw new Error(data.message || 'Failed to send response')
      }
    } catch (err) {
      console.error('Error sending response:', err)
      
      let errorMessage = 'Failed to send response'
      
      if (err instanceof AxiosError) {
        if (err.response) {
          errorMessage = err.response.data?.message || `HTTP error! status: ${err.response.status}`
        } else if (err.request) {
          errorMessage = 'Network error: Unable to connect to server'
        } else {
          errorMessage = err.message || 'Failed to send response'
        }
      } else {
        errorMessage = err instanceof Error ? err.message : 'Failed to send response'
      }
      
      // Show error to user (you might want to add a toast notification here)
      setError(errorMessage)
      toast.error(`Error: ${errorMessage}`) // Temporary error display
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitFollowUpResponse = async (followUpMessage: string) => {
    if (!followUpMessage.trim() || !selectedQuery) return

    setIsSubmittingFollowUp(true)

    try {
      // Extract the numeric ID from the query ID (remove QRY- prefix)
      const numericId = selectedQuery.id.replace('QRY-', '').replace(/^0+/, '') || '1'
      const endpoint = `/api/v1/organizers/queries/${numericId}/messages`
      
      // Get current admin user ID from session storage or use a default
    
      
      const payload = {
        user_id: userId,
        message: followUpMessage.trim(),
        message_type: "response"
      }

      console.log('Sending follow-up response to:', endpoint, 'with payload:', payload)

      const response = await axiosInstance.post(endpoint, payload)
      const data = response.data

      console.log('Follow-up response API result:', data)

      if (data.statusCode === 200 || data.statusCode === 201) {
        // Create new follow-up for local state
        const newFollowUp: FollowUp = {
          id: `FU-${Date.now()}`,
          message: followUpMessage,
          sender: "admin",
          senderName: "Current Admin",
          createdAt: new Date().toISOString(),
        }

        const updatedQuery = {
          ...selectedQuery,
          followUps: [...selectedQuery.followUps, newFollowUp],
          updatedAt: new Date().toISOString(),
        }

        setQueries(queries.map((query) => (query.id === selectedQuery.id ? updatedQuery : query)))
        setSelectedQuery(updatedQuery)
        
        // Optionally refresh the queries to get the latest data
        await fetchQueries(statusFilter, pagination.current_page)
      } else {
        throw new Error(data.message || 'Failed to send follow-up response')
      }
    } catch (err) {
      console.error('Error sending follow-up response:', err)
      
      let errorMessage = 'Failed to send follow-up response'
      
      if (err instanceof AxiosError) {
        if (err.response) {
          errorMessage = err.response.data?.message || `HTTP error! status: ${err.response.status}`
        } else if (err.request) {
          errorMessage = 'Network error: Unable to connect to server'
        } else {
          errorMessage = err.message || 'Failed to send follow-up response'
        }
      } else {
        errorMessage = err instanceof Error ? err.message : 'Failed to send follow-up response'
      }
      
      // Show error to user (you might want to add a toast notification here)
      toast.error(`Error: ${errorMessage}`) // Temporary error display
    } finally {
      setIsSubmittingFollowUp(false)
    }
  }

  if (currentView === "details") {
    if (loading) {
      return <QueryDetailsSkeleton />
    }
    
    if (!selectedQuery) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Query not found</h2>
            <p className="text-gray-600 mb-4">The selected query could not be loaded.</p>
            <Button onClick={() => setCurrentView("list")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
          </div>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("list")}
                  className="p-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Query Details</h1>
                  <p className="text-gray-600">View and manage query communication</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(selectedQuery.status)} border`}>{selectedQuery.status}</Badge>
            </div>
          </div>

          <div className="space-y-6">
            {/* Query Info */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedQuery.title}</h2>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedQuery.vendorName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(selectedQuery.createdAt)}
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {selectedQuery.category}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedQuery.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-sm">
                    <div>
                      <span className="text-gray-600">Vendor Email</span>
                      <p className="text-gray-900">{selectedQuery.vendorEmail}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated</span>
                      <p className="text-gray-900">{formatDateTime(selectedQuery.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Response */}
            {selectedQuery.adminResponse ? (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Admin Response</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedQuery.adminResponse}</p>
                  {selectedQuery.adminName && (
                    <p className="text-sm text-gray-600 mt-2">Response by: {selectedQuery.adminName}</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Reply className="w-5 h-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Admin Response</h3>
                  </div>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your response here..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px] resize-none"
                    />
                    <Button
                      onClick={handleSubmitResponse}
                      disabled={!responseMessage.trim() || isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Response
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Follow-up Messages */}
            {selectedQuery.followUps.length > 0 && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {selectedQuery.followUps.map((followUp, index) => (
                      <div key={followUp.id} className="space-y-4">
                        <div
                          className={`border-l-4 pl-4 ${followUp.sender === "vendor" ? "border-blue-200" : "border-green-200"}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {followUp.sender === "vendor" ? "Vendor Message" : "Admin Response"}
                            </span>
                            <span className="text-sm text-red-600">{formatDateTime(followUp.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{followUp.message}</p>
                        </div>


                      </div>
                    ))}
                    
                    {/* Response form if the last message is from vendor */}
                    {selectedQuery.followUps.length > 0 && selectedQuery.status !== "closed" && selectedQuery.status !== "resolved" &&
                     selectedQuery.followUps[selectedQuery.followUps.length - 1].sender === "vendor" && (
                      <div className="mt-6 p-4 border-l-4 border-blue-200 bg-blue-50">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Respond to Latest Message</h4>
                          <Textarea
                            placeholder="Type your response here..."
                            disabled={isSubmittingFollowUp}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px] resize-none bg-white"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.ctrlKey && !isSubmittingFollowUp) {
                                const target = e.target as HTMLTextAreaElement
                                if (target.value.trim()) {
                                  handleSubmitFollowUpResponse(target.value)
                                  target.value = ""
                                }
                              }
                            }}
                          />
                          <Button
                            onClick={(e) => {
                              const textarea = e.currentTarget.parentElement?.querySelector(
                                "textarea",
                              ) as HTMLTextAreaElement
                              if (textarea?.value.trim()) {
                                handleSubmitFollowUpResponse(textarea.value)
                                textarea.value = ""
                              }
                            }}
                            disabled={isSubmittingFollowUp}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            {isSubmittingFollowUp ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Response
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}


          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Query Management</h1>
            <p className="text-gray-600">Manage and respond to vendor queries</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border border-red-200 shadow-sm mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error loading queries</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="ml-auto"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Queries Table */}
        {loading ? (
          <QueryListSkeleton />
        ) : (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Title</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Vendor</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Category</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Created</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredQueries.map((query) => (
                    <tr key={query.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">{query.title}</div>
                          <div className="text-sm text-gray-600 truncate max-w-md">{query.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{query.vendorName}</div>
                          <div className="text-sm text-gray-600">{query.vendorEmail}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{query.category}</td>
                      <td className="py-4 px-6">
                        <Badge className={`${getStatusColor(query.status)} border text-xs`}>{query.status}</Badge>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{formatDate(query.createdAt)}</td>
                      <td className="py-4 px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedQuery(query)
                                setCurrentView("details")
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                           
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && filteredQueries.length === 0 && !error && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No queries found</h3>
            <p className="text-gray-600">No queries match your current filters.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {((pagination.current_page - 1) * pagination.items_per_page) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} of{' '}
              {pagination.total_items} queries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchQueries(statusFilter, pagination.current_page - 1)}
                disabled={!pagination.has_prev || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchQueries(statusFilter, pagination.current_page + 1)}
                disabled={!pagination.has_next || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
