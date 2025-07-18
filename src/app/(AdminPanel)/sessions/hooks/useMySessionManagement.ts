import { useState, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
import { Session, SessionStats } from '../types';

export const useMySessionManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    total_sessions: 0,
    active_sessions: 0,
    inactive_sessions: 0,
    unique_users: 1 // Always 1 for current user
  });

  const calculateStats = useCallback((sessionsData: Session[]) => {
    const stats: SessionStats = {
      total_sessions: sessionsData.length,
      active_sessions: sessionsData.filter(s => s.is_active).length,
      inactive_sessions: sessionsData.filter(s => !s.is_active).length,
      unique_users: 1 // Always 1 for current user
    };
    setSessionStats(stats);
  }, []);

  const fetchMySessions = useCallback(async (activeOnly: boolean = true, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        active_only: activeOnly.toString(),
        limit: limit.toString()
      });

      const response = await axiosInstance.get(`/api/v1/admin/me/sessions/?${params}`);
      
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

  const terminateMySession = useCallback(async (sessionId: number) => {
    try {
      if (!sessionId) {
        toast.error("Invalid session ID");
        return false;
      }

      const response = await axiosInstance.delete(`/api/v1/admin/me/sessions/${sessionId}`);
      
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

  const terminateAllMySessions = useCallback(async (keepCurrent: boolean = true) => {
    try {
      const params = new URLSearchParams({
        keep_current: keepCurrent.toString()
      });

      const response = await axiosInstance.delete(`/api/v1/admin/me/sessions/?${params}`);
      
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
      unique_users: 1
    });
    setError(null);
  }, []);

  return {
    sessions,
    loading,
    error,
    sessionStats,
    fetchMySessions,
    terminateMySession,
    terminateAllMySessions,
    resetSessions
  };
};