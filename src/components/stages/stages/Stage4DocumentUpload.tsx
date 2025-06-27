"use client";

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../../context/DashboardContext';
import StageService from '../../../services/stageService';

interface DocumentUploadData {
  // Driver's License
  driversLicenseFrontUrl: string;
  driversLicenseBackUrl: string;
  driversLicenseClass: string;
  
  // Vehicle Documents
  vehicleRegistrationUrl: string;
  vehicleInsuranceUrl: string;
  
  // Additional Documents
  drivingAbstractUrl: string;
  workEligibilityUrl: string;
  sinCardUrl: string;
  
  // Additional Information
  sinCardNumber: string;
  drivingAbstractDate: string;
  workEligibilityType: string;
  
  // Optional
  backgroundCheck: string;
}

const Stage4DocumentUpload: React.FC = () => {
  const { state, actions } = useDashboard();
  const [data, setData] = useState<DocumentUploadData>({
    driversLicenseFrontUrl: '',
    driversLicenseBackUrl: '',
    driversLicenseClass: '',
    vehicleRegistrationUrl: '',
    vehicleInsuranceUrl: '',
    drivingAbstractUrl: '',
    workEligibilityUrl: '',
    sinCardUrl: '',
    sinCardNumber: '',
    drivingAbstractDate: '',
    workEligibilityType: 'passport',
    backgroundCheck: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Load existing data
    const existingData = state.userData?.[`stage3`];
    console.log('🔍 Loading existing stage 3 data:', existingData);
    if (existingData) {
      setData(existingData);
    } else {
      // Ensure workEligibilityType has a default value if no existing data
      setData(prev => ({
        ...prev,
        workEligibilityType: prev.workEligibilityType || 'passport'
      }));
    }
  }, [state.userData]);

  const handleInputChange = (fieldName: keyof DocumentUploadData, value: string) => {
    const updatedData = { ...data, [fieldName]: value };
    setData(updatedData);
    
    // Debug: Log when workEligibilityType is changed
    if (fieldName === 'workEligibilityType') {
      console.log('🔍 workEligibilityType changed to:', value);
    }
    
    actions.autoSave(3, updatedData);
  };

  const handleFetchProfile = async () => {
    setIsFetchingProfile(true);
    try {
      console.log('🔍 Fetching profile data...');
      const response = await StageService.getProfile();
      console.log('🔍 Profile response:', response);
      
      if (response?.data) {
        setProfileData(response.data);
        setShowProfile(true);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      alert('Failed to fetch profile data. Please try again.');
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Debug: Log the data being submitted
    console.log('🔍 Submitting Stage 3 data:', data);
    console.log('🔍 workEligibilityType value:', data.workEligibilityType);
    
    try {
      await actions.updateStageData(3, data);
      actions.navigateToStage(4);
    } catch (error) {
      console.error('Error saving Stage 3 data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = data.driversLicenseFrontUrl && 
                  data.driversLicenseBackUrl && 
                  data.driversLicenseClass &&
                  data.vehicleRegistrationUrl && 
                  data.vehicleInsuranceUrl &&
                  data.drivingAbstractUrl &&
                  data.workEligibilityUrl &&
                  data.sinCardUrl &&
                  data.sinCardNumber &&
                  data.drivingAbstractDate &&
                  data.workEligibilityType;

  return (
    <div className="space-y-6 pt-28">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Document Upload</h2>
        <p className="text-gray-300">
          Provide URLs for the required documents to verify your eligibility as a driver.
        </p>
      </div>

      {/* Fetch Profile Button */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Profile Information</h3>
            <p className="text-sm text-gray-400">View your current profile details</p>
          </div>
          <button
            onClick={handleFetchProfile}
            disabled={isFetchingProfile}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isFetchingProfile
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isFetchingProfile ? 'Fetching...' : 'Fetch Profile Details'}
          </button>
        </div>
      </div>

      {/* Profile Display */}
      {showProfile && profileData && (
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Your Profile Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-orange-400">Personal Information</h4>
              {profileData.driver && (
                <>
                  <div className="text-sm">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">
                      {profileData.driver.firstName} {profileData.driver.lastName}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{profileData.driver.email}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white ml-2">{profileData.driver.cellNumber}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Registration Stage:</span>
                    <span className="text-white ml-2">{profileData.driver.registrationStage}</span>
                  </div>
                </>
              )}
            </div>

            {/* Registration Status */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-orange-400">Registration Status</h4>
              <div className="text-sm">
                <span className="text-gray-400">Current Stage:</span>
                <span className="text-white ml-2">{profileData.currentStage || 'Not set'}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Total Stages:</span>
                <span className="text-white ml-2">{profileData.totalStages || 'Not set'}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Completed:</span>
                <span className="text-white ml-2">
                  {profileData.isRegistrationComplete ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Stage Data */}
          {profileData.stages && (
            <div className="space-y-3">
              <h4 className="text-md font-medium text-orange-400">Stage Progress</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(profileData.stages).map(([stageNum, stageData]: [string, any]) => (
                  <div key={stageNum} className="text-sm bg-gray-700 p-2 rounded">
                    <div className="text-gray-400">Stage {stageNum}</div>
                    <div className="text-white">{stageData.title}</div>
                    <div className={`text-xs ${stageData.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                      {stageData.completed ? '✓ Completed' : '○ Pending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowProfile(false)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Hide Profile Details
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Driver's License Section */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Driver's License</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Driver's License Front URL *
              </label>
              <input
                type="url"
                value={data.driversLicenseFrontUrl}
                onChange={(e) => handleInputChange('driversLicenseFrontUrl', e.target.value)}
                placeholder="https://example.com/license-front.jpg"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Driver's License Back URL *
              </label>
              <input
                type="url"
                value={data.driversLicenseBackUrl}
                onChange={(e) => handleInputChange('driversLicenseBackUrl', e.target.value)}
                placeholder="https://example.com/license-back.jpg"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Driver's License Class *
            </label>
            <select
              value={data.driversLicenseClass}
              onChange={(e) => handleInputChange('driversLicenseClass', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select License Class</option>
              <option value="G">G (Car)</option>
              <option value="G1">G1 (Learner)</option>
              <option value="G2">G2 (Novice)</option>
              <option value="M">M (Motorcycle)</option>
              <option value="M1">M1 (Motorcycle Learner)</option>
              <option value="M2">M2 (Motorcycle Novice)</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Vehicle Documents Section */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Vehicle Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Vehicle Registration URL *
              </label>
              <input
                type="url"
                value={data.vehicleRegistrationUrl}
                onChange={(e) => handleInputChange('vehicleRegistrationUrl', e.target.value)}
                placeholder="https://example.com/registration.pdf"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Vehicle Insurance URL *
              </label>
              <input
                type="url"
                value={data.vehicleInsuranceUrl}
                onChange={(e) => handleInputChange('vehicleInsuranceUrl', e.target.value)}
                placeholder="https://example.com/insurance.pdf"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Documents Section */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Additional Documents</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Driving Abstract URL *
              </label>
              <input
                type="url"
                value={data.drivingAbstractUrl}
                onChange={(e) => handleInputChange('drivingAbstractUrl', e.target.value)}
                placeholder="https://example.com/driving-abstract.pdf"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Work Eligibility Document URL *
              </label>
              <input
                type="url"
                value={data.workEligibilityUrl}
                onChange={(e) => handleInputChange('workEligibilityUrl', e.target.value)}
                placeholder="https://example.com/work-eligibility.pdf"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                SIN Card URL *
              </label>
              <input
                type="url"
                value={data.sinCardUrl}
                onChange={(e) => handleInputChange('sinCardUrl', e.target.value)}
                placeholder="https://example.com/sin-card.jpg"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Additional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                SIN Card Number *
              </label>
              <input
                type="text"
                value={data.sinCardNumber}
                onChange={(e) => handleInputChange('sinCardNumber', e.target.value)}
                placeholder="123-456-789"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Driving Abstract Date *
              </label>
              <input
                type="date"
                value={data.drivingAbstractDate}
                onChange={(e) => handleInputChange('drivingAbstractDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Work Eligibility Type *
            </label>
            <select
              value={data.workEligibilityType}
              onChange={(e) => handleInputChange('workEligibilityType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Work Eligibility Type</option>
              <option value="passport">Passport</option>
              <option value="permanent_resident">Permanent Resident Card</option>
              <option value="work_permit">Work Permit</option>
              <option value="student_permit">Student Permit</option>
              <option value="visitor_permit">Visitor Permit</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Background Check (Optional) */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Background Check (Optional)</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Background Check URL
            </label>
            <input
              type="url"
              value={data.backgroundCheck}
              onChange={(e) => handleInputChange('backgroundCheck', e.target.value)}
              placeholder="https://example.com/background-check.pdf"
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-sm text-gray-400">
              If you don't have a background check, we can help you obtain one in the next step.
            </p>
          </div>
        </div>
        
        <div className="pt-6">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isValid && !isLoading
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Saving...' : 'Continue to Final Step'}
          </button>
        </div>
        
        {!isValid && (
          <div className="text-sm text-orange-400 text-center">
            Please provide all required information to continue.
          </div>
        )}
      </form>
    </div>
  );
};

export default Stage4DocumentUpload;
