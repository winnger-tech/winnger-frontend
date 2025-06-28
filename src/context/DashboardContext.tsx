'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import StageService from '../services/stageService';

// Enhanced dashboard state to match the API guide
interface DashboardState {
  currentStage: number;
  totalStages: number;
  userData: any;
  loading: boolean;
  error: string | null;
  autoSaving: boolean;
  stages: Record<string, StageInfo>;
  progress: {
    totalStages: number;
    completedStages: number;
    currentStage: number;
    percentage: number;
  };
}

// Stage info structure matching the API guide
interface StageInfo {
  title: string;
  description: string;
  fields: string[];
  completed: boolean;
  isCurrentStage: boolean;
}

// Enhanced dashboard actions
interface DashboardActions {
  initializeDashboard: (userType: 'driver' | 'restaurant') => Promise<void>;
  navigateToStage: (stage: number) => void;
  updateStageData: (stage: number, data: any) => Promise<void>;
  autoSave: (stage: number, data: any) => Promise<void>;
  getStageData: (stage: number) => Promise<any>;
}

// Stage configurations for fallback
const DRIVER_STAGES: Record<string, StageInfo> = {
  "1": {
    title: "Personal Information",
    description: "Personal details and contact information",
    fields: ["firstName", "lastName", "dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode"],
    completed: false,
    isCurrentStage: false
  },
  "2": {
    title: "Vehicle Information",
    description: "Vehicle details, insurance, and registration",
    fields: ["vehicleType", "make", "model", "year", "licensePlate"],
    completed: false,
    isCurrentStage: false
  },
  "3": {
    title: "Document Upload",
    description: "Driver's license, vehicle documents, and insurance",
    fields: ["driversLicense", "insurance", "registration", "backgroundCheck"],
    completed: false,
    isCurrentStage: false
  },
  "4": {
    title: "Banking & Consent",
    description: "Banking information and consent forms",
    fields: ["bankingInfo", "consent"],
    completed: false,
    isCurrentStage: false
  },
  "5": {
    title: "Profile Review",
    description: "Review complete registration information",
    fields: ["profileReview", "finalSubmission"],
    completed: false,
    isCurrentStage: false
  }
};

const RESTAURANT_STAGES: Record<string, StageInfo> = {
  "1": {
    title: "Restaurant Information",
    description: "Basic restaurant details and contact information",
    fields: ["restaurantName", "businessEmail", "businessPhone", "restaurantAddress", "city", "province", "postalCode", "businessType"],
    completed: false,
    isCurrentStage: false
  },
  "2": {
    title: "Banking Information",
    description: "Provide your banking details and HST number for payment processing",
    fields: ["bankingInfo", "HSTNumber"],
    completed: false,
    isCurrentStage: false
  },
  "3": {
    title: "Business Documents",
    description: "Upload required business documents and set expiry dates for compliance",
    fields: ["drivingLicenseUrl", "voidChequeUrl", "HSTdocumentUrl", "foodHandlingCertificateUrl", "articleofIncorporation", "articleofIncorporationExpiryDate", "foodSafetyCertificateExpiryDate"],
    completed: false,
    isCurrentStage: false
  },
  "4": {
    title: "Review & Confirmation",
    description: "Review your information and confirm your registration details",
    fields: ["agreedToTerms", "confirmationChecked", "additionalNotes"],
    completed: false,
    isCurrentStage: false
  },
  "5": {
    title: "Payment Processing",
    description: "Complete your registration fee payment to finalize your account",
    fields: ["paymentIntentId", "stripePaymentMethodId", "paymentCompleted"],
    completed: false,
    isCurrentStage: false
  }
};

// Context
const DashboardContext = createContext<{
  state: DashboardState;
  actions: DashboardActions;
} | null>(null);

