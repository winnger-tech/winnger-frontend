"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../../../context/DashboardContext';
import { FileUpload } from '../../common/FileUpload';

interface RestaurantDocumentsData {
  businessLicense: File | null;
  foodHandlersPermit: File | null;
  liabilityInsurance: File | null;
  menuImages: File[];
  agreedToTerms: boolean;
  consentToVerification: boolean;
}

const Stage3RestaurantDocuments: React.FC = () => {
  const router = useRouter();
  const { state, actions } = useDashboard();
  const [data, setData] = useState<RestaurantDocumentsData>({
    businessLicense: null,
    foodHandlersPermit: null,
    liabilityInsurance: null,
    menuImages: [],
    agreedToTerms: false,
    consentToVerification: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing data
    const existingData = state.userData?.[`stage3`];
    if (existingData) {
      setData(existingData);
    }
  }, [state.userData]);

  const handleFileChange = (fieldName: keyof Omit<RestaurantDocumentsData, 'menuImages' | 'agreedToTerms' | 'consentToVerification'>, file: File | null) => {
    const updatedData = { ...data, [fieldName]: file };
    setData(updatedData);
    
    // Auto-save when file is uploaded
    actions.autoSave(3, updatedData);
  };

  const handleMenuImageAdd = (file: File) => {
    const updatedImages = [...data.menuImages, file];
    const updatedData = { ...data, menuImages: updatedImages };
    setData(updatedData);
    actions.autoSave(3, updatedData);
  };

  const handleCheckboxChange = (field: 'agreedToTerms' | 'consentToVerification', value: boolean) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    actions.autoSave(3, updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save current stage data
      await actions.updateStageData(3, data);
      
      // Mark registration as complete for restaurants and redirect to success page
      console.log('Restaurant registration completed successfully!');
      router.push('/restaurant-registration-staged/success');
      
    } catch (error) {
      console.error('Error completing restaurant registration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = data.businessLicense && data.foodHandlersPermit && data.liabilityInsurance && 
                  data.agreedToTerms && data.consentToVerification;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Documents & Verification</h2>
        <p className="text-gray-300">
          Upload required documents to complete your restaurant registration with Winnger.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Documents */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Required Documents</h3>
          
          <div className="space-y-4">
            <FileUpload
              label="Business License"
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              onFileSelect={(file) => handleFileChange('businessLicense', file)}
              error={!data.businessLicense ? 'Business license is required' : undefined}
            />

            <FileUpload
              label="Food Handler's Permit"
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              onFileSelect={(file) => handleFileChange('foodHandlersPermit', file)}
              error={!data.foodHandlersPermit ? 'Food handler\'s permit is required' : undefined}
            />

            <FileUpload
              label="Liability Insurance"
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              onFileSelect={(file) => handleFileChange('liabilityInsurance', file)}
              error={!data.liabilityInsurance ? 'Liability insurance is required' : undefined}
            />
          </div>
        </div>

        {/* Menu Images */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Menu Images (Optional)</h3>
          <p className="text-gray-400 text-sm">
            Upload images of your menu to help customers discover your offerings.
          </p>
          
          <FileUpload
            label="Add Menu Image"
            required={false}
            accept=".jpg,.jpeg,.png"
            onFileSelect={handleMenuImageAdd}
          />

          {data.menuImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-300 mb-2">
                Uploaded menu images: {data.menuImages.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {data.menuImages.map((image, index) => (
                  <div key={index} className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">
                    {image.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verification & Agreement */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Verification & Agreement</h3>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.consentToVerification}
                onChange={(e) => handleCheckboxChange('consentToVerification', e.target.checked)}
                className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
              />
              <span className="text-white text-sm">
                I consent to verification of my business documents and understand that false information may result in account suspension.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.agreedToTerms}
                onChange={(e) => handleCheckboxChange('agreedToTerms', e.target.checked)}
                className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
              />
              <span className="text-white text-sm">
                I agree to the{' '}
                <a href="/terms" className="text-orange-400 hover:text-orange-300 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-orange-400 hover:text-orange-300 underline">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>
        </div>

        {/* Completion Status */}
        <div className="bg-green-900 border border-green-600 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-400">
                Ready to Launch!
              </h3>
              <div className="mt-2 text-sm text-green-300">
                <p>
                  Once you complete this final step, we'll review your restaurant and get you listed on Winnger within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isValid && !isLoading
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Completing Registration...' : 'Complete Restaurant Registration'}
          </button>
        </div>

        {!isValid && (
          <div className="text-sm text-orange-400 text-center">
            Please upload all required documents and agree to the terms to complete registration.
          </div>
        )}
      </form>
    </div>
  );
};

export default Stage3RestaurantDocuments;
