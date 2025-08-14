export interface Partner {
  partner_id: string;
  logo: string;
  website_url: string;
  created_at: string;
  updatedAt?: string;
  // Support for both naming conventions from API
  createdAt?: string;
}

export interface PartnerFormData {
  logo: File | null;
  url: string;
  existingLogo?: string; // URL of existing logo for edit mode
}

export interface PartnerFilters {
  searchTerm: string;
}

export interface PartnerStats {
  total: number;
  active: number;
}