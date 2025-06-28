'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Navbar from '../component/Navbar';
import { useTranslation } from '../../utils/i18n';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface RestaurantData {
  id: string;
  ownerName: string;
  email: string;
  restaurantName: string;
  phoneNumber: string;
  businessType: 'solo' | 'corporate';
  identificationType: string;
  identificationNumber: string;
  bankingInfo: {
    transitNumber: string;
    institutionNumber: string;
    accountNumber: string;
  };
  hstNumber: string;
  documents: {
    businessLicenseUrl: string;
    articleofIncorporation: string;
    businessLicenseExpiryDate: string;
    articleofIncorporationExpiryDate: string;
  };
  plans: {
    selectedPlan: string;
    agreedToTerms: boolean;
    confirmationChecked: boolean;
  };
  payment: {
    paymentIntentId: string;
    stripePaymentMethodId: string;
    paymentCompleted: boolean;
  };
  status: 'pending' | 'approved' | 'rejected' | 'pending_approval';
  isRegistrationComplete: boolean;
  currentStep: number;
  completedSteps: number[];
  progressPercentage: number;
  paymentStatus: string;
}

export default function RestaurantDashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch restaurant data
  const fetchRestaurantData = async () => {
    try {
      const token = localStorage.getItem('winngr_auth_token');
      if (!token) {
        console.log('No auth token found, redirecting to login');
        router.push('/restaurantlogin');
        return;
      }
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log('Fetching restaurant data from:', `${apiBaseUrl}/restaurants/progress`);
      
      const response = await fetch(`${apiBaseUrl}/restaurants/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Restaurant API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Restaurant data received:', data);
        setRestaurantData(data.data);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Restaurant API error:', errorData);
        setError(`Failed to load restaurant data: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant data:', error);
      setError('Network error - please check your connection');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Restaurant dashboard mounted, auth status:', isAuthenticated);
    if (isAuthenticated) {
      fetchRestaurantData();
    } else {
      console.log('Not authenticated, redirecting to login');
      setIsLoading(false);
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#f44336';
      case 'pending':
      case 'pending_approval':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      case 'pending_approval':
        return 'Pending Approval';
      default:
        return 'Unknown';
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return 'Basic Information';
      case 2:
        return 'Banking Information';
      case 3:
        return 'Business Documents';
      case 4:
        return 'Review & Confirmation';
      case 5:
        return 'Payment Processing';
      default:
        return `Step ${step}`;
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <ContentWrapper>
            <LoadingWrapper>
              <LoadingSpinner />
              <LoadingMessage>Loading restaurant dashboard...</LoadingMessage>
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
              <ErrorTitle>Dashboard Error</ErrorTitle>
              <ErrorMessage>{error}</ErrorMessage>
              <RetryButton onClick={fetchRestaurantData}>
                Try Again
              </RetryButton>
            </ErrorWrapper>
          </ContentWrapper>
        </PageContainer>
      </>
    );
  }

  if (!restaurantData) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <ContentWrapper>
            <ErrorWrapper>
              <ErrorTitle>No Data Available</ErrorTitle>
              <ErrorMessage>Restaurant data could not be loaded.</ErrorMessage>
              <RetryButton onClick={fetchRestaurantData}>
                Try Again
              </RetryButton>
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
          <Header>
            <Title>Restaurant Dashboard</Title>
            <Subtitle>Complete overview of your restaurant registration</Subtitle>
          </Header>

          <DashboardGrid>
            {/* Registration Status */}
            <StatusCard>
              <CardTitle>Registration Status</CardTitle>
              <StatusBadge color={getStatusColor(restaurantData.status)}>
                {getStatusText(restaurantData.status)}
              </StatusBadge>
              <StatusDetails>
                <StatusItem>
                  <Label>Registration Complete:</Label>
                  <Value>{restaurantData.isRegistrationComplete ? 'Yes' : 'No'}</Value>
                </StatusItem>
                <StatusItem>
                  <Label>Current Step:</Label>
                  <Value>{restaurantData.currentStep} - {getStepTitle(restaurantData.currentStep)}</Value>
                </StatusItem>
                <StatusItem>
                  <Label>Progress:</Label>
                  <Value>{restaurantData.progressPercentage}% Complete</Value>
                </StatusItem>
                <StatusItem>
                  <Label>Payment Status:</Label>
                  <Value>{restaurantData.paymentStatus}</Value>
                </StatusItem>
              </StatusDetails>
            </StatusCard>

            {/* Basic Information */}
            <InfoCard>
              <CardTitle>Basic Information</CardTitle>
              <InfoGrid>
                <InfoItem>
                  <Label>Restaurant Name:</Label>
                  <Value>{restaurantData.restaurantName || 'Not provided'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Owner Name:</Label>
                  <Value>{restaurantData.ownerName}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Email:</Label>
                  <Value>{restaurantData.email}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Phone Number:</Label>
                  <Value>{restaurantData.phoneNumber || 'Not provided'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Business Type:</Label>
                  <Value>{restaurantData.businessType || 'Not provided'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Identification Type:</Label>
                  <Value>{restaurantData.identificationType || 'Not provided'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Identification Number:</Label>
                  <Value>{restaurantData.identificationNumber || 'Not provided'}</Value>
                </InfoItem>
              </InfoGrid>
            </InfoCard>

            {/* Banking Information */}
            <InfoCard>
              <CardTitle>Banking Information</CardTitle>
              <InfoGrid>
                <InfoItem>
                  <Label>Transit Number:</Label>
                  <Value>{restaurantData.bankingInfo?.transitNumber || 'Not provided'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Institution Number:</Label>
                  <Value>{restaurantData.bankingInfo?.institutionNumber || 'Not provided'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Account Number:</Label>
                  <Value>{restaurantData.bankingInfo?.accountNumber ? '***' + restaurantData.bankingInfo.accountNumber.slice(-4) : 'Not provided'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>HST Number:</Label>
                  <Value>{restaurantData.hstNumber || 'Not provided'}</Value>
                </InfoItem>
              </InfoGrid>
            </InfoCard>

            {/* Documents */}
            <InfoCard>
              <CardTitle>Business Documents</CardTitle>
              <InfoGrid>
                <InfoItem>
                  <Label>Business License:</Label>
                  <Value>
                    {restaurantData.documents?.businessLicenseUrl ? (
                      <DocumentLink href={restaurantData.documents.businessLicenseUrl} target="_blank">
                        View Document
                      </DocumentLink>
                    ) : (
                      'Not uploaded'
                    )}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <Label>License Expiry:</Label>
                  <Value>{restaurantData.documents?.businessLicenseExpiryDate || 'Not provided'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Articles of Incorporation:</Label>
                  <Value>
                    {restaurantData.documents?.articleofIncorporation ? (
                      <DocumentLink href={restaurantData.documents.articleofIncorporation} target="_blank">
                        View Document
                      </DocumentLink>
                    ) : (
                      'Not uploaded'
                    )}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <Label>Incorporation Expiry:</Label>
                  <Value>{restaurantData.documents?.articleofIncorporationExpiryDate || 'Not provided'}</Value>
                </InfoItem>
              </InfoGrid>
            </InfoCard>

            {/* Plans & Payment */}
            <InfoCard>
              <CardTitle>Plans & Payment</CardTitle>
              <InfoGrid>
                <InfoItem>
                  <Label>Selected Plan:</Label>
                  <Value>{restaurantData.plans?.selectedPlan || 'Not selected'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Terms Agreed:</Label>
                  <Value>{restaurantData.plans?.agreedToTerms ? 'Yes' : 'No'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Confirmation Checked:</Label>
                  <Value>{restaurantData.plans?.confirmationChecked ? 'Yes' : 'No'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Payment Completed:</Label>
                  <Value>{restaurantData.payment?.paymentCompleted ? 'Yes' : 'No'}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>Payment Intent ID:</Label>
                  <Value>{restaurantData.payment?.paymentIntentId || 'Not available'}</Value>
                </InfoItem>
              </InfoGrid>
            </InfoCard>

            {/* Progress Steps */}
            <ProgressCard>
              <CardTitle>Registration Progress</CardTitle>
              <StepsContainer>
                {[1, 2, 3, 4, 5].map((step) => (
                  <StepItem key={step} completed={restaurantData.completedSteps.includes(step)} current={step === restaurantData.currentStep}>
                    <StepNumber>{step}</StepNumber>
                    <StepInfo>
                      <StepTitle>{getStepTitle(step)}</StepTitle>
                      <StepStatus>
                        {restaurantData.completedSteps.includes(step) ? 'Completed' : 
                         step === restaurantData.currentStep ? 'Current' : 'Pending'}
                      </StepStatus>
                    </StepInfo>
                  </StepItem>
                ))}
              </StepsContainer>
            </ProgressCard>
          </DashboardGrid>

          {/* Action Buttons */}
          <ActionSection>
            <ActionButton onClick={() => router.push('/restaurant-dashboard-staged')}>
              View Staged Registration
            </ActionButton>
            <ActionButton onClick={() => router.push('/restaurant-profile')}>
              View Profile
            </ActionButton>
            <ActionButton onClick={() => router.push('/restaurant-registration-staged')}>
              Continue Registration
            </ActionButton>
          </ActionSection>
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
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  line-height: 1.6;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatusCard = styled.div`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProgressCard = styled.div`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  grid-column: 1 / -1;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  color: #ffc32b;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const StatusBadge = styled.div<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1.5rem;
`;

const StatusDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: #bdc3c7;
  font-weight: 500;
  min-width: 150px;
`;

const Value = styled.span`
  color: white;
  font-weight: 600;
  text-align: right;
  flex: 1;
`;

const DocumentLink = styled.a`
  color: #ffc32b;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StepItem = styled.div<{ completed: boolean; current: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.completed ? 'rgba(76, 175, 80, 0.2)' : 
                        props.current ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.completed ? '#4CAF50' : 
                              props.current ? '#ff9800' : 'rgba(255, 255, 255, 0.1)'};
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffc32b;
  color: #403E2D;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
`;

const StepInfo = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  color: white;
  font-weight: 600;
  font-size: 1rem;
`;

const StepStatus = styled.div`
  color: #bdc3c7;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
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