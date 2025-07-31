"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";

// Import types
import { Organizer } from "./types";

// Import hooks
import {
  useOrganizers,
  useOrganizerFilters,
  useOrganizerStats,
  useOrganizerActions,
} from "./hooks";

// Import utilities
import { exportOrganizersToCSV } from "./utils";

// Import components
import { StatCard } from "./components/StatCard";
import { PageHeader } from "./components/PageHeader";
import { SearchAndFilters } from "./components/SearchAndFilters";
import { OrganizersTable } from "./components/OrganizersTable";
import { OrganizerDetailsDialog } from "./components/OrganizerDetailsDialog";
import { ConfirmationDialogs } from "./components/ConfirmationDialogs";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "./components/LoadingAndErrorStates";

const OrganizerManagement = () => {
  // State for selected organizer and dialogs
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizerToDelete, setOrganizerToDelete] = useState<Organizer | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [organizerToReject, setOrganizerToReject] = useState<Organizer | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [organizerToRestore, setOrganizerToRestore] = useState<Organizer | null>(null);

  // Custom hooks
  const { organizers, setOrganizers, loading, error } = useOrganizers();
  const { filters, filteredOrganizers, updateFilter } = useOrganizerFilters(organizers);
  const stats = useOrganizerStats(organizers);
  const {
    handleApproveOrganizer,
    handleRejectOrganizer,
    handleDeleteOrganizer,
    handleRestoreOrganizer,
  } = useOrganizerActions(setOrganizers);

  // Dialog handlers
  const handleRejectOrganizerDialog = (organizer: Organizer) => {
    setOrganizerToReject(organizer);
    setRejectDialogOpen(true);
  };

  const confirmRejectOrganizer = async () => {
    if (organizerToReject) {
      const success = await handleRejectOrganizer(organizerToReject);
      if (success) {
        setSelectedOrganizer((prev) =>
          prev && prev.id === organizerToReject.id
            ? { ...prev, status: "rejected", isActive: false }
            : prev
        );
      }
      setRejectDialogOpen(false);
      setOrganizerToReject(null);
    }
  };

  const handleDeleteOrganizerDialog = (organizer: Organizer) => {
    setOrganizerToDelete(organizer);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteOrganizer = async () => {
    if (organizerToDelete) {
      const success = await handleDeleteOrganizer(organizerToDelete);
      if (success) {
        setSelectedOrganizer((prev) =>
          prev && prev.id === organizerToDelete.id
            ? { ...prev, isActive: false, status: "rejected" }
            : prev
        );
      }
      setDeleteDialogOpen(false);
      setOrganizerToDelete(null);
    }
  };

  const handleRestoreOrganizerDialog = (organizer: Organizer) => {
    setOrganizerToRestore(organizer);
    setRestoreDialogOpen(true);
  };

  const confirmRestoreOrganizer = async () => {
    if (organizerToRestore) {
      const success = await handleRestoreOrganizer(organizerToRestore);
      if (success) {
        setSelectedOrganizer((prev) =>
          prev && prev.id === organizerToRestore.id
            ? { ...prev, isActive: true, status: "approved" }
            : prev
        );
      }
      setRestoreDialogOpen(false);
      setOrganizerToRestore(null);
    }
  };

  const handleApproveOrganizerWithUpdate = async (organizer: Organizer) => {
    const success = await handleApproveOrganizer(organizer);
    if (success) {
      setSelectedOrganizer((prev) =>
        prev && prev.id === organizer.id
          ? { ...prev, status: "approved", isActive: true }
          : prev
      );
    }
  };

  const handleExportOrganizers = () => {
    exportOrganizersToCSV(filteredOrganizers);
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Check for filters to determine empty state message
  const hasFilters = filters.searchTerm || filters.statusFilter !== "all" || filters.roleFilter !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto max-w-7xl p-4 lg:p-8 space-y-8">
        {/* Error State */}
        {error && <ErrorState error={error} />}

        {/* Page Header */}
        <PageHeader onExport={handleExportOrganizers} />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Organizers"
            value={stats.total.toString()}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Approved"
            value={stats.approved.toString()}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Pending"
            value={stats.pending.toString()}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected.toString()}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
          />
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          filters={filters}
          onFilterChange={updateFilter}
          totalCount={organizers.length}
          filteredCount={filteredOrganizers.length}
        />

        {/* Organizers Table */}
        {filteredOrganizers.length > 0 ? (
          <OrganizersTable
            organizers={filteredOrganizers}
            onViewOrganizer={setSelectedOrganizer}
            onApproveOrganizer={handleApproveOrganizerWithUpdate}
            onRejectOrganizer={handleRejectOrganizerDialog}
            onDeleteOrganizer={handleDeleteOrganizerDialog}
            onRestoreOrganizer={handleRestoreOrganizerDialog}
          />
        ) : (
          !loading && <EmptyState hasFilters={hasFilters} />
        )}

        {/* Organizer Details Dialog */}
        <OrganizerDetailsDialog
          organizer={selectedOrganizer}
          isOpen={!!selectedOrganizer}
          onClose={() => setSelectedOrganizer(null)}
          onApprove={handleApproveOrganizerWithUpdate}
          onReject={handleRejectOrganizerDialog}
          onDelete={handleDeleteOrganizerDialog}
          onRestore={handleRestoreOrganizerDialog}
        />

        {/* Confirmation Dialogs */}
        <ConfirmationDialogs
          rejectDialog={{
            open: rejectDialogOpen,
            organizer: organizerToReject,
            onConfirm: confirmRejectOrganizer,
            onCancel: () => {
              setRejectDialogOpen(false);
              setOrganizerToReject(null);
            },
          }}
          restoreDialog={{
            open: restoreDialogOpen,
            organizer: organizerToRestore,
            onConfirm: confirmRestoreOrganizer,
            onCancel: () => {
              setRestoreDialogOpen(false);
              setOrganizerToRestore(null);
            },
          }}
          deleteDialog={{
            open: deleteDialogOpen,
            organizer: organizerToDelete,
            onConfirm: confirmDeleteOrganizer,
            onCancel: () => {
              setDeleteDialogOpen(false);
              setOrganizerToDelete(null);
            },
          }}
        />
      </div>
    </div>
  );
};

export default OrganizerManagement;
