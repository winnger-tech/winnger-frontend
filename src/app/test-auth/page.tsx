"use client";

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginRestaurant, loginDriver, logout } from '../../store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, error } = useAppSelector((state) => state.auth);
  const router = useRouter();
  
  const [restaurantCredentials, setRestaurantCredentials] = useState({
    email: '1@restaurant.com',
    password: 'password'
  });
  
  const [driverCredentials, setDriverCredentials] = useState({
    email: 'amantest12@gmail.co',
    password: '64742626An@'
  });

  const handleRestaurantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Testing restaurant login with:', restaurantCredentials);
    await dispatch(loginRestaurant(restaurantCredentials));
  };

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Testing driver login with:', driverCredentials);
    await dispatch(loginDriver(driverCredentials));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div style={{ 
      padding: '2rem',
      fontFamily: 'Space Grotesk, sans-serif',
      background: 'linear-gradient(135deg, #403E2D 0%, #2d2b1f 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        padding: '2rem', 
        borderRadius: '12px',
        marginTop: '2rem'
      }}>
        <h2>Current Auth State:</h2>
        <pre style={{ 
          background: 'rgba(0, 0, 0, 0.3)', 
          padding: '1rem', 
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          {JSON.stringify({
            isAuthenticated,
            isLoading,
            error,
            user: user ? {
              id: user.id,
              type: user.type,
              email: user.email,
              ownerName: user.ownerName,
              firstName: user.firstName,
              lastName: user.lastName,
              registrationStage: user.registrationStage,
              isRegistrationComplete: user.isRegistrationComplete
            } : null
          }, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Restaurant Login Form */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '2rem', 
          borderRadius: '12px'
        }}>
          <h3>Restaurant Login Test</h3>
          <form onSubmit={handleRestaurantLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
              <input
                type="email"
                value={restaurantCredentials.email}
                onChange={(e) => setRestaurantCredentials(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#403E2D'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
              <input
                type="password"
                value={restaurantCredentials.password}
                onChange={(e) => setRestaurantCredentials(prev => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#403E2D'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: '#ffc32b',
                color: '#403E2D',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Logging in...' : 'Test Restaurant Login'}
            </button>
          </form>
        </div>

        {/* Driver Login Form */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '2rem', 
          borderRadius: '12px'
        }}>
          <h3>Driver Login Test</h3>
          <form onSubmit={handleDriverLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
              <input
                type="email"
                value={driverCredentials.email}
                onChange={(e) => setDriverCredentials(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#403E2D'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
              <input
                type="password"
                value={driverCredentials.password}
                onChange={(e) => setDriverCredentials(prev => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#403E2D'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: '#ffc32b',
                color: '#403E2D',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Logging in...' : 'Test Driver Login'}
            </button>
          </form>
        </div>
      </div>

      {isAuthenticated && (
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={handleLogout}
            style={{
              background: '#e74c3c',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            Logout
          </button>
          
          <div style={{ marginTop: '1rem' }}>
            <h4>Navigation Tests:</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/restaurant-dashboard-staged')}
                style={{
                  background: '#ffc32b',
                  color: '#403E2D',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Restaurant Dashboard Staged
              </button>
              <button
                onClick={() => router.push('/driver-dashboard-staged')}
                style={{
                  background: '#ffc32b',
                  color: '#403E2D',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Driver Dashboard Staged
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Quick Actions:</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a 
            href="/restaurantlogin" 
            style={{
              background: '#ffc32b',
              color: '#403E2D',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Restaurant Login Page
          </a>
          <a 
            href="/driverlogin" 
            style={{
              background: '#ffc32b',
              color: '#403E2D',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Driver Login Page
          </a>
          <a 
            href="/restaurant-dashboard-staged" 
            style={{
              background: '#ffc32b',
              color: '#403E2D',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Restaurant Dashboard Staged
          </a>
          <a 
            href="/driver-dashboard-staged" 
            style={{
              background: '#ffc32b',
              color: '#403E2D',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Driver Dashboard Staged
          </a>
        </div>
      </div>
    </div>
  );
} 