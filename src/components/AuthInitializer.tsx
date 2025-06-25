'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { loadUserFromStorage } from '../store/slices/authSlice';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load user data from localStorage on app initialization
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return <>{children}</>;
}
