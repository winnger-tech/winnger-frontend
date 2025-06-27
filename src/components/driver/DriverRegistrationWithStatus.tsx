'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';
import { useDriverRegistrationStatus } from '../../hooks/useApi';
import DriverRegistration from './DriverRegistration';
import LoadingSpinner from '../common/LoadingSpinner';

interface DriverRegistrationWithStatusProps {
  onSubmit: (data: any) => void;
}

interface RegistrationStatusData {
  isComplete: boolean;
  email?: string;
  password?: string;
  currentStage?: number;
  message?: string;
}

const DriverRegistrationWithStatus: React.FC<DriverRegistrationWithStatusProps> = ({ onSubmit }) => {
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const [driverId, setDriverId] = useState<string>('');
  const [prefilledData, setPrefilledData] = useState<{ email: string; password: string } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Get driver ID from URL params or user state
  useEffect(() => {
    const idFromParams = searchParams?.get('driverId');
    const idFromUser = user?.id;
    
    if (idFromParams) {
      setDriverId(idFromParams);
    } else if (idFromUser && user?.type === 'driver') {
      setDriverId(idFromUser);
    }
  }, [searchParams, user]);

  // Check registration status
  const { data: statusData, isLoading: statusLoading, error: statusError } = useDriverRegistrationStatus(driverId);

  useEffect(() => {
    if (statusData && !statusLoading) {
      const data = statusData as RegistrationStatusData;
      
      if (data.email && data.password) {
        setPrefilledData({
          email: data.email,
          password: data.password
        });
      }
      
      // If registration is complete, you might want to redirect or show a message
      if (data.isComplete) {
        console.log('Driver registration is already complete');
        // You can redirect to dashboard or show completion message
      }
    }
  }, [statusData, statusLoading]);

  // Show loading while checking status
  if (isCheckingStatus || statusLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <LoadingSpinner />
        <p style={{ color: '#e0e0e0', fontSize: '1rem' }}>
          Checking registration status...
        </p>
      </div>
    );
  }

  // Show error if status check failed
  if (statusError && driverId) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ color: '#ff6b6b', fontSize: '1.2rem', marginBottom: '1rem' }}>
          Error checking registration status
        </div>
        <p style={{ color: '#e0e0e0', fontSize: '1rem' }}>
          Unable to verify your registration status. Please try again or contact support.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#ffc32b',
            color: '#403E2D',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Pass prefilled data to the registration component
  return (
    <DriverRegistration 
      onSubmit={onSubmit}
      prefilledData={prefilledData}
    />
  );
};

export default DriverRegistrationWithStatus; 