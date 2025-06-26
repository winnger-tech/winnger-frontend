import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  loginRestaurant, 
  loginDriver, 
  registerRestaurant, 
  registerDriver, 
  logout, 
  loadUserFromStorage,
  refreshAuthToken,
  clearError,
  updateUser
} from '../store/slices/authSlice';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RestaurantRegisterCredentials {
  ownerName: string;
  email: string;
  password: string;
}

interface DriverRegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  // Load user data on mount only once
  useEffect(() => {
    let mounted = true;
    
    if (!authState.isAuthenticated && !authState.isLoading && typeof window !== 'undefined') {
      const token = localStorage.getItem('winngr_auth_token');
      if (token && mounted) {
        dispatch(loadUserFromStorage());
      }
    }
    
    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Check token expiry and refresh if needed
  useEffect(() => {
    if (authState.isAuthenticated && authState.tokenExpiry) {
      const timeUntilExpiry = authState.tokenExpiry - Date.now();
      
      // If token expires in less than 5 minutes, refresh it
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        dispatch(refreshAuthToken());
      }
      
      // Set up timer to refresh token before it expires
      if (timeUntilExpiry > 5 * 60 * 1000) {
        const refreshTimer = setTimeout(() => {
          dispatch(refreshAuthToken());
        }, timeUntilExpiry - 5 * 60 * 1000);
        
        return () => clearTimeout(refreshTimer);
      }
    }
  }, [dispatch, authState.isAuthenticated, authState.tokenExpiry]);

  const loginAsRestaurant = useCallback(async (credentials: LoginCredentials) => {
    const result = await dispatch(loginRestaurant(credentials));
    return result;
  }, [dispatch]);

  const loginAsDriver = useCallback(async (credentials: LoginCredentials) => {
    const result = await dispatch(loginDriver(credentials));
    return result;
  }, [dispatch]);

  const registerAsRestaurant = useCallback(async (credentials: RestaurantRegisterCredentials) => {
    const result = await dispatch(registerRestaurant(credentials));
    return result;
  }, [dispatch]);

  const registerAsDriver = useCallback(async (credentials: DriverRegisterCredentials) => {
    const result = await dispatch(registerDriver(credentials));
    return result;
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const updateUserData = useCallback((userData: any) => {
    dispatch(updateUser(userData));
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    const result = await dispatch(refreshAuthToken());
    return result;
  }, [dispatch]);

  return {
    // State
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    tokenExpiry: authState.tokenExpiry,
    
    // Computed values
    isRestaurant: authState.user?.type === 'restaurant',
    isDriver: authState.user?.type === 'driver',
    isRegistrationComplete: authState.user?.isRegistrationComplete || false,
    registrationStage: authState.user?.registrationStage || 1,
    
    // Actions
    loginAsRestaurant,
    loginAsDriver,
    registerAsRestaurant,
    registerAsDriver,
    logout: logoutUser,
    clearError: clearAuthError,
    updateUser: updateUserData,
    refreshToken,
  };
}
