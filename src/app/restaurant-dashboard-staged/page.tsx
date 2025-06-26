"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';
import { DashboardProvider } from '../../context/DashboardContext';
import Dashboard from '../../components/dashboard/Dashboard';
import Navbar from '../component/Navbar';

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Debug logging
  console.log('🏪 Restaurant Dashboard Staged Debug:', {
    isAuthenticated,
    user,
    userType: user?.type,
    registrationStage: user?.registrationStage,
    isRegistrationComplete: user?.isRegistrationComplete
  });

  useEffect(() => {
    console.log('🔄 Restaurant Dashboard useEffect triggered:', {
      isAuthenticated,
      user,
      userType: user?.type
    });
    
    // Only redirect if user is not authenticated or wrong type
    if (!isAuthenticated || !user || user.type !== 'restaurant') {
      console.log('🔄 Redirecting to restaurant login:', { isAuthenticated, user });
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, user, router]);

  // Don't render if user is not a restaurant
  if (!isAuthenticated || !user || user.type !== 'restaurant') {
    console.log('❌ User is not authenticated or not a restaurant:', { isAuthenticated, user });
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
            Access Denied
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            This page is only for authenticated restaurant users
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => router.push('/restaurantlogin')}
              style={{
                background: '#ffc32b',
                color: '#403E2D',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering restaurant dashboard for user:', user);
  return (
    <>
      <Navbar />
      <DashboardProvider userType="restaurant">
        <Dashboard userType="restaurant" />
      </DashboardProvider>
    </>
  );
}
