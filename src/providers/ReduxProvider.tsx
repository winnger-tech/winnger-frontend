'use client';

import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../store';
import { AuthInitializer } from '../components/AuthInitializer';

interface ReduxProviderProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Redux Provider Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the Redux store.</div>;
    }
    return this.props.children;
  }
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  const storeRef = useRef<AppStore | undefined>();
  
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return (
    <ErrorBoundary>
      <Provider store={storeRef.current}>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </Provider>
    </ErrorBoundary>
  );
}
