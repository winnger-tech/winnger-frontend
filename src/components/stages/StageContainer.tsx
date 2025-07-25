'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import { useToast } from '../../context/ToastContext';
import { handleApiError, handleApiSuccess } from '../../utils/apiErrorHandler';
import StageService from '../../services/stageService';
import LoadingSpinner from '../common/LoadingSpinner';
import { Toast } from '../Toast';

// Import stage components
import Stage1RestaurantInfo from './stages/Stage1RestaurantInfo';
import Stage2RestaurantBanking from './stages/Stage2RestaurantBanking';
import Stage3RestaurantBusiness from './stages/Stage3RestaurantBusiness';
import Stage3RestaurantDocuments from './stages/Stage3RestaurantDocuments';
import Stage4RestaurantPlans from './stages/Stage4RestaurantPlans';
import Stage4RestaurantReview from './stages/Stage4RestaurantReview';
import Stage5RestaurantPayment from './stages/Stage5RestaurantPayment';
import Stage2PersonalDetails from './stages/Stage2PersonalDetails';
import Stage3VehicleInfo from './stages/Stage3VehicleInfo';
import Stage4DocumentUpload from './stages/Stage4DocumentUpload';
import Stage4BackgroundCheck from './stages/Stage4BackgroundCheck';
import Stage5ProfileReview from './stages/Stage5ProfileReview';
import Stage6Payment from './stages/Stage6Payment';

interface StageContainerProps {
  userType: 'driver' | 'restaurant';
  stageId?: number;
}

