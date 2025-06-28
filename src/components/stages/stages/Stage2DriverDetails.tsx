'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Stage2Props {
  data: any;
  onChange: (data: any) => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  errors: any;
  userType: 'driver' | 'restaurant';
}

interface ValidationErrors {
  [key: string]: string;
}

export default function Stage2DriverDetails({ 
  data, 
  onChange, 
  onSubmit, 
  loading, 
  errors,
  userType 
}: Stage2Props) {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Validation functions
  const validateRequired = (value: string, fieldName: string) => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return '';
  };

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (!phone) return 'Phone number is required';
    if (cleaned.length !== 10) return 'Phone number must be 10 digits';
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let error = '';

    // Apply validation based on field
    switch (name) {
      case 'emergencyContactName':
        error = validateRequired(value, 'Emergency contact name');
        break;
      case 'emergencyContactPhone':
        error = validatePhoneNumber(value);
        break;
      case 'emergencyContactRelationship':
        error = validateRequired(value, 'Emergency contact relationship');
        break;
    }

    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));

    onChange({ [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields before submit
    const newErrors: ValidationErrors = {};
    
    // Validate required fields for driver stage 2
    newErrors.emergencyContactName = validateRequired(data.emergencyContactName || '', 'Emergency contact name');
    newErrors.emergencyContactPhone = validatePhoneNumber(data.emergencyContactPhone || '');
    newErrors.emergencyContactRelationship = validateRequired(data.emergencyContactRelationship || '', 'Emergency contact relationship');

    setValidationErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (!hasErrors) {
      onSubmit(data);
    }
  };

  const relationshipOptions = [
    { value: '', label: 'Select Relationship' },
    { value: 'parent', label: 'Parent' },
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <StageCard>
        <CardHeader>
          <Title>Emergency Contact Information</Title>
          <Description>
            Please provide emergency contact details for safety purposes
          </Description>
        </CardHeader>

        <Form onSubmit={handleSubmit}>
          <SectionTitle>Emergency Contact Details</SectionTitle>
          
          <InputRow>
            <InputGroup>
              <Label>Emergency Contact Name *</Label>
              <Input
                type="text"
                name="emergencyContactName"
                value={data.emergencyContactName || ''}
                onChange={handleInputChange}
                placeholder="Full name of emergency contact"
                style={{
                  borderColor: validationErrors.emergencyContactName ? '#ff4757' : '#e1e1e1'
                }}
              />
              {validationErrors.emergencyContactName && (
                <ErrorText>{validationErrors.emergencyContactName}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Emergency Contact Phone *</Label>
              <Input
                type="tel"
                name="emergencyContactPhone"
                value={data.emergencyContactPhone || ''}
                onChange={handleInputChange}
                placeholder="(123) 456-7890"
                style={{
                  borderColor: validationErrors.emergencyContactPhone ? '#ff4757' : '#e1e1e1'
                }}
              />
              {validationErrors.emergencyContactPhone && (
                <ErrorText>{validationErrors.emergencyContactPhone}</ErrorText>
              )}
            </InputGroup>
          </InputRow>

          <InputRow>
            <InputGroup>
              <Label>Relationship to You *</Label>
              <Select
                name="emergencyContactRelationship"
                value={data.emergencyContactRelationship || ''}
                onChange={handleInputChange}
                style={{
                  borderColor: validationErrors.emergencyContactRelationship ? '#ff4757' : '#e1e1e1'
                }}
              >
                {relationshipOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {validationErrors.emergencyContactRelationship && (
                <ErrorText>{validationErrors.emergencyContactRelationship}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Emergency Contact Email</Label>
              <Input
                type="email"
                name="emergencyContactEmail"
                value={data.emergencyContactEmail || ''}
                onChange={handleInputChange}
                placeholder="email@example.com (optional)"
              />
            </InputGroup>
          </InputRow>

          <InfoNote>
            <InfoIcon>ℹ️</InfoIcon>
            <InfoText>
              This information will only be used in case of emergency while you're working. 
              We will never contact your emergency contact for any other reason.
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

// Styled Components (reusing from Stage1 for consistency)
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
  background: white;
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

const Select = styled.select`
  padding: 1rem;
  border: 2px solid #e1e1e1;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
  background: white;
  color: #111;

  &:focus {
    outline: none;
    border-color: #ffc32b;
    box-shadow: 0 0 0 3px rgba(255, 195, 43, 0.1);
  }

  option {
    color: #111;
    background: white;
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

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #403E2D;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const ErrorText = styled.span`
  color: #ff4757;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
  font-weight: 500;
`;
