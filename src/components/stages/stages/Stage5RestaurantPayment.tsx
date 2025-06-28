'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCreditCard, FaShieldAlt, FaCheck, FaSpinner } from 'react-icons/fa';
import { useTranslation } from '../../../utils/i18n';
import { useDashboard } from '../../../context/DashboardContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface Stage5RestaurantPaymentProps {
  data: any;
  onChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}

interface FormData {
  paymentIntentId: string;
  stripePaymentMethodId: string;
  paymentCompleted: boolean;
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PaymentForm = ({ onPaymentSuccess, onPaymentError, isProcessing }: { 
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onPaymentError('Stripe is not loaded. Please refresh the page and try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError('Payment form is not ready. Please try again.');
      return;
    }

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('winngr_auth_token');
      if (!token) {
        onPaymentError('Authentication token not found. Please log in again.');
        return;
      }

      console.log('🔑 Creating payment intent with token:', token.substring(0, 20) + '...');

      // Create payment intent first
      const createIntentResponse = await fetch('/api/restaurants/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Payment intent response status:', createIntentResponse.status);

      if (!createIntentResponse.ok) {
        const errorData = await createIntentResponse.json();
        console.error('❌ Payment intent error:', errorData);
        onPaymentError(errorData.message || `Failed to create payment intent (${createIntentResponse.status})`);
        return;
      }

      const responseData = await createIntentResponse.json();
      console.log('✅ Payment intent created:', responseData);

      if (!responseData.success) {
        onPaymentError(responseData.message || 'Payment intent creation failed');
        return;
      }

      const { clientSecret, paymentIntentId } = responseData;

      if (!clientSecret || !paymentIntentId) {
        onPaymentError('Invalid payment intent response from server');
        return;
      }

      console.log('💳 Confirming payment with Stripe...');

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Restaurant Registration',
          },
        }
      });

      if (error) {
        console.error('❌ Stripe payment error:', error);
        onPaymentError(error.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent);
        onPaymentSuccess({
          paymentIntentId: paymentIntentId,
          stripePaymentMethodId: paymentIntent.payment_method as string,
          paymentCompleted: true
        });
      } else {
        onPaymentError(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('❌ Payment failed:', error);
      onPaymentError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <PaymentFormContainer onSubmit={handleSubmit}>
      <PaymentSection>
        <SectionTitle>Payment Information</SectionTitle>
        <CardElementContainer>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#403E2D',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#e74c3c',
                },
              },
            }}
          />
        </CardElementContainer>
      </PaymentSection>

      <PaymentButton
        type="submit"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <FaSpinner className="animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <FaCreditCard />
            Pay $45 Registration Fee
          </>
        )}
      </PaymentButton>
    </PaymentFormContainer>
  );
};

