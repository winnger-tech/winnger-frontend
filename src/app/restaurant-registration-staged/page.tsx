'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Navbar from '../component/Navbar';
import { useTranslation } from '../../utils/i18n';
import { useAuth } from '@/hooks/useAuth';
import ProgressBar from '@/components/common/LoadingSpinner';

export default function RestaurantRegistrationStagedPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Fetch dashboard data to determine the current stage
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('winngr_auth_token');
      if (!token) {
        // If no token, redirect to login
        router.push('/restaurantlogin');
        return;
      }
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiBaseUrl}/restaurants/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
        
        // Redirect to the current stage based on API response
        if (data.data?.currentStep) {
          const currentStep = data.data.currentStep;
          console.log('🔀 API returned current step:', currentStep);
          
          // Navigate to the current step
          console.log('🔀 Navigating to step:', currentStep);
          router.push(`/restaurant-registration-staged/stage/${currentStep}`);
        } else {
          // If no step is set, start at step 1
          console.log('🔀 No step info, defaulting to step 1');
          router.push('/restaurant-registration-staged/stage/1');
        }
      } else {
        // If API call fails, start at step 1
        console.log('❌ API call failed, defaulting to step 1');
        router.push('/restaurant-registration-staged/stage/1');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // If API call fails, start at step 1
      router.push('/restaurant-registration-staged/stage/1');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
      // If not authenticated, redirect to login
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <Navbar />
      <PageContainer>
        <ContentWrapper>
          <PageTitle>{t('Restaurant Registration')}</PageTitle>
          <PageDescription>
            Complete your restaurant registration step by step
          </PageDescription>
          
          {isLoading && (
            <LoadingWrapper>
              <ProgressBar />
              <LoadingMessage>Loading registration data...</LoadingMessage>
            </LoadingWrapper>
          )}
        </ContentWrapper>
      </PageContainer>
    </>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 120px 20px 40px;
  background-color: #403E2D;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const PageDescription = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  margin-bottom: 3rem;
  line-height: 1.6;
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const LoadingMessage = styled.p`
  color: #e0e0e0;
  margin-top: 1rem;
  font-size: 1rem;
`; 