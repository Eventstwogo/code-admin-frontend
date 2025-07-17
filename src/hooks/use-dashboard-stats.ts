"use client";

import { useState, useEffect } from "react";

interface DashboardStats {
  categories: number;
  users: number;
  revenue: string;
  events: number;
  tickets: number;
  activeUsers: number;
}

interface StatsItem {
  title: string;
  count: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  percentage?: string;
}

// Simulate API call for dashboard stats
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API call
      const mockStats: DashboardStats = {
        categories: 12,
        users: 1234,
        revenue: "$45,678",
        events: 28,
        tickets: 5432,
        activeUsers: 89,
      };
      
      setStats(mockStats);
      setError(null);
    } catch (err) {
      setError("Failed to fetch dashboard statistics");
      console.error("Dashboard stats error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formattedStats: StatsItem[] = !stats ? [] : [
    {
      title: "Categories",
      count: stats.categories.toString(),
      trend: "+2 this month",
      trendDirection: 'up',
      percentage: "+16.7%"
    },
    {
      title: "Users",
      count: stats.users.toLocaleString(),
      trend: "+48 this week",
      trendDirection: 'up',
      percentage: "+4.1%"
    },
    {
      title: "Revenue",
      count: stats.revenue,
      trend: "+12% from last month",
      trendDirection: 'up',
      percentage: "+12.0%"
    },
    {
      title: "Events",
      count: stats.events.toString(),
      trend: "+5 this week",
      trendDirection: 'up',
      percentage: "+21.7%"
    }
  ];

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    formattedStats,
    isLoading,
    error,
    refetch
  };
};

// Hook for theme-aware animations
export const useThemeAnimations = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getCardHoverClass = (baseGradient: string) => {
    if (!mounted) return "";
    
    return `hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:scale-[1.02]`;
  };

  const getIconAnimationClass = () => {
    if (!mounted) return "";
    
    return "group-hover:scale-110 transition-transform duration-300";
  };

  const getButtonAnimationClass = () => {
    if (!mounted) return "";
    
    return "group-hover/btn:translate-x-1 transition-transform duration-200";
  };

  return {
    mounted,
    getCardHoverClass,
    getIconAnimationClass,
    getButtonAnimationClass
  };
};