"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../utils/i18n';
import { useDashboard } from '../../../context/DashboardContext';

interface Stage2RestaurantLocationProps {
  data: any;
  onChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}

export default function Stage2RestaurantLocation({ 
  data, 
  onChange, 
  onSave, 
  isReadOnly = false 
}: Stage2RestaurantLocationProps) {
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
      case 'phone':
        if (!value?.trim()) {
          return t('Phone number is required');
        } else if (!/^\+?1?\d{10,14}$/.test(value.replace(/[\s-()]/g, ''))) {
          return t('Please enter a valid phone number');
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
      
      case 'businessType':
        if (!value?.trim()) {
          return t('Business type is required');
        }
        return '';
      
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
        } else if (!/^\+?1?\d{10,14}$/.test(value.replace(/[\s-()]/g, ''))) {
          return t('Please enter a valid phone number');
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
        } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value)) {
          return t('Please enter a valid Canadian postal code');
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    onChange(newData);
    
    // Real-time validation
    const fieldError = validateField(name, value);
    setErrors((prev: any) => ({ 
      ...prev, 
      [name]: fieldError 
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    // Validate all required fields exactly as expected by the backend
    const requiredFields = [
      'phone', 'identificationType', 'ownerAddress', 'businessType',
      'restaurantName', 'businessEmail', 'businessPhone', 'restaurantAddress',
      'city', 'province', 'postalCode'
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
      // Prepare data in the exact format expected by the backend
      const apiData = {
        phone: formData.phone,
        identificationType: formData.identificationType,
        ownerAddress: formData.ownerAddress,
        businessType: formData.businessType,
        restaurantName: formData.restaurantName,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        restaurantAddress: formData.restaurantAddress,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode
      };
      
      console.log('Sending Step 1 payload:', apiData);
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
        <StageTitle>{t('Owner & Business Information')}</StageTitle>
        <StageDescription>
          {t('Complete your basic owner and business information')}
        </StageDescription>
      </StageHeader>

      <Form>
        <FormSection>
          <SectionTitle>Review Your Restaurant Information</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>{t('Restaurant Name')}</Label>
              <ReadOnlyField>{formData.restaurantName}</ReadOnlyField>
            </FormGroup>
            <FormGroup>
              <Label>{t('Owner/Manager Name')}</Label>
              <ReadOnlyField>{formData.ownerName}</ReadOnlyField>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>{t('Identification Type')}</Label>
              <ReadOnlyField>{formData.identificationType}</ReadOnlyField>
            </FormGroup>
            <FormGroup>
              <Label>{t('Owner Address')}</Label>
              <ReadOnlyField>{formData.ownerAddress}</ReadOnlyField>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>{t('Business Type')}</Label>
              <ReadOnlyField>{formData.businessType}</ReadOnlyField>
            </FormGroup>
            <FormGroup>
              <Label>{t('Business Email')}</Label>
              <ReadOnlyField>{formData.businessEmail}</ReadOnlyField>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>{t('Restaurant Address')}</Label>
              <ReadOnlyField>{formData.restaurantAddress}</ReadOnlyField>
            </FormGroup>
            <FormGroup>
              <Label>{t('City')}</Label>
              <ReadOnlyField>{formData.city}</ReadOnlyField>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>{t('Province')}</Label>
              <ReadOnlyField>{formData.province}</ReadOnlyField>
            </FormGroup>
            <FormGroup>
              <Label>{t('Postal Code')}</Label>
              <ReadOnlyField>{formData.postalCode}</ReadOnlyField>
            </FormGroup>
          </FormRow>
        </FormSection>
        <ButtonWrapper>
          <ContinueButton type="button" onClick={() => onSave(formData)}>
            {t('Continue')}
          </ContinueButton>
        </ButtonWrapper>
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

const Select = styled.select<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#ff6b00' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff6b00;
    background: rgba(255, 255, 255, 0.15);
  }

  option {
    background: #403E2D;
    color: white;
  }
`;

const ErrorMessage = styled.span`
  color: #ff6b00;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const ReadOnlyField = styled.div`
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
  font-size: 1rem;
  min-height: 44px;
  display: flex;
  align-items: center;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const ContinueButton = styled.button`
  background-color: #ff6b00;
  color: white;
  padding: 14px 32px;
  border: none;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #e55a00;
  }
`; 