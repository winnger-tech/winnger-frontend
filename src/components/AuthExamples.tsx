import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { useUpdateRestaurant, useUpdateDriver } from '../hooks/useApi';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  userType: 'restaurant' | 'driver';
}

export const LoginForm: React.FC<LoginFormProps> = ({ userType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginAsRestaurant, loginAsDriver, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      let result;
      if (userType === 'restaurant') {
        result = await loginAsRestaurant({ email, password });
      } else {
        result = await loginAsDriver({ email, password });
      }

      if (result.type === 'auth/loginRestaurant/fulfilled' || result.type === 'auth/loginDriver/fulfilled') {
        // Login successful, redirect to dashboard
        router.push(`/${userType}-dashboard`);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>{userType === 'restaurant' ? 'Restaurant' : 'Driver'} Login</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <InputGroup>
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </InputGroup>

      <InputGroup>
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
      </InputGroup>

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </SubmitButton>
    </Form>
  );
};

// Example usage component for updating user profile
export const ProfileUpdateForm: React.FC = () => {
  const { user, updateUser, isRestaurant } = useAuth();
  const updateRestaurantMutation = useUpdateRestaurant();
  const updateDriverMutation = useUpdateDriver();
  
  const updateMutation = isRestaurant ? updateRestaurantMutation : updateDriverMutation;

  const [formData, setFormData] = useState({
    ownerName: user?.ownerName || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMutation.mutate(formData, {
      onSuccess: (data: any) => {
        updateUser(data);
        alert('Profile updated successfully!');
      },
      onError: (error: any) => {
        alert('Failed to update profile: ' + error.message);
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>Update Profile</Title>
      
      {isRestaurant ? (
        <InputGroup>
          <Label>Restaurant Owner Name</Label>
          <Input
            type="text"
            value={formData.ownerName}
            onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
            placeholder="Owner name"
          />
        </InputGroup>
      ) : (
        <>
          <InputGroup>
            <Label>First Name</Label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="First name"
            />
          </InputGroup>
          <InputGroup>
            <Label>Last Name</Label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Last name"
            />
          </InputGroup>
        </>
      )}

      <InputGroup>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Email address"
        />
      </InputGroup>

      <SubmitButton type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Updating...' : 'Update Profile'}
      </SubmitButton>
    </Form>
  );
};

// Styled components
const Form = styled.form`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #403E2D;
  text-align: center;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #666;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffc32b;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 195, 43, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;
