'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Navbar from '../../component/Navbar';
import { useTranslation } from '../../../utils/i18n';
import { useAuth } from '@/hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function RestaurantRegistrationSuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, router]);

  // Handle Stripe checkout
  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const stripe = await stripePromise;
      
      if (!stripe) {
        console.error('Stripe not loaded');
        return;
      }

      const res = await fetch('/api/restaurants/create-checkout-session', {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <PageContainer>
        <ContentWrapper>
          <SuccessCard>
            <SuccessIcon>✅</SuccessIcon>
            <SuccessTitle>Registration Complete!</SuccessTitle>
            <SuccessDescription>
              Congratulations! Your restaurant registration has been completed successfully. 
              You can now start accepting orders and managing your restaurant through our platform.
            </SuccessDescription>
            
            <ActionButtons>
              <PrimaryButton onClick={() => router.push('/restaurantlogin')}>
                Go to Login
              </PrimaryButton>
              <SecondaryButton onClick={handleCheckout} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Complete Payment'}
              </SecondaryButton>
            </ActionButtons>
            
            <InfoSection>
              <InfoTitle>What's Next?</InfoTitle>
              <InfoList>
                <InfoItem>• Set up your menu items and pricing</InfoItem>
                <InfoItem>• Configure your delivery hours and zones</InfoItem>
                <InfoItem>• Upload restaurant photos and branding</InfoItem>
                <InfoItem>• Start receiving and managing orders</InfoItem>
              </InfoList>
            </InfoSection>
          </SuccessCard>
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
`;

const SuccessCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const SuccessTitle = styled.h1`
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const SuccessDescription = styled.p`
  color: #e0e0e0;
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PrimaryButton = styled.button`
  background-color: #ff6b00;
  color: white;
  padding: 14px 28px;
  border: none;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background-color: #e55a00;
  }
`;

const SecondaryButton = styled.button`
  background-color: transparent;
  color: #ff6b00;
  padding: 14px 28px;
  border: 2px solid #ff6b00;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background-color: #ff6b00;
    color: white;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InfoSection = styled.div`
  background: rgba(255, 107, 0, 0.1);
  border: 1px solid rgba(255, 107, 0, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
`;

const InfoTitle = styled.h3`
  color: #ff6b00;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
`;

const InfoItem = styled.li`
  color: #e0e0e0;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`; 