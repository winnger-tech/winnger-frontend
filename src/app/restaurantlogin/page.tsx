"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../component/Navbar';
import { useTranslation } from '../../utils/i18n';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginRestaurant, clearError } from '../../store/slices/authSlice';
import { useToast } from '../../context/ToastContext';
import Link from 'next/link';

export default function RestaurantLoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [registrationStage, setRegistrationStage] = useState<number | null>(null);
  const totalStages = 4;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      showSuccess('Login successful! Redirecting...');
      
      // Redirect after short delay to show the success toast
      setTimeout(() => {
        // Always redirect to restaurant dashboard staged
          router.push('/restaurant-dashboard-staged');
      }, 1500);
    }
  }, [isAuthenticated, user, router, showSuccess]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  // Clear Redux error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginRestaurant(formData));
      
      if (loginRestaurant.fulfilled.match(result)) {
        // Success - navigation will be handled by useEffect
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <>
      <Navbar />
      <Container>
        <ContentWrapper>
          <FormSection
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FormHeader>
              <Title>{t('restaurantLogin.title')}</Title>
              <Subtitle>{t('restaurantLogin.subtitle')}</Subtitle>
              {registrationStage && (
                <div className="mb-2 text-sm text-gray-700">
                  {(t as any)('restaurantLogin.stage', { current: registrationStage, total: totalStages })}
                </div>
              )}
            </FormHeader>

            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label>
                  {t('restaurantLogin.form.email')} <Required>*</Required>
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  $hasError={!!validationErrors.email}
                  placeholder={t('restaurantLogin.form.emailPlaceholder')}
                />
                {validationErrors.email && <ErrorText>{validationErrors.email}</ErrorText>}
              </InputGroup>

              <InputGroup>
                <Label>
                  {t('restaurantLogin.form.password')} <Required>*</Required>
                </Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  $hasError={!!validationErrors.password}
                  placeholder={t('restaurantLogin.form.passwordPlaceholder')}
                />
                {validationErrors.password && <ErrorText>{validationErrors.password}</ErrorText>}
              </InputGroup>

              <ForgotPassword href="/forgot-password">
                {t('restaurantLogin.form.forgotPassword')}
              </ForgotPassword>

              <SubmitButton type="submit" disabled={isLoading} $loading={isLoading}>
                {isLoading
                  ? t('restaurantLogin.form.submittingButton')
                  : t('restaurantLogin.form.submitButton')}
              </SubmitButton>
            </Form>

            <SignupPrompt>
              {t('restaurantLogin.form.signupPrompt')}{' '}
              <SignupLink href="/resturantsignup">{t('restaurantLogin.form.signupLink')}</SignupLink>
            </SignupPrompt>
          </FormSection>

          <InfoSection
            as={motion.div}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <InfoCard>
              <InfoTitle>{t('restaurantLogin.portal.title')}</InfoTitle>
              <BenefitsList>
                <BenefitItem>
                  <BenefitIcon>📊</BenefitIcon>
                  <BenefitText>{t('restaurantLogin.portal.analytics')}</BenefitText>
                </BenefitItem>
                <BenefitItem>
                  <BenefitIcon>🍽️</BenefitIcon>
                  <BenefitText>{t('restaurantLogin.portal.menu')}</BenefitText>
                </BenefitItem>
                <BenefitItem>
                  <BenefitIcon>🚀</BenefitIcon>
                  <BenefitText>{t('restaurantLogin.portal.orders')}</BenefitText>
                </BenefitItem>
                <BenefitItem>
                  <BenefitIcon>💰</BenefitIcon>
                  <BenefitText>{t('restaurantLogin.portal.earnings')}</BenefitText>
                </BenefitItem>
              </BenefitsList>
            </InfoCard>
          </InfoSection>
        </ContentWrapper>
      </Container>
    </>
  );
}

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #403E2D 0%, #2d2b1f 100%);
  padding-top: 120px;
  font-family: 'Space Grotesk', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1rem;
  }
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #403E2D;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #403E2D;
  margin-bottom: 0.5rem;
`;

const Required = styled.span`
  color: #e74c3c;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e1e1'};
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
  background: white;
  color: #111;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#ffc32b'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255, 195, 43, 0.1)'};
  }

  &::placeholder {
    color: #999;
  }
`;

const ErrorText = styled.span`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const ForgotPassword = styled(Link)`
  color: #ffc32b;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  align-self: flex-end;
  margin-top: -0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Space Grotesk', sans-serif;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 1rem;
  opacity: ${props => props.$loading ? 0.7 : 1};

  &:hover {
    transform: ${props => props.$loading ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.$loading ? 'none' : '0 10px 25px rgba(255, 195, 43, 0.3)'};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const SignupPrompt = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: #666;
`;

const SignupLink = styled(Link)`
  color: #ffc32b;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const InfoTitle = styled.h2`
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
`;

const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BenefitIcon = styled.div`
  font-size: 1.5rem;
  min-width: 40px;
`;

const BenefitText = styled.span`
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
`;