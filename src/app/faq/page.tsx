"use client"

import styled from 'styled-components';
import { Plus, Minus } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from '../../utils/i18n';

const FaqSection = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: t('faq.question1'),
      answer: t('faq.answer1'),
    },
    {
      question: t('faq.question2'),
      answer: t('faq.answer2'),
    },
    {
      question: t('faq.question3'),
      answer: t('faq.answer3'),
    },
    {
      question: t('faq.question4'),
      answer: t('faq.answer4'),
    },
    {
      question: t('faq.question5'),
      answer: t('faq.answer5'),
    },
    {
      question: t('faq.question6'),
      answer: t('faq.answer6'),
    },
  ];

  return (
    <FaqContainer id='faqs'
      as={motion.div}
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Title>{t('faq.title')}</Title>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <AccordionItem key={index} active={isOpen} onClick={() => toggle(index)}>
            <Question>
              {faq.question}
              {isOpen ? (
                <Minus color="white" strokeWidth={2.5} />
              ) : (
                <Plus color="white" strokeWidth={2.5} />
              )}
            </Question>
            {isOpen && <Answer>{faq.answer}</Answer>}
          </AccordionItem>
        );
      })}
    </FaqContainer>
  );
};

export default FaqSection;

// Styled Components
const FaqContainer = styled.div`
  padding: 40px 24px;
  margin: 0 80px;

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
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 24px;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 2rem;
    white-space: normal;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const AccordionItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>`
  background-color: #6E6B52;
  color: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0px 4px 0px 0px #000000;
  margin-bottom: 16px;
  cursor: pointer;
  border: 1px solid white;
  transition: all 0.3s ease;

  &:hover {
    background-color: #777565;
  }

  @media (max-width: 480px) {
    padding: 18px;
  }
`;

const Question = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const Answer = styled.div`
  margin-top: 16px;
  font-size: 14px;
  border-top: 1px solid white;
  padding-top: 12px;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;
