"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/lib/axiosInstance";
import useStore from "@/lib/Zustand";
import { AxiosError } from "axios";
import {
  LayoutGrid,
  Users,
  ShoppingCart,
  ArrowRight,
  Settings,
  BarChart3,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertCircle,
  Bell,
  MessageSquare,
  Building2,
  Clock,
} from "lucide-react";

// Interfaces for API data
interface DashboardApiResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  method: string;
  path: string;
  data: {
    categories: {
      total: number;
      added_this_month: number;
      percentage_change: number;
      trend: string;
    };
    admin_users: {
      total: number;
      added_this_week: number;
      percentage_change: number;
      trend: string;
    };
    users: {
      total: number;
      added_this_week: number;
      percentage_change: number;
      trend: string;
    };
    events: {
      total: number;
      total_bookings: number;
      added_this_month: number;
      percentage_change: number;
      trend: string;
    };
    organizers: {
      total: number;
      approved: number;
      pending: number;
      registered_this_month: number;
      percentage_change: number;
      trend: string;
    };
    revenue: {
      current_month: number;
      last_month: number;
      difference: number;
      percentage_change: number;
      trend: string;
      note: string;
    };
    queries: {
      total: number;
      resolved: number;
      pending: number;
      created_this_week: number;
      percentage_change: number;
      trend: string;
    };
    contact_us: {
      total: number;
      resolved: number;
      pending: number;
      submitted_this_week: number;
      percentage_change: number;
      trend: string;
    };
    settings: {
      total: number;
      changes_this_week: number;
      percentage_change: number;
      trend: string;
    };
    generated_at: string;
  };
}

interface DashboardStats {
  categories: {
    total: number;
    added_this_month: number;
    percentage_change: number;
    trend: string;
  };
  adminUsers: {
    total: number;
    added_this_week: number;
    percentage_change: number;
    trend: string;
  };
  users: {
    total: number;
    added_this_week: number;
    percentage_change: number;
    trend: string;
  };
  events: {
    total: number;
    total_bookings: number;
    added_this_month: number;
    percentage_change: number;
    trend: string;
  };
  organizers: {
    total: number;
    approved: number;
    pending: number;
    registered_this_month: number;
    percentage_change: number;
    trend: string;
  };
  revenue: {
    current_month: number;
    last_month: number;
    difference: number;
    percentage_change: number;
    trend: string;
    note: string;
  };
  queries: {
    total: number;
    resolved: number;
    pending: number;
    created_this_week: number;
    percentage_change: number;
    trend: string;
  };
  contact_us: {
    total: number;
    resolved: number;
    pending: number;
    submitted_this_week: number;
    percentage_change: number;
    trend: string;
  };
  settings: {
    total: number;
    changes_this_week: number;
    percentage_change: number;
    trend: string;
  };
  generated_at: string;
}

interface RecentQuery {
  id: number;
  title: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AnalyticsData {
  summary: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    locked_users: number;
    with_expiry_flag: number;
    expired_passwords: number;
    high_failed_attempts: number;
    earliest_user: string;
    latest_user: string;
  };
  daily_registrations: Array<{
    date: string;
    count: number;
  }>;
}

interface SystemHealth {
  database: string;
  api_services: string;
  last_backup: string;
  overall_status: string;
  timestamp: string;
}

interface StatsCard {
  title: string;
  count: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  percentage?: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
}

