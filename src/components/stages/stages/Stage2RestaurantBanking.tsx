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

interface Stage2RestaurantBankingProps {
  data: any;
  onChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}

export default function Stage2RestaurantBanking({ 
  data, 
  onChange, 
  onSave, 
  isReadOnly = false 
}: Stage2RestaurantBankingProps) {
  const { t } = useTranslation();
  const { state } = useDashboard();
  
  // Create a safe initial state
  const createInitialState = (inputData: any) => {
    console.log('Stage2RestaurantBanking - Creating initial state with data:', inputData);
    
    // Always ensure bankingInfo has the correct structure
    const safeBankingInfo = {
      transitNumber: '',
      institutionNumber: '',
      accountNumber: ''
    };
    
    // If inputData has bankingInfo, merge it safely
    if (inputData && inputData.bankingInfo) {
      safeBankingInfo.transitNumber = inputData.bankingInfo.transitNumber || '';
      safeBankingInfo.institutionNumber = inputData.bankingInfo.institutionNumber || '';
      safeBankingInfo.accountNumber = inputData.bankingInfo.accountNumber || '';
    }
    
    return {
      bankingInfo: safeBankingInfo,
      HSTNumber: inputData?.HSTNumber || '',
      ...inputData
    };
  };
  
  const [formData, setFormData] = useState(createInitialState(data));
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    console.log('Stage2RestaurantBanking - useEffect triggered with data:', data);
    const newState = createInitialState(data);
    console.log('Stage2RestaurantBanking - New state created:', newState);
    setFormData(newState);
  }, [data]);

  // Validation function
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'transitNumber':
        if (!value?.trim()) {
          return t('Transit number is required');
        } else if (!/^\d{5}$/.test(value)) {
          return t('Transit number must be 5 digits');
        }
        return '';
      
      case 'institutionNumber':
        if (!value?.trim()) {
          return t('Institution number is required');
        } else if (!/^\d{3}$/.test(value)) {
          return t('Institution number must be 3 digits');
        }
        return '';
      
      case 'accountNumber':
        if (!value?.trim()) {
          return t('Account number is required');
        } else if (!/^\d{7,12}$/.test(value)) {
          return t('Account number must be 7-12 digits');
        }
        return '';
      
      case 'HSTNumber':
        if (!value?.trim()) {
          return t('HST number is required');
        } else if (!/^\d{9}RT\d{4}$/.test(value)) {
          return t('HST number must be in format: 123456789RT0001');
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bankingInfo.')) {
      const bankingField = name.split('.')[1];
      // Always ensure we have a valid bankingInfo object
      const currentBankingInfo = formData.bankingInfo || {
        transitNumber: '',
        institutionNumber: '',
        accountNumber: ''
      };
      
      const newBankingInfo = { 
        ...currentBankingInfo, 
        [bankingField]: value 
      };
      
      const newData = { 
        ...formData, 
        bankingInfo: newBankingInfo 
      };
      
      console.log('Stage2RestaurantBanking - Updating bankingInfo:', {
        field: bankingField,
        value,
        newBankingInfo,
        newData
      });
      
      setFormData(newData);
      // Don't call onChange here - only update local state
    } else {
      const newData = { ...formData, [name]: value };
      setFormData(newData);
      // Don't call onChange here - only update local state
    }
    
    // Clear error for this field when user starts typing
    const fieldName = name.includes('.') ? name.split('.')[1] : name;
    if (errors[fieldName]) {
      setErrors((prev: any) => ({ 
        ...prev, 
        [fieldName]: '' 
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    // Ensure bankingInfo exists before validation
    const bankingInfo = formData.bankingInfo || {
      transitNumber: '',
      institutionNumber: '',
      accountNumber: ''
    };
    
    // Validate banking info
    const transitError = validateField('transitNumber', bankingInfo.transitNumber);
    if (transitError) newErrors.transitNumber = transitError;
    
    const institutionError = validateField('institutionNumber', bankingInfo.institutionNumber);
    if (institutionError) newErrors.institutionNumber = institutionError;
    
    const accountError = validateField('accountNumber', bankingInfo.accountNumber);
    if (accountError) newErrors.accountNumber = accountError;
    
    // Validate HST number
    const hstError = validateField('HSTNumber', formData.HSTNumber);
    if (hstError) newErrors.HSTNumber = hstError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      // Call onChange to update parent component with final data
      onChange(formData);
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
        <StageTitle>{t('Banking Information')}</StageTitle>
        <StageDescription>
          {t('Provide your banking details and HST number for payment processing')}
        </StageDescription>
      </StageHeader>

      <Form>
        {/* Banking Information */}
        <SectionTitle>{t('Banking Details')}</SectionTitle>
        <FormRow>
          <FormGroup>
            <Label htmlFor="transitNumber">
              {t('Transit Number')} <Required>*</Required>
            </Label>
            <Input
              id="transitNumber"
              name="bankingInfo.transitNumber"
              type="text"
              value={(formData.bankingInfo && formData.bankingInfo.transitNumber) || ''}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.transitNumber}
              placeholder={t('Enter 5-digit transit number')}
              maxLength={5}
            />
            {errors.transitNumber && <ErrorMessage>{errors.transitNumber}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="institutionNumber">
              {t('Institution Number')} <Required>*</Required>
            </Label>
            <Input
              id="institutionNumber"
              name="bankingInfo.institutionNumber"
              type="text"
              value={(formData.bankingInfo && formData.bankingInfo.institutionNumber) || ''}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.institutionNumber}
              placeholder={t('Enter 3-digit institution number')}
              maxLength={3}
            />
            {errors.institutionNumber && <ErrorMessage>{errors.institutionNumber}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="accountNumber">
            {t('Account Number')} <Required>*</Required>
          </Label>
          <Input
            id="accountNumber"
            name="bankingInfo.accountNumber"
            type="text"
            value={(formData.bankingInfo && formData.bankingInfo.accountNumber) || ''}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            hasError={!!errors.accountNumber}
            placeholder={t('Enter 7-12 digit account number')}
            maxLength={12}
          />
          {errors.accountNumber && <ErrorMessage>{errors.accountNumber}</ErrorMessage>}
        </FormGroup>

        {/* HST Information */}
        <SectionTitle>{t('Tax Information')}</SectionTitle>
        <FormGroup>
          <Label htmlFor="HSTNumber">
            {t('HST Number')} <Required>*</Required>
          </Label>
          <Input
            id="HSTNumber"
            name="HSTNumber"
            type="text"
            value={formData.HSTNumber}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            hasError={!!errors.HSTNumber}
            placeholder={t('Enter HST number (e.g., 123456789RT0001)')}
            maxLength={15}
          />
          {errors.HSTNumber && <ErrorMessage>{errors.HSTNumber}</ErrorMessage>}
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