"use client";

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from '../../../utils/i18n';
import Navbar from '../../component/Navbar';

const SuccessContainer = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
`;

const SuccessCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const IconWrapper = styled(motion.div)`
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #fff;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const InfoText = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const Button = styled.button`
  background: #fff;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 2rem;

  &:hover {
    transform: translateY(-2px);
  }
`;

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const iconAnimation = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1, 
    transition: { 
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.2
    }
  }
};

export default function RestaurantRegistrationSuccess() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <SuccessContainer
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <SuccessCard variants={fadeIn}>
          <IconWrapper variants={iconAnimation}>
            <CheckCircle size={80} color="#4ade80" />
          </IconWrapper>
          
          <Title>
            {t('registration.restaurant.success.title') || 'Registration Successful!'}
          </Title>
          
          <Subtitle>
            {t('registration.restaurant.success.subtitle') || 'Welcome to our restaurant partner network!'}
          </Subtitle>
          
          <InfoText>
            {t('registration.restaurant.success.processing') || 
             'Your registration has been submitted successfully. Our team will review your application and get back to you within 24-48 hours.'}
          </InfoText>
          
          <InfoText>
            {t('registration.restaurant.success.confirmation') || 
             'You will receive a confirmation email shortly with your registration details and next steps.'}
          </InfoText>
          
          <InfoText>
            {t('registration.restaurant.success.questions') || 
             'If you have any questions, please don\'t hesitate to contact our support team.'}
          </InfoText>
          
          <Button onClick={() => window.location.href = '/'}>
            {t('registration.restaurant.success.backToHome') || 'Back to Home'}
          </Button>
        </SuccessCard>
      </SuccessContainer>
    </>
  );
} 