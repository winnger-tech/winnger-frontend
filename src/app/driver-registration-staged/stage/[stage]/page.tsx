'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import Navbar from '../../../component/Navbar';
import { useTranslation } from '../../../../utils/i18n';
import { useAuth } from '@/hooks/useAuth';
import StageContainer from '@/components/stages/StageContainer';
import { DashboardProvider } from '@/context/DashboardContext';
import ProgressBar from '@/components/common/LoadingSpinner';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function StageDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [driverData, setDriverData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  const currentStage = parseInt(params?.stage as string) || 1;

  // Fetch dashboard data using the DashboardContext
  const fetchDashboardData = async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem('winngr_auth_token');
      console.log('🔑 Token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.log('⚠️ No authentication token found, redirecting to login');
        // Store the current URL to redirect back after login
        const currentPath = window.location.pathname;
        router.push(`/driverlogin?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Import the stage service directly to avoid context initialization issues
      const StageService = (await import('@/services/stageService')).default;
      
      // Set user type for StageService
      StageService.setUserType('driver');
      
      console.log('📡 Fetching dashboard data...');
      const response = await StageService.getDashboard();
      console.log('✅ Dashboard data received:', response);
      
      if (response && response.data) {
        setDashboardData(response.data);
        
        // Check if registration is complete
        if (response.data.isRegistrationComplete) {
          setRegistrationComplete(true);
          setDriverData(response.data.driver);
        }
        
        // Validate that the requested stage is valid
        const requestedStage = parseInt(params?.stage as string) || 1;
        const maxAllowedStage = response.data.currentStage || 1;
        const registrationStage = response.data.driver?.registrationStage || 1;
        
        console.log('🔍 Stage validation:', { 
          requestedStage, 
          maxAllowedStage, 
          registrationStage,
          userType: 'driver'
        });
        
        // Use registration stage as the source of truth for stage progression
        const currentRegistrationStage = registrationStage;
        
        // If trying to access a stage ahead of current registration progress, redirect to current stage
        if (requestedStage > currentRegistrationStage && currentRegistrationStage < 5) {
          console.log(`⚠️ Redirecting to registration stage ${currentRegistrationStage} - cannot skip stages`);
          router.push(`/driver-registration-staged/stage/${currentRegistrationStage}`);
        } else if (requestedStage < currentRegistrationStage && currentRegistrationStage > 1) {
          // If trying to access a stage behind current progress, redirect to current stage
          console.log(`⚠️ Redirecting to registration stage ${currentRegistrationStage} - cannot go back to completed stages`);
          router.push(`/driver-registration-staged/stage/${currentRegistrationStage}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard data:', error);
      
      // Check if it's an auth error
      if (error.status === 401 || error.message?.includes('unauthorized')) {
        console.log('⚠️ Auth token expired or invalid, redirecting to login');
        localStorage.removeItem('winngr_auth_token');
        const currentPath = window.location.pathname;
        router.push(`/driverlogin?redirect=${encodeURIComponent(currentPath)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 StageDetailPage useEffect triggered:', {
      isAuthenticated,
      userType: user?.type,
      registrationStage: user?.registrationStage,
      currentPath: window.location.pathname
    });
    
    // Always check for token directly first, don't rely solely on auth context
    const token = localStorage.getItem('winngr_auth_token');
    console.log('🔑 Token check in useEffect:', token ? 'Token exists' : 'No token');
    
    if (token) {
      // If token exists, proceed with fetching dashboard data
      console.log('✅ Token found, fetching dashboard data');
      fetchDashboardData();
    } else if (isAuthenticated === false) {
      // Only redirect if we're explicitly not authenticated
      console.log('❌ Not authenticated, redirecting to login');
      setIsLoading(false);
      const currentPath = window.location.pathname;
      router.push(`/driverlogin?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      // If authentication status is undefined/loading, wait for it
      console.log('⏳ Authentication status loading, waiting...');
      setIsLoading(false);
    }
  }, [isAuthenticated, params?.stage]);

  // Handle Stripe checkout
  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        console.error('Stripe not loaded');
        return;
      }

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { id } = await res.json();
      
      if (!id) {
        throw new Error('No session ID received');
      }

      await stripe.redirectToCheckout({ sessionId: id });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Payment initialization failed. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <PageContainer>
        <ContentWrapper>
          <PageTitle>{t('registration.driver.title')}</PageTitle>
          <PageDescription>
            {t('registration.driver.description')}
            {!registrationComplete && " Complete all steps to finish your registration."}
          </PageDescription>
          
          {isLoading ? (
            <LoadingWrapper>
              <ProgressBar />
              <LoadingMessage>Loading registration data...</LoadingMessage>
            </LoadingWrapper>
          ) : registrationComplete ? (
            <PaymentSection>
              <SuccessMessage>
                {t('registration.driver.payment.success')}
              </SuccessMessage>
              <PaymentDescription>
                {t('registration.driver.payment.description')}
              </PaymentDescription>
              <Button onClick={handleCheckout}>
                {t('registration.driver.payment.button')}
              </Button>
            </PaymentSection>
          ) : (
            <RegistrationWrapper>
              <StageContainer userType="driver" stageId={currentStage} />
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
