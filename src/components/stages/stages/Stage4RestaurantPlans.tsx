'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheck, FaCreditCard, FaShieldAlt, FaRocket } from 'react-icons/fa';
import { useTranslation } from '../../../utils/i18n';
import { useDashboard } from '../../../context/DashboardContext';

interface Stage4RestaurantPlansProps {
  data: any;
  onChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}

interface FormData {
  selectedPlan: string;
  agreedToTerms: boolean;
  paymentCompleted: boolean;
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

export default function Stage4RestaurantPlans({ 
  data, 
  onChange, 
  onSave, 
  isReadOnly = false 
}: Stage4RestaurantPlansProps) {
  const { t } = useTranslation();
  const { state } = useDashboard();
  
  const [formData, setFormData] = useState<FormData>({
    selectedPlan: data?.selectedPlan || 'basic',
    agreedToTerms: data?.agreedToTerms || false,
    paymentCompleted: data?.paymentCompleted || false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlanSelect = (planId: string) => {
    if (isReadOnly) return;
    
    const newFormData = { ...formData, selectedPlan: planId };
    setFormData(newFormData);
    onChange(newFormData);
    
    // Clear errors when plan is selected
    if (errors.selectedPlan) {
      setErrors(prev => ({ ...prev, selectedPlan: '' }));
    }
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    
    const newFormData = { ...formData, agreedToTerms: e.target.checked };
    setFormData(newFormData);
    onChange(newFormData);
    
    // Clear errors when terms are agreed to
    if (errors.agreedToTerms) {
      setErrors(prev => ({ ...prev, agreedToTerms: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.selectedPlan) {
      newErrors.selectedPlan = 'Please select a plan';
    }
    
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Here you would integrate with your payment processor (Stripe, etc.)
      // For now, we'll simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newFormData = { ...formData, paymentCompleted: true };
      setFormData(newFormData);
      onChange(newFormData);
      
      // Save the data
      await onSave(newFormData);
      
    } catch (error) {
      console.error('Payment failed:', error);
      setErrors(prev => ({ ...prev, payment: 'Payment failed. Please try again.' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedPlan = () => {
    return plans.find(plan => plan.id === formData.selectedPlan) || plans[0];
  };

  return (
    <StageContainer>
      <StageHeader>
        <StageTitle>Choose Your Plan</StageTitle>
        <StageDescription>
          Select the plan that best fits your restaurant's needs and complete your registration
        </StageDescription>
      </StageHeader>

      <PlansContainer>
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            $selected={formData.selectedPlan === plan.id}
            $popular={plan.popular}
            $readOnly={isReadOnly}
            onClick={() => handlePlanSelect(plan.id)}
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

            <SelectButton $selected={formData.selectedPlan === plan.id}>
              {formData.selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </SelectButton>
          </PlanCard>
        ))}
      </PlansContainer>

      {errors.selectedPlan && <ErrorMessage>{errors.selectedPlan}</ErrorMessage>}

      <TermsSection>
        <TermsCheckbox>
          <input
            type="checkbox"
            id="terms"
            checked={formData.agreedToTerms}
            onChange={handleTermsChange}
            disabled={isReadOnly}
          />
          <label htmlFor="terms">
            I agree to the{' '}
            <TermsLink href="/terms" target="_blank">
              Terms of Service
            </TermsLink>{' '}
            and{' '}
            <TermsLink href="/privacy" target="_blank">
              Privacy Policy
            </TermsLink>
          </label>
        </TermsCheckbox>
        {errors.agreedToTerms && <ErrorMessage>{errors.agreedToTerms}</ErrorMessage>}
      </TermsSection>

      <PaymentSection>
        <PaymentSummary>
          <PaymentTitle>Payment Summary</PaymentTitle>
          <PaymentDetails>
            <PaymentItem>
              <span>Selected Plan:</span>
              <span>{getSelectedPlan().title}</span>
            </PaymentItem>
            <PaymentItem>
              <span>Registration Fee:</span>
              <span>{getSelectedPlan().price}</span>
            </PaymentItem>
            <PaymentTotal>
              <span>Total:</span>
              <span>{getSelectedPlan().price}</span>
            </PaymentTotal>
          </PaymentDetails>
        </PaymentSummary>

        {!isReadOnly && (
          <PaymentButton
            onClick={handlePayment}
            disabled={isProcessing || !formData.agreedToTerms || !formData.selectedPlan}
            $processing={isProcessing}
          >
            {isProcessing ? (
              <>
                <ProcessingSpinner />
                Processing Payment...
              </>
            ) : (
              <>
                <FaCreditCard />
                Pay {getSelectedPlan().price} & Complete Registration
              </>
            )}
          </PaymentButton>
        )}

        {errors.payment && <ErrorMessage>{errors.payment}</ErrorMessage>}
      </PaymentSection>

      {formData.paymentCompleted && (
        <SuccessMessage>
          <SuccessIcon>✅</SuccessIcon>
          <div>
            <SuccessTitle>Payment Successful!</SuccessTitle>
            <SuccessText>Your restaurant registration is now complete. You'll receive an email confirmation shortly.</SuccessText>
          </div>
        </SuccessMessage>
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
  margin-bottom: 3rem;
`;

const StageTitle = styled.h2`
  font-size: 2.5rem;
  color: #403E2D;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const StageDescription = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.5;
`;

const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.div<{ $selected: boolean; $popular: boolean; $readOnly: boolean }>`
  position: relative;
  background: ${props => props.$selected ? 'linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%)' : '#fff'};
  border: 3px solid ${props => {
    if (props.$selected) return '#e6a800';
    if (props.$popular) return '#ffc32b';
    return '#e0e0e0';
  }};
  border-radius: 20px;
  padding: 2rem;
  cursor: ${props => props.$readOnly ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$selected ? '0 10px 30px rgba(255, 195, 43, 0.3)' : '0 5px 15px rgba(0, 0, 0, 0.1)'};

  &:hover {
    transform: ${props => props.$readOnly ? 'none' : 'translateY(-5px)'};
    box-shadow: ${props => props.$readOnly ? '0 5px 15px rgba(0, 0, 0, 0.1)' : '0 15px 40px rgba(0, 0, 0, 0.15)'};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff6b6b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const PlanTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #403E2D;
  margin-bottom: 0.5rem;
`;

const PlanPrice = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #403E2D;
  margin-bottom: 0.5rem;
`;

const PlanDescription = styled.p`
  color: #666;
  font-size: 1rem;
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #403E2D;
`;

const FeatureIcon = styled.div`
  color: #4CAF50;
  font-size: 0.875rem;
`;

const FeatureText = styled.span`
  font-size: 0.95rem;
`;

const SelectButton = styled.div<{ $selected: boolean }>`
  text-align: center;
  padding: 1rem;
  background: ${props => props.$selected ? '#403E2D' : '#f5f5f5'};
  color: ${props => props.$selected ? 'white' : '#666'};
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
`;

const TermsSection = styled.div`
  margin-bottom: 2rem;
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }

  label {
    color: #403E2D;
    font-size: 0.95rem;
  }
`;

const TermsLink = styled.a`
  color: #ffc32b;
  text-decoration: underline;
  
  &:hover {
    color: #e6a800;
  }
`;

const PaymentSection = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const PaymentSummary = styled.div`
  margin-bottom: 2rem;
`;

const PaymentTitle = styled.h3`
  font-size: 1.25rem;
  color: #403E2D;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const PaymentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PaymentItem = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 1rem;
`;

const PaymentTotal = styled.div`
  display: flex;
  justify-content: space-between;
  color: #403E2D;
  font-size: 1.25rem;
  font-weight: 700;
  border-top: 2px solid #e0e0e0;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
`;

const PaymentButton = styled.button<{ $processing: boolean }>`
  width: 100%;
  background: ${props => props.$processing ? '#ccc' : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'};
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.$processing ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
  }

  &:disabled {
    transform: none;
    box-shadow: none;
  }
`;

const ProcessingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SuccessIcon = styled.div`
  font-size: 2rem;
`;

const SuccessTitle = styled.h3`
  color: #155724;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const SuccessText = styled.p`
  color: #155724;
  font-size: 1rem;
  margin: 0;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
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