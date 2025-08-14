"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { usePartners, usePartnerFilters, usePartnerStats, usePartnerActions } from "./hooks";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { PartnerFormDialog } from "./components/PartnerFormDialog";
import { PartnerStats } from "./components/PartnerStats";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Partner } from "./types";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

export default function PartnersPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  
  // Hooks
  const { partners, setPartners, loading, error, refetch } = usePartners();
  const { filters, filteredPartners, updateFilter } = usePartnerFilters(partners);
  const stats = usePartnerStats(partners);
  const { handleAddPartner, handleUpdatePartner, handleDeletePartner } = usePartnerActions(setPartners);

  // Handle edit partner
  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowEditDialog(true);
  };

  // Handle delete partner
  const handleDelete = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowDeleteDialog(true);
  };

  // Handle status toggle
  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      // Call the API to toggle status (you mentioned the API endpoint)
      // Note: You mentioned /api/v1/advertisements/status/{ad_id} for partners, 
      // but it should probably be /api/v1/partners/status/{partner_id}
      await axiosInstance.patch(`/api/v1/partners/status/${id}` );
      
      // Update the local state
      setPartners(prev => 
        prev.map(partner => 
          partner.partner_id === id 
            ? { ...partner, partner_status: !currentStatus }
            : partner
        )
      );
      
      // Show success message
      const message = currentStatus ? 'Partner activated successfully' : 'Partner deactivated successfully';
      toast.success(message);
    } catch (error) {
      console.error('Error toggling partner status:', error);
      // You can add error toast notification here if available
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (selectedPartner) {
      const success = await handleDeletePartner(selectedPartner.partner_id);
      if (success) {
        setShowDeleteDialog(false);
        setSelectedPartner(null);
      }
    }
  };

  // Handle update partner
  const handleUpdate = async (formData: any) => {
    if (selectedPartner) {
      const success = await handleUpdatePartner(selectedPartner.partner_id, formData);
      if (success) {
        setShowEditDialog(false);
        setSelectedPartner(null);
      }
      return success;
    }
    return false;
  };

  // Partner actions component
  const PartnerActions = ({ partner }: { partner: Partner }) => (
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
          onClick={() => navigator.clipboard.writeText(partner.website_url)}
        >
          Copy URL
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(partner.website_url, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Visit Website
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleEdit(partner)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(partner)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
          <p className="text-muted-foreground">
            Manage your business partners and their information
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Partner
        </Button>
      </div>

      {/* Stats */}
      <PartnerStats stats={stats} />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by URL..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Partners ({filteredPartners.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPartners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">No partners found</h3>
                <p className="text-muted-foreground">
                  {partners.length === 0
                    ? "Get started by adding your first partner."
                    : "Try adjusting your search criteria."}
                </p>
                {partners.length === 0 && (
                  <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Partner
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead >S.No</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead>Website URL</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((partner) => (
                  <TableRow key={partner.partner_id}>
                    <TableCell className="w-12">
                      {filteredPartners.indexOf(partner) + 1}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1"
                      >
                        {partner.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      {partner.created_at ? new Date(partner.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!partner.partner_status}
                          onCheckedChange={() => handleStatusToggle(partner.partner_id, partner.partner_status)}
                        />
                        <Badge 
                          variant={!partner.partner_status ? "default" : "secondary"}
                          className={!partner.partner_status 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }
                        >
                          {partner.partner_status ? "Inactive" : "Active"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <PartnerActions partner={partner} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Partner Dialog */}
      <PartnerFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddPartner}
        title="Add New Partner"
        submitText="Add Partner"
      />

      {/* Edit Partner Dialog */}
      <PartnerFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleUpdate}
        initialData={selectedPartner ? {
          url: selectedPartner.website_url,
          logo: null, // New file will be handled in the form
          existingLogo: selectedPartner.logo, // Show existing logo
        } : undefined}
        title="Edit Partner"
        submitText="Update Partner"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Partner"
        description={`Are you sure you want to delete the partner "${selectedPartner?.website_url}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}