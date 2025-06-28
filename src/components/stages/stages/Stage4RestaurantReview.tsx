'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] },
  },
};

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

  const planKeys = ['lite', 'pro', 'proPlus'];

  const plans = planKeys.map((key) => ({
    title: t(`plans.${key}.title`),
    price: t(`plans.${key}.price`),
    description: t(`plans.${key}.description`),
    features: t(`plans.${key}.features`) as string[],
  }));

  return (
    <StageContainer>
      <StageHeader>
        <StageTitle>Choose Your Plan</StageTitle>
        <StageDescription>
          Select the plan that best fits your restaurant's needs and complete your registration
        </StageDescription>
      </StageHeader>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemFadeUp}>
          <Heading>{t('plans.heading')}</Heading>
        </motion.div>
        <motion.div variants={itemFadeUp}>
          <Subheading>{t('plans.subheading')}</Subheading>
        </motion.div>

        <CardsWrapper>
          {plans.map((plan, index) => (
            <Card key={index} $highlight={index === 1} as={motion.div} variants={itemFadeUp}>
              <CardContent>
                <Title>{plan.title}</Title>
                <Price>{plan.price}</Price>
                <Description>{plan.description}</Description>
                <FeatureList>
                  {plan.features.map((feature, i) => (
                    <Feature key={i}>
                      <FaCheck className="icon" />
                      {feature}
                    </Feature>
                  ))}
                </FeatureList>
              </CardContent>
            </Card>
          ))}
        </CardsWrapper>
      </motion.div>

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

const Heading = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: #1f1f1f;
  margin-bottom: 12px;
`;

const Subheading = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 48px;
`;

const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
`;

const Card = styled.div<{ $highlight?: boolean }>`
  background: #d8a73e;
  border: 3px solid ${({ $highlight }) => ($highlight ? "#b98d2f" : "#e0bb5c")};
  box-shadow: ${({ $highlight }) =>
    $highlight
      ? "0 10px 25px rgba(0,0,0,0.2)"
      : "0 6px 16px rgba(0,0,0,0.1)"};
  border-radius: 20px;
  width: 340px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
  }
`;

const CardContent = styled.div`
  padding: 28px;
`;

const Title = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
`;

const Price = styled.p`
  font-size: 18px;
  color: #fefefe;
  margin: 8px 0 14px;
`;

const Description = styled.p`
  font-size: 15px;
  color: #ffffffd1;
  margin-bottom: 20px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffffee;
  font-size: 15px;
  margin-bottom: 10px;

  .icon {
    color: #ffffff;
    background: #3c3c3c;
    border-radius: 50%;
    padding: 3px;
    font-size: 12px;
  }
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