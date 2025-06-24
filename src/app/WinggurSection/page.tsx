'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from '@/utils/i18n'; // adjust path if needed

const WhyWinggurSection = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });

  const features = [
    {
      image: '/icons/flexibility.png',
      title: t('whyWinggur.features.flexibility'),
    },
    {
      image: '/icons/instant-pay.png',
      title: t('whyWinggur.features.instantPay'),
    },
    {
      image: '/icons/community.png',
      title: t('whyWinggur.features.community'),
    },
    {
      image: '/icons/support.png',
      title: t('whyWinggur.features.support'),
    },
    {
      image: '/icons/tips.png',
      title: t('whyWinggur.features.tips'),
    },
    {
      image: '/icons/no-experience.png',
      title: t('whyWinggur.features.noExperience'),
    },
  ];

  return (
    <SectionWrapper>
      <Title>{t('whyWinggur.title')}</Title>
      <CardGrid
        ref={ref}
        as={motion.div}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        variants={containerVariants}
      >
        {features.map((item, index) => (
          <Card as={motion.div} variants={fadeUp} key={index}>
            <IconSection>
              <Image src={item.image} alt={item.title} width={36} height={36} />
            </IconSection>
            <Text>{item.title}</Text>
          </Card>
        ))}
      </CardGrid>
    </SectionWrapper>
  );
};

export default WhyWinggurSection;

// Framer Motion Variants
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
      ease: 'easeOut',
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Styled Components
const SectionWrapper = styled.div`
  padding: 60px 24px;
  color: white;
  max-width: 1280px;
  margin: 0 auto;

    @media (max-width: 1120px) {
    margin: 0 80px; 
  }

  @media (max-width: 1024px) {
    margin: 0 40px;
  }

  @media (max-width: 768px) {
    margin: 0 24px;
    padding: 32px 16px;
  }

  @media (max-width: 480px) {
    margin: 0 16px;
    padding: 24px 12px;
  }
`;

const Title = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: start;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: #6E6B52;
  color: black;
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const IconSection = styled.div`
  width: 58px;
  height: 58px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-right: 16px;
`;

const Text = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #fff;
  text-align: left;
`;

