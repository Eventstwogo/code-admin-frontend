"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats, useThemeAnimations } from "@/hooks/use-dashboard-stats";
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
} from "lucide-react";

// Mock user info (replace with real user data if available)
const user = {
  name: "Admin User",
  avatar: null,
  role: "Administrator",
};

// Mock recent activity (replace with real data if available)
const recentActivity = [
  { id: 1, type: "event", message: "Created new event: Summer Fest 2024", time: "2 hours ago" },
  { id: 2, type: "user", message: "New user registered: John Doe", time: "4 hours ago" },
  { id: 3, type: "ticket", message: "Sold 50 tickets for Music Night", time: "Yesterday" },
];

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
  const { formattedStats, isLoading, error, refetch } = useDashboardStats();
  const { mounted, getCardHoverClass, getIconAnimationClass, getButtonAnimationClass } = useThemeAnimations();

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

  const statsConfig = [
    {
      title: "Categories",
      icon: <LayoutGrid className="w-6 h-6" />,
      description: "Manage all ticket categories",
      href: "/Categories",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Users",
      icon: <Users className="w-6 h-6" />,
      description: "View and manage all users",
      href: "/Users",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Revenue",
      icon: <ShoppingCart className="w-6 h-6" />,
      description: "Track ticket sales and earnings",
      href: "/Revenue",
      gradient: "from-yellow-500 to-orange-600",
      bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Settings",
      icon: <Settings className="w-6 h-6" />,
      description: "System configuration and preferences",
      href: "/Settings",
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  const quickActions = [
    {
      title: "Events",
      icon: <CalendarCheck className="w-5 h-5" />,
      description: "Manage events",
      href: "/Events",
      color: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Tickets",
      icon: <Ticket className="w-5 h-5" />,
      description: "View tickets",
      href: "/Tickets",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "View reports",
      href: "/Analytics",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Activity",
      icon: <Activity className="w-5 h-5" />,
      description: "Recent activity",
      href: "/Activity",
      color: "text-teal-600 dark:text-teal-400",
    },
  ];

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
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{user.name}</span>! Here's an overview of your ticket booking system.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            <span className="text-sm text-foreground font-medium">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((config, index) => {
          const statData = formattedStats[index];
          if (!statData) return null;
          return (
            <Card
              key={config.title}
              className={`relative overflow-hidden border-0 bg-gradient-to-br ${config.bgGradient} ${getCardHoverClass(config.bgGradient)} group transition-shadow duration-200 hover:shadow-lg dark:hover:shadow-black/30`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent" />
              <CardHeader className="relative flex flex-row items-center justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-foreground/80">
                    {config.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {statData.count}
                    </span>
                    {getTrendIcon(statData.trendDirection)}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {statData.trend}
                    </p>
                    {statData.percentage && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                        statData.trendDirection === 'up' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : statData.trendDirection === 'down'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {statData.percentage}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-full ${config.iconBg} ${getIconAnimationClass()}`}>
                  <div className={config.iconColor}>
                    {config.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {config.description}
                </p>
                <Link href={config.href}>
                  <Button 
                    variant="secondary" 
                    className="w-full group/btn hover:bg-background/80 dark:hover:bg-background/80 transition-all duration-200"
                  >
                    <span>Go to {config.title}</span>
                    <ArrowRight className={`w-4 h-4 ml-2 ${getButtonAnimationClass()}`} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Health/Notifications Card and Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-base font-semibold text-foreground">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">No new notifications. All systems operational!</div>
          </CardContent>
        </Card>
        {/* Recent Activity Section */}
        <Card className="bg-white dark:bg-zinc-900 border border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-base font-semibold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-600" />
                <span>{item.message}</span>
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{item.time}</span>
              </div>
            ))}
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
          {quickActions.map((action, index) => (
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
              Last updated: {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
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

