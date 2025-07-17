// hooks/useAuth.ts
import { useEffect } from 'react';
import useStore from '@/lib/Zustand';
import { refreshTokenIfNeeded } from '@/lib/auth';

export const useAuth = () => {
  // Replace destructuring with selectors
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const userId = useStore(state => state.userId);
  const role = useStore(state => state.role);
  const checkAuth = useStore(state => state.checkAuth);

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