"use client";

import styled, { keyframes } from "styled-components";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "../../utils/i18n";
import LanguageSelector from "./LanguageSelector";
import { motion, AnimatePresence } from "framer-motion";

const fadeSlideDown = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Nav as={motion.nav} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <NavContainer>
        <LogoWrapper>
          <Link href="/">
            <Image src="/logo w.png" alt="Logo" width={70} height={70} />
          </Link>
        </LogoWrapper>

        <HamburgerLangWrapper>
                    <MobileLangSelector>
            <LanguageSelector />
          </MobileLangSelector>
          <Hamburger onClick={() => setMenuOpen(!menuOpen)} $menuOpen={menuOpen}>
            <span />
            <span />
            <span />
          </Hamburger>
        </HamburgerLangWrapper>

        <AnimatePresence>
          {menuOpen && (
            <MotionRightSection
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8 }}
            >
              <NavMenu>
                <DesktopLangSelector>
                  <LanguageSelector />
                </DesktopLangSelector>
                {[
                  { label: "home", href: "#" },
                  { label: "about", href: "#about" },
                  { label: "howItWorks", href: "#how-it-works" },
                  { label: "faq", href: "#faqs" },
                ].map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.8 }}
                  >
                    {t(`navigation.${item.label}`)}
                  </motion.a>
                ))}

                <MotionButton href="/driver-registration" onClick={() => setMenuOpen(false)} whileHover={{ scale: 1.08, y: -4, boxShadow: "0px 8px 20px rgba(255, 195, 43, 0.5)", transition: { type: "spring", stiffness: 400, damping: 18, mass: 0.4 } }} whileTap={{ scale: 0.96 }}>
                  {t("navigation.driverRegister")}
                </MotionButton>
                <MotionButton href="/restaurant-registration" onClick={() => setMenuOpen(false)} whileHover={{ scale: 1.08, y: -4, boxShadow: "0px 8px 20px rgba(255, 195, 43, 0.5)", transition: { type: "spring", stiffness: 400, damping: 18, mass: 0.4 } }} whileTap={{ scale: 0.96 }}>
                  {t("navigation.restaurantRegister")}
                </MotionButton>
              </NavMenu>
            </MotionRightSection>
          )}
        </AnimatePresence>

        <DesktopRightSection>
          <DesktopLangSelector>
            <LanguageSelector />
          </DesktopLangSelector>
          <NavMenu>
            <NavItem href="/">{t("navigation.home")}</NavItem>
            <NavItem href="#about">{t("navigation.about")}</NavItem>
            <NavItem href="#how-it-works">{t("navigation.howItWorks")}</NavItem>
            <NavItem href="#faqs">{t("navigation.faq")}</NavItem>
            <ButtonGroup>
              <MotionButton href="/driver-registration" whileHover={{ scale: 1.08, y: -4, boxShadow: "0px 8px 20px rgba(255, 195, 43, 0.5)", transition: { type: "spring", stiffness: 400, damping: 18, mass: 0.4 } }} whileTap={{ scale: 0.96 }}>
                {t("navigation.driverRegister")}
              </MotionButton>
              <MotionButton href="/restaurant-registration" whileHover={{ scale: 1.08, y: -4, boxShadow: "0px 8px 20px rgba(255, 195, 43, 0.5)", transition: { type: "spring", stiffness: 400, damping: 18, mass: 0.4 } }} whileTap={{ scale: 0.96 }}>
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

const Nav = styled.nav`
  width: 100%;
  padding: 1.3rem 50px;
  background-color: rgba(64, 62, 45, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-family: "Space Grotesk", sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

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

const HamburgerLangWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (min-width: 1025px) {
    display: none;
  }
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
    $menuOpen && `
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
  top: 100px;
  left: 0;
  width: 100%;
  background-color: rgba(64, 62, 45, 1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-radius: 0 0 20px 20px;
  z-index: 998;

  @media (min-width: 1025px) {
    display: none;
  }
`;

const DesktopRightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.5rem;
  margin-left: auto;

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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 1024px) {
    flex-direction: column;
    width: 100%;
  }
`;

const MotionButton = styled(motion.a)`
  background-color: #ffc32b;
  color: black;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    background-color: #f3b71e;
    box-shadow: 0 6px 18px rgba(255, 195, 43, 0.45);
  }
`;

const MobileLangSelector = styled.div`
  display: block;

  @media (min-width: 1025px) {
    display: none;
  }
`;

const DesktopLangSelector = styled.div`
  display: block;

  @media (max-width: 1024px) {
    display: none;
  }
`;
