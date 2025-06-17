'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle, Home } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem;
`;

const SuccessContainer = styled(motion.div)`
  max-width: 800px;
  margin: 2rem auto;
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  
  svg {
    width: 80px;
    height: 80px;
    color: #10B981;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1F2937;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: #4B5563;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const NextSteps = styled.div`
  background: #F3F4F6;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
  text-align: left;
`;

const StepTitle = styled.h2`
  font-size: 1.5rem;
  color: #1F2937;
  margin-bottom: 1rem;
`;

const StepList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StepItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  color: #4B5563;
  font-size: 1.1rem;
  
  &:before {
    content: "•";
    color: #10B981;
    font-weight: bold;
    margin-right: 0.5rem;
  }
`;

const HomeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto 0;
  padding: 0.75rem 1.5rem;
  background-color: #10B981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #059669;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function RestaurantRegistrationSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams) {
      const id = searchParams.get('session_id');
      if (id) {
        setSessionId(id);
      }
    }
  }, [searchParams]);

  const handleHomeClick = () => {
    router.push('/');
  };

  return (
    <>
      <Container>
        <SuccessContainer
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        >
          <IconWrapper>
            <CheckCircle />
          </IconWrapper>
          
          <Title>Registration Payment Successful!</Title>
          
          <Message>
            Thank you for completing your restaurant registration payment. Your application is now being processed.
            We will review your information and get back to you within 2-3 business days.
          </Message>

          <NextSteps>
            <StepTitle>Next Steps</StepTitle>
            <StepList>
              <StepItem>
                Our team will review your application and documents within 2-3 business days.
              </StepItem>
              <StepItem>
                You will receive an email notification once your application has been reviewed.
              </StepItem>
              <StepItem>
                If approved, you'll receive access to your restaurant dashboard where you can start setting up your menu and business details.
              </StepItem>
              <StepItem>
                For any questions or concerns, please contact our support team at support@winnger.com
              </StepItem>
            </StepList>
          </NextSteps>

          <HomeButton onClick={handleHomeClick}>
            <Home />
            Return to Home
          </HomeButton>
        </SuccessContainer>
      </Container>
    </>
  );
} 