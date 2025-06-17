'use client';
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '../../utils/i18n';

export default function About() {
  const { t } = useTranslation();
  return (
    <Section id='about'>
      <ContentWrapper>
        <InlineHeadingWrapper>
          <Heading>{t('about.title')}</Heading>
          <SubHeading>
            {t('about.description')}
            <br />
            {t('about.missionText')}
          </SubHeading>
        </InlineHeadingWrapper>

        <CardWrapper>
          <MotionCard
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <CardText>
              <CardTitle>{t('howItWorks.forDrivers.title')}</CardTitle>
              <CardList>
                <li>
                  <strong>➜ {t('about.driver.earn')}</strong>
                </li>
                <li>
                  <strong>➜ {t('about.driver.setup')}</strong>
                </li>
                <li>
                  <strong>➜ {t('about.driver.support')}</strong>
                </li>
              </CardList>
              <Link href="/driver-registration" passHref>
                <Button>{t('home.hero.driverRegister')}</Button>
              </Link>
            </CardText>
            <CardImage>
              <Image
                src="/driver-about.png"
                alt="Driver Illustration"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </CardImage>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <CardText>
              <CardTitle>{t('howItWorks.forRestaurants.title')}</CardTitle>
              <CardList>
                <li>
                  <strong>➜ {t('about.restaurant.expand')}</strong>
                </li>
                <li>
                  <strong>➜ {t('about.restaurant.onboarding')}</strong>
                </li>
                <li>
                  <strong>➜ {t('about.restaurant.grow')}</strong>
                </li>
              </CardList>
              <Link href="/restaurant-registration" passHref>
                <Button>{t('home.hero.restaurantRegister')}</Button>
              </Link>
            </CardText>
            <CardImage>
              <Image
                src="/restaurant-about.png"
                alt="Restaurant Illustration"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </CardImage>
          </MotionCard>
        </CardWrapper>
      </ContentWrapper>
    </Section>
  );
}

// Styled Components Below

const Section = styled.section`
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

const ContentWrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const InlineHeadingWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 4rem;

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

  @media (max-width: 768px) {
    max-width: 100%;
    text-align: left;
  }
`;

const Highlight = styled.span`
  color: white;
  font-weight: 600;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const MotionCard = motion(styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #6E6B52;
  border-radius: 2rem;
  padding: 2.5rem;
  gap: 2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
    border-radius: 1rem; 
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 1rem; 
  }
`);

const CardText = styled.div`
  flex: 1;
  color: white;
  text-align: left;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  text-align: left;
`;

const CardList = styled.ul`
  font-size: 1rem;
  color: #f2f2f2;
  margin-bottom: 2rem;
  text-align: left;

  li {
    margin-bottom: 0.75rem;
  }

  strong {
    color: white;
  }
`;


const Button = styled.button`
  background-color: #f7b22c;
  color: black;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #e0a600;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const CardImage = styled.div`
  position: relative;
  width: 300px;
  height: 280px;
  margin-top: -30px;
  margin-bottom: -30px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 100%;
    height: 220px;
    margin-top: -20px;
    margin-bottom: -20px;
  }

  @media (max-width: 480px) {
    height: 180px;
  }
`;
