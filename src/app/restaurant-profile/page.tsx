'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Navbar from '../component/Navbar';
import { useTranslation } from '../../utils/i18n';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface RestaurantProfile {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  identificationType: string;
  ownerAddress: string;
  businessType: string;
  restaurantName: string;
  businessEmail: string;
  businessPhone: string;
  restaurantAddress: string;
  city: string;
  province: string;
  postalCode: string;
  bankingInfo: {
    accountNumber: string;
    transitNumber: string;
    institutionNumber: string;
  };
  HSTNumber: string;
  currentStep: number;
  completedSteps: number[];
  isRegistrationComplete: boolean;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RestaurantProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('winngr_auth_token');
      if (!token) {
        console.log('No auth token found, redirecting to login');
        router.push('/restaurantlogin');
        return;
      }
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log('Fetching profile from:', `${apiBaseUrl}/restaurants/profile`);
      
      const response = await fetch(`${apiBaseUrl}/restaurants/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfile(data.data.restaurant);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile API error:', errorData);
        setError(`Failed to load profile: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Network error - please check your connection');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Restaurant profile mounted, auth status:', isAuthenticated);
    if (isAuthenticated) {
      fetchProfile();
    } else {
      console.log('Not authenticated, redirecting to login');
      setIsLoading(false);
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#ffc32b';
      case 'rejected':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <ContentWrapper>
            <LoadingWrapper>
              <LoadingSpinner />
              <LoadingMessage>Loading profile...</LoadingMessage>
            </LoadingWrapper>
          </ContentWrapper>
        </PageContainer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <ContentWrapper>
            <ErrorWrapper>
              <ErrorTitle>Profile Error</ErrorTitle>
              <ErrorMessage>{error}</ErrorMessage>
              <RetryButton onClick={fetchProfile}>
                Try Again
              </RetryButton>
            </ErrorWrapper>
          </ContentWrapper>
        </PageContainer>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <ContentWrapper>
            <ErrorWrapper>
              <ErrorTitle>No Profile Data</ErrorTitle>
              <ErrorMessage>Profile information could not be loaded.</ErrorMessage>
            </ErrorWrapper>
          </ContentWrapper>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageContainer>
        <ContentWrapper>
          <PageTitle>Restaurant Profile</PageTitle>
          
          <ProfileGrid>
            {/* Restaurant Information */}
            <ProfileSection>
              <SectionTitle>Restaurant Information</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Restaurant Name</InfoLabel>
                  <InfoValue>{profile.restaurantName}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Business Type</InfoLabel>
                  <InfoValue>{profile.businessType}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Business Email</InfoLabel>
                  <InfoValue>{profile.businessEmail}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Business Phone</InfoLabel>
                  <InfoValue>{profile.businessPhone}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Restaurant Address</InfoLabel>
                  <InfoValue>{profile.restaurantAddress}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>City</InfoLabel>
                  <InfoValue>{profile.city}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Province</InfoLabel>
                  <InfoValue>{profile.province}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Postal Code</InfoLabel>
                  <InfoValue>{profile.postalCode}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </ProfileSection>

            {/* Owner Information */}
            <ProfileSection>
              <SectionTitle>Owner Information</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Owner Name</InfoLabel>
                  <InfoValue>{profile.ownerName}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{profile.email}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>{profile.phone}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>ID Type</InfoLabel>
                  <InfoValue>{profile.identificationType}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Owner Address</InfoLabel>
                  <InfoValue>{profile.ownerAddress}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </ProfileSection>

            {/* Banking Information */}
            <ProfileSection>
              <SectionTitle>Banking Information</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Account Number</InfoLabel>
                  <InfoValue>••••••••{profile.bankingInfo.accountNumber.slice(-4)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Transit Number</InfoLabel>
                  <InfoValue>{profile.bankingInfo.transitNumber}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Institution Number</InfoLabel>
                  <InfoValue>{profile.bankingInfo.institutionNumber}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>HST Number</InfoLabel>
                  <InfoValue>{profile.HSTNumber}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </ProfileSection>

            {/* Registration Status */}
            <ProfileSection>
              <SectionTitle>Registration Status</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Status</InfoLabel>
                  <StatusBadge $color={getStatusColor(profile.status)}>
                    {getStatusText(profile.status)}
                  </StatusBadge>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Current Step</InfoLabel>
                  <InfoValue>{profile.currentStep}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Completed Steps</InfoLabel>
                  <InfoValue>{profile.completedSteps.join(', ')}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Registration Complete</InfoLabel>
                  <InfoValue>{profile.isRegistrationComplete ? 'Yes' : 'No'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email Verified</InfoLabel>
                  <InfoValue>{profile.emailVerified ? 'Yes' : 'No'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Created</InfoLabel>
                  <InfoValue>{formatDate(profile.createdAt)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Last Updated</InfoLabel>
                  <InfoValue>{formatDate(profile.updatedAt)}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </ProfileSection>
          </ProfileGrid>
        </ContentWrapper>
      </PageContainer>
    </>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 120px 20px 40px;
  background-color: #403E2D;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 2rem;
  font-weight: 600;
  text-align: center;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ProfileSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #403E2D;
  margin-bottom: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #ffc32b;
  padding-bottom: 0.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  color: #403E2D;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ $color: string }>`
  background: ${props => props.$color};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  width: fit-content;
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const LoadingMessage = styled.p`
  color: #e0e0e0;
  margin-top: 1rem;
  font-size: 1rem;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: #ff6b6b;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: #e0e0e0;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 195, 43, 0.3);
  }
`; 