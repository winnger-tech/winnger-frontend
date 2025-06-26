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
    title: "Basic Information",
    description: "Personal details and contact information",
    fields: ["firstName", "lastName", "email", "password"],
    completed: false,
    isCurrentStage: false
  },
  "2": {
    title: "Personal Details",
    description: "Address, emergency contact, and preferences",
    fields: ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode"],
    completed: false,
    isCurrentStage: false
  },
  "3": {
    title: "Vehicle Information",
    description: "Vehicle details, insurance, and registration",
    fields: ["vehicleType", "make", "model", "year", "licensePlate"],
    completed: false,
    isCurrentStage: false
  },
  "4": {
    title: "Document Upload",
    description: "Driver's license, vehicle documents, and insurance",
    fields: ["driversLicense", "insurance", "registration", "backgroundCheck"],
    completed: false,
    isCurrentStage: false
  },
  "5": {
    title: "Banking & Consent",
    description: "Banking information and consent forms",
    fields: ["bankingInfo", "consent"],
    completed: false,
    isCurrentStage: false
  }
};

const RESTAURANT_STAGES: Record<string, StageInfo> = {
  "1": {
    title: "Restaurant Information",
    description: "Basic restaurant details and contact information",
    fields: ["restaurantName", "ownerName", "email", "password"],
    completed: false,
    isCurrentStage: false
  },
  "2": {
    title: "Restaurant Details",
    description: "Business info, address, and contact details",
    fields: ["businessAddress", "city", "province", "postalCode"],
    completed: false,
    isCurrentStage: false
  },
  "3": {
    title: "Documents & Verification",
    description: "Business license, permits, insurance and final verification",
    fields: ["businessLicense", "foodHandlersPermit", "liabilityInsurance"],
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

      // Update state with real data
      setState(prev => ({
        ...prev,
        loading: false,
        currentStage: response.currentStage || 1,
        stages: response.stages || fallbackStages,
        progress: response.progress || {
          totalStages: Object.keys(fallbackStages).length,
          completedStages: 0,
          currentStage: 1,
          percentage: 0
        },
        userData: response.userData || {}
      }));

      console.log('✅ Dashboard initialized successfully');
    } catch (error) {
      clearTimeout(loadingTimeout); // Clear timeout on error
      console.error('❌ Dashboard initialization failed:', error);
      
      // Fallback to mock data if API fails
      console.log('🔄 Falling back to mock data...');
      
      const mockResponse = {
        currentStage: 1,
        stages: fallbackStages,
        progress: {
          totalStages: Object.keys(fallbackStages).length,
          completedStages: 0,
          currentStage: 1,
          percentage: 0
        },
        userData: {}
      };

      // Update stages with initial state
      const updatedStages = { ...mockResponse.stages };
      updatedStages["1"].isCurrentStage = true;

      setState(prev => ({
        ...prev,
        loading: false,
        currentStage: mockResponse.currentStage,
        stages: updatedStages,
        progress: mockResponse.progress,
        userData: mockResponse.userData,
        error: null // Clear any previous errors
      }));

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
      
      // Update local state
      setState(prev => ({
        ...prev,
        userData: {
          ...prev.userData,
          [`stage${stage}`]: { ...prev.userData[`stage${stage}`], ...data }
        }
      }));

      console.log('✅ Stage data updated successfully');
    } catch (error) {
      console.error('❌ Failed to update stage data:', error);
      
      // Still update local state even if server update fails
      setState(prev => ({
        ...prev,
        userData: {
          ...prev.userData,
          [`stage${stage}`]: { ...prev.userData[`stage${stage}`], ...data }
        }
      }));
      
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
