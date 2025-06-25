import { useState, useEffect, useCallback } from 'react';

interface StageInfo {
  title: string;
  description: string;
  completed: boolean;
  isCurrentStage: boolean;
}

interface DashboardState {
  currentStage: number;
  stages: Record<string, StageInfo>;
  progress: {
    totalStages: number;
    completedStages: number;
    currentStage: number;
    percentage: number;
  };
  userData: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  autoSaving: boolean;
}

const MOCK_DRIVER_STAGES: Record<string, StageInfo> = {
  '1': { 
    title: 'Basic Information', 
    description: 'Personal details and contact information', 
    completed: false, 
    isCurrentStage: true 
  },
  '2': { 
    title: 'Personal Details', 
    description: 'Address, emergency contact, and preferences', 
    completed: false, 
    isCurrentStage: false 
  },
  '3': { 
    title: 'Vehicle Information', 
    description: 'Vehicle details, insurance, and registration', 
    completed: false, 
    isCurrentStage: false 
  },
  '4': { 
    title: 'Document Upload', 
    description: 'Driver license, vehicle documents, and insurance', 
    completed: false, 
    isCurrentStage: false 
  },
  '5': { 
    title: 'Background Check & Final Steps', 
    description: 'Background verification and final approval', 
    completed: false, 
    isCurrentStage: false 
  },
};

const MOCK_RESTAURANT_STAGES: Record<string, StageInfo> = {
  '1': { 
    title: 'Restaurant Information', 
    description: 'Basic restaurant details and contact information', 
    completed: false, 
    isCurrentStage: true 
  },
  '2': { 
    title: 'Restaurant Details', 
    description: 'Cuisine type, description, and operational details', 
    completed: false, 
    isCurrentStage: false 
  },
  '3': { 
    title: 'Documents & Verification', 
    description: 'Business license, permits, and insurance documents', 
    completed: false, 
    isCurrentStage: false 
  },
};

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    currentStage: 1,
    stages: {},
    progress: {
      totalStages: 0,
      completedStages: 0,
      currentStage: 1,
      percentage: 0,
    },
    userData: {},
    isLoading: true,
    error: null,
    autoSaving: false,
  });

  const loadDashboard = useCallback(async (userType: 'driver' | 'restaurant') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`📊 Loading dashboard for ${userType}`);
      
      // Mock data based on user type
      const stages = userType === 'driver' ? MOCK_DRIVER_STAGES : MOCK_RESTAURANT_STAGES;
      const totalStages = Object.keys(stages).length;
      
      // Load saved user data from localStorage
      const savedDataKey = `${userType}_registration_data`;
      const savedData = localStorage.getItem(savedDataKey);
      const userData = savedData ? JSON.parse(savedData) : {};
      
      // Calculate progress based on saved data
      let completedStages = 0;
      let currentStage = 1;
      
      // Update stage completion based on saved data
      const updatedStages = { ...stages };
      Object.keys(updatedStages).forEach(stageKey => {
        const stageNum = parseInt(stageKey);
        const stageData = userData[`stage${stageNum}`];
        
        if (stageData && Object.keys(stageData).length > 0) {
          updatedStages[stageKey] = { ...updatedStages[stageKey], completed: true };
          completedStages++;
          if (stageNum >= currentStage) {
            currentStage = Math.min(stageNum + 1, totalStages);
          }
        }
        
        // Set current stage indicator
        updatedStages[stageKey] = { 
          ...updatedStages[stageKey], 
          isCurrentStage: parseInt(stageKey) === currentStage 
        };
      });

      const percentage = Math.round((completedStages / totalStages) * 100);

      setState({
        currentStage,
        stages: updatedStages,
        progress: {
          totalStages,
          completedStages,
          currentStage,
          percentage,
        },
        userData,
        isLoading: false,
        error: null,
        autoSaving: false,
      });
      
      console.log(`✅ Dashboard loaded: ${completedStages}/${totalStages} stages completed (${percentage}%)`);
    } catch (error) {
      console.error('Dashboard load failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load dashboard data',
      }));
    }
  }, []);

  const updateStageData = useCallback(async (stage: number, data: Record<string, any>) => {
    console.log(`💾 Updating stage ${stage} data:`, data);
    
    setState(prev => {
      const newUserData = { ...prev.userData, [`stage${stage}`]: data };
      
      // Save to localStorage
      const userType = Object.keys(prev.stages).length === 5 ? 'driver' : 'restaurant';
      const savedDataKey = `${userType}_registration_data`;
      localStorage.setItem(savedDataKey, JSON.stringify(newUserData));

      // Update stage completion status
      const newStages = { ...prev.stages };
      if (newStages[stage]) {
        newStages[stage] = { ...newStages[stage], completed: true };
      }

      // Update current stage to next incomplete stage
      let nextStage = stage + 1;
      if (nextStage <= prev.progress.totalStages) {
        Object.keys(newStages).forEach(key => {
          newStages[key] = { 
            ...newStages[key], 
            isCurrentStage: parseInt(key) === nextStage 
          };
        });
      }

      // Recalculate progress
      const completedStages = Object.values(newStages).filter(s => s.completed).length;
      const percentage = Math.round((completedStages / prev.progress.totalStages) * 100);

      return {
        ...prev,
        currentStage: Math.min(nextStage, prev.progress.totalStages),
        userData: newUserData,
        stages: newStages,
        progress: {
          ...prev.progress,
          completedStages,
          currentStage: Math.min(nextStage, prev.progress.totalStages),
          percentage,
        },
      };
    });
  }, []);

  const goToStage = useCallback((stage: number) => {
    console.log(`🎯 Navigating to stage ${stage}`);
    
    setState(prev => {
      // Update current stage indicators
      const newStages = { ...prev.stages };
      Object.keys(newStages).forEach(key => {
        newStages[key] = { 
          ...newStages[key], 
          isCurrentStage: parseInt(key) === stage 
        };
      });

      return {
        ...prev,
        currentStage: stage,
        stages: newStages,
        progress: {
          ...prev.progress,
          currentStage: stage,
        },
      };
    });
  }, []);

  const autoSave = useCallback((stage: number, data: Record<string, any>) => {
    setState(prev => ({ ...prev, autoSaving: true }));
    
    // Debounced auto-save to sessionStorage
    const timeoutId = setTimeout(() => {
      const key = `draft_stage_${stage}`;
      sessionStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Auto-saved stage ${stage} draft`);
      
      setState(prev => ({ ...prev, autoSaving: false }));
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      setState(prev => ({ ...prev, autoSaving: false }));
    };
  }, []);

  const initializeDashboard = useCallback(async (userType: 'driver' | 'restaurant') => {
    await loadDashboard(userType);
  }, [loadDashboard]);

  return {
    ...state,
    loadDashboard,
    initializeDashboard,
    updateStageData,
    goToStage,
    autoSave,
  };
}
