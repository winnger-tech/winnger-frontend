"use client";

import styled, { keyframes } from "styled-components";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "../../utils/i18n";
import LanguageSelector from "./LanguageSelector";
import { motion, AnimatePresence } from "framer-motion";

// Animations
const fadeSlideDown = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Nav as={motion.nav} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <NavContainer>
        <LogoWrapper>
          <Link href="/">
            <Image src="/logo w.png" alt="Logo" width={70} height={70} />
          </Link>
        </LogoWrapper>

        {/* Language Selector visible only on mobile */}
        <MobileLangSelector>
          <LanguageSelector />
        </MobileLangSelector>

        <Hamburger onClick={() => setMenuOpen(!menuOpen)} $menuOpen={menuOpen}>
          <span />
          <span />
          <span />
        </Hamburger>

        <AnimatePresence>
          {menuOpen && (
            <MotionRightSection
              key="menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <NavMenu>
                <DesktopLangSelector>
                  <LanguageSelector />
                </DesktopLangSelector>

                {[{ label: "about", href: "#about" },
                  { label: "howItWorks", href: "#how-it-works" },
                  { label: "faq", href: "#faqs" }]
                  .map((item, index) => (
                    <MotionNavItem
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {t(`navigation.${item.label}`)}
                    </MotionNavItem>
                  ))}

                <ButtonGroup>
                  <MotionButton
                    href="/driver-registration"
                    onClick={() => setMenuOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {t("navigation.driverRegister")}
                  </MotionButton>

                  <MotionButton
                    href="/restaurant-registration"
                    onClick={() => setMenuOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {t("navigation.restaurantRegister")}
                  </MotionButton>
                </ButtonGroup>
              </NavMenu>
            </MotionRightSection>
          )}
        </AnimatePresence>

        {/* Desktop Nav */}
        <DesktopRightSection>
          <NavMenu>
            <DesktopLangSelector>
              <LanguageSelector />
            </DesktopLangSelector>

            <NavItem href="#about">{t("navigation.about")}</NavItem>
            <NavItem href="#how-it-works">{t("navigation.howItWorks")}</NavItem>
            <NavItem href="#faqs">{t("navigation.faq")}</NavItem>

            <ButtonGroup>
              <MotionButton
                href="/driver-registration"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                {t("navigation.driverRegister")}
              </MotionButton>
              <MotionButton
                href="/restaurant-registration"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                {t("navigation.restaurantRegister")}
              </MotionButton>
            </ButtonGroup>
          </NavMenu>
        </DesktopRightSection>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

// Styled Components
const Nav = styled.nav`
  width: 100%;
  padding: 1.3rem 50px;
  background-color: #403e2d;
  font-family: "Space Grotesk", sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;

  @media (max-width: 768px) {
    padding: 1.3rem 20px;
  }

  @media (max-width: 480px) {
    padding: 1rem 12px;
  }
`;

const NavContainer = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Hamburger = styled.div<{ $menuOpen: boolean }>`
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 6px;
  z-index: 1000;

  span {
    height: 3px;
    width: 26px;
    background: white;
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  ${({ $menuOpen }) =>
    $menuOpen &&
    `
    span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    span:nth-child(2) {
      opacity: 0;
    }
    span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  `}

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const MotionRightSection = styled(motion.div)`
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  background: #706c51;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-radius: 0 0 20px 20px;
  z-index: 998;

  @media (min-width: 1025px) {
    display: none;
  }
`;

const DesktopRightSection = styled.div`
  display: flex;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavMenu = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 1.8rem;
    padding: 2rem 2.5rem;
    align-items: stretch;
  }
`;

const NavItem = styled(Link)`
  text-decoration: none;
  color: white;
  font-size: 1.1rem;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 1024px) {
    font-size: 1.3rem;
    padding: 0.5rem 0;
  }
`;

const MotionNavItem = motion(NavItem);

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 1024px) {
    flex-direction: column;
    width: 100%;
  }
`;

const YellowButton = styled(Link)`
  background-color: #f7b42f;
  color: black;
  text-decoration: none;
  font-size: 1rem;
  padding: 14px 24px;
  border-radius: 14px;
  text-align: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e0a528;
  }

  @media (max-width: 1024px) {
    width: 100%;
    padding: 16px 0;
  }
`;

const MotionButton = motion(YellowButton);

const MobileLangSelector = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: block;
    width: 150px;
    position: absolute;
    right: 70px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
  }
`;

const DesktopLangSelector = styled.div`
  display: block;
  min-width: 180px;

  @media (max-width: 1024px) {
    display: none;
  }
`;
