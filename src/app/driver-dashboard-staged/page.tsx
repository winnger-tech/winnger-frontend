"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';
import { DashboardProvider } from '../../context/DashboardContext';
import Dashboard from '../../components/dashboard/Dashboard';
import Navbar from '../component/Navbar';

export default function DriverDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only redirect if we're not loading and user is not authenticated
    if (!isLoading && (!isAuthenticated || !user || user.type !== 'driver')) {
      router.push('/driverlogin');
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Show loading state while auth is being determined
  if (isLoading || (!isAuthenticated || !user)) {
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
      <DashboardProvider userType="driver">
        <Dashboard userType="driver" />
      </DashboardProvider>
    </>
  );
}
