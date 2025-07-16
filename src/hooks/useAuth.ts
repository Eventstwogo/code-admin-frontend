// hooks/useAuth.ts
import { useEffect } from 'react';
import useStore from '@/lib/Zustand';
import { refreshTokenIfNeeded } from '@/lib/auth';

export const useAuth = () => {
  const { isAuthenticated, userId, role, checkAuth } = useStore();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();

    // Set up periodic token refresh check (every 5 minutes)
    const interval = setInterval(async () => {
      if (isAuthenticated) {
        await refreshTokenIfNeeded();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [checkAuth, isAuthenticated]);

  return {
    isAuthenticated,
    userId,
    role,
    checkAuth,
  };
};