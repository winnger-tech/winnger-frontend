"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../component/Navbar';
import { useTranslation } from '../../utils/i18n';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerDriver, clearError } from '../../store/slices/authSlice';
import { Toast } from '../../components/Toast';
import Link from 'next/link';

export default function DriverSignupPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setShowSuccessToast(true);
      
      // Redirect after short delay to show the success toast
      setTimeout(() => {
        // After signup, direct user to stage 2 (personal details) since stage 1 (basic registration) is complete
        console.log('✅ Registration successful, redirecting to stage 2');
        router.push('/driver-registration-staged/stage/2');
      }, 1500);
    }
  }, [isAuthenticated, user, router]);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(registerDriver(formData));
      
      if (registerDriver.fulfilled.match(result)) {
        // Success - navigation will be handled by useEffect
        console.log('Registration successful');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <>
      <Navbar />
      <Toast 
        message="Registration successful! Redirecting..."
        type="success"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
      <Container>
        <ContentWrapper>
          <FormSection
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FormHeader>
              <Title>{t('driverSignup.title')}</Title>
              <Subtitle>{t('driverSignup.subtitle')}</Subtitle>
            </FormHeader>

            <Form onSubmit={handleSubmit}>
              <InputRow>
                <InputGroup>
                  <Label>
                    {t('driverSignup.form.firstName')}
                  </Label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t('driverSignup.form.firstNamePlaceholder')}
                  />
                </InputGroup>

                <InputGroup>
                  <Label>
                    {t('driverSignup.form.lastName')}
                  </Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('driverSignup.form.lastNamePlaceholder')}
                  />
                </InputGroup>
              </InputRow>

              <InputGroup>
                <Label>
                  {t('driverSignup.form.email')}
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('driverSignup.form.emailPlaceholder')}
                />
              </InputGroup>

              <InputGroup>
                <Label>
                  {t('driverSignup.form.password')}
                </Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('driverSignup.form.passwordPlaceholder')}
                />
              </InputGroup>

              <SubmitButton 
                type="submit" 
                disabled={isLoading}
                $loading={isLoading}
              >
                {isLoading ? t('driverSignup.form.submittingButton') : t('driverSignup.form.submitButton')}
              </SubmitButton>
            </Form>

            <LoginPrompt>
              {t('driverSignup.form.loginPrompt')}{' '}
  <LoginLink href="/driverlogin">{t('driverSignup.form.loginLink')}</LoginLink>
            </LoginPrompt>
          </FormSection>

          <InfoSection
            as={motion.div}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <InfoCard>
              <InfoTitle>{t('driverSignup.benefits.title')}</InfoTitle>
              <BenefitsList>
                <BenefitItem>
                  <BenefitIcon>💰</BenefitIcon>
                  <BenefitText>{t('driverSignup.benefits.earn')}</BenefitText>
                </BenefitItem>
                <BenefitItem>
                  <BenefitIcon>⚡</BenefitIcon>
                  <BenefitText>{t('driverSignup.benefits.instant')}</BenefitText>
                </BenefitItem>
                <BenefitItem>
                  <BenefitIcon>🚗</BenefitIcon>
                  <BenefitText>{t('driverSignup.benefits.vehicle')}</BenefitText>
                </BenefitItem>
                <BenefitItem>
                  <BenefitIcon>📱</BenefitIcon>
                  <BenefitText>{t('driverSignup.benefits.app')}</BenefitText>
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

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

const LoginPrompt = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: #666;
`;

const LoginLink = styled(Link)`
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
