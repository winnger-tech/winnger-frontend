'use client';

import styled from 'styled-components';
import { Plus } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from '../../utils/i18n';

const FaqSection = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      image: '/faq1.png',
      question: t('faq.question1'),
      answer: t('faq.answer1'),
    },
    {
      image: '/faq2.png',
      question: t('faq.question2'),
      answer: t('faq.answer2'),
    },
    {
      image: '/faq3.png',
      question: t('faq.question3'),
      answer: t('faq.answer3'),
    },
    {
      image: '/faq4.png',
      question: t('faq.question4'),
      answer: t('faq.answer4'),
    },
    {
      image: '/faq5.png',
      question: t('faq.question5'),
      answer: t('faq.answer5'),
    },
    {
      image: '/faq6.png',
      question: t('faq.question6'),
      answer: t('faq.answer6'),
    },
  ];

  return (
    <FaqWrapper>
      <Title>{t('faq.title')}</Title>
      <ScrollWrapper
        ref={ref}
        as={motion.div}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        variants={containerVariants}
      >
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <CardContainer
              key={index}
              as={motion.div}
              variants={fadeUp}
              onClick={() => toggle(index)}
            >
              <FlipCard animate={{ rotateY: isOpen ? 180 : 0 }}>
                <Front>
                  <FrontContent>
                    <TopImage>
                      <Image src={faq.image} alt="FAQ icon" fill style={{ objectFit: 'cover' }} />
                    </TopImage>
                    <Question>{faq.question}</Question>
                    <Divider />
                    <IconWrapper>
                      <Plus color="white" strokeWidth={2.5} />
                    </IconWrapper>
                  </FrontContent>
                </Front>

                <Back>
                  <Answer>{faq.answer}</Answer>
                </Back>
              </FlipCard>
            </CardContainer>
          );
        })}
      </ScrollWrapper>
    </FaqWrapper>
  );
};

export default FaqSection;

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
    transition: { duration: 0.5 },
  },
};

// Styled Components

const FaqWrapper = styled.div`
  padding: 40px 24px;
  margin: 0 auto;
  max-width: 1250px;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 32px 16px;
  }

  @media (max-width: 480px) {
    padding: 24px 12px;
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 2rem;
  text-align: start;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ScrollWrapper = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
`;

const CardContainer = styled.div`
  flex: 0 0 300px;
  height: 300px;
  perspective: 1200px;

  @media (max-width: 480px) {
    flex: 0 0 260px;
    height: 320px;
  }
`;

const FlipCard = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
`;

const Face = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background-color: #6E6B52;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const Front = styled(Face)`
  z-index: 2;
`;

const Back = styled(Face)`
  transform: rotateY(180deg);
  padding: 24px;
  justify-content: center;
`;

const FrontContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 16px;
  justify-content: flex-start;
`;

const TopImage = styled.div`
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const Question = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  text-align: left;
`;

const Divider = styled.div`
  margin: 10px 0;
  height: 1px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.3);
`;

const IconWrapper = styled.div`
  margin-top: auto;
`;

const Answer = styled.div`
  font-size: 14px;
  color: white;
  line-height: 1.6;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;
