'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import Navbar from '../../component/Navbar';
import { useTranslation } from '../../../utils/i18n';

function PaymentSuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get payment details from URL parameters
    const sessionId = searchParams?.get('session_id');
    const paymentStatus = searchParams?.get('payment_status');
    const paymentIntent = searchParams?.get('payment_intent');
    
    if (sessionId || paymentIntent) {
      setPaymentDetails({
        sessionId: sessionId || paymentIntent,
        status: paymentStatus || 'completed',
        timestamp: new Date().toLocaleString()
      });
    }
    
    setIsLoading(false);
  }, [searchParams]);

  const handleContinue = () => {
    // Redirect to stage 5 (Profile Review) after payment completion
    window.location.href = '/driver-registration-staged/stage/5';
  };

  if (isLoading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingMessage>Loading payment details...</LoadingMessage>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <SuccessIcon>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2" fill="none"/>
            <path d="M9 12l2 2 4-4" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </SuccessIcon>
        
        <PageTitle>Payment Successful!</PageTitle>
        <PageDescription>
          Your driver registration payment has been processed successfully.
        </PageDescription>
        
        <PaymentDetails>
          <DetailItem>
            <Label>Payment Status:</Label>
            <Value className="success">Completed</Value>
          </DetailItem>
          <DetailItem>
            <Label>Amount Paid:</Label>
            <Value>$25.00 CAD</Value>
          </DetailItem>
          <DetailItem>
            <Label>Registration Fee:</Label>
            <Value>Driver Registration</Value>
          </DetailItem>
          {paymentDetails?.sessionId && (
            <DetailItem>
              <Label>Transaction ID:</Label>
              <Value className="small">{paymentDetails.sessionId}</Value>
            </DetailItem>
          )}
          <DetailItem>
            <Label>Date:</Label>
            <Value>{paymentDetails?.timestamp || new Date().toLocaleString()}</Value>
          </DetailItem>
        </PaymentDetails>

        <NextSteps>
          <h3>What's Next?</h3>
          <ul>
            <li>Your registration will be reviewed by our team</li>
            <li>You'll receive an email confirmation within 24 hours</li>
            <li>Once approved, you can start accepting delivery requests</li>
            <li>Download the Winnger driver app to get started</li>
          </ul>
        </NextSteps>

        <Button onClick={handleContinue}>
          Continue to Dashboard
        </Button>
      </ContentWrapper>
    </PageContainer>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <PageContainer>
          <ContentWrapper>
            <LoadingMessage>Loading payment details...</LoadingMessage>
          </ContentWrapper>
        </PageContainer>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 120px 20px 40px;
  background-color: #403E2D;
`;

const ContentWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

const SuccessIcon = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
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

const PaymentDetails = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  color: #b0b0b0;
  font-size: 0.95rem;
`;

const Value = styled.span`
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
  
  &.success {
    color: #4CAF50;
    font-weight: 600;
  }
  
  &.small {
    font-size: 0.85rem;
    color: #d0d0d0;
  }
`;

const NextSteps = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: left;
  
  h3 {
    color: white;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
  
  ul {
    color: #e0e0e0;
    line-height: 1.8;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

const Button = styled.button`
  background-color: #ff6b00;
  color: white;
  padding: 14px 32px;
  border: none;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;
  
  &:hover {
    background-color: #e55a00;
  }
`;

const LoadingMessage = styled.p`
  color: #e0e0e0;
  font-size: 1.1rem;
`; 