import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  driverId: string;
  onSuccess: () => void;
  onError: (error: { message: string }) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ driverId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // Create payment intent when component mounts
    
    fetch(`${API_BASE}/api/drivers/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError({ message: 'Failed to initialize payment' });
        }
      })
      .catch((err) => {
        onError({ message: 'Failed to initialize payment' });
      });
  }, [driverId, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      onError({ message: error.message || 'Payment failed' });
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      // Confirm payment on backend
      fetch(`${API_BASE}/api/drivers/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          driverId,
          paymentIntentId: paymentIntent.id 
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            onSuccess();
          } else {
            onError({ message: data.message });
          }
        })
        .catch(() => {
          onError({ message: 'Failed to confirm payment' });
        })
        .finally(() => {
          setProcessing(false);
        });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>Payment Information</Title>
      <Description>
        Please provide your payment information to complete the registration.
        The background check fee is CAD $65.00.
      </Description>
      
      <CardContainer>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </CardContainer>

      <SubmitButton type="submit" disabled={!stripe || processing || !clientSecret}>
        {processing ? 'Processing...' : 'Pay CAD $65.00'}
      </SubmitButton>
    </Form>
  );
};

const Form = styled.form`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: center;
`;

const Description = styled.p`
  color: #4a5568;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.5;
`;

const CardContainer = styled.div`
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: white;
  margin-bottom: 2rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #357abd;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;