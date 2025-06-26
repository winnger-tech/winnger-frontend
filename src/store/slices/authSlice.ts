import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Token management utilities
const TOKEN_STORAGE_KEY = 'winngr_auth_token';
const REFRESH_TOKEN_STORAGE_KEY = 'winngr_refresh_token';
const USER_STORAGE_KEY = 'winngr_user_data';
const TOKEN_EXPIRY_KEY = 'winngr_token_expiry';

// API base URLs - handle different ports for different endpoints
const DRIVER_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const RESTAURANT_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fallback to single API URL if environment variable is set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface TokenData {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

const storeTokenData = (tokenData: TokenData, user: User) => {
  if (typeof window !== 'undefined') {
    console.log('💾 Storing token data:', {
      token: tokenData.token ? 'present' : 'missing',
      refreshToken: tokenData.refreshToken ? 'present' : 'missing',
      expiresIn: tokenData.expiresIn,
      user: user
    });
    
    localStorage.setItem(TOKEN_STORAGE_KEY, tokenData.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    
    if (tokenData.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenData.refreshToken);
    }
    
    if (tokenData.expiresIn) {
      const expiry = Date.now() + (tokenData.expiresIn * 1000);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
    }
    
    console.log('✅ Token data stored successfully');
  }
};

const clearTokenData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
};

const getStoredTokenData = () => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  const userStr = localStorage.getItem(USER_STORAGE_KEY);
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  console.log('🔍 localStorage contents:', {
    token: token ? 'present' : 'missing',
    refreshToken: refreshToken ? 'present' : 'missing',
    userStr: userStr ? 'present' : 'missing',
    expiryStr: expiryStr ? 'present' : 'missing'
  });
  
  if (!token || !userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    console.log('👤 Parsed user data:', user);
    
    return {
      token,
      refreshToken,
      user,
      tokenExpiry: expiryStr ? parseInt(expiryStr) : null,
    };
  } catch (error) {
    console.error('💥 Error parsing user data:', error);
    return null;
  }
};

const isTokenExpired = (expiry: number | null): boolean => {
  if (!expiry) return false;
  return Date.now() >= expiry;
};

export interface User {
  id: string;
  ownerName?: string; // For restaurants
  firstName?: string; // For drivers
  lastName?: string; // For drivers
  email: string;
  registrationStage: number;
  isRegistrationComplete: boolean;
  type: 'restaurant' | 'driver';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  tokenExpiry: number | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false, // Start with loading false to allow immediate access
  error: null,
  isAuthenticated: false,
  tokenExpiry: null,
};

