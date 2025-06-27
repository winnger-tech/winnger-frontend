'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import styled from 'styled-components';
import Navbar from '../../component/Navbar';
import { useTranslation } from '../../../utils/i18n';
import { useAuth } from '../../../hooks/useAuth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function RegistrationSuccessPage() {
  const { t } = useTranslation();
  const { user, token, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      console.log('🔍 Authentication Debug:', {
        isAuthenticated,
        user: user,
        token: token ? 'Present' : 'Missing'
      });
      
      if (!isAuthenticated || !token || !user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      if (user.type !== 'driver') {
        throw new Error('This payment is only for driver registration.');
      }

      // Step 1: Create payment intent using backend API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      const paymentResponse = await fetch(`${apiBaseUrl}/drivers/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          driverId: user.id,
          amount: 25.00 // $25 registration fee
        })
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const paymentData = await paymentResponse.json();
      
      console.log('🔍 Payment response:', paymentData);
      
      if (!paymentData.clientSecret) {
        throw new Error('No client secret received from payment service');
      }

      // For demo purposes, we'll redirect to a simple payment confirmation
      // In a real implementation, you would use Stripe Elements for card input
      console.log('🔍 Payment intent created successfully');
      
      // Redirect to payment success page with the payment intent ID
      const paymentIntentId = paymentData.clientSecret.split('_secret_')[0];
      window.location.href = `/driver-registration-staged/payment-success?payment_intent=${paymentIntentId}`;

    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Payment initialization failed. Please try again.');
    } finally {
      setIsLoading(false);
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
          </PageDescription>
          
          <PaymentSection>
            <SuccessMessage>
              {t('registration.driver.payment.success')}
            </SuccessMessage>
            <PaymentDescription>
              {t('registration.driver.payment.description')}
            </PaymentDescription>
            {error && (
              <ErrorMessage>{error}</ErrorMessage>
            )}
            <Button onClick={handleCheckout} disabled={isLoading}>
              {isLoading ? 'Processing...' : t('registration.driver.payment.button')}
            </Button>
          </PaymentSection>
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

const ErrorMessage = styled.p`
  color: #f44336;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  padding: 0.75rem;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
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
  
  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #e55a00;
  }
`;
