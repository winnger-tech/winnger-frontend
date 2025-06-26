'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../../context/DashboardContext';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import ProgressBar from './ProgressBar';
import StageCard from './StageCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface DashboardProps {
  userType: 'driver' | 'restaurant';
}

interface StageInfo {
  title: string;
  description: string;
  fields: string[];
  completed: boolean;
  isCurrentStage: boolean;
}

export default function Dashboard({ userType }: DashboardProps) {
  const { state, actions } = useDashboard();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Initialize dashboard on mount - only run once
  useEffect(() => {
    // Only initialize if not already loading and not already initialized
    if (state.loading || (state.stages && Object.keys(state.stages).length > 0)) {
      console.log('🔄 Dashboard already loading or initialized, skipping...');
      return;
    }

    console.log('🚀 Starting dashboard initialization...');
    
    const initializeWithTimeout = async () => {
      try {
        await Promise.race([
          actions.initializeDashboard(userType),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Dashboard initialization timeout')), 15000)
          )
        ]);
      } catch (error) {
        console.error('Dashboard initialization failed or timed out:', error);
        // The DashboardContext will handle the fallback
      }
    };

    initializeWithTimeout();
  }, [userType, state.loading, state.stages]); // Add state dependencies to prevent unnecessary re-runs

  // Enhanced dashboard data processing
  const dashboardData = user?.dashboardData;
  const currentStageInfo = dashboardData?.stages?.[dashboardData?.currentStage?.toString()];
  const progress = dashboardData?.progress || state.progress;

  // Debug log to see what data we have
  console.log('Dashboard state:', state);
  console.log('User:', user);
  console.log('Dashboard data from API:', dashboardData);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const handleStageClick = (stage: number) => {
    // Only allow navigation to completed stages or current stage
    const stageData = state.stages[stage.toString()];
    if (stageData?.completed || stage === state.currentStage) {
      actions.navigateToStage(stage);
      router.push(`/${userType}-registration-staged/stage/${stage}`);
    }
  };

  const handleContinueRegistration = () => {
    const nextStage = state.currentStage;
    console.log('🚀 Continue Registration clicked:', {
      nextStage,
      userType,
      currentStage: state.currentStage,
      stages: state.stages,
      user: user
    });
    router.push(`/${userType}-registration-staged/stage/${nextStage}`);
  };

  if (state.loading) {
    return (
      <Container>
        <LoadingWrapper>
          <LoadingSpinner />
          <LoadingText>Loading your dashboard...</LoadingText>
          <LoadingSubtext>
            This may take a few moments. If it takes too long, please refresh the page.
          </LoadingSubtext>
        </LoadingWrapper>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container>
        <ErrorWrapper>
          <ErrorText>Error loading dashboard: {state.error}</ErrorText>
          <ErrorSubtext>
            There was an issue connecting to the server. This might be a temporary problem.
          </ErrorSubtext>
          <RetryButton onClick={() => actions.initializeDashboard(userType)}>
            Try Again
          </RetryButton>
        </ErrorWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Header
        as={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <WelcomeSection>
          <WelcomeTitle>
            Welcome back, {user?.firstName || user?.ownerName}!
          </WelcomeTitle>
          <WelcomeSubtitle>
            {userType === 'driver' ? 'Driver' : 'Restaurant'} Registration Dashboard
          </WelcomeSubtitle>
        </WelcomeSection>
        
        <HeaderActions>
          {state.autoSaving && (
            <AutoSaveIndicator>
              <SaveIcon>💾</SaveIcon>
              Auto-saving...
            </AutoSaveIndicator>
          )}
          <LogoutButton onClick={handleLogout}>
            Logout
          </LogoutButton>
        </HeaderActions>
      </Header>

      <ProgressSection
        as={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <ProgressBar progress={progress} />
        
        {!user?.isRegistrationComplete && state.stages && Object.keys(state.stages).length > 0 && (
          <ContinueSection>
            <CurrentStageInfo>
              <CurrentStageTitle>
                Current Step: {state.stages[state.currentStage.toString()]?.title || 'Loading...'}
              </CurrentStageTitle>
              <CurrentStageDescription>
                {state.stages[state.currentStage.toString()]?.description || 'Please wait while we load your registration progress.'}
              </CurrentStageDescription>
            </CurrentStageInfo>
            <ContinueButton onClick={handleContinueRegistration}>
              Continue Registration
            </ContinueButton>
          </ContinueSection>
        )}
      </ProgressSection>

      <StagesGrid
        as={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <StagesTitle>Registration Steps</StagesTitle>
        <StagesContainer>
          {state.stages && Object.entries(state.stages).map(([stageNum, stageInfo]) => (
            <StageCard
              key={stageNum}
              stageNumber={parseInt(stageNum)}
              stageInfo={stageInfo as StageInfo}
              onClick={() => handleStageClick(parseInt(stageNum))}
              isCurrent={(stageInfo as StageInfo).isCurrentStage}
              isCompleted={(stageInfo as StageInfo).completed}
            />
          ))}
        </StagesContainer>
      </StagesGrid>

      {user?.isRegistrationComplete && (
        <CompletionSection
          as={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <CompletionCard>
            <CompletionIcon>🎉</CompletionIcon>
            <CompletionTitle>Registration Complete!</CompletionTitle>
            <CompletionText>
              Your {userType} registration has been completed successfully. 
              You'll receive confirmation within 24-48 hours.
            </CompletionText>
            <ViewProfileButton onClick={() => router.push(`/${userType}-profile`)}>
              View Profile
            </ViewProfileButton>
          </CompletionCard>
        </CompletionSection>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #403E2D 0%, #2d2b1f 100%);
  padding: 2rem;
  font-family: 'Space Grotesk', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
`;

const LoadingText = styled.p`
  color: white;
  font-size: 1.1rem;
`;

const LoadingSubtext = styled.p`
  color: white;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
`;

const ErrorText = styled.p`
  color: #ff6b6b;
  font-size: 1.1rem;
  text-align: center;
`;

const ErrorSubtext = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
  text-align: center;
  opacity: 0.8;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 195, 43, 0.3);
  }
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

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AutoSaveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4CAF50;
  font-size: 0.9rem;
  font-weight: 500;
`;

const SaveIcon = styled.span`
  font-size: 1rem;
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

const ProgressSection = styled.div`
  margin-bottom: 3rem;
`;

const ContinueSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const CurrentStageInfo = styled.div`
  color: white;
  flex: 1;
`;

const CurrentStageTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CurrentStageDescription = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
`;

const ContinueButton = styled.button`
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(76, 175, 80, 0.3);
  }
`;

const StagesGrid = styled.div`
  margin-bottom: 3rem;
`;

const StagesTitle = styled.h2`
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
`;

const StagesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const CompletionSection = styled.div`
  display: flex;
  justify-content: center;
`;

const CompletionCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
`;

const CompletionIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const CompletionTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: #403E2D;
  margin-bottom: 1rem;
`;

const CompletionText = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ViewProfileButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  padding: 1.2rem 2rem;
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