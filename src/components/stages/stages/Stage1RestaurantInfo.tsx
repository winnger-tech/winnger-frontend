"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../utils/i18n';
import { useDashboard } from '../../../context/DashboardContext';

interface Stage1RestaurantInfoProps {
  data: any;
  onChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}

export default function Stage1RestaurantInfo({ 
  data, 
  onChange, 
  onSave, 
  isReadOnly = false 
}: Stage1RestaurantInfoProps) {
  const { t } = useTranslation();
  const { state } = useDashboard();
  
  const [formData, setFormData] = useState({
    restaurantName: data?.restaurantName || '',
    ownerName: data?.ownerName || '',
    email: data?.email || '',
    phone: data?.phone || '',
    ...data
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    setFormData({
      restaurantName: data?.restaurantName || '',
      ownerName: data?.ownerName || '',
      email: data?.email || '',
      phone: data?.phone || '',
      ...data
    });
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    onChange(newData);
    
    // Clear validation error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.restaurantName?.trim()) {
      newErrors.restaurantName = t('Restaurant name is required');
    }
    
    if (!formData.ownerName?.trim()) {
      newErrors.ownerName = t('Owner name is required');
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = t('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('Please enter a valid email');
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = t('Phone number is required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      await onSave(formData);
    }
  };

  return (
    <StageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StageHeader>
        <StageTitle>{t('Restaurant Basic Information')}</StageTitle>
        <StageDescription>
          {t('Provide your restaurant\'s basic information to get started')}
        </StageDescription>
      </StageHeader>

      <Form>
        <FormRow>
          <FormGroup>
            <Label htmlFor="restaurantName">
              {t('Restaurant Name')} <Required>*</Required>
            </Label>
            <Input
              id="restaurantName"
              name="restaurantName"
              type="text"
              value={formData.restaurantName}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.restaurantName}
              placeholder={t('Enter your restaurant name')}
            />
            {errors.restaurantName && <ErrorMessage>{errors.restaurantName}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="ownerName">
              {t('Owner/Manager Name')} <Required>*</Required>
            </Label>
            <Input
              id="ownerName"
              name="ownerName"
              type="text"
              value={formData.ownerName}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.ownerName}
              placeholder={t('Enter owner/manager name')}
            />
            {errors.ownerName && <ErrorMessage>{errors.ownerName}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="email">
              {t('Email Address')} <Required>*</Required>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.email}
              placeholder={t('Enter email address')}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">
              {t('Phone Number')} <Required>*</Required>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.phone}
              placeholder={t('Enter phone number')}
            />
            {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        {!isReadOnly && (
          <SaveButtonContainer>
            <SaveButton
              type="button"
              onClick={handleSave}
              disabled={state.loading}
            >
              {state.loading ? t('Saving...') : t('Save & Continue')}
            </SaveButton>
          </SaveButtonContainer>
        )}
      </Form>

      {isReadOnly && (
        <ReadOnlyNote>
          <InfoIcon>ℹ️</InfoIcon>
          {t('This information was provided during signup and cannot be edited at this stage.')}
        </ReadOnlyNote>
      )}
    </StageContainer>
  );
}

// Styled Components
const StageContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StageHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const StageTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StageDescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const Required = styled.span`
  color: #ef4444;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }

  &:read-only {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.25rem;
`;

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ReadOnlyNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #0369a1;
`;

const InfoIcon = styled.span`
  font-size: 1.125rem;
`;
