import { 
  Monitor, 
  Smartphone, 
  Tablet, 
} from "lucide-react";

export const getDeviceIcon = (deviceType: string | null | undefined) => {
  if (!deviceType) return Monitor;
  const type = deviceType.toLowerCase();
  if (type.includes('mobile') || type.includes('phone')) return Smartphone;
  if (type.includes('tablet')) return Tablet;
  return Monitor;
};

export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

export const getTimeAgo = (dateString: string | null | undefined) => {
  if (!dateString) return 'Unknown';
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } catch {
    return 'Unknown';
  }
};

export const getLocationDisplay = (location: string | null | undefined) => {
  return location || 'Unknown';
};

export const getBrowserDisplay = (browser: string | null | undefined) => {
  return browser || 'Unknown Browser';
};

export const formatIpAddress = (ipAddress: string | null | undefined) => {
  return ipAddress || 'Unknown IP';
};

export const getSessionStatusColor = (isActive: boolean) => {
  return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
};

export const getSessionStatusLabel = (isActive: boolean) => {
  return isActive ? 'Active' : 'Inactive';
};