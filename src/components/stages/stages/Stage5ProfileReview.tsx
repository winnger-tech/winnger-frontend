"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../../../context/DashboardContext';
import StageService from '../../../services/stageService';

interface ProfileData {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  vehicleInfo?: {
    vehicleType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    yearOfManufacture?: string;
    vehicleColor?: string;
    vehicleLicensePlate?: string;
    driversLicenseClass?: string;
  };
  documents?: {
    driversLicenseFrontUrl?: string;
    driversLicenseBackUrl?: string;
    vehicleRegistrationUrl?: string;
    vehicleInsuranceUrl?: string;
    drivingAbstractUrl?: string;
    workEligibilityUrl?: string;
    sinCardUrl?: string;
    sinCardNumber?: string;
    drivingAbstractDate?: string;
    workEligibilityType?: string;
  };
  bankingInfo?: {
    accountHolderName?: string;
    accountNumber?: string;
    transitNumber?: string;
    institutionNumber?: string;
  };
  backgroundCheck?: {
    hasBackgroundCheck?: boolean;
    wantsAssistance?: boolean;
    agreedToTerms?: boolean;
    consentToCheck?: boolean;
  };
  registrationStatus?: {
    isRegistrationComplete?: boolean;
    currentStage?: number;
    totalStages?: number;
  };
}

const Stage5ProfileReview: React.FC = () => {
  const router = useRouter();
  const { state, actions } = useDashboard();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching complete profile data...');
      const response = await StageService.getProfile();
      console.log('🔍 Profile response:', response);
      
      if (response?.data) {
        setProfileData(response.data);
      } else {
        // Fallback to local state data if API doesn't return profile
        const localData = {
          personalInfo: state.userData?.stage1 || {},
          vehicleInfo: state.userData?.stage2 || {},
          documents: state.userData?.stage3 || {},
          bankingInfo: state.userData?.stage4 || {},
          backgroundCheck: state.userData?.stage4 || {},
          registrationStatus: {
            isRegistrationComplete: true,
            currentStage: 5,
            totalStages: 5
          }
        };
        setProfileData(localData);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setError('Failed to load profile data. Please try again.');
      
      // Fallback to local state data
      const localData = {
        personalInfo: state.userData?.stage1 || {},
        vehicleInfo: state.userData?.stage2 || {},
        documents: state.userData?.stage3 || {},
        bankingInfo: state.userData?.stage4 || {},
        backgroundCheck: state.userData?.stage4 || {},
        registrationStatus: {
          isRegistrationComplete: true,
          currentStage: 5,
          totalStages: 5
        }
      };
      setProfileData(localData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    try {
      // Mark registration as complete
      await StageService.updateStage(5, {
        isRegistrationComplete: true,
        completed: true,
        completedAt: new Date().toISOString()
      });
      
      // Redirect to success page or dashboard
      router.push('/driver-registration-staged/success');
    } catch (error) {
      console.error('Error completing registration:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pt-28">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pt-28">
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
          <button 
            onClick={fetchProfileData}
            className="mt-2 text-red-400 hover:text-red-300 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-28">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Review</h2>
        <p className="text-gray-300">
          Review your complete registration information before final submission.
        </p>
      </div>

      {/* Registration Status */}
      <div className="bg-green-900 border border-green-600 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-400">
              Registration Complete!
            </h3>
            <p className="text-green-300">
              All stages have been completed successfully. Your profile is ready for review.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      {profileData.personalInfo && (
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="h-5 w-5 text-orange-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Full Name</label>
              <p className="text-white">
                {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <p className="text-white">{profileData.personalInfo.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Phone</label>
              <p className="text-white">{profileData.personalInfo.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Date of Birth</label>
              <p className="text-white">{profileData.personalInfo.dateOfBirth}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400">Address</label>
              <p className="text-white">
                {profileData.personalInfo.address}, {profileData.personalInfo.city}, {profileData.personalInfo.province} {profileData.personalInfo.postalCode}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Information */}
      {profileData.vehicleInfo && (
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="h-5 w-5 text-orange-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Vehicle Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Vehicle Type</label>
              <p className="text-white">{profileData.vehicleInfo.vehicleType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Make & Model</label>
              <p className="text-white">{profileData.vehicleInfo.vehicleMake} {profileData.vehicleInfo.vehicleModel}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Year</label>
              <p className="text-white">{profileData.vehicleInfo.yearOfManufacture}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Color</label>
              <p className="text-white">{profileData.vehicleInfo.vehicleColor}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">License Plate</label>
              <p className="text-white">{profileData.vehicleInfo.vehicleLicensePlate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">License Class</label>
              <p className="text-white">{profileData.vehicleInfo.driversLicenseClass}</p>
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      {profileData.documents && (
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="h-5 w-5 text-orange-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documents & Verification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">SIN Number</label>
              <p className="text-white">{profileData.documents.sinCardNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Driving Abstract Date</label>
              <p className="text-white">{profileData.documents.drivingAbstractDate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Work Eligibility Type</label>
              <p className="text-white">{profileData.documents.workEligibilityType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Documents Status</label>
              <div className="space-y-1">
                <p className="text-green-400 text-sm">✓ Driver's License (Front & Back)</p>
                <p className="text-green-400 text-sm">✓ Vehicle Registration</p>
                <p className="text-green-400 text-sm">✓ Vehicle Insurance</p>
                <p className="text-green-400 text-sm">✓ Driving Abstract</p>
                <p className="text-green-400 text-sm">✓ Work Eligibility</p>
                <p className="text-green-400 text-sm">✓ SIN Card</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banking Information */}
      {profileData.bankingInfo && (
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="h-5 w-5 text-orange-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Banking Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Account Holder</label>
              <p className="text-white">{profileData.bankingInfo.accountHolderName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Account Number</label>
              <p className="text-white">••••••••{profileData.bankingInfo.accountNumber?.slice(-4)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Transit Number</label>
              <p className="text-white">{profileData.bankingInfo.transitNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Institution Number</label>
              <p className="text-white">{profileData.bankingInfo.institutionNumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* Background Check & Consent */}
      {profileData.backgroundCheck && (
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="h-5 w-5 text-orange-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Background Check & Consent
          </h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span className="text-white">Background check consent provided</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span className="text-white">Terms of service agreed</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span className="text-white">Privacy policy accepted</span>
            </div>
          </div>
        </div>
      )}

      {/* Final Action */}
      <div className="pt-6">
        <button
          onClick={handleCompleteRegistration}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          Complete Registration
        </button>
      </div>

      <div className="text-center text-sm text-gray-400">
        <p>Your registration information has been reviewed and is ready for submission.</p>
        <p className="mt-1">You will receive confirmation within 24-48 hours.</p>
      </div>
    </div>
  );
};

export default Stage5ProfileReview; 