// Custom hook for dashboard data
const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useStore();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        dashboardResponse,
        queriesResponse,
        analyticsResponse,
        healthResponse,
      ] = await Promise.all([
        axiosInstance.get<DashboardApiResponse>("/api/v1/admin/dashboard"),
        axiosInstance
          .get("/api/v1/admin/queries/recent?limit=10")
          .catch(() => ({ data: { data: { queries: [] } } })),
        axiosInstance
          .get("/api/v1/admin/analytics")
          .catch(() => ({ data: { data: null } })),
        axiosInstance
          .get("/api/v1/admin/system/health")
          .catch(() => ({ data: { data: null } })),
      ]);

      // Process dashboard data
      const dashboardData = dashboardResponse.data.data;
      const transformedStats: DashboardStats = {
        categories: dashboardData.categories,
        adminUsers: dashboardData.admin_users,
        users: dashboardData.users,
        events: dashboardData.events,
        organizers: dashboardData.organizers,
        revenue: dashboardData.revenue,
        queries: dashboardData.queries,
        contact_us: dashboardData.contact_us,
        settings: dashboardData.settings,
        generated_at: dashboardData.generated_at,
      };

      setStats(transformedStats);

      // Process queries data
      const queriesData = queriesResponse.data?.data;
      setRecentQueries(queriesData?.queries || []);

      // Process analytics data
      const analyticsData = analyticsResponse.data?.data;
      setAnalytics(analyticsData || null);

      // Process system health data
      const healthData = healthResponse.data?.data;
      setSystemHealth(healthData || null);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      if (err instanceof AxiosError) {
        if (err.response) {
          setError(
            `Server error: ${err.response.data?.message || err.response.status}`
          );
        } else if (err.request) {
          setError("Network error: Unable to connect to server");
        } else {
          setError("Error setting up request");
        }
      } else {
        setError("Failed to fetch dashboard data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  return {
    stats,
    recentQueries,
    analytics,
    systemHealth,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
};

// Memoized Stats Card Component for better performance
const StatsCardComponent = React.memo(({ card }: { card: StatsCard }) => {
  const getTrendIcon = (direction: "up" | "down" | "neutral") => {
    switch (direction) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card
      className={`relative overflow-hidden border-0 bg-gradient-to-br ${card.bgGradient} group transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:scale-[1.03] dark:hover:shadow-black/30 cursor-pointer`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-white/10 dark:to-transparent" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10" />

      <CardHeader className="relative flex flex-row items-center justify-between pb-3">
        <div className="space-y-2 flex-1">
          <CardTitle className="text-sm font-semibold text-foreground/90 tracking-wide">
            {card.title}
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {card.count}
            </span>
            <div className="flex items-center gap-1">
              {getTrendIcon(card.trendDirection)}
              {card.percentage && (
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    card.trendDirection === "up"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : card.trendDirection === "down"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400"
                  }`}
                >
                  {card.percentage}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground/80 font-medium">
            {card.trend}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl ${card.iconBg} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}
        >
          <div className={card.iconColor}>{card.icon}</div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-0">
        <Link href={card.href}>
          <Button
            variant="secondary"
            className="w-full group/btn bg-white/50 hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/20 border-0 shadow-sm hover:shadow-md transition-all duration-300 font-medium"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
});

StatsCardComponent.displayName = "StatsCardComponent";

// Dashboard skeleton component
const DashboardSkeleton = () => {
  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="relative overflow-hidden border-0 bg-gradient-to-br from-muted/50 to-muted/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </CardHeader>
            <CardContent className="relative space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-1 rounded-full" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="pt-8 border-t border-border/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Skeleton className="h-4 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </main>
  );
};

const DashboardPage = () => {
  const { stats, systemHealth, isLoading, error, refetch } = useDashboardData();

  const getTrendDirection = (trend: string): "up" | "down" | "neutral" => {
    switch (trend.toLowerCase()) {
      case "up":
        return "up";
      case "down":
        return "down";
      case "stable":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const formatPercentageChange = (percentage: number): string => {
    if (percentage > 0) {
      return `+${percentage}%`;
    } else if (percentage < 0) {
      return `${percentage}%`;
    } else {
      return "0%";
    }
  };

  // Generate stats cards with real data - Memoized for performance
  const statsCards = useMemo((): StatsCard[] => {
    if (!stats) return [];

    return [
      {
        title: "Application Users",
        count: stats.users.total.toLocaleString(),
        trend: `+${stats.users.added_this_week} this week`,
        trendDirection: getTrendDirection(stats.users.trend),
        percentage: formatPercentageChange(stats.users.percentage_change),
        icon: <Users className="w-6 h-6" />,
        href: "/AppUsers",
        gradient: "from-blue-500 to-indigo-600",
        bgGradient:
          "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      {
        title: "Admin Users",
        count: stats.adminUsers.total.toString(),
        trend: `+${stats.adminUsers.added_this_week} this week`,
        trendDirection: getTrendDirection(stats.adminUsers.trend),
        percentage: formatPercentageChange(stats.adminUsers.percentage_change),
        icon: <Building2 className="w-6 h-6" />,
        href: "/Users",
        gradient: "from-green-500 to-emerald-600",
        bgGradient:
          "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
      },
      {
        title: "Categories",
        count: stats.categories.total.toString(),
        trend: `+${stats.categories.added_this_month} this month`,
        trendDirection: getTrendDirection(stats.categories.trend),
        percentage: formatPercentageChange(stats.categories.percentage_change),
        icon: <LayoutGrid className="w-6 h-6" />,
        href: "/Categories",
        gradient: "from-purple-500 to-violet-600",
        bgGradient:
          "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
      },
      {
        title: "Events",
        count: stats.events.total.toString(),
        trend: `+${stats.events.added_this_month} this month`,
        trendDirection: getTrendDirection(stats.events.trend),
        percentage: formatPercentageChange(stats.events.percentage_change),
        icon: <CalendarCheck className="w-6 h-6" />,
        href: "/Events",
        gradient: "from-orange-500 to-red-600",
        bgGradient:
          "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-600 dark:text-orange-400",
      },
      {
        title: "Organizers",
        count: stats.organizers.total.toString(),
        trend: `${stats.organizers.pending} pending approval`,
        trendDirection: getTrendDirection(stats.organizers.trend),
        percentage: formatPercentageChange(stats.organizers.percentage_change),
        icon: <Building2 className="w-6 h-6" />,
        href: "/Organizers",
        gradient: "from-teal-500 to-cyan-600",
        bgGradient:
          "from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20",
        iconBg: "bg-teal-100 dark:bg-teal-900/30",
        iconColor: "text-teal-600 dark:text-teal-400",
      },
      {
        title: "Revenue",
        count: `$${stats.revenue.current_month.toLocaleString()}`,
        trend: `$${stats.revenue.difference.toLocaleString()} vs last month`,
        trendDirection: getTrendDirection(stats.revenue.trend),
        percentage: formatPercentageChange(stats.revenue.percentage_change),
        icon: <ShoppingCart className="w-6 h-6" />,
        href: "/Revenue",
        gradient: "from-yellow-500 to-orange-600",
        bgGradient:
          "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-600 dark:text-yellow-400",
      },
      {
        title: "Queries",
        count: stats.queries.total.toString(),
        trend: `${stats.queries.pending} pending`,
        trendDirection: getTrendDirection(stats.queries.trend),
        percentage: formatPercentageChange(stats.queries.percentage_change),
        icon: <MessageSquare className="w-6 h-6" />,
        href: "/Enqueries",
        gradient: "from-indigo-500 to-purple-600",
        bgGradient:
          "from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20",
        iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
        iconColor: "text-indigo-600 dark:text-indigo-400",
      },
      {
        title: "Contact Us",
        count: stats.contact_us.total.toString(),
        trend: `${stats.contact_us.pending} unresolved`,
        trendDirection: getTrendDirection(stats.contact_us.trend),
        percentage: formatPercentageChange(stats.contact_us.percentage_change),
        icon: <Bell className="w-6 h-6" />,
        href: "/ContactUs",
        gradient: "from-pink-500 to-rose-600",
        bgGradient:
          "from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
        iconBg: "bg-pink-100 dark:bg-pink-900/30",
        iconColor: "text-pink-600 dark:text-pink-400",
      },
    ];
  }, [stats]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome/User Info Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here&apos;s an overview of your ticket booking
                system.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Last Updated Info */}
            {stats && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Updated: {new Date(stats.generated_at).toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* System Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
              <div
                className={`w-2 h-2 rounded-full ${
                  systemHealth?.overall_status === "online"
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium text-foreground">
                {systemHealth?.overall_status || "Unknown"}
              </span>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              className="rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Updating..." : "Refresh"}
            </Button>

            {/* Quick Settings Dropdown */}
            <Button variant="ghost" size="icon" className="rounded-lg">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats Section - Enhanced Layout */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
              <h2 className="text-xl font-semibold text-foreground">
                Key Metrics
              </h2>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated:{" "}
              {stats
                ? new Date(stats.generated_at).toLocaleTimeString()
                : "Loading..."}
            </div>
          </div>

          {/* Primary Metrics - Enhanced Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {statsCards.slice(0, 4).map((card) => (
              <StatsCardComponent key={card.title} card={card} />
            ))}
          </div>

          {/* Secondary Metrics - Enhanced Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {statsCards.slice(4).map((card) => (
              <StatsCardComponent key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
