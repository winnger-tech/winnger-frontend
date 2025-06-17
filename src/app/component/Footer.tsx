"use client";

import React from 'react';
import styled from 'styled-components';
import { FaLinkedinIn, FaFacebookF, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '../../utils/i18n';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Footer() {
  const { t } = useTranslation();

  return (
    <FooterContainer as={motion.footer} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
      <TopRow as={motion.div} variants={fadeUp}>
        <Logo>
          <Link href="/">
            <img src="/logo.png" alt="Logo" />
          </Link>
        </Logo>

        <NavLinks>
          <Link href="#about">{t('navigation.about')}</Link>
          <Link href="#how-it-works">{t('navigation.howItWorks')}</Link>
          <Link href="#faqs">{t('navigation.faq')}</Link>
          <Link href="#contact">{t('navigation.contact')}</Link>
        </NavLinks>

        <SocialIcons>
          <FaLinkedinIn />
          <FaFacebookF />
          <FaTwitter />
        </SocialIcons>
      </TopRow>

      <InfoRow as={motion.div} variants={fadeUp}>
        <ContactDetails>
          <p>{t('footer.email')}: info@winnger.com</p>
          <p>{t('footer.phone')}: 555-567-8901</p>
          <p>
            {t('footer.address')}: 1234 Main St<br />
            Moonstone City, Stardust State 12345
          </p>
        </ContactDetails>

        <SubscribeBox>
          <input type="email" placeholder={t('footer.emailPlaceholder')} />
          <button>{t('footer.subscribe')}</button>
        </SubscribeBox>
      </InfoRow>

      <BottomRow as={motion.div} variants={fadeUp}>
        <span>{t('footer.copyright')}</span>
        <Link href="#">{t('footer.privacyPolicy')}</Link>
      </BottomRow>
    </FooterContainer>
  );
}

// Styled Components

const FooterContainer = styled.footer`
  background-color: #D7C3A5;
  border-radius: 3rem 3rem 0 0;
  padding: 40px 80px;
  margin: 0 90px;
  color: black;

  @media (max-width: 1440px) {
    margin: 0 60px;
  }

  @media (max-width: 1024px) {
    padding: 36px 40px;
    margin: 0 40px;
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
    margin: 0 25px;
  }

  @media (max-width: 480px) {
    padding: 24px 16px;
    margin: 0 20px;
    border-radius: 2rem 2rem 0 0;
  }
`;

const TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Logo = styled.div`
  img {
    width: 80px;
    height: auto;
  }
`;

const NavLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;

  a {
    color: black;
    text-decoration: underline;
    font-weight: 500;
    font-size: 16px;

    &:hover {
      opacity: 0.7;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  svg {
    font-size: 24px;
    color: black;
    background-color: white;
    border-radius: 50%;
    padding: 6px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.7;
    }
  }

  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ContactDetails = styled.div`
  flex: 1;
  max-width: 380px;
  line-height: 2;
  font-size: 16px;
  font-weight: 400;
  color: black;
`;

const SubscribeBox = styled.div`
  flex: 1;
  max-width: 550px;
  background-color: #b59264;
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  color: black;

  input {
    padding: 1rem 1.5rem;
    border: 1px solid black;
    border-radius: 0.75rem;
    font-size: 16px;
    flex: 1;
    color: black;
    background: white;

    @media (max-width: 480px) {
      font-size: 14px;
      padding: 0.75rem 1rem;
    }
  }

  button {
    background-color: #e4cfb0;
    padding: 1rem 2rem;
    border-radius: 0.75rem;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: black;
    transition: 0.3s ease;

    &:hover {
      opacity: 0.85;
    }

    @media (max-width: 480px) {
      width: 100%;
      font-size: 16px;
      padding: 0.75rem;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const BottomRow = styled.div`
  border-top: 1px solid black;
  margin-top: 3rem;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 14px;
  color: black;

  a {
    color: black;
    text-decoration: underline;

    &:hover {
      opacity: 0.7;
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
`;
