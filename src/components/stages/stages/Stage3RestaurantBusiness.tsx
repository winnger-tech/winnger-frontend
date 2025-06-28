"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../utils/i18n';
import { useDashboard } from '../../../context/DashboardContext';

interface Stage3RestaurantBusinessProps {
  data: any;
  onChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}

export default function Stage3RestaurantBusiness({ 
  data, 
  onChange, 
  onSave, 
  isReadOnly = false 
}: Stage3RestaurantBusinessProps) {
  const { t } = useTranslation();
  const { state } = useDashboard();
  
  const [formData, setFormData] = useState({
    bankName: data?.bankingInfo?.bankName || '',
    accountNumber: data?.bankingInfo?.accountNumber || '',
    transitNumber: data?.bankingInfo?.transitNumber || '',
    institutionNumber: data?.bankingInfo?.institutionNumber || '',
    HSTNumber: data?.HSTNumber || '',
    ...data
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    setFormData({
      bankName: data?.bankingInfo?.bankName || '',
      accountNumber: data?.bankingInfo?.accountNumber || '',
      transitNumber: data?.bankingInfo?.transitNumber || '',
      institutionNumber: data?.bankingInfo?.institutionNumber || '',
      HSTNumber: data?.HSTNumber || '',
      ...data
    });
  }, [data]);

  // Real-time validation function
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'bankName':
        if (!value?.trim()) {
          return t('Bank name is required');
        }
        return '';
      
      case 'accountNumber':
        if (!value?.trim()) {
          return t('Account number is required');
        } else if (!/^\d{7,12}$/.test(value.replace(/\s/g, ''))) {
          return t('Please enter a valid account number (7-12 digits)');
        }
        return '';
      
      case 'transitNumber':
        if (!value?.trim()) {
          return t('Transit number is required');
        } else if (!/^\d{5}$/.test(value.replace(/\s/g, ''))) {
          return t('Transit number must be 5 digits');
        }
        return '';
      
      case 'institutionNumber':
        if (!value?.trim()) {
          return t('Institution number is required');
        } else if (!/^\d{3}$/.test(value.replace(/\s/g, ''))) {
          return t('Institution number must be 3 digits');
        }
        return '';
      
      case 'HSTNumber':
        if (!value?.trim()) {
          return t('HST number is required');
        } else if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(value.replace(/\s/g, ''))) {
          return t('Please enter a valid HST number (format: XX123456789XX)');
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    // Update the bankingInfo object structure for API
    if (['bankName', 'accountNumber', 'transitNumber', 'institutionNumber'].includes(name)) {
      const bankingInfo = {
        bankName: name === 'bankName' ? value : formData.bankName,
        accountNumber: name === 'accountNumber' ? value : formData.accountNumber,
        transitNumber: name === 'transitNumber' ? value : formData.transitNumber,
        institutionNumber: name === 'institutionNumber' ? value : formData.institutionNumber,
      };
      onChange({ ...newData, bankingInfo });
    } else {
      onChange(newData);
    }
    
    // Real-time validation
    const fieldError = validateField(name, value);
    setErrors((prev: any) => ({ 
      ...prev, 
      [name]: fieldError 
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    // Validate all required fields
    const requiredFields = ['bankName', 'accountNumber', 'transitNumber', 'institutionNumber', 'HSTNumber'];
    
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
      // Prepare data in the exact format expected by the backend
      const apiData = {
        bankingInfo: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          transitNumber: formData.transitNumber,
          institutionNumber: formData.institutionNumber,
        },
        HSTNumber: formData.HSTNumber
      };
      
      console.log('Sending Step 2 payload:', apiData);
      await onSave(apiData);
    }
  };

  return (
    <StageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StageHeader>
        <StageTitle>{t('Banking & Tax Information')}</StageTitle>
        <StageDescription>
          {t('Provide your banking information and HST number')}
        </StageDescription>
      </StageHeader>

      <Form>
        <FormSection>
          <SectionTitle>Banking Information</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="bankName">
              {t('Bank Name')} <Required>*</Required>
            </Label>
            <Input
              id="bankName"
              name="bankName"
              type="text"
              value={formData.bankName}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.bankName}
              placeholder={t('Enter bank name')}
            />
            {errors.bankName && <ErrorMessage>{errors.bankName}</ErrorMessage>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="accountNumber">
                {t('Account Number')} <Required>*</Required>
              </Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                type="text"
                value={formData.accountNumber}
                onChange={handleInputChange}
                readOnly={isReadOnly}
                hasError={!!errors.accountNumber}
                placeholder={t('Enter account number (7-12 digits)')}
              />
              {errors.accountNumber && <ErrorMessage>{errors.accountNumber}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="transitNumber">
                {t('Transit Number')} <Required>*</Required>
              </Label>
              <Input
                id="transitNumber"
                name="transitNumber"
                type="text"
                value={formData.transitNumber}
                onChange={handleInputChange}
                readOnly={isReadOnly}
                hasError={!!errors.transitNumber}
                placeholder={t('Enter transit number (5 digits)')}
              />
              {errors.transitNumber && <ErrorMessage>{errors.transitNumber}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="institutionNumber">
              {t('Institution Number')} <Required>*</Required>
            </Label>
            <Input
              id="institutionNumber"
              name="institutionNumber"
              type="text"
              value={formData.institutionNumber}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.institutionNumber}
              placeholder={t('Enter institution number (3 digits)')}
            />
            {errors.institutionNumber && <ErrorMessage>{errors.institutionNumber}</ErrorMessage>}
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>Tax Information</SectionTitle>
          
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
              placeholder={t('Enter HST number (format: XX123456789XX)')}
            />
            {errors.HSTNumber && <ErrorMessage>{errors.HSTNumber}</ErrorMessage>}
            <HelpText>
              {t('HST number format: 2 letters + 9 digits + 2 letters (e.g., ON123456789ON)')}
            </HelpText>
          </FormGroup>
        </FormSection>

        <InfoSection>
          <InfoTitle>Important Information</InfoTitle>
          <InfoList>
            <InfoItem>
              • {t('All banking information is encrypted and secure')}
            </InfoItem>
            <InfoItem>
              • {t('Your HST number is required for tax reporting purposes')}
            </InfoItem>
            <InfoItem>
              • {t('Please ensure all information is accurate before proceeding')}
            </InfoItem>
          </InfoList>
        </InfoSection>
      </Form>
    </StageContainer>
  );
}

const StageContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StageHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const StageTitle = styled.h2`
  color: white;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const StageDescription = styled.p`
  color: #e0e0e0;
  font-size: 1rem;
  line-height: 1.5;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #ff6b00;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 107, 0, 0.3);
  padding-bottom: 0.5rem;
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
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Required = styled.span`
  color: #ff6b00;
`;

const Input = styled.input<{ hasError?: boolean; readOnly?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#ff6b00' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  opacity: ${props => props.readOnly ? 0.6 : 1};
  cursor: ${props => props.readOnly ? 'not-allowed' : 'text'};

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #ff6b00;
    background: rgba(255, 255, 255, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #ff6b00;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const HelpText = styled.p`
  color: #e0e0e0;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-style: italic;
`;

const InfoSection = styled.div`
  background: rgba(255, 107, 0, 0.1);
  border: 1px solid rgba(255, 107, 0, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const InfoTitle = styled.h4`
  color: #ff6b00;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoItem = styled.li`
  color: #e0e0e0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`; 