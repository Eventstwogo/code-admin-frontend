'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useStore from '@/lib/Zustand';
import { refreshTokenIfNeeded } from '@/lib/auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, checkAuth } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/ResetPassword'
  ];

  const isPublicRoute = publicRoutes.includes(pathname) || 
                       pathname.startsWith('/reset-password') || 
                       pathname.startsWith('/ResetPassword');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check authentication status
        checkAuth();
        
        // Try to refresh token if needed
        if (isAuthenticated) {
          await refreshTokenIfNeeded();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [checkAuth, isAuthenticated]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      // User is not authenticated and trying to access protected route
      console.log('Redirecting to login - not authenticated');
      router.push('/login');
    } else if (isAuthenticated && (pathname === '/' || pathname === '/login')) {
      // User is authenticated and on public route, redirect to dashboard
      console.log('Redirecting to dashboard - already authenticated');
      router.push('/Dashboard');
    }
  }, [isAuthenticated, isPublicRoute, pathname, router, isInitialized, isLoading]);

  // Show loading spinner while checking authentication
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // For public routes, always render children
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, only render if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // This should not be reached due to the redirect effect above,
  // but just in case, show loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-white text-lg">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default AuthGuard;