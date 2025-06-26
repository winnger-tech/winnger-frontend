"use client";

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../component/Navbar';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

export default function DriverDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user || user.type !== 'driver') {
      router.push('/driverlogin');
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <Container>
        <ContentWrapper>
          <Header
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <WelcomeSection>
              <Title>Welcome back, {user.firstName}!</Title>
              <Subtitle>Driver Dashboard</Subtitle>
            </WelcomeSection>
            <LogoutButton onClick={handleLogout}>
              Logout
            </LogoutButton>
          </Header>

          <StatsGrid
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <StatCard>
              <StatIcon>🚗</StatIcon>
              <StatValue>0</StatValue>
              <StatLabel>Total Deliveries</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon>💰</StatIcon>
              <StatValue>$0.00</StatValue>
              <StatLabel>Total Earnings</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon>⭐</StatIcon>
              <StatValue>N/A</StatValue>
              <StatLabel>Rating</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon>🎯</StatIcon>
              <StatValue>Available</StatValue>
              <StatLabel>Status</StatLabel>
            </StatCard>
          </StatsGrid>

          <InfoSection
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <InfoCard>
              <InfoTitle>Account Information</InfoTitle>
              <InfoItem>
                <InfoLabel>Email:</InfoLabel>
                <InfoValue>{user.email}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Registration Stage:</InfoLabel>
                <InfoValue>{user.registrationStage}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Registration Complete:</InfoLabel>
                <InfoValue>{user.isRegistrationComplete ? 'Yes' : 'No'}</InfoValue>
              </InfoItem>
              {!user.isRegistrationComplete && (
                <CompleteRegistrationButton
                  onClick={() => router.push('/driver-dashboard-staged')}
                >
                  Complete Registration
                </CompleteRegistrationButton>
              )}
            </InfoCard>
          </InfoSection>
        </ContentWrapper>
      </Container>
    </>
  );
}

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #403E2D 0%, #2d2b1f 100%);
  padding-top: 120px;
  font-family: 'Space Grotesk', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const WelcomeSection = styled.div`
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
  margin: 0;
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 195, 43, 0.3);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #ffc32b;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: white;
  opacity: 0.8;
`;

const InfoSection = styled.div`
  display: flex;
  justify-content: center;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
`;

const InfoTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #403E2D;
  margin-bottom: 2rem;
  text-align: center;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e1e1e1;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #403E2D;
`;

const InfoValue = styled.span`
  color: #666;
`;

const CompleteRegistrationButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 2rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 195, 43, 0.3);
  }
`;