// Provider component
export function DashboardProvider({ 
  children, 
  userType 
}: { 
  children: React.ReactNode;
  userType: 'driver' | 'restaurant';
}) {
  const fallbackStages = userType === 'driver' ? DRIVER_STAGES : RESTAURANT_STAGES;
  
  const [state, setState] = useState<DashboardState>({
    currentStage: 1,
    totalStages: Object.keys(fallbackStages).length,
    userData: {},
    loading: false,
    error: null,
    autoSaving: false,
    stages: fallbackStages,
    progress: {
      totalStages: Object.keys(fallbackStages).length,
      completedStages: 0,
      currentStage: 1,
      percentage: 0
    }
  });

  // API service calls using real StageService - memoized with useCallback
  const initializeDashboard = useCallback(async (type: 'driver' | 'restaurant') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setState(prev => ({ ...prev, loading: false, error: 'Loading timeout - please try again' }));
    }, 20000); // 20 second timeout
    
    try {
      console.log(`🔄 Initializing ${type} dashboard...`);
      
      // Set user type in StageService
      StageService.setUserType(type);
      
      // Get real dashboard data from API
      const response = await StageService.getDashboard();
      
      clearTimeout(loadingTimeout); // Clear timeout on success
      console.log('📊 Dashboard response:', response);

      // Process stages and calculate completion status
      const processedStages = { ...fallbackStages };
      const userData = response.userData || response.data || {};
      
      // Update stages based on user data
      Object.keys(processedStages).forEach(stageNum => {
        const stageData = userData[`stage${stageNum}`] || {};
        const stageFields = processedStages[stageNum].fields;
        
        // Check if stage is completed based on required fields
        const isCompleted = stageFields.every(field => {
          if (field === 'bankingInfo') {
            return stageData.bankingInfo && 
                   stageData.bankingInfo.transitNumber && 
                   stageData.bankingInfo.institutionNumber && 
                   stageData.bankingInfo.accountNumber;
          }
          // Handle document URL fields
          if (field.endsWith('Url') || field === 'articleofIncorporation') {
            return stageData[field] && stageData[field] !== '';
          }
          // Handle date fields
          if (field.endsWith('ExpiryDate')) {
            return stageData[field] && stageData[field] !== '';
          }
          // Handle stage 4 fields (Review & Confirmation)
          if (field === 'agreedToTerms') {
            return stageData[field] === true;
          }
          if (field === 'confirmationChecked') {
            return stageData[field] === true;
          }
          if (field === 'additionalNotes') {
            // Additional notes is optional, so always return true
            return true;
          }
          // Handle stage 5 fields (Payment Processing)
          if (field === 'paymentIntentId') {
            return stageData[field] && stageData[field] !== '';
          }
          if (field === 'stripePaymentMethodId') {
            return stageData[field] && stageData[field] !== '';
          }
          if (field === 'paymentCompleted') {
            return stageData[field] === true;
          }
          // Handle legacy stage 4 fields (for backward compatibility)
          if (field === 'selectedPlan') {
            return stageData[field] && stageData[field] !== '';
          }
          return stageData[field] && stageData[field] !== '';
        });
        
        processedStages[stageNum] = {
          ...processedStages[stageNum],
          completed: isCompleted,
          isCurrentStage: parseInt(stageNum) === (response.currentStage || 1)
        };
      });

      // Calculate progress
      const totalStages = Object.keys(processedStages).length;
      const completedStages = Object.values(processedStages).filter(stage => stage.completed).length;
      const currentStage = response.currentStage || 1;
      const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

      // Update state with real data
      setState(prev => {
        const newState = {
          ...prev,
          loading: false,
          currentStage: currentStage,
          totalStages: totalStages,
          stages: processedStages,
          progress: {
            totalStages: totalStages,
            completedStages: completedStages,
            currentStage: currentStage,
            percentage: percentage
          },
          userData: userData
        };
        
        console.log('✅ Dashboard state updated:', {
          currentStage: newState.currentStage,
          totalStages: newState.totalStages,
          completedStages: newState.progress.completedStages,
          percentage: newState.progress.percentage
        });
        
        return newState;
      });

      console.log('✅ Dashboard initialized successfully');
    } catch (error) {
      clearTimeout(loadingTimeout); // Clear timeout on error
      console.error('❌ Dashboard initialization failed:', error);
      
      // Fallback to mock data if API fails
      console.log('🔄 Falling back to mock data...');
      
      // Update stages with initial state
      const updatedStages = { ...fallbackStages };
      updatedStages["1"].isCurrentStage = true;

      const totalStages = Object.keys(updatedStages).length;
      const completedStages = 0;
      const currentStage = 1;
      const percentage = 0;

      setState(prev => {
        const newState = {
          ...prev,
          loading: false,
          currentStage: currentStage,
          totalStages: totalStages,
          stages: updatedStages,
          progress: {
            totalStages: totalStages,
            completedStages: completedStages,
            currentStage: currentStage,
            percentage: percentage
          },
          userData: {},
          error: null // Clear any previous errors
        };
        
        console.log('✅ Dashboard initialized with fallback data:', {
          currentStage: newState.currentStage,
          totalStages: newState.totalStages,
          completedStages: newState.progress.completedStages,
          percentage: newState.progress.percentage
        });
        
        return newState;
      });

      console.log('✅ Dashboard initialized with fallback data');
    }
  }, [fallbackStages]);

  const navigateToStage = useCallback((stage: number) => {
    setState(prev => ({
      ...prev,
      currentStage: stage
    }));
  }, []);

  const updateStageData = useCallback(async (stage: number, data: any): Promise<void> => {
    try {
      console.log(`💾 Updating stage ${stage} data:`, data);
      
      // Update stage data using StageService
      await StageService.updateStage(stage, data);
      
      // Update local state and recalculate progress
      setState(prev => {
        const updatedUserData = {
          ...prev.userData,
          [`stage${stage}`]: { ...prev.userData[`stage${stage}`], ...data }
        };

        // Recalculate stage completion status
        const updatedStages = { ...prev.stages };
        const stageFields = updatedStages[stage.toString()]?.fields || [];
        
        // Check if stage is completed based on required fields
        const isCompleted = stageFields.every(field => {
          if (field === 'bankingInfo') {
            return data.bankingInfo && 
                   data.bankingInfo.transitNumber && 
                   data.bankingInfo.institutionNumber && 
                   data.bankingInfo.accountNumber;
          }
          // Handle document URL fields
          if (field.endsWith('Url') || field === 'articleofIncorporation') {
            return data[field] && data[field] !== '';
          }
          // Handle date fields
          if (field.endsWith('ExpiryDate')) {
            return data[field] && data[field] !== '';
          }
          // Handle stage 4 fields (Review & Confirmation)
          if (field === 'agreedToTerms') {
            return data[field] === true;
          }
          if (field === 'confirmationChecked') {
            return data[field] === true;
          }
          if (field === 'additionalNotes') {
            // Additional notes is optional, so always return true
            return true;
          }
          // Handle stage 5 fields (Payment Processing)
          if (field === 'paymentIntentId') {
            return data[field] && data[field] !== '';
          }
          if (field === 'stripePaymentMethodId') {
            return data[field] && data[field] !== '';
          }
          if (field === 'paymentCompleted') {
            return data[field] === true;
          }
          // Handle legacy stage 4 fields (for backward compatibility)
          if (field === 'selectedPlan') {
            return data[field] && data[field] !== '';
          }
          return data[field] && data[field] !== '';
        });
        
        updatedStages[stage.toString()] = {
          ...updatedStages[stage.toString()],
          completed: isCompleted
        };

        // Recalculate progress
        const totalStages = Object.keys(updatedStages).length;
        const completedStages = Object.values(updatedStages).filter(stage => stage.completed).length;
        const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

        return {
          ...prev,
          userData: updatedUserData,
          stages: updatedStages,
          progress: {
            ...prev.progress,
            completedStages: completedStages,
            percentage: percentage
          }
        };
      });

      console.log('✅ Stage data updated successfully');
    } catch (error) {
      console.error('❌ Failed to update stage data:', error);
      
      // Still update local state even if server update fails
      setState(prev => {
        const updatedUserData = {
          ...prev.userData,
          [`stage${stage}`]: { ...prev.userData[`stage${stage}`], ...data }
        };

        // Recalculate stage completion status
        const updatedStages = { ...prev.stages };
        const stageFields = updatedStages[stage.toString()]?.fields || [];
        
        // Check if stage is completed based on required fields
        const isCompleted = stageFields.every(field => {
          if (field === 'bankingInfo') {
            return data.bankingInfo && 
                   data.bankingInfo.transitNumber && 
                   data.bankingInfo.institutionNumber && 
                   data.bankingInfo.accountNumber;
          }
          // Handle document URL fields
          if (field.endsWith('Url') || field === 'articleofIncorporation') {
            return data[field] && data[field] !== '';
          }
          // Handle date fields
          if (field.endsWith('ExpiryDate')) {
            return data[field] && data[field] !== '';
          }
          // Handle stage 4 fields (Review & Confirmation)
          if (field === 'agreedToTerms') {
            return data[field] === true;
          }
          if (field === 'confirmationChecked') {
            return data[field] === true;
          }
          if (field === 'additionalNotes') {
            // Additional notes is optional, so always return true
            return true;
          }
          // Handle stage 5 fields (Payment Processing)
          if (field === 'paymentIntentId') {
            return data[field] && data[field] !== '';
          }
          if (field === 'stripePaymentMethodId') {
            return data[field] && data[field] !== '';
          }
          if (field === 'paymentCompleted') {
            return data[field] === true;
          }
          // Handle legacy stage 4 fields (for backward compatibility)
          if (field === 'selectedPlan') {
            return data[field] && data[field] !== '';
          }
          return data[field] && data[field] !== '';
        });
        
        updatedStages[stage.toString()] = {
          ...updatedStages[stage.toString()],
          completed: isCompleted
        };

        // Recalculate progress
        const totalStages = Object.keys(updatedStages).length;
        const completedStages = Object.values(updatedStages).filter(stage => stage.completed).length;
        const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

        return {
          ...prev,
          userData: updatedUserData,
          stages: updatedStages,
          progress: {
            ...prev.progress,
            completedStages: completedStages,
            percentage: percentage
          }
        };
      });
      
      console.log('✅ Stage data updated locally (server update failed)');
      
      // Don't throw error to prevent UI from hanging
      // throw error;
    }
  }, []);

  const autoSave = useCallback(async (stage: number, data: any) => {
    setState(prev => ({ ...prev, autoSaving: true }));
    
    try {
      // Use StageService auto-save functionality
      await StageService.saveDraft(stage, data);
      
      console.log(`💾 Auto-saved stage ${stage} data`);
    } catch (error) {
      console.warn('⚠️ Auto-save failed:', error);
    } finally {
      setState(prev => ({ ...prev, autoSaving: false }));
    }
  }, []);

  const getStageData = useCallback(async (stage: number) => {
    try {
      console.log(`📖 Getting stage ${stage} data`);
      
      // Try to get data from server first
      const response = await StageService.getStageData(stage);
      return response.data || {};
    } catch (error) {
      console.warn('⚠️ Server data fetch failed, trying local draft:', error);
      
      // Fallback to local draft data
      // Ensure userType is set before calling getDraft
      StageService.setUserType(userType);
      const draftData = StageService.getDraft(stage);
      return draftData || {};
    }
  }, [userType]);

  const actions: DashboardActions = {
    initializeDashboard,
    navigateToStage,
    updateStageData,
    autoSave,
    getStageData
  };

  return (
    <DashboardContext.Provider value={{ state, actions }}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook to use dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
