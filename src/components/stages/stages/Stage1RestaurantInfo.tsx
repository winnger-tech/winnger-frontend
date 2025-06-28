"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../utils/i18n';
import { useDashboard } from '../../../context/DashboardContext';

// Styled Components
const StageContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 6rem 2rem 2rem 2rem;
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

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 1rem 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
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

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  color: #111;
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

const Select = styled.select.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  color: #111;
  background-color: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  color: #111;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
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
    phone: data?.phone || '',
    identificationType: data?.identificationType || '',
    ownerAddress: data?.ownerAddress || '',
    businessType: data?.businessType || '',
    restaurantName: data?.restaurantName || '',
    businessEmail: data?.businessEmail || '',
    businessPhone: data?.businessPhone || '',
    restaurantAddress: data?.restaurantAddress || '',
    city: data?.city || '',
    province: data?.province || '',
    postalCode: data?.postalCode || '',
    ...data
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    setFormData({
      phone: data?.phone || '',
      identificationType: data?.identificationType || '',
      ownerAddress: data?.ownerAddress || '',
      businessType: data?.businessType || '',
      restaurantName: data?.restaurantName || '',
      businessEmail: data?.businessEmail || '',
      businessPhone: data?.businessPhone || '',
      restaurantAddress: data?.restaurantAddress || '',
      city: data?.city || '',
      province: data?.province || '',
      postalCode: data?.postalCode || '',
      ...data
    });
  }, [data]);

  // Real-time validation function
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'restaurantName':
        if (!value?.trim()) {
          return t('Restaurant name is required');
        }
        return '';
      
      case 'businessEmail':
        if (!value?.trim()) {
          return t('Business email is required');
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          return t('Please enter a valid email');
        }
        return '';
      
      case 'businessPhone':
        if (!value?.trim()) {
          return t('Business phone is required');
        }
        return '';
      
      case 'restaurantAddress':
        if (!value?.trim()) {
          return t('Restaurant address is required');
        }
        return '';
      
      case 'city':
        if (!value?.trim()) {
          return t('City is required');
        }
        return '';
      
      case 'province':
        if (!value?.trim()) {
          return t('Province is required');
        }
        return '';
      
      case 'postalCode':
        if (!value?.trim()) {
          return t('Postal code is required');
        }
        return '';
      
      case 'businessType':
        if (!value?.trim()) {
          return t('Business type is required');
        }
        return '';
      
      case 'identificationType':
        if (!value?.trim()) {
          return t('Identification type is required');
        }
        return '';
      
      case 'ownerAddress':
        if (!value?.trim()) {
          return t('Owner address is required');
        }
        return '';
      
      case 'phone':
        if (!value?.trim()) {
          return t('Phone is required');
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    onChange(newData);
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ 
        ...prev, 
        [name]: '' 
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    // Validate all required fields
    const requiredFields = [
      'restaurantName', 'businessEmail', 'businessPhone', 'restaurantAddress',
      'city', 'province', 'postalCode', 'businessType', 'identificationType',
      'ownerAddress', 'phone'
    ];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
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
        <StageTitle>{t('Restaurant Information')}</StageTitle>
        <StageDescription>
          {t('Provide your restaurant\'s complete information to get started')}
        </StageDescription>
      </StageHeader>

      <Form>
        {/* Restaurant Information */}
        <SectionTitle>{t('Restaurant Details')}</SectionTitle>
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
            <Label htmlFor="businessType">
              {t('Business Type')} <Required>*</Required>
            </Label>
            <Select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              disabled={isReadOnly}
              hasError={!!errors.businessType}
            >
              <option value="">{t('Select business type')}</option>
              <option value="solo">Solo</option>
              <option value="corporate">Corporate</option>
            </Select>
            {errors.businessType && <ErrorMessage>{errors.businessType}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="businessEmail">
              {t('Business Email')} <Required>*</Required>
            </Label>
            <Input
              id="businessEmail"
              name="businessEmail"
              type="email"
              value={formData.businessEmail}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.businessEmail}
              placeholder={t('Enter business email')}
            />
            {errors.businessEmail && <ErrorMessage>{errors.businessEmail}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="businessPhone">
              {t('Business Phone')} <Required>*</Required>
            </Label>
            <Input
              id="businessPhone"
              name="businessPhone"
              type="tel"
              value={formData.businessPhone}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.businessPhone}
              placeholder={t('Enter business phone')}
            />
            {errors.businessPhone && <ErrorMessage>{errors.businessPhone}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        {/* Restaurant Address */}
        <SectionTitle>{t('Restaurant Address')}</SectionTitle>
        <FormGroup>
          <Label htmlFor="restaurantAddress">
            {t('Restaurant Address')} <Required>*</Required>
          </Label>
          <Input
            id="restaurantAddress"
            name="restaurantAddress"
            type="text"
            value={formData.restaurantAddress}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            hasError={!!errors.restaurantAddress}
            placeholder={t('Enter restaurant address')}
          />
          {errors.restaurantAddress && <ErrorMessage>{errors.restaurantAddress}</ErrorMessage>}
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label htmlFor="city">
              {t('City')} <Required>*</Required>
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.city}
              placeholder={t('Enter city')}
            />
            {errors.city && <ErrorMessage>{errors.city}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="province">
              {t('Province')} <Required>*</Required>
            </Label>
            <Select
              id="province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              disabled={isReadOnly}
              hasError={!!errors.province}
            >
              <option value="">{t('Select province')}</option>
              <option value="AB">Alberta</option>
              <option value="BC">British Columbia</option>
              <option value="MB">Manitoba</option>
              <option value="NB">New Brunswick</option>
              <option value="NL">Newfoundland and Labrador</option>
              <option value="NS">Nova Scotia</option>
              <option value="NT">Northwest Territories</option>
              <option value="NU">Nunavut</option>
              <option value="ON">Ontario</option>
              <option value="PE">Prince Edward Island</option>
              <option value="QC">Quebec</option>
              <option value="SK">Saskatchewan</option>
              <option value="YT">Yukon</option>
            </Select>
            {errors.province && <ErrorMessage>{errors.province}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="postalCode">
            {t('Postal Code')} <Required>*</Required>
          </Label>
          <Input
            id="postalCode"
            name="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            hasError={!!errors.postalCode}
            placeholder={t('Enter postal code')}
          />
          {errors.postalCode && <ErrorMessage>{errors.postalCode}</ErrorMessage>}
        </FormGroup>

        {/* Owner Information */}
        <SectionTitle>{t('Owner Information')}</SectionTitle>
        <FormRow>
          <FormGroup>
            <Label htmlFor="phone">
              {t('Owner Phone')} <Required>*</Required>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.phone}
              placeholder={t('Enter owner phone')}
            />
            {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="identificationType">
              {t('Identification Type')} <Required>*</Required>
            </Label>
            <Select
              id="identificationType"
              name="identificationType"
              value={formData.identificationType}
              onChange={handleInputChange}
              disabled={isReadOnly}
              hasError={!!errors.identificationType}
            >
              <option value="">{t('Select identification type')}</option>
              <option value="licence">Driver's Licence</option>
              <option value="pr_card">PR Card</option>
              <option value="passport">Passport</option>
              <option value="medical_card">Medical Card</option>
              <option value="provincial_id">Provincial ID</option>
            </Select>
            {errors.identificationType && <ErrorMessage>{errors.identificationType}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="ownerAddress">
            {t('Owner Address')} <Required>*</Required>
          </Label>
          <TextArea
            id="ownerAddress"
            name="ownerAddress"
            value={formData.ownerAddress}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            hasError={!!errors.ownerAddress}
            placeholder={t('Enter owner address')}
            rows={3}
          />
          {errors.ownerAddress && <ErrorMessage>{errors.ownerAddress}</ErrorMessage>}
        </FormGroup>

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
