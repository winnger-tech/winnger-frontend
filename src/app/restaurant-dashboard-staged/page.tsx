"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';
import { DashboardProvider } from '../../context/DashboardContext';
import Dashboard from '../../components/dashboard/Dashboard';
import Navbar from '../component/Navbar';

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  // Temporary: Add mock authentication for testing
  const [hasMockAuth, setHasMockAuth] = React.useState(false);
  
  React.useEffect(() => {
    // Set mock authentication for testing
    const mockUser = {
      id: 'test-restaurant',
      ownerName: 'Test Restaurant Owner',
      email: 'test@example.com',
      registrationStage: 2,
      isRegistrationComplete: false,
      type: 'restaurant' as const
    };
    
    if (process.env.NODE_ENV === 'development' && !isAuthenticated) {
      // Simulate authentication for testing
      setHasMockAuth(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only redirect if we're not loading and user is not authenticated and no mock auth
    if (!isLoading && (!isAuthenticated && !hasMockAuth || (user && user.type !== 'restaurant'))) {
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, user, router, isLoading, hasMockAuth]);

  // Show loading state while auth is being determined
  if (isLoading || (!isAuthenticated && !hasMockAuth)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #403E2D 0%, #2d2b1f 100%)',
        color: 'white',
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Loading...
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Checking authentication status
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <DashboardProvider userType="restaurant">
        <Dashboard userType="restaurant" />
      </DashboardProvider>
    </>
  );
}
