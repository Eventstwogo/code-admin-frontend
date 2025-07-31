import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Star, Shield } from "lucide-react";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const getRoleBadge = (role: string) => {
  switch (role) {
    case "Premium Organizer":
      return (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-0 flex items-center gap-1">
          <Star className="w-3 h-3" />
          Premium
        </Badge>
      );
    case "Partner":
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Partner
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-400 border-0">
          Organizer
        </Badge>
      );
  }
};

export const getAbnStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Active
        </Badge>
      );
    case "Suspended":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Suspended
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};