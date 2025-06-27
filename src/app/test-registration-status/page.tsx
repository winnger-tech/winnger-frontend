'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

export default function TestRegistrationStatusPage() {
  const router = useRouter();
  const [driverId, setDriverId] = useState('e36c2dfd-8e21-4fcf-89e2-7d5334167715');
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkRegistrationStatus = async () => {
    if (!driverId) {
      setError('Please enter a driver ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusData(null);

    try {
      const response = await fetch(`/api/drivers/registration-status/${driverId}`);
      const data = await response.json();

      if (response.ok) {
        setStatusData(data);
      } else {
        setError(data.message || 'Failed to check registration status');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error checking registration status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegistration = () => {
    router.push(`/driver-registration?driverId=${driverId}`);
  };

  return (
    <Container>
      <ContentWrapper>
        <Title>Test Driver Registration Status</Title>
        <Description>
          This page allows you to test the driver registration status API and see how email/password fields are populated.
        </Description>

        <TestSection>
          <SectionTitle>API Test</SectionTitle>
          
          <InputGroup>
            <Label>Driver ID:</Label>
            <Input
              type="text"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              placeholder="Enter driver ID"
            />
          </InputGroup>

          <Button onClick={checkRegistrationStatus} disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Check Registration Status'}
          </Button>

          {error && (
            <ErrorMessage>
              Error: {error}
            </ErrorMessage>
          )}

          {statusData && (
            <ResultSection>
              <ResultTitle>Registration Status Result:</ResultTitle>
              <ResultData>
                <pre>{JSON.stringify(statusData, null, 2)}</pre>
              </ResultData>
              
              {statusData.data?.email && statusData.data?.password && (
                <InfoBox>
                  <InfoTitle>✅ Email and Password Found</InfoTitle>
                  <InfoText>
                    Email: {statusData.data.email}<br/>
                    Password: {statusData.data.password}
                  </InfoText>
                  <ActionButton onClick={goToRegistration}>
                    Go to Registration Form (with prefilled data)
                  </ActionButton>
                </InfoBox>
              )}
            </ResultSection>
          )}
        </TestSection>

        <TestSection>
          <SectionTitle>Direct Registration Links</SectionTitle>
          <LinkGroup>
            <DirectLink onClick={() => router.push('/driver-registration?driverId=e36c2dfd-8e21-4fcf-89e2-7d5334167715')}>
              Test with Sample Driver ID
            </DirectLink>
            <DirectLink onClick={() => router.push('/driver-registration')}>
              Registration without Driver ID
            </DirectLink>
          </LinkGroup>
        </TestSection>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  padding: 120px 20px 40px;
  background-color: #403E2D;
  color: white;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Description = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  margin-bottom: 3rem;
  text-align: center;
  line-height: 1.6;
`;

const TestSection = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #ffc32b;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #403E2D;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #ffc32b;
  }
`;

const Button = styled.button`
  background-color: #ffc32b;
  color: #403E2D;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #e6b800;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const ResultSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const ResultTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #ffc32b;
`;

const ResultData = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 0.875rem;
  }
`;

const InfoBox = styled.div`
  background-color: rgba(76, 175, 80, 0.2);
  border: 1px solid #4CAF50;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const InfoTitle = styled.h4`
  color: #4CAF50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const InfoText = styled.p`
  color: #e0e0e0;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #45a049;
  }
`;

const LinkGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DirectLink = styled.button`
  background-color: #3498db;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #2980b9;
  }
`; 