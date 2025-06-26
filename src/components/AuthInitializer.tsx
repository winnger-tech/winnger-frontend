'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { loadUserFromStorage } from '../store/slices/authSlice';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Only run on client side and load user data from localStorage
    // Don't block rendering while loading
    if (typeof window !== 'undefined') {
      console.log('🔄 AuthInitializer: Loading user from storage...');
      dispatch(loadUserFromStorage());
    }
  }, [dispatch]);

  // Always render children immediately, don't wait for auth to load
  return <>{children}</>;
}
