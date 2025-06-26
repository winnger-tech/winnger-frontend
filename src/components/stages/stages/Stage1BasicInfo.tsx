'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Stage1Props {
  data: any;
  onChange: (data: any) => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  errors: any;
  userType: 'driver' | 'restaurant';
}

export default function Stage1BasicInfo({ 
  data, 
  onChange, 
  onSubmit, 
  loading, 
  errors,
  userType 
}: Stage1Props) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <StageCard>
        <CardHeader>
          <Title>Basic Information</Title>
          <Description>
            Your basic account information (read-only after initial registration)
          </Description>
        </CardHeader>

        <Form onSubmit={handleSubmit}>
          {userType === 'driver' ? (
            <InputRow>
              <InputGroup>
                <Label>First Name *</Label>
                <Input
                  type="text"
                  name="firstName"
                  value={data.firstName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  readOnly
                />
              </InputGroup>

              <InputGroup>
                <Label>Last Name *</Label>
                <Input
                  type="text"
                  name="lastName"
                  value={data.lastName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  readOnly
                />
              </InputGroup>
            </InputRow>
          ) : (
            <InputGroup>
              <Label>Restaurant Owner Name *</Label>
              <Input
                type="text"
                name="ownerName"
                value={data.ownerName || ''}
                onChange={handleInputChange}
                placeholder="Enter owner name"
                readOnly
              />
            </InputGroup>
          )}

          <InputGroup>
            <Label>Email Address *</Label>
            <Input
              type="email"
              name="email"
              value={data.email || ''}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              readOnly
            />
          </InputGroup>

          <InfoNote>
            <InfoIcon>ℹ️</InfoIcon>
            <InfoText>
              This information was set during account creation and cannot be modified. 
              If you need to change this information, please contact support.
            </InfoText>
          </InfoNote>

          <SubmitButton 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Continue to Next Step'}
          </SubmitButton>
        </Form>
      </StageCard>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding-top: 110px;
`;

const StageCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #403E2D;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #403E2D;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #e1e1e1;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
  background: ${props => props.readOnly ? '#f5f5f5' : 'white'};
  color: #111;

  &:focus {
    outline: none;
    border-color: #ffc32b;
    box-shadow: 0 0 0 3px rgba(255, 195, 43, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const InfoNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 195, 43, 0.1);
  border: 1px solid rgba(255, 195, 43, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
`;

const InfoIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const InfoText = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
  min-width: 200px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 195, 43, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;
