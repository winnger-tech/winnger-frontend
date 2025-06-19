'use client';

import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from '../../utils/i18n';
import Image from 'next/image';

const ContactSection = () => {
  const { t } = useTranslation();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
  // inside ContactSection component return:

<Container
  id="contact"
  ref={ref}
  initial="hidden"
  animate={controls}
  variants={containerVariants}
>
  <InlineHeadingWrapper as={motion.div} variants={fadeUpStaggerContainer}>
    <motion.div variants={fadeUp}>
      <Heading>{t('contact.title')}</Heading>
    </motion.div>
    <motion.div variants={fadeUp}>
      <SubHeading>{t('contact.description')}</SubHeading>
    </motion.div>
  </InlineHeadingWrapper>

  <ContentWrapper>
    <ContactBox as={motion.div} variants={fadeUp}>
      <Form
        as={motion.form}
        variants={fadeUpStaggerContainer}
        initial="hidden"
        animate="visible"
      >
        <InputWrapper as={motion.div} variants={fadeUp}>
          <Label htmlFor="name">{t('contact.name')}</Label>
          <Input id="name" type="text" placeholder={t('contact.namePlaceholder')} />
        </InputWrapper>

        <InputWrapper as={motion.div} variants={fadeUp}>
          <Label htmlFor="email">{t('contact.email')}</Label>
          <Input id="email" type="email" placeholder={t('contact.emailPlaceholder')} required />
        </InputWrapper>

        <InputWrapper as={motion.div} variants={fadeUp}>
          <Label htmlFor="message">{t('contact.message')}</Label>
          <TextArea id="message" placeholder={t('contact.messagePlaceholder')} required />
        </InputWrapper>

        <motion.div variants={fadeUp}>
          <Button type="submit">{t('contact.sendMessage')}</Button>
        </motion.div>
      </Form>
    </ContactBox>

    <RightSection as={motion.div} variants={fadeUp}>
      <Image
        src="/AppUI.png"
        alt="App UI"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        style={{ objectFit: 'contain', borderRadius: '20px' }}
        priority
      />
    </RightSection>
  </ContentWrapper>
</Container>
  );
};

export default ContactSection;

// === Framer Motion Variants ===
const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const fadeUpStaggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// === Styled Components ===

const Container = styled(motion.section)`
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 40px 0px;
  margin: 0 auto;
  max-width: 1250px;

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

const InlineHeadingWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const Heading = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const SubHeading = styled.p`
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: #e0e0e0;
  max-width: 800px;
  text-align: left;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 40px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const ContactBox = styled.div`
  background-color: #6E6B52;
  padding: 48px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 700px;
  width: 100%;

  @media (max-width: 1024px) {
    padding: 40px 28px;
  }

  @media (max-width: 480px) {
    padding: 32px 20px;
    border-radius: 24px;
  }
`;

const RightSection = styled(motion.div)`
  flex: 1;
  min-height: 550px;
  position: relative;
  min-width: 300px;

  @media (max-width: 1024px) {
    height: 300px;
    width: 100%;
  }

  @media (max-width: 768px) {
    height: 260px;
  }

  @media (max-width: 480px) {
    height: 220px;
  }
`;


const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 600px;

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  color: white;
  font-size: 14px;
`;

const Input = styled.input`
  background-color: #403E2D;
  border: 1px solid white;
  padding: 12px 16px;
  border-radius: 12px;
  color: white;
  font-size: 14px;

  &::placeholder {
    color: #d6d6d6;
  }
`;

const TextArea = styled.textarea`
  background-color: #403E2D;
  border: 1px solid white;
  padding: 12px 16px;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  resize: none;
  min-height: 140px;

  &::placeholder {
    color: #d6d6d6;
  }
`;

const Button = styled.button`
  background-color: #ffc32b;
  color: black;
  border: none;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  width: 100%;
  transition: background 0.3s ease;

  &:hover {
    background-color: #e6ac00;
  }
`;
