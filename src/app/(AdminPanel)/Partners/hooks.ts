import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";
import { Partner, PartnerFilters, PartnerStats, PartnerFormData } from "./types";

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/v1/partners");
      console.log("Partners API Response:", response.data);
      
      if (!response.data) {
        throw new Error("Failed to fetch partners list");
      }
      
      // Handle different response structures
      let partnersData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        partnersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        partnersData = response.data;
      }
      
      console.log("Processed Partners Data:", partnersData);
      setPartners(partnersData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching partners:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch partners. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return { partners, setPartners, loading, error, refetch: fetchPartners };
};

export const usePartnerFilters = (partners: Partner[]) => {
  const [filters, setFilters] = useState<PartnerFilters>({
    searchTerm: "",
  });

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch = partner.website_url.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [partners, filters]);

  const updateFilter = (key: keyof PartnerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return { filters, filteredPartners, updateFilter };
};

export const usePartnerStats = (partners: Partner[]): PartnerStats => {
  return useMemo(() => {
    const totalPartners = partners.length;
    const activePartners = partners.length; // All partners are considered active for now

    return {
      total: totalPartners,
      active: activePartners,
    };
  }, [partners]);
};

export const usePartnerActions = (setPartners: React.Dispatch<React.SetStateAction<Partner[]>>) => {
  const handleAddPartner = async (formData: PartnerFormData) => {
    try {
      const data = new FormData();
      if (formData.logo) {
        data.append('logo', formData.logo);
      }
      data.append('website_url', formData.url);

      const response = await axiosInstance.post("/api/v1/partners", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 200 || response.status === 201) {
        setPartners((prev) => [...prev, response.data.data]);
        toast.success("Partner added successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to add partner");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          "Failed to add partner. Please try again.";
      toast.error(errorMessage);
      console.error(error);
      return false;
    }
  };

  const handleUpdatePartner = async (id: string, formData: PartnerFormData) => {
    try {
      const data = new FormData();
      if (formData.logo) {
        data.append('logo', formData.logo);
      }
      data.append('website_url', formData.url);

      const response = await axiosInstance.put(`/api/v1/partners/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 200) {
        setPartners((prev) =>
          prev.map((partner) =>
            partner.partner_id === id ? { ...partner, ...response.data } : partner
          )
        );
        toast.success("Partner updated successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to update partner");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          "Failed to update partner. Please try again.";
      toast.error(errorMessage);
      console.error(error);
      return false;
    }
  };

  const handleDeletePartner = async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/partners/${id}`);
      
      if (response.status === 200) {
        setPartners((prev) => prev.filter((partner) => partner.partner_id !== id));
        toast.success("Partner deleted successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to delete partner");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          "Failed to delete partner. Please try again.";
      toast.error(errorMessage);
      console.error(error);
      return false;
    }
  };

  return {
    handleAddPartner,
    handleUpdatePartner,
    handleDeletePartner,
  };
};