export default function Stage5RestaurantPayment({ 
  data, 
  onChange, 
  onSave, 
  isReadOnly = false 
}: Stage5RestaurantPaymentProps) {
  const { t } = useTranslation();
  const { state } = useDashboard();
  
  const [formData, setFormData] = useState<FormData>({
    paymentIntentId: data?.paymentIntentId || '',
    stripePaymentMethodId: data?.stripePaymentMethodId || '',
    paymentCompleted: data?.paymentCompleted || false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');

  useEffect(() => {
    if (data) {
      setFormData({
        paymentIntentId: data.paymentIntentId || '',
        stripePaymentMethodId: data.stripePaymentMethodId || '',
        paymentCompleted: data.paymentCompleted || false,
      });
    }
  }, [data]);

  const handlePaymentSuccess = async (paymentData: any) => {
    setIsProcessing(true);
    setPaymentError('');
    
    try {
      // Only include the necessary payment fields, explicitly exclude any status fields
      const cleanPaymentData = {
        paymentIntentId: paymentData.paymentIntentId,
        stripePaymentMethodId: paymentData.stripePaymentMethodId,
        paymentCompleted: paymentData.paymentCompleted,
        // Explicitly exclude any status fields to avoid enum conflicts
        // The backend should handle status updates automatically
      };
      
      console.log('💳 Saving payment data:', cleanPaymentData);
      
      const newFormData = { ...formData, ...cleanPaymentData };
      setFormData(newFormData);
      onChange(newFormData);
      
      // Save the payment data
      await onSave(newFormData);
      
      console.log('✅ Payment data saved successfully');
    } catch (error) {
      console.error('❌ Failed to save payment data:', error);
      
      // Handle specific enum error for restaurant status
      if (error instanceof Error && error.message.includes('invalid input value for enum enum_restaurants_status')) {
        console.error('🔧 Enum error detected - backend trying to set invalid status');
        setPaymentError('Payment was successful but there was an issue updating your status. Please contact support to resolve this.');
      } else if (error instanceof Error && error.message.includes('pending_approval')) {
        console.error('🔧 Backend trying to set invalid status: pending_approval');
        setPaymentError('Payment was successful but there was an issue with the status update. Please contact support.');
      } else {
        setPaymentError('Payment was successful but failed to save. Please contact support.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setIsProcessing(false);
  };

  if (formData.paymentCompleted) {
    return (
      <StageContainer>
        <SuccessContainer>
          <SuccessIcon>
            <FaCheck />
          </SuccessIcon>
          <SuccessTitle>Payment Completed Successfully!</SuccessTitle>
          <SuccessMessage>
            Your restaurant registration has been completed. Your account is now pending approval.
          </SuccessMessage>
          <NextSteps>
            <StepTitle>Next Steps:</StepTitle>
            <StepList>
              <StepItem>Your application will be reviewed by our team</StepItem>
              <StepItem>You will receive an email notification once approved</StepItem>
              <StepItem>Once approved, you can start using all platform features</StepItem>
            </StepList>
          </NextSteps>
        </SuccessContainer>
      </StageContainer>
    );
  }

  return (
    <StageContainer>
      <StageHeader>
        <StageTitle>Payment Processing</StageTitle>
        <StageDescription>
          Complete your registration fee payment to finalize your account
        </StageDescription>
      </StageHeader>

      <PaymentDetails>
        <PaymentSummary>
          <SummaryTitle>Registration Fee Summary</SummaryTitle>
          <SummaryItem>
            <span>Restaurant Basic Plan</span>
            <span>$45.00</span>
          </SummaryItem>
          <SummaryTotal>
            <span>Total</span>
            <span>$45.00</span>
          </SummaryTotal>
        </PaymentSummary>

        <SecurityNote>
          <SecurityIcon>
            <FaShieldAlt />
          </SecurityIcon>
          <SecurityText>
            Your payment information is secure and encrypted. We use Stripe for secure payment processing.
          </SecurityText>
        </SecurityNote>
      </PaymentDetails>

      {!isReadOnly ? (
        <Elements stripe={stripePromise}>
          <PaymentForm 
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            isProcessing={isProcessing}
          />
        </Elements>
      ) : (
        <ReadOnlyNote>
          <InfoIcon>ℹ️</InfoIcon>
          {t('Payment information cannot be edited at this stage.')}
        </ReadOnlyNote>
      )}

      {paymentError && (
        <ErrorMessage>
          {paymentError}
        </ErrorMessage>
      )}
    </StageContainer>
  );
}

const StageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const StageHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const StageTitle = styled.h2`
  font-size: 2rem;
  color: #403E2D;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const StageDescription = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
`;

const PaymentDetails = styled.div`
  margin-bottom: 2rem;
`;

const PaymentSummary = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const SummaryTitle = styled.h3`
  font-size: 1.125rem;
  color: #403E2D;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #403E2D;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 1.125rem;
  color: #403E2D;
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
`;

const SecurityIcon = styled.div`
  color: #16a34a;
  font-size: 1.25rem;
`;

const SecurityText = styled.p`
  font-size: 0.875rem;
  line-height: 1.4;
`;

const PaymentFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PaymentSection = styled.div`
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  color: #403E2D;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const CardElementContainer = styled.div`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  
  &:focus-within {
    border-color: #ffc32b;
    box-shadow: 0 0 0 3px rgba(255, 195, 43, 0.1);
  }
`;

const PaymentButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const SuccessIcon = styled.div`
  color: #10b981;
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const SuccessTitle = styled.h2`
  font-size: 1.75rem;
  color: #403E2D;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const SuccessMessage = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
`;

const NextSteps = styled.div`
  text-align: left;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
`;

const StepTitle = styled.h3`
  font-size: 1.125rem;
  color: #403E2D;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const StepList = styled.ul`
  list-style: none;
  padding: 0;
`;

const StepItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #403E2D;
  font-size: 0.875rem;
  
  &:before {
    content: "✓";
    color: #10b981;
    font-weight: bold;
  }
`;

const ReadOnlyNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
`;

const InfoIcon = styled.span`
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.875rem;
`; 