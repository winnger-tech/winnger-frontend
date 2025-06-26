'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';
import { useDashboardStats } from '../../hooks/useApi';

export default function RestaurantDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Fetch dashboard stats
  const { data: stats } = useDashboardStats();

  // Handle authentication redirect
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    // Clear auth data and redirect
    localStorage.removeItem('winngr_auth_token');
    localStorage.removeItem('winngr_refresh_token');
    localStorage.removeItem('winngr_user_data');
    localStorage.removeItem('winngr_token_expiry');
    router.push('/');
    window.location.reload(); // Force reload to clear state
  };

  const handleCompleteRegistration = () => {
    router.push('/restaurant-dashboard-staged');
  };

  // Mock stats if API data is not available
  const displayStats = stats || {
    ordersToday: 0,
    totalRevenue: 0,
    activeMenuItems: 0,
    rating: 5.0
  };

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Container>
      <Header>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>Restaurant Dashboard</Title>
          <Subtitle>Welcome back, {user?.ownerName}!</Subtitle>
        </motion.div>
        
        <LogoutButton onClick={handleLogout}>
          Logout
        </LogoutButton>
      </Header>

      <MainContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <WelcomeCard>
            <CardTitle>Account Status</CardTitle>
            <StatusInfo>
              <StatusItem>
                <StatusLabel>Registration Stage:</StatusLabel>
                <StatusValue>{user?.registrationStage || 1}</StatusValue>
              </StatusItem>
              <StatusItem>
                <StatusLabel>Registration Complete:</StatusLabel>
                <StatusBadge $complete={user?.isRegistrationComplete || false}>
                  {user?.isRegistrationComplete ? 'Complete' : 'Incomplete'}
                </StatusBadge>
              </StatusItem>
              <StatusItem>
                <StatusLabel>Email:</StatusLabel>
                <StatusValue>{user?.email}</StatusValue>
              </StatusItem>
            </StatusInfo>

            {!user?.isRegistrationComplete && (
              <CompleteButton onClick={handleCompleteRegistration}>
                Complete Registration
              </CompleteButton>
            )}
          </WelcomeCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <StatsGrid>
            <StatCard>
              <StatTitle>Orders Today</StatTitle>
              <StatValue>
                {displayStats.ordersToday}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Total Revenue</StatTitle>
              <StatValue>
                ${displayStats.totalRevenue.toFixed(2)}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Active Menu Items</StatTitle>
              <StatValue>
                {displayStats.activeMenuItems}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Rating</StatTitle>
              <StatValue>
                {displayStats.rating}★
              </StatValue>
            </StatCard>
          </StatsGrid>
        </motion.div>
      </MainContent>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #403E2D 0%, #2d2b1f 100%);
  font-family: 'Space Grotesk', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin: 0.5rem 0 0 0;
`;

const LogoutButton = styled.button`
  background: #e74c3c;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #c0392b;
    transform: translateY(-2px);
  }
`;

const MainContent = styled.main`
  padding: 3rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  color: #403E2D;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
`;

const StatusInfo = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
`;

const StatusLabel = styled.span`
  font-weight: 600;
  color: #666;
`;

const StatusValue = styled.span`
  color: #403E2D;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ $complete: boolean }>`
  background: ${props => props.$complete ? '#27ae60' : '#f39c12'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const CompleteButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
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
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const StatTitle = styled.h3`
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  color: #403E2D;
  font-size: 2rem;
  font-weight: 700;
`;



