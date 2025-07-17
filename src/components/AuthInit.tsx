'use client';

import { useEffect } from 'react';
import useStore from '@/lib/Zustand';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthInit() {
  const { checkAuth, isAuthenticated } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication on app startup
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Handle routing after auth check
    if (isAuthenticated && pathname === '/') {
      router.push('/Dashboard');
    }
  }, [isAuthenticated, pathname, router]);

  return null; // This component doesn't render anything
}