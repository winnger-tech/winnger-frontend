'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

import styled from 'styled-components';
import Navbar from '../component/Navbar';
import DriverRegistration from '@/components/driver/DriverRegistration';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function DriverRegistrationPage() {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [driverData, setDriverData] = useState(null);

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
          <PageTitle>Driver Registration</PageTitle>
          <PageDescription>
            Join our network of professional drivers and start earning on your own schedule.
            {!registrationComplete && " Fill out the form below to begin your registration process."}
          </PageDescription>
          
          {!registrationComplete ? (
            <RegistrationWrapper>
              <DriverRegistration onSubmit={handleRegistrationSubmit} />
            </RegistrationWrapper>
          ) : (
            <PaymentSection>
              <SuccessMessage>
                Registration form completed successfully!
              </SuccessMessage>
              <PaymentDescription>
                Complete your registration with a one-time registration fee of $25.
              </PaymentDescription>
              <Button onClick={handleCheckout}>
                Proceed to Payment ($25)
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