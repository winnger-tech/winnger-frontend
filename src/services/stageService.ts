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
    
    if (this.userType === 'restaurant') {
      // Try progress endpoint first, then fallback to profile
      try {
        const progressResponse = await ApiService.get('/restaurants/progress');
        console.log('Restaurant progress response:', progressResponse);
        return progressResponse;
      } catch (error) {
        console.log('Progress endpoint failed, trying profile endpoint:', error);
        const profileResponse = await ApiService.get('/restaurants/profile');
        console.log('Restaurant profile response:', profileResponse);
        return profileResponse;
      }
    } else {
      return ApiService.get(`/${this.userType}s-staged/profile`);
    }
  }

  // Get specific stage data
  async getStageData(stage: number): Promise<StageData> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    
    if (this.userType === 'restaurant') {
      // For restaurants, get profile data and extract stage-specific data
      const profile = await ApiService.get('/restaurants/profile');
      return { data: { data: profile.data?.restaurant || {} } };
    } else {
      return ApiService.get<StageData>(`/${this.userType}s-staged/stage/${stage}`);
    }
  }

  // Update specific stage
  async updateStage(stage: number, data: StageData): Promise<any> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    
    if (this.userType === 'restaurant') {
      // Map restaurant stages to API endpoints
      switch (stage) {
        case 1:
          return ApiService.put('/restaurants/step1', data);
        case 2:
          return ApiService.put('/restaurants/step2', data);
        case 3:
          return ApiService.put('/restaurants/step3', data);
        case 4:
          return ApiService.put('/restaurants/step4', data);
        case 5:
          return ApiService.put('/restaurants/step5', data);
        default:
          throw new Error(`Invalid stage ${stage} for restaurant`);
      }
    } else {
      // Send to the specific stage endpoint as per API documentation
      return ApiService.put(`/${this.userType}s-staged/stage/${stage}`, data);
    }
  }

  // Get user profile
  async getProfile(): Promise<any> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    
    if (this.userType === 'restaurant') {
      return ApiService.get('/restaurants/profile');
    } else {
      return ApiService.get(`/${this.userType}s-staged/profile`);
    }
  }

  // Get registration progress
  async getProgress(): Promise<any> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    
    if (this.userType === 'restaurant') {
      return ApiService.get('/restaurants/progress');
    } else {
      return ApiService.get(`/${this.userType}s-staged/progress`);
    }
  }

  // Upload file for a stage
  async uploadFile(file: File, stage: number, fieldName: string, onProgress?: (progress: number) => void): Promise<any> {
    if (!this.userType) {
      throw new Error('User type not set');
    }
    
    if (this.userType === 'restaurant') {
      // For restaurants, we need to handle file uploads differently
      // Since the API expects URLs, we might need to upload to S3 first
      const endpoint = '/restaurants/upload';
      return ApiService.uploadFile(endpoint, file, onProgress);
    } else {
      const endpoint = `/${this.userType}s-staged/upload`;
      return ApiService.uploadFile(endpoint, file, onProgress);
    }
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