export default function StageContainer({ userType, stageId }: StageContainerProps) {
  const router = useRouter();
  const params = useParams();
  const { state, actions } = useDashboard();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [stageData, setStageData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any>({});

  // Store backend requiredFields for current stage
  const [requiredFields, setRequiredFields] = useState<string[]>([]);

  const currentStage = stageId || parseInt((params?.stage as string) || '1') || 1;

  console.log('🎯 StageContainer Debug:', {
    stageId,
    params,
    currentStage,
    userType,
    state: state
  });

  // Auto-save functionality
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleAutoSave = useCallback(async (data: any) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await actions.autoSave(currentStage, data);
        showInfo('Progress saved automatically');
      } catch (error) {
        console.warn('Auto-save failed:', error);
        handleApiError(error, showError, 'Failed to save progress automatically');
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [currentStage, actions, showInfo, showError]);

  // Fetch requiredFields from backend profile
  const fetchRequiredFields = useCallback(async () => {
    try {
      const profile = await StageService.getDashboard();
      if (profile?.data?.nextStage?.requiredFields) {
        setRequiredFields(profile.data.nextStage.requiredFields);
      } else {
        setRequiredFields([]);
      }
    } catch (error) {
      console.error('Failed to fetch required fields:', error);
      handleApiError(error, showError, 'Failed to load form requirements');
      setRequiredFields([]);
    }
  }, [showError]);

  // Fetch requiredFields on mount and when currentStage changes
  useEffect(() => {
    fetchRequiredFields();
  }, [fetchRequiredFields, currentStage]);

  // Auto-advance if all backend required fields are filled
  useEffect(() => {
    if (!loading && stageData && requiredFields.length > 0) {
      const allFilled = requiredFields.every((field: string) => {
        const value = stageData[field];
        return value !== undefined && value !== null && value !== '';
      });
      const maxStages = userType === 'driver' ? 6 : 5;
      if (allFilled && currentStage < maxStages) {
        router.replace(`/${userType}-registration-staged/stage/${currentStage + 1}`);
      }
    }
  }, [loading, stageData, requiredFields, currentStage, state.totalStages, router, userType]);

  // Load stage data
  const loadStageData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔧 Setting userType for StageService:', userType);
      // Set user type for StageService
      StageService.setUserType(userType);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Stage data load timeout')), 10000)
      );

      console.log('📡 Fetching stage data for stage:', currentStage);
      const dataPromise = StageService.getStageData(currentStage);
      
      const response = await Promise.race([dataPromise, timeoutPromise]) as any;
      console.log('✅ Stage data received:', response);
      setStageData(response.data.data || {});
    } catch (error) {
      console.warn('⚠️ Stage data load failed, using fallback:', error);
      handleApiError(error, showError, 'Failed to load stage data. Using saved progress.');
      
      // If server fails, try to get draft data
      try {
        console.log('📋 Attempting to load draft data for stage:', currentStage);
        const draftData = StageService.getDraft(currentStage);
        console.log('📋 Draft data result:', draftData);
        if (draftData) {
          setStageData(draftData);
        } else {
          setStageData({}); // Use empty data as fallback
          setError(null); // Don't show error, just use empty data
        }
      } catch (draftError) {
        console.warn('⚠️ Draft data load also failed:', draftError);
        setStageData({}); // Use empty data as fallback
        setError(null); // Don't show error, just use empty data
      }
    } finally {
      setLoading(false);
    }
  }, [currentStage, userType, showError]);

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
      handleApiSuccess('Stage completed successfully!', showSuccess);
      // Fetch latest profile to get new registrationStage and requiredFields
      await fetchRequiredFields();
      
      // Get the latest profile data to determine the correct next stage
      try {
        const profileResponse = await StageService.getProfile();
        console.log('📊 Profile response after submit:', profileResponse);
        
        if (profileResponse?.data?.driver?.registrationStage) {
          const nextRegistrationStage = profileResponse.data.driver.registrationStage;
          console.log('🔀 Next registration stage from API:', nextRegistrationStage);
          
          // Navigate to next stage
          const maxStages = userType === 'driver' ? 6 : 5;
          if (nextRegistrationStage <= maxStages) {
            console.log(`🔄 Navigating to next stage: ${nextRegistrationStage}`);
            router.push(`/${userType}-registration-staged/stage/${nextRegistrationStage}`);
          } else {
            console.log('🎉 Registration complete, navigating to success page');
            router.push(`/${userType}-registration-staged/success`);
          }
        } else {
          // Fallback navigation
          const nextStage = currentStage + 1;
          const maxStages = userType === 'driver' ? 6 : 5;
          if (nextStage <= maxStages) {
            console.log(`🔄 Fallback navigation to next stage: ${nextStage}`);
            router.push(`/${userType}-registration-staged/stage/${nextStage}`);
          } else {
            console.log('🎉 Registration complete, navigating to success page');
            router.push(`/${userType}-registration-staged/success`);
          }
        }
      } catch (profileError) {
        console.warn('⚠️ Profile fetch failed, using fallback navigation:', profileError);
        // Fallback navigation
        const nextStage = currentStage + 1;
        const maxStages = userType === 'driver' ? 6 : 5;
        if (nextStage <= maxStages) {
          console.log(`🔄 Fallback navigation to next stage: ${nextStage}`);
          router.push(`/${userType}-registration-staged/stage/${nextStage}`);
        } else {
          console.log('🎉 Registration complete, navigating to success page');
          router.push(`/${userType}-registration-staged/success`);
        }
      }
    } catch (error) {
      console.error('❌ Stage submission failed:', error);
      handleApiError(error, showError, 'Failed to save stage data');
      setValidationErrors(error.validationErrors || {});
    } finally {
      setSaving(false);
    }
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentStage > 1) {
      router.push(`/${userType}-registration-staged/stage/${currentStage - 1}`);
    } else {
      router.push(`/${userType}-dashboard-staged`);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    setError(null);

    try {
      await actions.skipStage(currentStage);
      handleApiSuccess('Stage skipped successfully!', showSuccess);
      
      // Navigate to next stage
      const nextStage = currentStage + 1;
      const maxStages = userType === 'driver' ? 6 : 5;
      if (nextStage <= maxStages) {
        router.push(`/${userType}-registration-staged/stage/${nextStage}`);
      } else {
        router.push(`/${userType}-registration-staged/success`);
      }
    } catch (error) {
      console.error('❌ Stage skip failed:', error);
      handleApiError(error, showError, 'Failed to skip stage');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    const nextStage = currentStage + 1;
    const maxStages = userType === 'driver' ? 6 : 5;
    if (nextStage <= maxStages) {
      router.push(`/${userType}-registration-staged/stage/${nextStage}`);
    } else {
      router.push(`/${userType}-registration-staged/success`);
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
          // Stage 1 is now Personal Information
          return (
            <Stage2PersonalDetails 
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
            <Stage2RestaurantBanking 
              data={stageData}
              onChange={handleFormChange}
              onSave={handleSubmit}
            />
          );
        } else {
          // Stage 2 is now Vehicle Information
          return (
            <Stage3VehicleInfo 
              data={stageData}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              loading={saving}
              errors={validationErrors}
              userType={userType}
            />
          );
        }
      case 3:
        if (userType === 'restaurant') {
          return (
            <Stage3RestaurantDocuments 
              data={stageData}
              onChange={handleFormChange}
              onSave={handleSubmit}
            />
          );
        } else {
          // Stage 3 is now Document Upload
          return <Stage4DocumentUpload />;
        }
      case 4:
        if (userType === 'restaurant') {
          return (
            <Stage4RestaurantReview 
              data={stageData}
              onChange={handleFormChange}
              onSave={handleSubmit}
            />
          );
        } else if (userType === 'driver') {
          // Stage 4 is now Banking & Consent
          return <Stage4BackgroundCheck />;
        }
        return <div>Stage 4 - Not available</div>;
      case 5:
        if (userType === 'restaurant') {
          return (
            <Stage5RestaurantPayment 
              data={stageData}
              onChange={handleFormChange}
              onSave={handleSubmit}
            />
          );
        } else if (userType === 'driver') {
          // Stage 5 is Profile Review (after payment completion)
          return <Stage5ProfileReview />;
        }
        return <div>Stage 5 - Not available</div>;
      case 6:
        if (userType === 'driver') {
          // Stage 6 is Payment for drivers
          return (
            <Stage6Payment 
              data={stageData}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              loading={saving}
              errors={validationErrors}
              userType={userType}
            />
          );
        }
        return <div>Stage 6 - Not available</div>;
      default:
        return <div>Stage not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {userType === 'driver' ? 'Driver Registration' : 'Restaurant Registration'}
              </h1>
              <p className="text-sm text-gray-400">
                Step {currentStage} of {userType === 'driver' ? 6 : 5}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentStage < (userType === 'driver' ? 6 : 5) && (
              <button
                onClick={handleSkip}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-900 border border-red-600 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="stage-content">
          {renderStageComponent()}
        </div>
      </div>
    </div>
  );
}

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #403E2D 0%, #2d2b1f 100%);
  padding: 110px 2rem 2rem 2rem;
  font-family: 'Space Grotesk', sans-serif;

  @media (max-width: 768px) {
    padding: 110px 1rem 1rem 1rem;
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
  disabled?: boolean;
}>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  ${props => {
    if (props.disabled) {
      return `
        background: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 0.5) !important;
        transform: none !important;
        box-shadow: none !important;
      `;
    }
    
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
