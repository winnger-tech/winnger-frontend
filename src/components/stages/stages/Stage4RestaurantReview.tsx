'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheck, FaCreditCard, FaShieldAlt, FaRocket } from 'react-icons/fa';
import { useTranslation } from '../../../utils/i18n';
import { useDashboard } from '../../../context/DashboardContext';

interface Stage4RestaurantReviewProps {
  data: any;
  onChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}

interface FormData {
  agreedToTerms: boolean;
  confirmationChecked: boolean;
  additionalNotes: string;
}

const plans = [
  {
    id: 'basic',
    title: 'Restaurant Basic',
    price: '$45',
    description: 'One-time registration fee',
    features: [
      'Restaurant listing on Winnger platform',
      'Basic order management system',
      'Customer support',
      'Payment processing setup',
      'Background verification included',
      '24-48 hour approval process'
    ],
    popular: false
  },
  {
    id: 'premium',
    title: 'Restaurant Premium',
    price: '$75',
    description: 'Enhanced features package',
    features: [
      'Everything in Basic plan',
      'Priority listing placement',
      'Advanced analytics dashboard',
      'Marketing tools access',
      'Dedicated account manager',
      'Faster approval (12-24 hours)',
      'Custom branding options'
    ],
    popular: true
  }
];

export default function Stage4RestaurantReview({ 
  data, 
  onChange, 
  onSave, 
  isReadOnly = false 
}: Stage4RestaurantReviewProps) {
  const { t } = useTranslation();
  const { state } = useDashboard();
  
  const [formData, setFormData] = useState<FormData>({
    agreedToTerms: data?.agreedToTerms || false,
    confirmationChecked: data?.confirmationChecked || false,
    additionalNotes: data?.additionalNotes || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        agreedToTerms: data.agreedToTerms || false,
        confirmationChecked: data.confirmationChecked || false,
        additionalNotes: data.additionalNotes || '',
      });
    }
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    const newFormData = { 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    };
    setFormData(newFormData);
    
    // Clear errors when user makes changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    onChange(newFormData);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms and conditions';
    }
    
    if (!formData.confirmationChecked) {
      newErrors.confirmationChecked = 'You must confirm that all information is correct';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Hardcode the required data as specified
      const saveData = {
        agreedToTerms: true,
        confirmationChecked: true,
        additionalNotes: formData.additionalNotes || "Optional additional notes about the registration"
      };
      
      await onSave(saveData);
    } catch (error) {
      console.error('Failed to save stage 4 data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    return formData.agreedToTerms && formData.confirmationChecked;
  };

  return (
    <StageContainer>
      <StageHeader>
        <StageTitle>Review & Confirmation</StageTitle>
        <StageDescription>
          Review your information and confirm your registration details
        </StageDescription>
      </StageHeader>

      <PlansSection>
        <SectionTitle>Registration Plans</SectionTitle>
        <PlansContainer>
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              $selected={plan.id === 'basic'}
              $popular={plan.popular}
              $readOnly={isReadOnly}
              as={motion.div}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {plan.popular && <PopularBadge>Most Popular</PopularBadge>}
              
              <PlanHeader>
                <PlanTitle>{plan.title}</PlanTitle>
                <PlanPrice>{plan.price}</PlanPrice>
                <PlanDescription>{plan.description}</PlanDescription>
              </PlanHeader>

              <PlanFeatures>
                {plan.features.map((feature, i) => (
                  <Feature key={i}>
                    <FeatureIcon>
                      <FaCheck />
                    </FeatureIcon>
                    <FeatureText>{feature}</FeatureText>
                  </Feature>
                ))}
              </PlanFeatures>

              <SelectButton $selected={plan.id === 'basic'}>
                {plan.id === 'basic' ? 'Selected' : 'Select Plan'}
              </SelectButton>
            </PlanCard>
          ))}
        </PlansContainer>
      </PlansSection>

      <ConfirmationSection>
        <SectionTitle>Confirmation</SectionTitle>
        
        <ConfirmationItem>
          <CheckboxContainer>
            <input
              type="checkbox"
              id="agreedToTerms"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleInputChange}
              disabled={isReadOnly}
            />
            <CheckboxLabel htmlFor="agreedToTerms">
              I agree to the <TermsLink href="/terms" target="_blank">Terms and Conditions</TermsLink>
            </CheckboxLabel>
          </CheckboxContainer>
          {errors.agreedToTerms && <ErrorMessage>{errors.agreedToTerms}</ErrorMessage>}
        </ConfirmationItem>

        <ConfirmationItem>
          <CheckboxContainer>
            <input
              type="checkbox"
              id="confirmationChecked"
              name="confirmationChecked"
              checked={formData.confirmationChecked}
              onChange={handleInputChange}
              disabled={isReadOnly}
            />
            <CheckboxLabel htmlFor="confirmationChecked">
              I confirm that all the information provided is accurate and complete
            </CheckboxLabel>
          </CheckboxContainer>
          {errors.confirmationChecked && <ErrorMessage>{errors.confirmationChecked}</ErrorMessage>}
        </ConfirmationItem>

        <FormGroup>
          <Label htmlFor="additionalNotes">
            Additional Notes (Optional)
          </Label>
          <TextArea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            placeholder="Any additional notes about your registration..."
            rows={3}
          />
        </FormGroup>
      </ConfirmationSection>

      {!isReadOnly && (
        <SaveButtonContainer>
          <SaveButton
            type="button"
            onClick={handleSave}
            disabled={state.loading || !isFormValid() || isProcessing}
          >
            {isProcessing ? 'Processing...' : state.loading ? t('Saving...') : 'Proceed to Payment'}
          </SaveButton>
        </SaveButtonContainer>
      )}

      {isReadOnly && (
        <ReadOnlyNote>
          <InfoIcon>ℹ️</InfoIcon>
          {t('This information was provided during signup and cannot be edited at this stage.')}
        </ReadOnlyNote>
      )}
    </StageContainer>
  );
}

const StageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const StageHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const StageTitle = styled.h2`
  font-size: 2rem;
  color: #403E2D;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const StageDescription = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
`;

const PlansSection = styled.div`
  margin-bottom: 2rem;
`;

const ConfirmationSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: #403E2D;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #ffc32b;
  padding-bottom: 0.5rem;
`;

const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.div<{ $selected?: boolean; $popular?: boolean; $readOnly?: boolean }>`
  background: ${props => props.$selected ? '#f0fdf4' : '#ffffff'};
  border: 2px solid ${props => {
    if (props.$selected) return '#10b981';
    if (props.$popular) return '#ffc32b';
    return '#e5e7eb';
  }};
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  cursor: ${props => props.$readOnly ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.$readOnly ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.$readOnly ? 'none' : '0 8px 25px rgba(0, 0, 0, 0.1)'};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -10px;
  right: 20px;
  background: #ffc32b;
  color: #403E2D;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

const PlanTitle = styled.h4`
  font-size: 1.25rem;
  color: #403E2D;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const PlanPrice = styled.div`
  font-size: 1.5rem;
  color: #10b981;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const PlanDescription = styled.p`
  color: #666;
  font-size: 0.875rem;
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #403E2D;
  font-size: 0.875rem;
`;

const FeatureIcon = styled.div`
  color: #10b981;
  font-size: 0.75rem;
`;

const FeatureText = styled.span`
  flex: 1;
`;

const SelectButton = styled.div<{ $selected?: boolean }>`
  text-align: center;
  padding: 0.75rem;
  background: ${props => props.$selected ? '#10b981' : '#f3f4f6'};
  color: ${props => props.$selected ? '#ffffff' : '#403E2D'};
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
`;

const ConfirmationItem = styled.div`
  margin-bottom: 1rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #403E2D;
  line-height: 1.4;
  cursor: pointer;
`;

const TermsLink = styled.a`
  color: #3b82f6;
  text-decoration: underline;
  
  &:hover {
    color: #2563eb;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  color: #403E2D;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const TextArea = styled.textarea<{ readOnly?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: ${props => props.readOnly ? '#f5f5f5' : '#fff'};
  color: #403E2D;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffc32b;
    box-shadow: 0 0 0 3px rgba(255, 195, 43, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
  margin-left: 1.5rem;
`;

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 195, 43, 0.3);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ReadOnlyNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
`;

const InfoIcon = styled.span`
  font-size: 1rem;
`; 