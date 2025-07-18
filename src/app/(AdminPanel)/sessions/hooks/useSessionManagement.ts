import { useState, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
import { Session, SessionStats, SessionFilters } from '../types';

export const useSessionManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    total_sessions: 0,
    active_sessions: 0,
    inactive_sessions: 0,
    unique_users: 0
  });

  const calculateStats = useCallback((sessionsData: Session[]) => {
    const stats: SessionStats = {
      total_sessions: sessionsData.length,
      active_sessions: sessionsData.filter(s => s.is_active).length,
      inactive_sessions: sessionsData.filter(s => !s.is_active).length,
      unique_users: new Set(sessionsData.map(s => s.user_id)).size
    };
    setSessionStats(stats);
  }, []);

  const fetchSessions = useCallback(async (filters: SessionFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!filters.user_id?.trim()) {
        setSessions([]);
        setSessionStats({
          total_sessions: 0,
          active_sessions: 0,
          inactive_sessions: 0,
          unique_users: 0
        });
        return;
      }

      const params = new URLSearchParams({
        user_id: filters.user_id,
        active_only: filters.active_only.toString(),
        limit: filters.limit.toString()
      });

      const response = await axiosInstance.get(`/api/v1/admin/sessions/?${params}`);
      
      if (response.data.statusCode === 200) {
        const sessionsData = response.data.data?.sessions || [];
        setSessions(sessionsData);
        calculateStats(sessionsData);
      } else {
        throw new Error(response.data.message || "Failed to fetch sessions");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch sessions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  const terminateSession = useCallback(async (sessionId: number, userId: string) => {
    try {
      if (!sessionId || !userId?.trim()) {
        toast.error("Invalid session or user ID");
        return false;
      }

      const params = new URLSearchParams({
        user_id: userId.trim()
      });

      const response = await axiosInstance.delete(`/api/v1/admin/sessions/${sessionId}?${params}`);
      
      if (response.data.statusCode === 200) {
        toast.success("Session terminated successfully");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to terminate session");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to terminate session';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const terminateAllSessions = useCallback(async (userId: string, keepCurrent: boolean = true) => {
    try {
      if (!userId?.trim()) {
        toast.error("Invalid user ID");
        return { success: false, terminatedCount: 0 };
      }

      const params = new URLSearchParams({
        user_id: userId.trim(),
        keep_current: keepCurrent.toString()
      });

      const response = await axiosInstance.delete(`/api/v1/admin/sessions/?${params}`);
      
      if (response.data.statusCode === 200) {
        const terminatedCount = response.data.data?.terminated_count || 0;
        toast.success(`Successfully terminated ${terminatedCount} session(s)`);
        return { success: true, terminatedCount };
      } else {
        throw new Error(response.data.message || "Failed to terminate sessions");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to terminate sessions';
      toast.error(errorMessage);
      return { success: false, terminatedCount: 0 };
    }
  }, []);

  const resetSessions = useCallback(() => {
    setSessions([]);
    setSessionStats({
      total_sessions: 0,
      active_sessions: 0,
      inactive_sessions: 0,
      unique_users: 0
    });
    setError(null);
  }, []);

  return {
    sessions,
    loading,
    error,
    sessionStats,
    fetchSessions,
    terminateSession,
    terminateAllSessions,
    resetSessions
  };
};