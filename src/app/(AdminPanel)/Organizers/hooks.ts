import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";
import { Organizer, OrganizerStats, OrganizerFilters } from "./types";
import { transformOrganizerData } from "./utils";

export const useOrganizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const organizersResponse = await axiosInstance.get("/api/v1/organizers/list");
      if (!organizersResponse.data) {
        throw new Error("Failed to fetch organizers list");
      }

      // Log invalid entries for debugging
      const invalidEntries = organizersResponse.data.filter((item: any) => item.status === "invalid");
      if (invalidEntries.length > 0) {
        console.warn(`Found ${invalidEntries.length} invalid organizer entries:`, invalidEntries);
      }

      const organizerResults = organizersResponse.data
        .filter((item: any) => item.status === "valid") // Only process valid entries
        .map(transformOrganizerData)
        .filter((organizer: Organizer | null) => organizer !== null);

      setOrganizers(organizerResults);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch data. Please try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  return { organizers, setOrganizers, loading, error, refetch: fetchOrganizers };
};

export const useOrganizerFilters = (organizers: Organizer[]) => {
  const [filters, setFilters] = useState<OrganizerFilters>({
    searchTerm: "",
    statusFilter: "all",
    roleFilter: "all",
  });

  const filteredOrganizers = useMemo(() => {
    return organizers.filter((organizer) => {
      const matchesSearch =
        organizer.storeName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        organizer.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        organizer.organizerId.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus =
        filters.statusFilter === "all" || organizer.status === filters.statusFilter;
      const matchesRole = filters.roleFilter === "all" || organizer.role === filters.roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [organizers, filters]);

  const updateFilter = (key: keyof OrganizerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return { filters, filteredOrganizers, updateFilter };
};

export const useOrganizerStats = (organizers: Organizer[]): OrganizerStats => {
  return useMemo(() => {
    const totalOrganizers = organizers.length;
    const approvedOrganizers = organizers.filter(
      (v) => v.status === "approved"
    ).length;
    const pendingOrganizers = organizers.filter((v) => v.status === "pending").length;
    const rejectedOrganizers = organizers.filter(
      (v) => v.status === "rejected"
    ).length;

    return {
      total: totalOrganizers,
      approved: approvedOrganizers,
      pending: pendingOrganizers,
      rejected: rejectedOrganizers,
    };
  }, [organizers]);
};

export const useOrganizerActions = (setOrganizers: React.Dispatch<React.SetStateAction<Organizer[]>>) => {
  const handleApproveOrganizer = async (organizer: Organizer) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/organizers/approval/approve?user_id=${organizer.id}`
      );
      
      // Check for successful response (status 200)
      if (response.status === 200 && response.data.message === "Organizer approved successfully") {
        setOrganizers((prev) =>
          prev.map((v) =>
            v.id === organizer.id
              ? { ...v, status: "approved", isActive: true }
              : v
          )
        );
        toast.success("Organizer approved successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to approve organizer");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          "Failed to approve organizer. Please try again.";
      toast.error(errorMessage);
      console.error(error);
      return false;
    }
  };

  const handleRejectOrganizer = async (organizer: Organizer) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/organizers/approval/reject?user_id=${organizer.id}`
      );
      
      // Check for successful response (status 200)
      if (response.status === 200 && response.data.message === "Organizer approval rejected successfully") {
        setOrganizers((prev) =>
          prev.map((v) =>
            v.id === organizer.id
              ? { ...v, status: "rejected", isActive: true } // Keep isActive true as backend doesn't change is_deleted
              : v
          )
        );
        toast.success("Organizer rejected successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to reject organizer");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          "Failed to reject organizer. Please try again.";
      toast.error(errorMessage);
      console.error(error);
      return false;
    }
  };

  const handleDeleteOrganizer = async (organizer: Organizer) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/organizers/approval/soft-delete?user_id=${organizer.id}`
      );
      
      // Check for successful response (status 200)
      if (response.status === 200 && response.data.message.includes("successfully")) {
        setOrganizers((prev) =>
          prev.map((v) =>
            v.id === organizer.id
              ? { ...v, isActive: false } // Only change isActive, keep current status
              : v
          )
        );
        toast.success("Organizer deactivated successfully!");
        return true;
      } else {
        throw new Error(
          response.data.message || "Failed to deactivate organizer"
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          "Failed to deactivate organizer. Please try again.";
      toast.error(errorMessage);
      console.error(error);
      return false;
    }
  };

  const handleRestoreOrganizer = async (organizer: Organizer) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/organizers/approval/restore?user_id=${organizer.id}`
      );
      
      // Check for successful response (status 200)
      if (response.status === 200 && response.data.message.includes("successfully")) {
        setOrganizers((prev) =>
          prev.map((v) =>
            v.id === organizer.id
              ? { ...v, isActive: true } // Only change isActive, keep current status
              : v
          )
        );
        toast.success("Organizer restored successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to restore organizer");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          "Failed to restore organizer. Please try again.";
      toast.error(errorMessage);
      console.error(error);
      return false;
    }
  };

  return {
    handleApproveOrganizer,
    handleRejectOrganizer,
    handleDeleteOrganizer,
    handleRestoreOrganizer,
  };
};