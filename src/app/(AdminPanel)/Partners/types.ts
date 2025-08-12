export interface Partner {
  partner_id: string;
  logo: string; // URL or file path to the logo
  website_url: string; // Partner's website URL
  createdAt?: string;
  updatedAt?: string;
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