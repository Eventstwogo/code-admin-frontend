"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
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

export interface Advertisement {
  ad_id: string
  title: string
  banner: string
  target_url: string
  ad_status: boolean
  created_at: string
  updated_at: string
}

// Actions cell component
const ActionsCell = ({ 
  advertisement, 
  onEdit,
  onDelete 
}: { 
  advertisement: Advertisement
  onEdit: (ad: Advertisement) => void
  onDelete: (id: string) => void
}) => {
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
          onClick={() => navigator.clipboard.writeText(advertisement.ad_id)}
        >
          Copy advertisement ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(advertisement)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit advertisement
        </DropdownMenuItem>
        {advertisement.target_url && (
          <DropdownMenuItem 
            onClick={() => window.open(advertisement.target_url, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit URL
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(advertisement.ad_id)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete advertisement
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const createAdvertisementColumns = (
  onEdit: (ad: Advertisement) => void,
  onDelete: (id: string) => void
): ColumnDef<Advertisement>[] => [
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
    size: 50,
  },
  {
    accessorKey: "banner",
    header: "Banner",
    cell: ({ row }) => {
      const advertisement = row.original
      return (
        <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-gray-200">
          {advertisement.banner ? (
            <Image
              src={advertisement.banner}
              alt={advertisement.title}
              fill
              sizes="96px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    size: 120,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const advertisement = row.original
      return (
        <div className="space-y-1 w-full max-w-[300px] pr-4">
          <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight">
            {advertisement.title}
          </h3>
          <div className="text-xs text-gray-500">
            ID: {advertisement.ad_id}
          </div>
        </div>
      )
    },
    size: 300,
  },
  {
    accessorKey: "target_url",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Target URL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const advertisement = row.original
      return (
        <div className="space-y-1 w-full max-w-[250px]">
          {advertisement.target_url ? (
            <>
              <a 
                href={advertisement.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm truncate block"
                title={advertisement.target_url}
              >
                {advertisement.target_url}
              </a>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ExternalLink className="h-3 w-3" />
                <span>Click to visit</span>
              </div>
            </>
          ) : (
            <span className="text-gray-400 text-sm">No URL</span>
          )}
        </div>
      )
    },
    size: 250,
  },
  {
    accessorKey: "ad_status",
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
      const advertisement = row.original
      return (
        <Badge variant={advertisement.ad_status ? "default" : "secondary"}>
          {advertisement.ad_status ? "Inactive" : "Active"}
        </Badge>
      )
    },
    size: 100,
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
      const advertisement = row.original
      return (
        <div className="text-sm text-gray-600">
          {new Date(advertisement.created_at).toLocaleDateString()}
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const advertisement = row.original
      return (
        <div className="text-sm text-gray-600">
          {new Date(advertisement.updated_at).toLocaleDateString()}
        </div>
      )
    },
    size: 120,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const advertisement = row.original
      return <ActionsCell advertisement={advertisement} onEdit={onEdit} onDelete={onDelete} />
    },
    size: 80,
  },
]