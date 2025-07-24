"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar, Clock, Eye, Edit, MapPin, MoreHorizontal, Trash2, Users } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  event_status: boolean;
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
  onDelete: (id: string) => void
): ColumnDef<Event>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "card_image",
    header: "Image",
    cell: ({ row }) => {
      const event = row.original
      return (
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
      )
    },
    enableSorting: false,
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
        <div className="space-y-1 min-w-[200px]">
          <h3 className="font-semibold text-gray-800 line-clamp-1">
            {event.event_title}
          </h3>
          {event.extra_data?.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{event.extra_data.address}</span>
            </div>
          )}
          {event.extra_data?.duration && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              {event.extra_data.duration}
            </div>
          )}
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
      )
    },
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
      ) : (
        <span className="text-gray-400">No category</span>
      )
    },
    sortingFn: (rowA, rowB) => {
      const categoryA = rowA.original.category?.category_name || ""
      const categoryB = rowB.original.category?.category_name || ""
      return categoryA.localeCompare(categoryB)
    },
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
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600 line-clamp-1">
            {event.organizer.username}
          </span>
        </div>
      ) : (
        <span className="text-gray-400">No organizer</span>
      )
    },
    sortingFn: (rowA, rowB) => {
      const organizerA = rowA.original.organizer?.username || ""
      const organizerB = rowB.original.organizer?.username || ""
      return organizerA.localeCompare(organizerB)
    },
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
      return (
        <Badge variant={event.event_status ? "default" : "secondary"}>
          {event.event_status ? "Inactive" : "Active"}
        </Badge>
      )
    },
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
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const event = row.original
      return <ActionsCell event={event} onDelete={onDelete} />
    },
  },
]