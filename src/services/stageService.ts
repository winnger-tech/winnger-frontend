import ApiService from './api';

interface StageData {
  [key: string]: any;
}

interface DashboardResponse {
  currentStage: number;
  stages: Record<string, any>;
  progress: {
    totalStages: number;
    completedStages: number;
    currentStage: number;
    percentage: number;
  };
  userData: any;
}

class StageService {
  private userType: 'driver' | 'restaurant' | null = null;

  // Set user type for API endpoints
  setUserType(type: 'driver' | 'restaurant'): void {
    this.userType = type;
  }

  // Get dashboard data (profile)
  async getDashboard(): Promise<any> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    return ApiService.get(`/${this.userType}s-staged/profile`);
  }

  // Get specific stage data
  async getStageData(stage: number): Promise<StageData> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    return ApiService.get<StageData>(`/${this.userType}s-staged/stage/${stage}`);
  }

  // Update specific stage
  async updateStage(stage: number, data: StageData): Promise<any> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    // Send to the specific stage endpoint as per API documentation
    return ApiService.put(`/${this.userType}s-staged/stage/${stage}`, data);
  }

  // Get user profile
  async getProfile(): Promise<any> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    return ApiService.get(`/${this.userType}s-staged/profile`);
  }

  // Upload file for a stage
  async uploadFile(file: File, stage: number, fieldName: string, onProgress?: (progress: number) => void): Promise<any> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    const endpoint = `/${this.userType}s-staged/upload`;
    return ApiService.uploadFile(endpoint, file, onProgress);
  }

  // Auto-save draft data
  async saveDraft(stage: number, data: StageData): Promise<any> {
    // Save to sessionStorage for offline capability
    const key = `draft_${this.userType}_stage_${stage}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
    
    // Also attempt to save to server
    try {
      return await this.updateStage(stage, data);
    } catch (error) {
      console.warn('Auto-save to server failed, saved locally:', error);
      return { success: true, savedLocally: true };
    }
  }

  // Get draft data
  getDraft(stage: number): StageData | null {
    const key = `draft_${this.userType}_stage_${stage}`;
    if (typeof window !== 'undefined') {
      const draft = sessionStorage.getItem(key);
      return draft ? JSON.parse(draft) : null;
    }
    return null;
  }

  // Clear draft data
  clearDraft(stage: number): void {
    const key = `draft_${this.userType}_stage_${stage}`;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }

  // Clear all drafts
  clearAllDrafts(): void {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(`draft_${this.userType}_stage_`)) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }
}

export default new StageService();