// Async thunks for authentication
export const loginRestaurant = createAsyncThunk(
  'auth/loginRestaurant',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🏪 Restaurant login attempt:', credentials.email);
      
      const response = await fetch(`${RESTAURANT_API_BASE_URL}/restaurants-staged/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: credentials.email, // Use email as ownerName for API compatibility
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const result = await response.json();
      console.log('🏪 Restaurant login response:', result);

      if (!result.success) {
        console.log('❌ Restaurant login failed:', result.message);
        return rejectWithValue(result.message || 'Login failed');
      }

      // Use the email from the response, not the request
      const user: User = { 
        ...result.data.restaurant, 
        type: 'restaurant' as const,
        email: result.data.restaurant.email // Ensure we use the email from the response
      };
      
      const tokenData: TokenData = {
        token: result.data.token,
        refreshToken: undefined,
        expiresIn: undefined,
      };

      console.log('✅ Restaurant login successful, user:', user);
      storeTokenData(tokenData, user);

      return {
        user,
        token: tokenData.token,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: null,
      };
    } catch (error) {
      console.error('💥 Restaurant login error:', error);
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

export const registerRestaurant = createAsyncThunk(
  'auth/registerRestaurant',
  async (credentials: { ownerName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🏪 Restaurant registration attempt:', credentials.email);
      
      const response = await fetch(`${RESTAURANT_API_BASE_URL}/restaurants-staged/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      console.log('🏪 Restaurant registration response:', result);

      if (!result.success) {
        console.log('❌ Restaurant registration failed:', result.message);
        return rejectWithValue(result.message || 'Registration failed');
      }

      const user: User = { ...result.data.restaurant, type: 'restaurant' as const };
      const tokenData: TokenData = {
        token: result.data.token,
        refreshToken: undefined,
        expiresIn: undefined,
      };

      console.log('✅ Restaurant registration successful, user:', user);
      storeTokenData(tokenData, user);

      return {
        user,
        token: tokenData.token,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: null,
      };
    } catch (error) {
      console.error('💥 Restaurant registration error:', error);
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

// Driver authentication thunks
export const loginDriver = createAsyncThunk(
  'auth/loginDriver',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🚗 Driver login attempt:', credentials.email);
      
      const response = await fetch(`${DRIVER_API_BASE_URL}/drivers-staged/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      console.log('🚗 Driver login response:', result);

      if (!result.success) {
        console.log('❌ Driver login failed:', result.message);
        return rejectWithValue(result.message || 'Login failed');
      }

      const user: User = { ...result.data.driver, type: 'driver' as const };
      const tokenData: TokenData = {
        token: result.data.token,
        refreshToken: undefined,
        expiresIn: undefined,
      };

      console.log('✅ Driver login successful, user:', user);
      storeTokenData(tokenData, user);

      return {
        user,
        token: tokenData.token,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: null,
      };
    } catch (error) {
      console.error('💥 Driver login error:', error);
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

export const registerDriver = createAsyncThunk(
  'auth/registerDriver',
  async (credentials: { firstName: string; lastName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🚗 Driver registration attempt:', credentials.email);
      
      const response = await fetch(`${DRIVER_API_BASE_URL}/drivers-staged/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      console.log('🚗 Driver registration response:', result);

      if (!result.success) {
        console.log('❌ Driver registration failed:', result.message);
        return rejectWithValue(result.message || 'Registration failed');
      }

      const user: User = { ...result.data.driver, type: 'driver' as const };
      const tokenData: TokenData = {
        token: result.data.token,
        refreshToken: undefined,
        expiresIn: undefined,
      };

      console.log('✅ Driver registration successful, user:', user);
      storeTokenData(tokenData, user);

      return {
        user,
        token: tokenData.token,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: null,
      };
    } catch (error) {
      console.error('💥 Driver registration error:', error);
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Loading user from storage...');
      const storedData = getStoredTokenData();
      console.log('📦 Stored data:', storedData);
      
      if (!storedData) {
        console.log('❌ No stored authentication data found');
        // Don't reject, just return empty state
        return {
          user: null,
          token: null,
          refreshToken: null,
          tokenExpiry: null,
        };
      }

      // Check if token is expired
      if (storedData.tokenExpiry && isTokenExpired(storedData.tokenExpiry)) {
        console.log('⏰ Token expired, clearing data');
        clearTokenData();
        return {
          user: null,
          token: null,
          refreshToken: null,
          tokenExpiry: null,
        };
      }
      
      console.log('✅ User loaded from storage successfully:', storedData.user);
      return {
        user: storedData.user,
        token: storedData.token,
        refreshToken: storedData.refreshToken,
        tokenExpiry: storedData.tokenExpiry,
      };
    } catch (error) {
      console.error('💥 Error loading user from storage:', error);
      clearTokenData();
      return {
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiry: null,
      };
    }
  }
);

// Refresh token thunk
export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { refreshToken } = state.auth;

      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (!result.success) {
        clearTokenData();
        return rejectWithValue(result.message || 'Token refresh failed');
      }

      const tokenData: TokenData = {
        token: result.data.token,
        refreshToken: result.data.refreshToken,
        expiresIn: result.data.expiresIn,
      };

      // Update stored token data
      if (state.auth.user) {
        storeTokenData(tokenData, state.auth.user);
      }

      return {
        token: tokenData.token,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: tokenData.expiresIn ? Date.now() + (tokenData.expiresIn * 1000) : null,
      };
    } catch (error) {
      clearTokenData();
      return rejectWithValue('Network error during token refresh');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.tokenExpiry = null;
      clearTokenData();
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
        }
      }
    },
    setTokenExpiry: (state, action: PayloadAction<number | null>) => {
      state.tokenExpiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Restaurant
      .addCase(loginRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenExpiry = action.payload.tokenExpiry;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register Restaurant
      .addCase(registerRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenExpiry = action.payload.tokenExpiry;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Login Driver
      .addCase(loginDriver.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginDriver.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenExpiry = action.payload.tokenExpiry;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register Driver
      .addCase(registerDriver.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenExpiry = action.payload.tokenExpiry;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Load User from Storage
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenExpiry = action.payload.tokenExpiry;
        // Only set authenticated to true if we have a user
        state.isAuthenticated = !!action.payload.user;
        state.error = null;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.tokenExpiry = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Refresh Token
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenExpiry = action.payload.tokenExpiry;
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.tokenExpiry = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, updateUser, setTokenExpiry } = authSlice.actions;
export default authSlice.reducer;
