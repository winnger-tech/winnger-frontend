'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { AuthInitializer } from '../components/AuthInitializer';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  // Debug: log the store instance
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('Redux store instance in StoreProvider:', store);
  }
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  );
}
