"use client";

import styled, { keyframes } from "styled-components";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from '../../utils/i18n';
import LanguageSelector from "./LanguageSelector";

// Animations
const fadeSlideDown = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const dropdownReveal = keyframes`
  0% { opacity: 0; transform: translateY(-15px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Nav>
      <NavContainer>
        <LogoWrapper>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={60} height={60} />
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

        <RightSection $menuOpen={menuOpen}>
          <NavMenu>
            {/* Language Selector for desktop */}
            <DesktopLangSelector>
              <LanguageSelector />
            </DesktopLangSelector>
            <NavItem href="#about" onClick={() => setMenuOpen(false)}>{t('navigation.about')}</NavItem>
            <NavItem href="#how-it-works" onClick={() => setMenuOpen(false)}>{t('navigation.howItWorks')}</NavItem>
            <NavItem href="#faqs" onClick={() => setMenuOpen(false)}>{t('navigation.faq')}</NavItem>
            <ButtonGroup>
              <YellowButton href="/driver-registration" onClick={() => setMenuOpen(false)}>
                {t('navigation.driverRegister')}
              </YellowButton>
              <YellowButton href="/restaurant-registration" onClick={() => setMenuOpen(false)}>
                {t('navigation.restaurantRegister')}
              </YellowButton>
            </ButtonGroup>
          </NavMenu>
        </RightSection>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

// Styled Components

const Nav = styled.nav`
  width: 100%;
  padding: 1.3rem 50px;
  background-color: #403E2D;
  font-family: 'Space Grotesk', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  animation: ${fadeSlideDown} 0.6s ease forwards;

  @media (max-width: 768px) {
    padding: 1.3rem 20px;
  }

  @media (max-width: 480px) {
    padding: 1rem 12px;
  }
`;

const NavContainer = styled.div`
  max-width: 1440px;
  margin: 0 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  @media (max-width: 768px) {
    margin: 0 20px;
  }

  @media (max-width: 480px) {
    margin: 0 12px;
  }
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

const RightSection = styled.div<{ $menuOpen: boolean }>`
  @media (max-width: 1024px) {
    position: fixed;
    top: 80px; /* Height of navbar + some margin */
    left: 0;
    width: 100%;
    background: #706C51;
    backdrop-filter: blur(8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border-radius: 0 0 20px 20px;
    max-height: ${({ $menuOpen }) => ($menuOpen ? "500px" : "0")};
    overflow: hidden;
    transition: max-height 0.5s ease;
    animation: ${({ $menuOpen }) => ($menuOpen ? dropdownReveal : 'none')} 0.35s ease forwards;
    z-index: 998;
  }

  @media (min-width: 1025px) {
    display: flex !important;
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
