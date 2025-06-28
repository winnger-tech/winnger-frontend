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
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Redux Provider Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Stack:', error.stack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid #ff6b6b', 
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          color: '#c53030'
        }}>
          <h2>Something went wrong with the Redux store.</h2>
          <p>Error: {this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
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
