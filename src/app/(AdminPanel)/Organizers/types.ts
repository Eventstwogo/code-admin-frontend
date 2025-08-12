export interface Organizer {
  id: string;
  email: string;
  organizerId: string;
  role: "Organizer" | "Premium Organizer" | "Partner";
  storeName: string;
  storeUrl: string;
  location: string;
  purpose: string;
  paymentPreference: "Bank Transfer" | "PayPal" | "Stripe" | "Direct Deposit";
  abnDetails: {
    entityName: string;
    status: "Active" | "Cancelled" | "Suspended";
    type: "Company" | "Partnership" | "Trust" | "Individual";
    businessLocation: string;
  };
  registrationDate: string;
  lastActivity: string;
  status: "Approved" | "pending" | "Rejected"|"Hold";
  isActive: boolean;
  avatar?: string;
}

export interface OrganizerStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface OrganizerCardStats {
  total_organizers: number;
  approved: number;
  pending: number;
  rejected: number;
  under_review: number;
  not_started: number;
}

export interface OrganizerCardStatsResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  method: string;
  path: string;
  data: OrganizerCardStats;
}

export interface OrganizerFilters {
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
}