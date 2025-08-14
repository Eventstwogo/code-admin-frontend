"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar, Clock, Eye, Edit, MapPin, MoreHorizontal, Trash2, Users, Star, Ticket, Settings } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Event interfaces
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

export interface Event {
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
  event_status: "ACTIVE" | "INACTIVE" | "PENDING";
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

// Actions cell component
const ActionsCell = ({ 
  event, 
  onDelete 
}: { 
  event: Event; 
  onDelete: (id: string) => void;
}) => {
  const router = useRouter()

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
          onClick={() => navigator.clipboard.writeText(event.event_id)}
        >
          Copy event ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/Events/view/${event.event_id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/Events/BasicInfo?event_id=${event.event_id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit event
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(event.event_id)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const createColumns = (
  onDelete: (id: string) => void,
  onFeaturedToggle?: (eventId: string, currentStatus: boolean) => void,
  onCreateCoupons?: (eventId: string) => void,
  onStatusToggle?: (eventId: string, currentStatus: "ACTIVE" | "INACTIVE" | "PENDING") => void,
  onCreateSlots?: (eventId: string) => void
): ColumnDef<Event>[] => [
{
  id: "serialNumber",
  header: "S.No",
  cell: ({ row }) => row.index + 1, // This gives the row number starting from 1
  enableSorting: false,
  enableHiding: false,
  size: 50, // Optional: fixed width for the S.No column
},

  {
    accessorKey: "event_title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const event = row.original
      return (
        <div className="space-y-1 w-full max-w-[320px] pr-4">
          <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight">
            {event.event_title}
          </h3>
          {event.extra_data?.address && (
            <div className="flex items-center text-xs text-gray-600">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1 truncate">{event.extra_data.address}</span>
            </div>
          )}
          {event.extra_data?.duration && (
            <div className="flex items-center text-xs text-gray-600">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{event.extra_data.duration}</span>
            </div>
          )}
          {event.hash_tags && event.hash_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {event.hash_tags.slice(0, 2).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag.length > 10 ? `${tag.substring(0, 10)}...` : tag}
                </Badge>
              ))}
              {event.hash_tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{event.hash_tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      )
    },
    size: 350, // Fixed width for event details column (increased for more space)
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const event = row.original
      return event.category ? (
        <div className="space-y-1 w-full pl-2">
          <Badge variant="outline" className="text-xs truncate max-w-[150px]" title={event.category.category_name}>
            {event.category.category_name.length > 18 ? 
              `${event.category.category_name.substring(0, 18)}...` : 
              event.category.category_name
            }
          </Badge>
          {event.subcategory && (
            <div className="text-xs text-gray-500 truncate max-w-[150px]" title={event.subcategory.subcategory_name}>
              {event.subcategory.subcategory_name.length > 20 ? 
                `${event.subcategory.subcategory_name.substring(0, 20)}...` : 
                event.subcategory.subcategory_name
              }
            </div>
          )}
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No category</span>
      )
    },
    sortingFn: (rowA, rowB) => {
      const categoryA = rowA.original.category?.category_name || ""
      const categoryB = rowB.original.category?.category_name || ""
      return categoryA.localeCompare(categoryB)
    },
    size: 180, // Fixed width for category column (increased for more space)
  },
  {
    accessorKey: "organizer",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organizer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const event = row.original
      return event.organizer ? (
        <div className="flex items-center space-x-2 w-full pl-2">
          <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate max-w-[150px]" title={event.extra_data?.organizer || event.organizer.username}>
            {event.extra_data?.organizer || event.organizer.username}
          </span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No organizer</span>
      )
    },
    sortingFn: (rowA, rowB) => {
      const organizerA = rowA.original.organizer?.username || ""
      const organizerB = rowB.original.organizer?.username || ""
      return organizerA.localeCompare(organizerB)
    },
    size: 180, // Fixed width for organizer column
  },
  {
    accessorKey: "event_status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const event = row.original
      
      if (event.event_status === "PENDING") {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCreateSlots?.(event.event_id)}
            className="flex items-center gap-2 hover:bg-orange-50 hover:text-orange-600 border-orange-200"
          >
            <Settings className="h-4 w-4" />
            Create Slots
          </Button>
        )
      }
      
      // For ACTIVE/INACTIVE status, show toggle switch
      const isActive = event.event_status === "ACTIVE"
      return (
        <Switch
          checked={isActive}
          onCheckedChange={() => onStatusToggle?.(event.event_id, event.event_status)}
          className="data-[state=checked]:bg-green-500"
        />
      )
    },
    size: 100, // Fixed width for status column (increased for switch)
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const event = row.original
      return (
        <div className="text-sm text-gray-600">
          {new Date(event.created_at).toLocaleDateString()}
        </div>
      )
    },
    size: 120, // Fixed width for created date column
  },
  {
    id: "featured",
    header: "Featured List",
    cell: ({ row }) => {
      const event = row.original
      const isFeatured = event.featured_event || false
      
      return (
        <Button
          variant={isFeatured ? "default" : "outline"}
          size="sm"
          onClick={() => onFeaturedToggle?.(event.event_id, isFeatured)}
          className={`flex items-center gap-2 ${
            isFeatured 
              ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
              : "hover:bg-yellow-50 hover:text-yellow-600"
          }`}
        >
          <Star className={`h-4 w-4 ${isFeatured ? "fill-current" : ""}`} />
          {isFeatured ? "Featured" : "Not Featured"}
        </Button>
      )
    },
    enableSorting: false,
    size: 140, // Fixed width for featured column
  },
  {
    id: "coupons",
    header: "Coupons",
    cell: ({ row }) => {
      const event = row.original
      
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateCoupons?.(event.event_id)}
          className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
        >
          <Ticket className="h-4 w-4" />
          Create Coupons
        </Button>
      )
    },
    enableSorting: false,
    size: 180, // Fixed width for coupons column
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const event = row.original
      return <ActionsCell event={event} onDelete={onDelete} />
    },
    size: 80, // Fixed width for actions column
  },
]