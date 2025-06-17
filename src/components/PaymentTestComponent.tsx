'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import styled from 'styled-components';

const stripePromise = loadStripe("pk_test_51RUev403dkXaIukYE6J4hDctlSuyJ6FMUJ4LLWL2CQ5h9Lo1wqunqmln2XkQtbnEo1Hs3jShSG0wE6qUQGN1UrTc009ewWKZfR" );

// Dummy data for testing
const dummyDriverData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  cellNumber: '+1-416-555-0123',
  vehicleType: 'Car',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  yearOfManufacture: '2020',
  city: 'Toronto',
  province: 'ON'
};

const PaymentTestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDirectCheckout = async () => {
    setLoading(true);
    setError('');
    
    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      console.log('Creating checkout session with dummy data:', dummyDriverData);

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverData: dummyDriverData,
          testMode: true
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { id } = await res.json();
      
      if (!id) {
        throw new Error('No session ID received');
      }

      console.log('Checkout session created:', id);
      await stripe.redirectToCheckout({ sessionId: id });
      
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackendPaymentIntent = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drivers/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dummyDriverData),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setError('✅ Payment intent created successfully! Check console for details.');
      console.log('Payment Intent:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment intent';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TestContainer>
      <TestTitle>Payment Testing Component</TestTitle>
      <TestDescription>
        Use this component to test payment flows with dummy data
      </TestDescription>
      
      <DummyDataSection>
        <h4>Dummy Driver Data:</h4>
        <DataDisplay>
          {Object.entries(dummyDriverData).map(([key, value]) => (
            <DataItem key={key}>
              <strong>{key}:</strong> {value}
            </DataItem>
          ))}
        </DataDisplay>
      </DummyDataSection>

      <ButtonGroup>
        <TestButton 
          onClick={handleDirectCheckout} 
          disabled={loading}
          primary
        >
          {loading ? 'Loading...' : 'Test Stripe Checkout ($25)'}
        </TestButton>
        
        <TestButton 
          onClick={handleBackendPaymentIntent} 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Test Backend Payment Intent'}
        </TestButton>
      </ButtonGroup>

      {error && (
        <ErrorMessage success={error.includes('✅')}>
          {error}
        </ErrorMessage>
      )}

      <InstructionsSection>
        <h4>Instructions:</h4>
        <ul>
          <li><strong>Test Stripe Checkout:</strong> Redirects to Stripe's hosted checkout page</li>
          <li><strong>Test Backend Payment Intent:</strong> Tests backend API directly (check console/network tab)</li>
          <li>Use Stripe test card: <code>4242 4242 4242 4242</code></li>
          <li>Any future expiry date and any 3-digit CVC</li>
        </ul>
      </InstructionsSection>
    </TestContainer>
  );
};

const TestContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TestTitle = styled.h2`
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const TestDescription = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
`;

const DummyDataSection = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  
  h4 {
    margin-top: 0;
    color: #333;
  }
`;

const DataDisplay = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const DataItem = styled.div`
  color: #555;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const TestButton = styled.button<{ primary?: boolean }>`
  background-color: ${props => props.primary ? '#ff6b00' : '#007bff'};
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.primary ? '#e55a00' : '#0056b3'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div<{ success?: boolean }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
`;

const InstructionsSection = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  
  h4 {
    margin-top: 0;
    color: #333;
  }
  
  ul {
    margin: 0;
    color: #555;
  }
  
  code {
    background-color: #f1f3f4;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }
`;

export default PaymentTestComponent; 