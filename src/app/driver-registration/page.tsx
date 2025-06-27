'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import styled from 'styled-components';
import Navbar from '../component/Navbar';
import { useTranslation } from '../../utils/i18n';
import { useAuth } from '@/hooks/useAuth';
import StageContainer from '@/components/stages/StageContainer';
import { DashboardProvider } from '@/context/DashboardContext';
import ProgressBar from '@/components/common/LoadingSpinner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function DriverRegistrationPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user, isRegistrationComplete } = useAuth();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [driverData, setDriverData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Check if user is registered and at what stage
  useEffect(() => {
    console.log('🔍 DriverRegistrationPage useEffect:', {
      isAuthenticated,
      user: user ? { type: user.type, registrationStage: user.registrationStage, isRegistrationComplete: user.isRegistrationComplete } : null,
      currentPath: window.location.pathname
    });
    
    if (isAuthenticated && user) {
      // If the user has completed all stages
      if (user.isRegistrationComplete) {
        console.log('✅ Registration complete, showing payment section');
        setRegistrationComplete(true);
        setDriverData(user);
      } else if (user.registrationStage > 1) {
        // Redirect to the staged registration process if they've started it
        console.log(`🔄 Redirecting to stage ${user.registrationStage} from driver-registration page`);
        window.location.href = `/driver-registration-staged/stage/${user.registrationStage}`;
      } else {
        console.log('📝 User at stage 1, staying on registration page');
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initialize dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('winngr_auth_token');
      if (!token) return;
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiBaseUrl}/drivers-staged/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
        
        // Update registration complete status based on API response
        if (data.data.isRegistrationComplete) {
          setRegistrationComplete(true);
          setDriverData(data.data.driver);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleRegistrationSubmit = (data: any) => {
    console.log('Driver registration completed:', data);
    setDriverData(data);
    setRegistrationComplete(true);
  };

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
            {!registrationComplete && " Fill out the form below to begin your registration process."}
          </PageDescription>
          
          {isLoading ? (
            <LoadingWrapper>
              <ProgressBar />
              <LoadingMessage>Loading registration data...</LoadingMessage>
            </LoadingWrapper>
          ) : !registrationComplete ? (
            <RegistrationWrapper>
              <Button
                onClick={() => {
                  // Check if token exists
                  const token = localStorage.getItem('winngr_auth_token');
                  if (!token) {
                    // If no token, redirect to login first
                    window.location.href = '/driverlogin?redirect=/driver-registration-staged/stage/1';
                  } else {
                    // If token exists, redirect to the staged registration flow
                    window.location.href = '/driver-registration-staged/stage/1';
                  }
                }}
              >
                {t('registration.driver.button.startRegistration')}
              </Button>
            </RegistrationWrapper>
          ) : (
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