"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/lib/axiosInstance";
import useStore from "@/lib/Zustand";
import { AxiosError } from "axios";
import {
  LayoutGrid,
  Users,
  ShoppingCart,
  ArrowRight,
  Settings,
  Ticket,
  BarChart3,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  Minus,
  RefreshCw,
  AlertCircle,
  Bell,
  User as UserIcon,
  MessageSquare,
  Building2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Interfaces for API data
interface DashboardStats {
  totalUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  totalQueries: number;
  pendingQueries: number;
  resolvedQueries: number;
  totalRevenue: number;
  activeEvents: number;
}

interface RecentQuery {
  id: number;
  title: string;
  sender_user_id: string;
  query_status: string;
  created_at: string;
  last_message: string;
}

interface StatsCard {
  title: string;
  count: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useStore();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch multiple endpoints in parallel
      const [queriesResponse] = await Promise.all([
        axiosInstance.get('/api/v1/organizers/queries/all/by-status?limit=5'),
        // Add more API calls here as needed
      ]);

      // Process queries data
      const queriesData = queriesResponse.data.data;
      setRecentQueries(queriesData.queries || []);

      // Calculate stats from the data
      const mockStats: DashboardStats = {
        totalUsers: 1250,
        totalOrganizers: 85,
        totalEvents: 42,
        totalQueries: queriesData.pagination?.total_items || 0,
        pendingQueries: queriesData.queries?.filter((q: RecentQuery) => q.query_status === 'pending').length || 0,
        resolvedQueries: queriesData.queries?.filter((q: RecentQuery) => q.query_status === 'answered').length || 0,
        totalRevenue: 125000,
        activeEvents: 15,
      };

      setStats(mockStats);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      if (err instanceof AxiosError) {
        if (err.response) {
          setError(`Server error: ${err.response.data?.message || err.response.status}`);
        } else if (err.request) {
          setError('Network error: Unable to connect to server');
        } else {
          setError('Error setting up request');
        }
      } else {
        setError('Failed to fetch dashboard data');
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
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
};

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
          <Card key={index} className="relative overflow-hidden border-0 bg-gradient-to-br from-muted/50 to-muted/30">
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
            <Card key={index} className="p-4 hover:shadow-md transition-shadow duration-200">
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
  const { stats, recentQueries, isLoading, error, refetch } = useDashboardData();
  const { userId } = useStore();

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // Generate stats cards with real data
  const getStatsCards = (): StatsCard[] => {
    if (!stats) return [];

    return [
      {
        title: "Total Users",
        count: stats.totalUsers.toLocaleString(),
        trend: "+12% from last month",
        trendDirection: 'up',
        percentage: "+12%",
        icon: <Users className="w-6 h-6" />,
        href: "/Users",
        gradient: "from-blue-500 to-indigo-600",
        bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      {
        title: "Organizers",
        count: stats.totalOrganizers.toString(),
        trend: "+5 this week",
        trendDirection: 'up',
        percentage: "+6.3%",
        icon: <Building2 className="w-6 h-6" />,
        href: "/Organizers",
        gradient: "from-green-500 to-emerald-600",
        bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
      },
      {
        title: "Total Events",
        count: stats.totalEvents.toString(),
        trend: "+8 this month",
        trendDirection: 'up',
        percentage: "+23.5%",
        icon: <CalendarCheck className="w-6 h-6" />,
        href: "/Events",
        gradient: "from-purple-500 to-violet-600",
        bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
      },
      {
        title: "Queries",
        count: stats.totalQueries.toString(),
        trend: `${stats.pendingQueries} pending`,
        trendDirection: stats.pendingQueries > 5 ? 'down' : 'up',
        percentage: `${stats.resolvedQueries} resolved`,
        icon: <MessageSquare className="w-6 h-6" />,
        href: "/Enqueries",
        gradient: "from-yellow-500 to-orange-600",
        bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-600 dark:text-yellow-400",
      },
    ];
  };

  const quickActions = [
    {
      title: "Categories",
      icon: <LayoutGrid className="w-5 h-5" />,
      description: "Manage categories",
      href: "/Categories",
      color: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Revenue",
      icon: <ShoppingCart className="w-5 h-5" />,
      description: "View revenue",
      href: "/Revenue",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Roles",
      icon: <Settings className="w-5 h-5" />,
      description: "Manage roles",
      href: "/Roles",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Sessions",
      icon: <Activity className="w-5 h-5" />,
      description: "Active sessions",
      href: "/sessions",
      color: "text-teal-600 dark:text-teal-400",
    },
  ];

  const formattedDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
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
    <main className="container mx-auto px-4 py-8 space-y-8">
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
              Welcome back! Here&apos;s an overview of your ticket booking system.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="ghost" size="icon" className="rounded-full" disabled={isLoading}>
            <RefreshCw className={`w-5 h-5 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/Settings">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm text-foreground font-medium">Administrator</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((card) => (
          <Card
            key={card.title}
            className={`relative overflow-hidden border-0 bg-gradient-to-br ${card.bgGradient} group transition-all duration-200 hover:shadow-lg hover:scale-[1.02] dark:hover:shadow-black/30`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-foreground/80">
                  {card.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {card.count}
                  </span>
                  {getTrendIcon(card.trendDirection)}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {card.trend}
                  </p>
                  {card.percentage && (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      card.trendDirection === 'up' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : card.trendDirection === 'down'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {card.percentage}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-full ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <div className={card.iconColor}>
                  {card.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <Link href={card.href}>
                <Button 
                  variant="secondary" 
                  className="w-full group/btn hover:bg-background/80 dark:hover:bg-background/80 transition-all duration-200"
                >
                  <span>View {card.title}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health/Notifications Card and Recent Queries Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-base font-semibold text-foreground">System Status</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Online
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Services</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Running
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Backup</span>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Queries Section */}
        <Card className="bg-white dark:bg-zinc-900 border border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-base font-semibold text-foreground">Recent Queries</CardTitle>
            </div>
            <Link href="/Enqueries">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentQueries.length > 0 ? (
              recentQueries.slice(0, 3).map((query) => (
                <div key={query.id} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    query.query_status === 'pending' ? 'bg-yellow-400' : 
                    query.query_status === 'answered' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{query.title}</p>
                    <p className="text-muted-foreground text-xs truncate">{query.last_message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${
                        query.query_status === 'pending' ? 'text-yellow-600 border-yellow-200' : 
                        query.query_status === 'answered' ? 'text-green-600 border-green-200' : 'text-gray-600 border-gray-200'
                      }`}>
                        {query.query_status === 'pending' ? <Clock className="w-3 h-3 mr-1" /> : 
                         query.query_status === 'answered' ? <CheckCircle className="w-3 h-3 mr-1" /> : 
                         <XCircle className="w-3 h-3 mr-1" />}
                        {query.query_status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(query.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No recent queries found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="p-4 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-200 hover:scale-[1.02] cursor-pointer border-border/50 hover:border-border group bg-white dark:bg-zinc-900">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors duration-200">
                    <div className={action.color}>
                      {action.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-foreground/80 transition-colors duration-200">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="pt-8 border-t border-border/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              Last updated: {formattedDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">System Status: Online</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;

