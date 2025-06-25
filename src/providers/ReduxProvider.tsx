'use client';

import { Provider } from 'react-redux';
import { store } from '../store';
import { AuthInitializer } from '../components/AuthInitializer';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  );
}
