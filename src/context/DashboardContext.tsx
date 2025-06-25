'use client';

import { createContext, useContext, useState, useEffect } from 'react';

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

  // API service calls (mock for now, will use real API)
  const initializeDashboard = async (type: 'driver' | 'restaurant') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Mock API call - replace with real StageService call
      console.log(`🔄 Initializing ${type} dashboard...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful response matching the API guide
      const mockResponse = {
        currentStage: 2,
        stages: type === 'driver' ? DRIVER_STAGES : RESTAURANT_STAGES,
        progress: {
          totalStages: Object.keys(type === 'driver' ? DRIVER_STAGES : RESTAURANT_STAGES).length,
          completedStages: 1,
          currentStage: 2,
          percentage: type === 'driver' ? 20 : 33
        },
        userData: {
          stage1: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
          stage2: {}
        }
      };

      // Update stages with completion status
      const updatedStages = { ...mockResponse.stages };
      updatedStages["1"].completed = true;
      updatedStages["2"].isCurrentStage = true;

      setState(prev => ({
        ...prev,
        loading: false,
        currentStage: mockResponse.currentStage,
        stages: updatedStages,
        progress: mockResponse.progress,
        userData: mockResponse.userData
      }));

      console.log('✅ Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  const navigateToStage = (stage: number) => {
    setState(prev => ({
      ...prev,
      currentStage: stage
    }));
  };

  const updateStageData = async (stage: number, data: any): Promise<void> => {
    try {
      // Mock API call for updating stage data
      console.log(`💾 Updating stage ${stage} data:`, data);
      
      setState(prev => ({
        ...prev,
        userData: {
          ...prev.userData,
          [`stage${stage}`]: { ...prev.userData[`stage${stage}`], ...data }
        }
      }));

      // Return void instead of { success: true }
    } catch (error) {
      console.error('❌ Failed to update stage data:', error);
      throw error;
    }
  };

  const autoSave = async (stage: number, data: any) => {
    setState(prev => ({ ...prev, autoSaving: true }));
    
    try {
      // Auto-save with debouncing
      await new Promise(resolve => setTimeout(resolve, 500));
      await updateStageData(stage, data);
      
      console.log(`💾 Auto-saved stage ${stage} data`);
    } catch (error) {
      console.warn('⚠️ Auto-save failed:', error);
    } finally {
      setState(prev => ({ ...prev, autoSaving: false }));
    }
  };

  const getStageData = async (stage: number) => {
    try {
      // Mock API call for getting stage data
      console.log(`📖 Getting stage ${stage} data`);
      return state.userData[`stage${stage}`] || {};
    } catch (error) {
      console.error('❌ Failed to get stage data:', error);
      throw error;
    }
  };

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
