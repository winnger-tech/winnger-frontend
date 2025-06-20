"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "../../utils/i18n";
import { useEffect, useState } from "react";

export default function Hero() {
  const { t } = useTranslation();
  const taglines = t("home.hero.titles") as string[];

  const [displayText, setDisplayText] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentTagline = taglines[currentLine % taglines.length];
    const typingSpeed = isDeleting ? 40 : 75;

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText(currentTagline.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else {
        setDisplayText(currentTagline.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }

      if (!isDeleting && charIndex === currentTagline.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setCurrentLine((prev) => (prev + 1) % taglines.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentLine, taglines]);

  return (
    <HeroWrapper>
      <Overlay />
      <ContentWrapper>
        <HeroLeft>
          <AnimatedTitle>
            {displayText}
            <Cursor>|</Cursor>
          </AnimatedTitle>

          <MotionDescription
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.2, ease: [0.25, 0.8, 0.25, 1], delay: 0.4 }}
          >
            {t("home.hero.description")}
          </MotionDescription>

          <ButtonGroup>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.65, duration: 0.8, ease: "easeOut" }}
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
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
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
      </ContentWrapper>
    </HeroWrapper>
  );
}


// Styled Components

export const HeroWrapper = styled.section`
  position: relative;
  padding: 6rem 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('/BGImg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  color: white;

  @media (max-width: 1024px) {
    padding: 5rem 4rem;
  }

  @media (max-width: 768px) {
    padding: 4rem 2rem;
  }

  @media (max-width: 480px) {
    padding: 3rem 1.25rem;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2));
  z-index: 1;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const HeroLeft = styled.div`
  max-width: 640px;
  width: 100%;
`;


const AnimatedTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.4rem;
  white-space: pre-line;

  @media (max-width: 1024px) {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  margin: 2rem 0 3rem 0;
  max-width: 480px;

  @media (max-width: 768px) {
    font-size: 1rem;
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
  }

  @media (max-width: 480px) {
    width: 100%;
    min-width: auto;
    padding: 1.1rem 0;
  }
`;

const ButtonLink = styled.span`
  display: inline-block;
  width: 100%;

  @media (min-width: 481px) {
    width: auto;
  }
`;


// Reuse all existing styled-components
const MotionTitle = motion(styled.h1`
  font-size: 3.5rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.4rem;
  white-space: pre-line;

  @media (max-width: 1024px) {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`);

const MotionDescription = motion(styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  margin: 2rem 0 3rem 0;
  max-width: 480px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 2rem;
  }
`);

const Cursor = styled.span`
  display: inline-block;
  margin-left: 4px;
  width: 1ch;
  animation: blink 1s step-end infinite;
  
  @keyframes blink {
    from, to { opacity: 0; }
    50% { opacity: 1; }
  }
`;