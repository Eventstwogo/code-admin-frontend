"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ExternalLink, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { Partner } from "./types";

interface PartnerActionsProps {
  partner: Partner;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
}

function PartnerActions({ partner, onEdit, onDelete }: PartnerActionsProps) {
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
          onClick={() => navigator.clipboard.writeText(partner.url)}
        >
          Copy URL
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(partner.url, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Visit Website
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(partner)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(partner)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createPartnerColumns = (
  onEdit: (partner: Partner) => void,
  onDelete: (partner: Partner) => void
): ColumnDef<Partner>[] => [
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      const partner = row.original;
      return (
        <div className="flex items-center">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={partner.logo || "/placeholder-logo.svg"}
              alt="Partner Logo"
              fill
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-logo.svg";
              }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "website_url",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Website URL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const url = row.getValue("website_url") as string;
      const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      return (
        <div className="flex items-center space-x-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1"
          >
            {displayUrl}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      if (!date) return <span className="text-muted-foreground">-</span>;
      
      return (
        <div className="text-sm">
          {new Date(date).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => {
      // For now, all partners are active
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Active
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const partner = row.original;
      return (
        <PartnerActions
          partner={partner}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];