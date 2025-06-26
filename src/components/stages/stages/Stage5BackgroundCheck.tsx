"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../../../context/DashboardContext';

interface BackgroundCheckData {
  hasBackgroundCheck: boolean;
  wantsAssistance: boolean;
  agreedToTerms: boolean;
  consentToCheck: boolean;
}

const Stage5BackgroundCheck: React.FC = () => {
  const router = useRouter();
  const { state, actions } = useDashboard();
  const [data, setData] = useState<BackgroundCheckData>({
    hasBackgroundCheck: false,
    wantsAssistance: false,
    agreedToTerms: false,
    consentToCheck: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing data
    const existingData = state.userData?.[`stage5`];
    if (existingData) {
      setData(existingData);
    }
  }, [state.userData]);

  const handleInputChange = (field: keyof BackgroundCheckData, value: boolean) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    
    // Auto-save when data changes
    actions.autoSave(5, updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save current stage data
      await actions.updateStageData(5, data);
      
      // Mark registration as complete and redirect to success page
      console.log('Registration completed successfully!');
      router.push('/driver-registration-staged/success');
      
    } catch (error) {
      console.error('Error completing registration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = data.agreedToTerms && data.consentToCheck;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Background Check & Final Steps</h2>
        <p className="text-gray-300">
          Complete your background verification to start driving with Winnger.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Background Check Status */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Background Check</h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasBackgroundCheck}
                onChange={(e) => handleInputChange('hasBackgroundCheck', e.target.checked)}
                className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
              />
              <span className="text-white">I already have a valid background check</span>
            </label>

            {!data.hasBackgroundCheck && (
              <label className="flex items-center space-x-3 cursor-pointer ml-7">
                <input
                  type="checkbox"
                  checked={data.wantsAssistance}
                  onChange={(e) => handleInputChange('wantsAssistance', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-white">I need assistance obtaining a background check</span>
              </label>
            )}
          </div>

          {data.wantsAssistance && !data.hasBackgroundCheck && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    Background Check Assistant
                  </h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p>
                      We'll help you obtain a background check through our trusted partner. 
                      This process typically takes 3-5 business days and costs $25.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Consent & Terms */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Consent & Agreement</h3>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.consentToCheck}
                onChange={(e) => handleInputChange('consentToCheck', e.target.checked)}
                className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
              />
              <span className="text-white text-sm">
                I consent to a background check and understand that any criminal history may affect my eligibility to drive with Winnger.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.agreedToTerms}
                onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
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

        {/* Completion Message */}
        <div className="bg-green-900 border border-green-600 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-400">
                Almost There!
              </h3>
              <div className="mt-2 text-sm text-green-300">
                <p>
                  Once you complete this final step, we'll review your application and get you started as a Winnger driver.
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
            {isLoading ? 'Completing Registration...' : 'Complete Registration'}
          </button>
        </div>

        {!isValid && (
          <div className="text-sm text-orange-400 text-center">
            Please agree to the terms and consent to background check to complete registration.
          </div>
        )}
      </form>
    </div>
  );
};

export default Stage5BackgroundCheck;
