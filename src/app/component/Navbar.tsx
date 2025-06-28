"use client";

import styled, { keyframes } from "styled-components";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../utils/i18n";
import LanguageSelector from "./LanguageSelector";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout, loadUserFromStorage } from "../../store/slices/authSlice";

const fadeSlideDown = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signinOpen, setSigninOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const dropdownRef = useRef(null);
  const signinDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    // Load user from storage on mount
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setSignupOpen(false);
      }
      if (
        signinDropdownRef.current &&
        !(signinDropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setSigninOpen(false);
      }
      if (
        userMenuRef.current &&
        !(userMenuRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    router.push('/');
  };

  const handleDashboard = () => {
    if (user?.type === 'restaurant') {
      router.push('/restaurant-dashboard-staged');
    } else if (user?.type === 'driver') {
      // Check if driver has started registration, redirect to appropriate stage
      if (user.registrationStage > 1) {
        router.push(`/driver-registration-staged/stage/${user.registrationStage}`);
      } else {
        router.push('/driver-registration-staged/stage/1');
      }
    }
    setUserMenuOpen(false);
  };

  return (
    <Nav
      as={motion.nav}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
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

                <Link href="/driversignup" onClick={() => setMenuOpen(false)}>{t("navigation.driverRegister")}</Link>
                <Link href="/resturantsignup" onClick={() => setMenuOpen(false)}>{t("navigation.restaurantRegister")}</Link>
                <Link href="/driverlogin" onClick={() => setMenuOpen(false)}>{t("navigation.driverLogin")}</Link>
                <Link href="/restaurantlogin" onClick={() => setMenuOpen(false)}>{t("navigation.restaurantLogin")}</Link>
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

            {isAuthenticated ? (
              // Authenticated user menu
              <DropdownWrapper ref={userMenuRef}>
                <UserButton onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  {user?.ownerName || 'User'}
                </UserButton>
                <AnimatePresence>
                  {userMenuOpen && (
                    <DropdownMenu
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DropdownItem onClick={handleDashboard}>
                        Dashboard
                      </DropdownItem>
                      <DropdownItem onClick={handleLogout}>
                        Logout
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </AnimatePresence>
              </DropdownWrapper>
            ) : (
              // Non-authenticated user buttons
              <>
                <DropdownWrapper ref={dropdownRef}>
                  <SignupButton onClick={() => setSignupOpen(!signupOpen)}>
                    {t("navigation.signup")}
                  </SignupButton>
                  <AnimatePresence>
                    {signupOpen && (
                      <DropdownMenu
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link href="/driversignup" onClick={() => setSignupOpen(false)}>
                          {t("navigation.driverRegister")}
                        </Link>
                        <Link href="/resturantsignup" onClick={() => setSignupOpen(false)}>
                          {t("navigation.restaurantRegister")}
                        </Link>
                      </DropdownMenu>
                    )}
                  </AnimatePresence>
                </DropdownWrapper>

                <DropdownWrapper ref={signinDropdownRef}>
                  <SigninButton onClick={() => setSigninOpen(!signinOpen)}>
                    {t("navigation.signin")}
                  </SigninButton>
                  <AnimatePresence>
                    {signinOpen && (
                      <DropdownMenu
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link href="/driverlogin" onClick={() => setSigninOpen(false)}>
                          {t("navigation.driverLogin")}
                        </Link>
                        <Link href="/restaurantlogin" onClick={() => setSigninOpen(false)}>
                          {t("navigation.restaurantLogin")}
                        </Link>
                      </DropdownMenu>
                    )}
                  </AnimatePresence>
                </DropdownWrapper>
              </>
            )}
          </NavMenu>
        </DesktopRightSection>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

// --- styled-components below remain unchanged except the following new ones:

const DropdownWrapper = styled.div`
  position: relative;
`;

const SignupButton = styled.button`
  background-color: #ffc32b;
  color: black;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #f3b71e;
  }
`;

const SigninButton = styled.button`
  background-color: transparent;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 1rem;
  border: 2px solid #ffc32b;
  cursor: pointer;

  &:hover {
    background-color: #ffc32b;
    color: black;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 110%;
  right: 0;
  background-color: white;
  border-radius: 10px;
  padding: 0.5rem 0;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  z-index: 1001;
  display: flex;
  flex-direction: column;

  a {
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    color: black;
    font-weight: 500;
    font-size: 0.95rem;
    transition: background 0.2s ease;

    &:hover {
      background-color: #f6f6f6;
    }
  }
`;

const UserButton = styled.button`
  background-color: #403E2D;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 1rem;
  border: 2px solid #ffc32b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #ffc32b;
    color: #403E2D;
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: black;
  font-weight: 500;
  font-size: 0.95rem;
  transition: background 0.2s ease;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background-color: #f6f6f6;
  }
`;

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
