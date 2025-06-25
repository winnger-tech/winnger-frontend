import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks for authentication
export const loginRestaurant = createAsyncThunk(
  'auth/loginRestaurant',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/restaurants-staged/login', {
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

      if (!result.success) {
        return rejectWithValue(result.message || 'Login failed');
      }

      // Store token in localStorage (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.restaurant));
      }

      return {
        user: { ...result.data.restaurant, type: 'restaurant' as const },
        token: result.data.token,
      };
    } catch (error) {
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

export const registerRestaurant = createAsyncThunk(
  'auth/registerRestaurant',
  async (credentials: { ownerName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/restaurants-staged/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!result.success) {
        return rejectWithValue(result.message || 'Registration failed');
      }

      // Store token in localStorage (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.restaurant));
      }

      return {
        user: { ...result.data.restaurant, type: 'restaurant' as const },
        token: result.data.token,
      };
    } catch (error) {
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

// Driver authentication thunks
export const loginDriver = createAsyncThunk(
  'auth/loginDriver',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/drivers-staged/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!result.success) {
        return rejectWithValue(result.message || 'Login failed');
      }

      // Store token in localStorage (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.driver));
      }

      return {
        user: { ...result.data.driver, type: 'driver' as const },
        token: result.data.token,
      };
    } catch (error) {
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

export const registerDriver = createAsyncThunk(
  'auth/registerDriver',
  async (credentials: { firstName: string; lastName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/drivers-staged/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!result.success) {
        return rejectWithValue(result.message || 'Registration failed');
      }

      // Store token in localStorage (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.driver));
      }

      return {
        user: { ...result.data.driver, type: 'driver' as const },
        token: result.data.token,
      };
    } catch (error) {
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return rejectWithValue('Server-side rendering');
      }

      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        return rejectWithValue('No stored authentication data');
      }

      const user = JSON.parse(userStr);
      
      return {
        user,
        token,
      };
    } catch (error) {
      return rejectWithValue('Failed to load user data');
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
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
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
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Load User from Storage
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
