import { Organizer } from "./types";

export const transformOrganizerData = (organizer: any): Organizer | null => {
  const { organizer_login, business_profile } = organizer;
  
  // Handle cases where business_profile might not exist
  if (!organizer_login || !business_profile) {
    return null;
  }

  return {
    id: organizer_login.user_id,
    email: organizer_login.email,
    organizerId: organizer_login.user_id,
    role: business_profile.profile_details?.role || "Organizer",
    storeName: business_profile.store_name || "",
    storeUrl:
      business_profile.profile_details?.storeUrl ||
      (business_profile.store_name
        ? business_profile.store_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        : ""),
    location: business_profile.location || "",
    purpose: Array.isArray(business_profile.purpose)
      ? business_profile.purpose
          .map((p: string) => p.replace(/["[\]]/g, ""))
          .join(", ")
      : business_profile.purpose?.replace(/["[\]]/g, "") || "",
    paymentPreference: Array.isArray(
      business_profile.profile_details?.paymentPreference
    )
      ? business_profile.profile_details.paymentPreference
          .map((p: string) => p.replace(/["[\]]/g, ""))
          .join(", ")
      : business_profile.profile_details?.paymentPreference?.replace(
          /["[\]]/g,
          ""
        ) || "Bank Transfer",
    abnDetails: {
      entityName: business_profile.profile_details?.entity_name || "",
      status: business_profile.profile_details?.status?.includes("Active")
        ? "Active"
        : business_profile.profile_details?.status?.includes("Cancelled")
        ? "Cancelled"
        : "Suspended",
      type: business_profile.profile_details?.type?.includes("Company")
        ? "Company"
        : business_profile.profile_details?.type?.includes("Partnership")
        ? "Partnership"
        : business_profile.profile_details?.type?.includes("Trust")
        ? "Trust"
        : "Individual",
      businessLocation: business_profile.profile_details?.location || "",
    },
    registrationDate: organizer_login.created_at.split("T")[0],
    lastActivity:
      organizer_login.last_login?.split("T")[0] ||
      organizer_login.created_at.split("T")[0],
    status: business_profile.is_approved === 1 
      ? "Hold" 
      : business_profile.is_approved === 2 
      ? "Approved"  : business_profile.is_approved === -1 ? "Rejected"
      : "pending",
    isActive: !organizer_login.is_deleted, // Use is_deleted field to determine if active
    avatar: business_profile.profile_details?.avatar || null,
  };
};

export const exportOrganizersToCSV = (organizers: Organizer[]) => {
  const csvContent = [
    [
      "ID",
      "Email",
      "Organizer ID",
      "Role",
      "Store Name",
      "Store URL",
      "Location",
      "Purpose",
      "Payment Preference",
      "ABN Entity Name",
      "ABN Status",
      "ABN Type",
      "ABN Location",
      "Registration Date",
      "Last Activity",
      "Status",
    ],
    ...organizers.map((organizer) => [
      organizer.id,
      organizer.email,
      organizer.organizerId,
      organizer.role,
      organizer.storeName,
      organizer.storeUrl,
      organizer.location,
      organizer.purpose,
      organizer.paymentPreference,
      organizer.abnDetails.entityName,
      organizer.abnDetails.status,
      organizer.abnDetails.type,
      organizer.abnDetails.businessLocation,
      organizer.registrationDate,
      organizer.lastActivity,
      organizer.status,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "organizers.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};