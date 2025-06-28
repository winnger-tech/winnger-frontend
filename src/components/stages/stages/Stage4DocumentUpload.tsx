"use client";

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../../context/DashboardContext';
import StageService from '../../../services/stageService';
import { FileUpload } from '@/components/common/FileUpload';
import styled from 'styled-components';

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

  const [fileFormData, setFileFormData] = useState({
    driversLicenseFront: null,
    driversLicenseBack: null,
    driversAbstract: null,
    driversWorkEligibility: null,
    driverSinCard: null,
    driverBackgroundCheck: null
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

  const handleFileInputChange = (name, file) => {
    setFileFormData(state => {
      return { ...state, [name]: file }
    });
  }

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

  const uploadDocuments = async () => {
    try {
      const [
        driversLicenseFrontDetails,
        driversLicenseBackDetails,
        driversAbstractDetails,
        driversWorkEligibilityDetails,
        driverSinCardDetails,
        driverBackgroundCheckDetails,
      ] = await Promise.all([
        uploadFile(fileFormData.driversLicenseFront),
        uploadFile(fileFormData.driversLicenseBack),
        uploadFile(fileFormData.driversAbstract),
        uploadFile(fileFormData.driversWorkEligibility),
        uploadFile(fileFormData.driverSinCard),
        uploadFile(fileFormData.driverBackgroundCheck),
      ]);

      return {
        driversLicenseFrontUrl: driversLicenseFrontDetails?.url || '',
        driversLicenseBackUrl: driversLicenseBackDetails?.url || '',
        drivingAbstractUrl: driversAbstractDetails?.url || '',
        workEligibilityUrl: driversWorkEligibilityDetails?.url || '',
        sinCardUrl: driverSinCardDetails?.url || '',
        backgroundCheck: driverBackgroundCheckDetails?.url || '',
      };
    } catch (e) {
      console.log(e);
    }
  }

  
  const uploadFile = async (file: File) => {
    try {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`/api/drivers/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const result = await response.json();
      console.log('File uploaded successfully:', result);
      return result;
    } catch (e) {
      throw new Error('Error uploading file');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Debug: Log the data being submitted
    console.log('🔍 Submitting Stage 3 data:', data);
    console.log('🔍 workEligibilityType value:', data.workEligibilityType);

    const fileUrls = await uploadDocuments();
    console.log({...data, fileUrls})
    try {
      await actions.updateStageData(3, {...data, ...fileUrls});
      actions.navigateToStage(4);
    } catch (error) {
      console.error('Error saving Stage 3 data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = data.driversLicenseClass &&
  // data.driversLicenseFrontUrl &&
    // data.driversLicenseBackUrl &&
    data.vehicleRegistrationUrl &&
    data.vehicleInsuranceUrl &&
    // data.drivingAbstractUrl &&
    // data.workEligibilityUrl &&
    // data.sinCardUrl &&
    data.sinCardNumber &&
    data.drivingAbstractDate &&
    data.workEligibilityType &&
    data.backgroundCheck;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">Document Upload</h1>
          <p className="text-gray-300">
            Please upload all required documents to complete your registration.
          </p>
        </div>

        {/* Profile Data Display */}
        {showProfile && profileData && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Profile Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profileData).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <span className="text-sm text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <div className="text-white">
                    {typeof value === 'string' && value.startsWith('http') ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 hover:text-orange-300 underline"
                      >
                        View Document
                      </a>
                    ) : (
                      <span>{String(value)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleFetchProfile}
            disabled={isFetchingProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingProfile ? 'Fetching...' : 'Fetch Profile Data'}
          </button>

          {showProfile && (
            <button
              onClick={() => setShowProfile(false)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Hide Profile Details
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Driver's License Section */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-white">Driver's License</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Driver's License Front *
                </label>
                <FileUpload
                  required={true}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={(file) => handleFileInputChange("driversLicenseFront", file)}
                  error={!fileFormData.driversLicenseFront ? 'Drivers License Front is required' : undefined}
                />

                {fileFormData.driversLicenseFront && (
                  <ImagePreview>
                    <img src={URL.createObjectURL(fileFormData.driversLicenseFront)} alt="Preview" />
                    <span>{fileFormData.driversLicenseFront?.name}</span>
                  </ImagePreview>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Driver's License Back *
                </label>
                <FileUpload
                  required={true}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={(file) => handleFileInputChange("driversLicenseBack", file)}
                  error={!fileFormData.driversLicenseBack ? 'Driver License Back is required' : undefined}
                />

                {fileFormData.driversLicenseBack && (
                  <ImagePreview>
                    <img src={URL.createObjectURL(fileFormData.driversLicenseBack)} alt="Preview" />
                    <span>{fileFormData.driversLicenseBack?.name}</span>
                  </ImagePreview>
                )}
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
                  Driving Abstract *
                </label>
                <FileUpload
                  required={true}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={(file) => handleFileInputChange("driversAbstract", file)}
                  error={!fileFormData.driversAbstract ? 'Drivers Abstract is required' : undefined}
                />

                {fileFormData.driversAbstract && (
                  <ImagePreview>
                    <img src={URL.createObjectURL(fileFormData.driversAbstract)} alt="Preview" />
                    <span>{fileFormData.driversAbstract?.name}</span>
                  </ImagePreview>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Work Eligibility Document *
                </label>
                <FileUpload
                  required={true}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={(file) => handleFileInputChange("driversWorkEligibility", file)}
                  error={!fileFormData.driversWorkEligibility ? 'Drivers Work Eligibility is required' : undefined}
                />

                {fileFormData.driversWorkEligibility && (
                  <ImagePreview>
                    <img src={URL.createObjectURL(fileFormData.driversWorkEligibility)} alt="Preview" />
                    <span>{fileFormData.driversWorkEligibility?.name}</span>
                  </ImagePreview>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  SIN Card Document *
                </label>
                <FileUpload
                  required={true}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={(file) => handleFileInputChange("driverSinCard", file)}
                  error={!fileFormData.driverSinCard ? 'Drivers SIN CARD is required' : undefined}
                />

                {fileFormData.driverSinCard && (
                  <ImagePreview>
                    <img src={URL.createObjectURL(fileFormData.driverSinCard)} alt="Preview" />
                    <span>{fileFormData.driverSinCard?.name}</span>
                  </ImagePreview>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Background Check Document
                </label>
                <FileUpload
                  required={false}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={(file) => handleFileInputChange("driverBackgroundCheck", file)}
                />

                {fileFormData.driverBackgroundCheck && (
                  <ImagePreview>
                    <img src={URL.createObjectURL(fileFormData.driverBackgroundCheck)} alt="Preview" />
                    <span>{fileFormData.driverBackgroundCheck?.name}</span>
                  </ImagePreview>
                )}
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
                <option value="passport">Passport</option>
                <option value="work_permit">Work Permit</option>
                <option value="pr_card">Permanent Resident Card</option>
                <option value="citizenship">Citizenship</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ImagePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;

  img {
    height: 60px;
    width: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  span {
    color: white;
    font-size: 0.9rem;
    max-width: 200px;
    word-break: break-word;
  }
`;

export default Stage4DocumentUpload;