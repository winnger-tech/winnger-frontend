'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import StageService from '../../services/stageService';
import LoadingSpinner from '../common/LoadingSpinner';
import { Toast } from '../Toast';

// Import stage components
import Stage1BasicInfo from './stages/Stage1BasicInfo';
import Stage1RestaurantInfo from './stages/Stage1RestaurantInfo';
import Stage2RestaurantDetails from './stages/Stage2RestaurantDetails';
import Stage2DriverDetails from './stages/Stage2DriverDetails';
import Stage3VehicleInfo from './stages/Stage3VehicleInfo';
import Stage3RestaurantDocuments from './stages/Stage3RestaurantDocuments';
import Stage4DocumentUpload from './stages/Stage4DocumentUpload';
import Stage5BackgroundCheck from './stages/Stage5BackgroundCheck';

interface StageContainerProps {
  userType: 'driver' | 'restaurant';
  stageId?: number;
}

export default function StageContainer({ userType, stageId }: StageContainerProps) {
  const router = useRouter();
  const params = useParams();
  const { state, actions } = useDashboard();
  
  const [stageData, setStageData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});

  const currentStage = stageId || parseInt((params?.stage as string) || '1') || 1;

  // Auto-save functionality
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleAutoSave = useCallback(async (data: any) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await actions.autoSave(currentStage, data);
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [currentStage, actions]);

  // Load stage data
  const loadStageData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First try to get data from server
      const response = await StageService.getStageData(currentStage);
      setStageData(response.data.data || {});
    } catch (error) {
      // If server fails, try to get draft data
      const draftData = StageService.getDraft(currentStage);
      if (draftData) {
        setStageData(draftData);
      } else {
        setError(error instanceof Error ? error.message : 'Failed to load stage data');
      }
    } finally {
      setLoading(false);
    }
  }, [currentStage]);

  useEffect(() => {
    loadStageData();
  }, [loadStageData]);

  // Handle form data changes
  const handleFormChange = (newData: any) => {
    setStageData((prev: any) => ({ ...prev, ...newData }));
    handleAutoSave({ ...stageData, ...newData });
    
    // Clear validation errors for changed fields
    const changedFields = Object.keys(newData);
    setValidationErrors((prev: any) => {
      const updated = { ...prev };
      changedFields.forEach(field => {
        delete updated[field];
      });
      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = async (data: any) => {
    setSaving(true);
    setError(null);
    setValidationErrors({});

    try {
      await actions.updateStageData(currentStage, data);
      setShowSaveToast(true);
      
      // Navigate to next stage or dashboard
      const nextStage = currentStage + 1;
      if (nextStage <= state.progress.totalStages) {
        setTimeout(() => {
          router.push(`/${userType}-registration/stage/${nextStage}`);
        }, 1000);
      } else {
        setTimeout(() => {
          router.push(`/${userType}-dashboard-staged`);
        }, 1000);
      }
    } catch (error: any) {
      if (error.errors) {
        setValidationErrors(error.errors);
      } else {
        setError(error.message || 'Failed to save stage data');
      }
    } finally {
      setSaving(false);
    }
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentStage > 1) {
      router.push(`/${userType}-registration/stage/${currentStage - 1}`);
    } else {
      router.push(`/${userType}-dashboard-staged`);
    }
  };

  const handleSkip = () => {
    const nextStage = currentStage + 1;
    if (nextStage <= state.progress.totalStages) {
      router.push(`/${userType}-registration/stage/${nextStage}`);
    } else {
      router.push(`/${userType}-dashboard-staged`);
    }
  };

  const handleNext = () => {
    const nextStage = currentStage + 1;
    if (nextStage <= state.progress.totalStages) {
      router.push(`/${userType}-registration-staged/stage/${nextStage}`);
    } else {
      router.push(`/${userType}-dashboard-staged`);
    }
  };

  const handlePrevious = () => {
    if (currentStage > 1) {
      router.push(`/${userType}-registration-staged/stage/${currentStage - 1}`);
    } else {
      router.push(`/${userType}-dashboard-staged`);
    }
  };

  // Render stage component
  const renderStageComponent = () => {
    switch (currentStage) {
      case 1:
        if (userType === 'restaurant') {
          return (
            <Stage1RestaurantInfo 
              data={stageData}
              onChange={handleFormChange}
              onSave={handleSubmit}
            />
          );
        } else {
          return (
            <Stage1BasicInfo 
              data={stageData}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              loading={saving}
              errors={validationErrors}
              userType={userType}
            />
          );
        }
      case 2:
        if (userType === 'restaurant') {
          return (
            <Stage2RestaurantDetails 
              data={stageData}
              onChange={handleFormChange}
              onSave={handleSubmit}
            />
          );
        } else {
          return (
            <Stage2DriverDetails 
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          );
        }
      case 3:
        if (userType === 'restaurant') {
          return <Stage3RestaurantDocuments />;
        } else {
          return (
            <Stage3VehicleInfo 
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          );
        }
      case 4:
        if (userType === 'driver') {
          return <Stage4DocumentUpload />;
        }
        return <div>Stage 4 - Not available for restaurants</div>;
      case 5:
        if (userType === 'driver') {
          return <Stage5BackgroundCheck />;
        }
        return <div>Stage 5 - Not available for restaurants</div>;
      case 5:
        return <div>Stage 5 - {userType === 'restaurant' ? 'Payment & Pricing' : 'Banking'} (Coming Soon)</div>;
      default:
        return <div>Stage not found</div>;
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingWrapper>
          <LoadingSpinner size="large" />
          <LoadingText>Loading stage data...</LoadingText>
        </LoadingWrapper>
      </Container>
    );
  }

  return (
    <>
      <Toast
        message="Stage saved successfully!"
        type="success"
        isVisible={showSaveToast}
        onClose={() => setShowSaveToast(false)}
      />
      
      <Container>
        <StageHeader
          as={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <BackButton onClick={handleBack}>
            ← Back
          </BackButton>
          
          <StageInfo>
            <StageTitle>
              Stage {currentStage}: {state.stages[currentStage]?.title}
            </StageTitle>
            <StageDescription>
              {state.stages[currentStage]?.description}
            </StageDescription>
          </StageInfo>

          <StageProgress>
            {currentStage} of {state.progress.totalStages}
          </StageProgress>
        </StageHeader>

        {error && (
          <ErrorMessage
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
            <RetryButton onClick={loadStageData}>
              Retry
            </RetryButton>
          </ErrorMessage>
        )}

        <StageContent
          as={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {renderStageComponent()}
        </StageContent>

        <StageNavigation
          as={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <NavButton onClick={handleBack} variant="secondary">
            Previous
          </NavButton>
          
          <NavButton onClick={handleSkip} variant="outline">
            Skip for Now
          </NavButton>
        </StageNavigation>

        {state.autoSaving && (
          <AutoSaveIndicator
            as={motion.div}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            💾 Auto-saving...
          </AutoSaveIndicator>
        )}
      </Container>
    </>
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

const StageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
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

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const StageInfo = styled.div`
  flex: 1;
  text-align: center;
  color: white;
`;

const StageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StageDescription = styled.p`
  font-size: 1.1rem;
  opacity: 0.8;
  margin: 0;
`;

const StageProgress = styled.span`
  background: rgba(255, 195, 43, 0.2);
  color: #ffc32b;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  padding: 1rem 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const RetryButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ff5252;
  }
`;

const StageContent = styled.div`
  margin-bottom: 3rem;
`;

const StageNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NavButton = styled.button<{
  variant: 'primary' | 'secondary' | 'outline';
}>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
          color: #403E2D;
          
          &:hover {
            box-shadow: 0 10px 25px rgba(255, 195, 43, 0.3);
            transform: translateY(-2px);
          }
        `;
      case 'secondary':
        return `
          background: rgba(255, 255, 255, 0.2);
          color: white;
          
          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          
          &:hover {
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
          }
        `;
    }
  }}
`;

const AutoSaveIndicator = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(255, 195, 43, 0.9);
  color: #403E2D;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(255, 195, 43, 0.3);
`;
