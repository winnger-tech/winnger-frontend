"use client";
import styled from "styled-components";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from '../../utils/i18n';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <HeroWrapper>
      <ContentWrapper>
        <HeroLeft>
          <MotionTitle
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {t('home.hero.title1')}
          </MotionTitle>

          <MotionTitle
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            {t('home.hero.title2')}
          </MotionTitle>

          <MotionDescription
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            {t('home.hero.description')}
          </MotionDescription>

          <ButtonGroup>
            <Link href="/driver-registration" passHref>
              <ButtonLink>
                <PrimaryButton whileHover={{ scale: 1.05 }}>
                  {t('home.hero.driverRegister')}
                </PrimaryButton>
              </ButtonLink>
            </Link>

            <Link href="/restaurant-registration" passHref>
              <ButtonLink>
                <PrimaryButton whileHover={{ scale: 1.05 }}>
                  {t('home.hero.restaurantRegister')}
                </PrimaryButton>
              </ButtonLink>
            </Link>
          </ButtonGroup>
        </HeroLeft>

        <HeroRight>
          <MotionHeroImage
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Image
              src="/HomeImg.png"
              alt="Hero Illustration"
              width={500}
              height={300}
              style={{
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
                objectFit: "cover",
                width: "100%",
                height: "auto",
              }}
            />
          </MotionHeroImage>
        </HeroRight>
      </ContentWrapper>
    </HeroWrapper>
  );
}

// Styled Components

export const HeroWrapper = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 50px;
  padding: 6rem 8rem;
  gap: 4rem;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    padding: 5rem 4rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 4rem 2rem;
    gap: 3rem;
  }

  @media (max-width: 480px) {
    padding: 3rem 1.25rem;
    gap: 2rem;
  }
`;


const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    gap: 3rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2.5rem;
  }
`;

export const HeroLeft = styled.div`
  flex: 1;
  color: white;
  max-width: 600px;
  width: 100%;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0.4rem;

  @media (max-width: 1024px) {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
    line-height: 1.3;
  }
`;

const Description = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  margin: 2rem 0 3rem 0;
  max-width: 480px;

  @media (max-width: 1024px) {
    max-width: 100%;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

export const PrimaryButton = styled(motion.button)`
  padding: 0.9rem 1.5rem;
  font-size: 1rem;
  border: none;
  background-color: #f7b22c;
  color: black;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 160px;
  text-align: center;

  @media (max-width: 768px) {
    min-width: 140px;
    font-size: 0.95rem;
    padding: 0.85rem 1.25rem;
  }

  @media (max-width: 480px) {
    width: 100%;
    min-width: auto;
    padding: 1.1rem 0;
    font-size: 0.95rem;
  }
`;

const ButtonLink = styled.a`
  display: inline-block;
  text-decoration: none;
  width: 100%;

  @media (min-width: 481px) {
    width: auto;
  }
`;

const HeroRight = styled.div`
  flex: 1;
  width: 100%;
  max-width: 550px;

  @media (max-width: 1024px) {
    max-width: 500px;
  }

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const MotionHeroImage = styled(motion.div)`
  width: 100%;
  border-radius: 25px;
  overflow: hidden;

   @media (max-width: 768px) {
    border-radius: 18px;
  }

  @media (max-width: 480px) {
    border-radius: 18px;
  }
`;

const MotionTitle = motion(Title);
const MotionDescription = motion(Description);
const MotionButtonGroup = motion(ButtonGroup);
