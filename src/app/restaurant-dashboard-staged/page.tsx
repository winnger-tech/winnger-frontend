'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Navbar from '../component/Navbar';
import { useTranslation } from '../../utils/i18n';
import { useAuth } from '@/hooks/useAuth';
import ProgressBar from '@/components/common/LoadingSpinner';
import { DashboardProvider } from '@/context/DashboardContext';
import Dashboard from '@/components/dashboard/Dashboard';

export default function RestaurantDashboardStagedPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('winngr_auth_token');
      if (!token) {
        console.log('No auth token found, redirecting to login');
        router.push('/restaurantlogin');
        return;
      }
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log('Fetching dashboard data from:', `${apiBaseUrl}/restaurants/progress`);
      
      const response = await fetch(`${apiBaseUrl}/restaurants/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Dashboard API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        setDashboardData(data.data);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Dashboard API error:', errorData);
        setError(`Failed to load dashboard: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Network error - please check your connection');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Restaurant dashboard mounted, auth status:', isAuthenticated);
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      console.log('Not authenticated, redirecting to login');
      setIsLoading(false);
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <ContentWrapper>
            <LoadingWrapper>
              <ProgressBar />
              <LoadingMessage>Loading dashboard...</LoadingMessage>
            </LoadingWrapper>
          </ContentWrapper>
        </PageContainer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <ContentWrapper>
            <ErrorWrapper>
              <ErrorTitle>Dashboard Error</ErrorTitle>
              <ErrorMessage>{error}</ErrorMessage>
              <RetryButton onClick={fetchDashboardData}>
                Try Again
              </RetryButton>
            </ErrorWrapper>
          </ContentWrapper>
        </PageContainer>
      </>
    );
  }

  return (
    <DashboardProvider userType="restaurant">
      <Navbar />
      <PageContainer>
        <ContentWrapper>
          <PageTitle>{t('Restaurant Dashboard')}</PageTitle>
          <PageDescription>
            Complete your restaurant registration to start accepting orders
          </PageDescription>
          
          <Dashboard userType="restaurant" />
        </ContentWrapper>
      </PageContainer>
    </DashboardProvider>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 120px 20px 40px;
  background-color: #403E2D;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
  font-weight: 600;
  text-align: center;
`;

const PageDescription = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  margin-bottom: 3rem;
  line-height: 1.6;
  text-align: center;
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

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: #ff6b6b;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: #e0e0e0;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 195, 43, 0.3);
  }
`; 