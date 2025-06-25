'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { loadUserFromStorage } from '../store/slices/authSlice';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Only run on client side and load user data from localStorage
    if (typeof window !== 'undefined') {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch]);

  return <>{children}</>;
}
