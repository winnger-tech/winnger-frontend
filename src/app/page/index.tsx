"use client";
import styled from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "../../utils/i18n";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <HeroWrapper>
      <ContentWrapper>
        <HeroLeft>
          <MotionTitle
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
          >
            {t("home.hero.title1")}
          </MotionTitle>

          <MotionTitle
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1], delay: 0.15 }}
          >
            {t("home.hero.title2")}
          </MotionTitle>

          <MotionDescription
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1], delay: 0.3 }}
          >
            {t("home.hero.description")}
          </MotionDescription>

          <ButtonGroup>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
            >
              <Link href="/driver-registration" passHref>
                <ButtonLink>
                  <PrimaryButton whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}>
                    {t("home.hero.driverRegister")}
                  </PrimaryButton>
                </ButtonLink>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
            >
              <Link href="/restaurant-registration" passHref>
                <ButtonLink>
                  <PrimaryButton whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}>
                    {t("home.hero.restaurantRegister")}
                  </PrimaryButton>
                </ButtonLink>
              </Link>
            </motion.div>
          </ButtonGroup>
        </HeroLeft>

        <HeroRight>
          <MotionHeroImage
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.25, 0.8, 0.25, 1] }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <VideoWrapper>
                <video
                  src="/HeroVid.mov"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "inherit",
                    objectFit: "cover",
                  }}
                />
                <Overlay />
              </VideoWrapper>
            </motion.div>
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

const ButtonLink = styled.span`
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

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: inherit;
  overflow: hidden;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.05));
  border-radius: inherit;
`;

const MotionTitle = motion(Title);
const MotionDescription = motion(Description);
