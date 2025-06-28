'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Define the User type
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  registrationStage: number;
  isRegistrationComplete: boolean;
  type: 'driver' | 'restaurant';
}

// Define the Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  loginDriver: (credentials: { email: string; password: string }) => Promise<boolean>;
  loginRestaurant: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const TOKEN_STORAGE_KEY = 'winngr_auth_token';
const USER_STORAGE_KEY = 'winngr_user_data';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          setIsLoading(false);
          return;
        }
        
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error loading user from localStorage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login driver function
  const loginDriver = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/drivers-staged/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!data.success) {
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return false;
      }

      // Extract user and token from response
      const userData: User = { 
        ...data.data.driver, 
        type: 'driver' 
      };
      const token = data.data.token;

      // Save to localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      }
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
      return false;
    }
  };

  // Login restaurant function
  const loginRestaurant = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/login`, {
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

      const data = await response.json();
      
      if (!data.success) {
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return false;
      }

      // Extract user and token from response
      const userData: User = { 
        ...data.data.restaurant, 
        type: 'restaurant' 
      };
      const token = data.data.token;

      // Save to localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      }
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    loginDriver,
    loginRestaurant,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the Auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
