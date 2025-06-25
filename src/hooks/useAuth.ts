import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  ownerName?: string;
  email: string;
  type: 'driver' | 'restaurant';
  isRegistrationComplete: boolean;
  registrationStage: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Load user from storage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        setState(prev => ({ ...prev, isLoading: false, error: 'Failed to load user data' }));
      }
    };

    loadUserFromStorage();
  }, []);

  const login = useCallback(async (email: string, password: string, userType: 'driver' | 'restaurant') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Mock API call - replace with actual API when available
      console.log(`🔐 Mock Login: ${email} as ${userType}`);
      
      const mockUser: User = {
        id: 'mock-id-' + Date.now(),
        firstName: email.split('@')[0],
        lastName: 'User',
        ownerName: userType === 'restaurant' ? email.split('@')[0] + ' Restaurant' : undefined,
        email,
        type: userType,
        isRegistrationComplete: false,
        registrationStage: 1,
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

      setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user: mockUser };
    } catch (error) {
      const errorMessage = 'Login failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (data: {
    firstName: string;
    lastName: string;
    ownerName?: string;
    email: string;
    password: string;
    userType: 'driver' | 'restaurant';
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`📝 Mock Register:`, data);
      
      const mockUser: User = {
        id: 'mock-id-' + Date.now(),
        firstName: data.firstName,
        lastName: data.lastName,
        ownerName: data.ownerName,
        email: data.email,
        type: data.userType,
        isRegistrationComplete: false,
        registrationStage: 1,
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

      setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user: mockUser };
    } catch (error) {
      const errorMessage = 'Registration failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🚪 Logging out');
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const newUser = { ...prev.user, ...updatedUser };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      
      return {
        ...prev,
        user: newUser,
      };
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };
}
