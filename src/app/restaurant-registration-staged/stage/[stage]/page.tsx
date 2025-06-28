'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import Navbar from '../../../component/Navbar';
import { useTranslation } from '../../../../utils/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { handleApiError, handleApiSuccess } from '@/utils/apiErrorHandler';
import StageContainer from '@/components/stages/StageContainer';
import { DashboardProvider } from '@/context/DashboardContext';
import ProgressBar from '@/components/common/LoadingSpinner';

export default function RestaurantStageDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  const currentStage = parseInt(params?.stage as string) || 1;

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('winngr_auth_token');
      if (!token) {
        handleApiError({ response: { status: 401 } }, showError, 'Authentication required. Please log in again.');
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
      
      if (response && response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
        
        // Check if registration is complete
        if (data.data.isRegistrationComplete) {
          setRegistrationComplete(true);
          setRestaurantData(data.data.restaurant);
          handleApiSuccess('Registration completed successfully!', showSuccess);
        }
        
        // Validate that the requested stage is valid
        const requestedStage = parseInt(params?.stage as string) || 1;
        const maxAllowedStage = data.data.currentStep || 1;
        
        console.log('🔍 Stage validation:', { 
          requestedStage, 
          maxAllowedStage,
          userType: 'restaurant'
        });
        
        // If trying to access a stage ahead of current progress, redirect to current stage
        if (requestedStage > maxAllowedStage && maxAllowedStage < 3) {
          console.log(`⚠️ Redirecting to step ${maxAllowedStage} - cannot skip steps`);
          handleApiError({ message: 'Cannot skip stages. Please complete the current stage first.' }, showError);
          router.push(`/restaurant-registration-staged/stage/${maxAllowedStage}`);
        } else if (requestedStage < maxAllowedStage && maxAllowedStage > 1) {
          // If trying to access a stage behind current progress, redirect to current stage
          console.log(`⚠️ Redirecting to step ${maxAllowedStage} - cannot go back to completed steps`);
          handleApiError({ message: 'Cannot go back to completed stages.' }, showError);
          router.push(`/restaurant-registration-staged/stage/${maxAllowedStage}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        handleApiError({ response: { data: errorData } }, showError, 'Failed to load registration progress');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      handleApiError(error, showError, 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
      handleApiError({ response: { status: 401 } }, showError, 'Please log in to continue with registration');
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, router, currentStage, showError, showSuccess]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <ContentWrapper>
            <LoadingWrapper>
              <ProgressBar />
              <LoadingMessage>Loading registration data...</LoadingMessage>
            </LoadingWrapper>
          </ContentWrapper>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageContainer>
        <ContentWrapper>
          <PageTitle>{t('Restaurant Registration')}</PageTitle>
          <PageDescription>
            {t('Complete your restaurant registration step by step')}
            {!registrationComplete && " Complete all steps to finish your registration."}
          </PageDescription>
          
          {registrationComplete ? (
            <PaymentSection>
              <SuccessMessage>
                Registration completed successfully!
              </SuccessMessage>
              <PaymentDescription>
                Your restaurant registration is complete. You can now access your dashboard.
              </PaymentDescription>
              <Button onClick={() => router.push('/restaurant-dashboard')}>
                Go to Dashboard
              </Button>
            </PaymentSection>
          ) : (
            <RegistrationWrapper>
              <StageContainer userType="restaurant" stageId={currentStage} />
            </RegistrationWrapper>
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

const RegistrationWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
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

const PaymentSection = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const SuccessMessage = styled.h3`
  color: #4CAF50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const PaymentDescription = styled.p`
  color: #e0e0e0;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const Button = styled.button`
  background-color: #ff6b00;
  color: white;
  padding: 14px 24px;
  border: none;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #e55a00;
  }
`; 