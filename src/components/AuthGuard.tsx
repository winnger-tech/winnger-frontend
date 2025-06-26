'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadUserFromStorage } from '../store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/restaurantlogin' 
}: AuthGuardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only load user data once on mount
    if (!hasInitialized.current && typeof window !== 'undefined') {
      hasInitialized.current = true;
      dispatch(loadUserFromStorage());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && hasInitialized.current) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading || !hasInitialized.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ffc32b]"></div>
      </div>
    );
  }

  // Don't render children if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
