'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDashboard } from '../../../context/DashboardContext';
import { useToast } from '../../../context/ToastContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface Stage6Props {
  data: any;
  onChange: (data: any) => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  errors: any;
  userType: 'driver' | 'restaurant';
}

interface PaymentData {
  paymentIntentId: string;
  paymentStatus: string;
  amount: number;
  currency: string;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      '::placeholder': {
        color: 'rgba(255, 255, 255, 0.6)',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#ff6b6b',
      iconColor: '#ff6b6b',
    },
  },
};

function PaymentForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const { showSuccess, showError } = useToast();
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      showError('Stripe is not loaded. Please refresh the page.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create PaymentIntent on backend
      const createIntentResponse = await fetch('/api/drivers-staged/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'driver', 
          amount: 5000, // $50.00 in cents
          currency: 'usd' 
        })
      });

      if (!createIntentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await createIntentResponse.json();

      // 2. Confirm card payment on frontend
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (result.error) {
        showError(result.error.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        // 3. Notify backend to confirm payment
        const confirmResponse = await fetch('/api/drivers-staged/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentIntentId })
        });

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm payment');
        }

        const confirmData = await confirmResponse.json();
        
        setPaymentData({
          paymentIntentId,
          paymentStatus: 'succeeded',
          amount: 5000,
          currency: 'usd'
        });

        showSuccess('Payment successful! Registration completed.');
        onSubmit({
          paymentIntentId,
          paymentStatus: 'succeeded',
          amount: 5000,
          currency: 'usd',
          completed: true
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      showError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PaymentFormContainer onSubmit={handlePayment}>
      <PaymentSection>
        <SectionTitle>Payment Information</SectionTitle>
        <PaymentAmount>
          <AmountLabel>Registration Fee:</AmountLabel>
          <AmountValue>$50.00 USD</AmountValue>
        </PaymentAmount>
        
        <CardSection>
          <CardLabel>Credit Card Information *</CardLabel>
          <CardElementContainer>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </CardElementContainer>
        </CardSection>

        <PaymentButton
          type="submit"
          disabled={!stripe || processing || loading}
          $loading={processing || loading}
        >
          {processing ? 'Processing Payment...' : loading ? 'Loading...' : 'Complete Registration & Pay $50.00'}
        </PaymentButton>

        {paymentData && paymentData.paymentStatus === 'succeeded' && (
          <SuccessMessage>
            ✅ Payment successful! Your registration is complete.
          </SuccessMessage>
        )}
      </PaymentSection>

      <InfoSection>
        <InfoTitle>Registration Summary</InfoTitle>
        <InfoList>
          <InfoItem>✓ Personal Information</InfoItem>
          <InfoItem>✓ Vehicle Details</InfoItem>
          <InfoItem>✓ Document Upload</InfoItem>
          <InfoItem>✓ Background Check</InfoItem>
          <InfoItem>✓ Profile Review</InfoItem>
          <InfoItem>🔄 Payment Processing</InfoItem>
        </InfoList>
      </InfoSection>
    </PaymentFormContainer>
  );
}

export default function Stage6Payment({
  data,
  onChange,
  onSubmit,
  loading,
  errors,
  userType
}: Stage6Props) {
  const { state, actions } = useDashboard();
  const currentStageData = state.userData?.stage6 || {};

  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <StageCard>
        <CardHeader>
          <Title>Complete Registration</Title>
          <Description>
            You're almost done! Complete your payment to finish your driver registration.
          </Description>
        </CardHeader>

        <Elements stripe={stripePromise}>
          <PaymentForm onSubmit={onSubmit} loading={loading} />
        </Elements>
      </StageCard>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const StageCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #e0e0e0;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const PaymentFormContainer = styled.form`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PaymentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #f0f0f0;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const PaymentAmount = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const AmountLabel = styled.span`
  color: white;
  font-size: 1rem;
  font-weight: 500;
`;

const AmountValue = styled.span`
  color: #4CAF50;
  font-size: 1.2rem;
  font-weight: 600;
`;

const CardSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CardLabel = styled.label`
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
`;

const CardElementContainer = styled.div`
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #4CAF50;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PaymentButton = styled.button<{ $loading: boolean }>`
  padding: 1rem 2rem;
  background: ${props => props.$loading ? '#666' : 'linear-gradient(135deg, #4CAF50, #45a049)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4CAF50;
  border-radius: 8px;
  color: #4CAF50;
  font-weight: 500;
  text-align: center;
`;

const InfoSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoTitle = styled.h4`
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoItem = styled.li`
  color: #e0e0e0;
  font-size: 0.9rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`; 