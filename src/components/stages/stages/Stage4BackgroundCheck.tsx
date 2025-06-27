"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../../../context/DashboardContext';

interface ConsentAndDeclarations {
  termsOfService: boolean;
  privacyPolicy: boolean;
  backgroundCheckConsent: boolean;
  dataUsageConsent: boolean;
  electronicCommunicationConsent: boolean;
  driverDeclaration: boolean;
  vehicleDeclaration: boolean;
  insuranceDeclaration: boolean;
  criminalRecordDeclaration: boolean;
  employmentEligibilityDeclaration: boolean;
}

interface Stage4Data {
  // Banking Information (top-level fields as backend expects)
  accountHolderName: string;
  accountNumber: string;
  transitNumber: string;
  institutionNumber: string;
  
  // Background Check
  hasBackgroundCheck: boolean;
  wantsAssistance: boolean;
  
  // Consent & Terms
  agreedToTerms: boolean;
  consentToCheck: boolean;
  
  // Comprehensive Consent and Declarations
  consentAndDeclarations: ConsentAndDeclarations;
}

const Stage4BackgroundCheck: React.FC = () => {
  const router = useRouter();
  const { state, actions } = useDashboard();
  const [data, setData] = useState<Stage4Data>({
    accountHolderName: '',
    accountNumber: '',
    transitNumber: '',
    institutionNumber: '',
    hasBackgroundCheck: false,
    wantsAssistance: false,
    agreedToTerms: false,
    consentToCheck: false,
    consentAndDeclarations: {
      termsOfService: false,
      privacyPolicy: false,
      backgroundCheckConsent: false,
      dataUsageConsent: false,
      electronicCommunicationConsent: false,
      driverDeclaration: false,
      vehicleDeclaration: false,
      insuranceDeclaration: false,
      criminalRecordDeclaration: false,
      employmentEligibilityDeclaration: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing data
    const existingData = state.userData?.[`stage4`];
    if (existingData) {
      setData(existingData);
    }
  }, [state.userData]);

  const handleBankingChange = (field: keyof Stage4Data, value: string) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    // actions.autoSave(4, updatedData);
  };

  const handleInputChange = (field: keyof Stage4Data, value: boolean) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    // actions.autoSave(4, updatedData);
  };

  const handleConsentChange = (field: keyof ConsentAndDeclarations, value: boolean) => {
    const updatedData = {
      ...data,
      consentAndDeclarations: {
        ...data.consentAndDeclarations,
        [field]: value
      }
    };
    setData(updatedData);
    // actions.autoSave(4, updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save current stage data
      await actions.updateStageData(4, data);
      
      // Redirect to stage 5 (Profile Review) instead of success page
      console.log('Stage 4 completed, redirecting to stage 5 for profile review');
      router.push('/driver-registration-staged/stage/5');
      
    } catch (error) {
      console.error('Error completing registration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isBankingValid = data.accountHolderName && 
                        data.accountNumber && 
                        data.transitNumber && 
                        data.institutionNumber;
  
  const isConsentValid = data.agreedToTerms && data.consentToCheck;
  
  const isAllConsentValid = Object.values(data.consentAndDeclarations).every(value => value === true);
  
  const isValid = isBankingValid && isConsentValid && isAllConsentValid;

  return (
    <div className="space-y-6 pt-28">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Banking & Final Steps</h2>
        <p className="text-gray-300">
          Complete your banking information and final verification to start driving with Winnger.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banking Information */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Banking Information</h3>
          <p className="text-sm text-gray-400">
            This information is required for payment processing. Your banking details are securely encrypted.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Account Holder Name *
              </label>
              <input
                type="text"
                value={data.accountHolderName}
                onChange={(e) => handleBankingChange('accountHolderName', e.target.value)}
                placeholder="Enter account holder name"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Account Number *
              </label>
              <input
                type="text"
                value={data.accountNumber}
                onChange={(e) => handleBankingChange('accountNumber', e.target.value)}
                placeholder="Enter account number"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Transit Number *
              </label>
              <input
                type="text"
                value={data.transitNumber}
                onChange={(e) => handleBankingChange('transitNumber', e.target.value)}
                placeholder="Enter transit number"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Institution Number *
              </label>
              <input
                type="text"
                value={data.institutionNumber}
                onChange={(e) => handleBankingChange('institutionNumber', e.target.value)}
                placeholder="Enter institution number"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

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

        {/* Comprehensive Consent and Declarations */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Consent and Declarations</h3>
          <p className="text-sm text-gray-400">
            Please review and agree to all the following consent and declarations to complete your registration.
          </p>
          
          <div className="space-y-4">
            {/* Legal Consents */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-orange-400">Legal Consents</h4>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.termsOfService}
                  onChange={(e) => handleConsentChange('termsOfService', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I have read and agree to the Terms of Service and all applicable laws and regulations.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.privacyPolicy}
                  onChange={(e) => handleConsentChange('privacyPolicy', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I have read and agree to the Privacy Policy and consent to the collection and use of my personal information.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.backgroundCheckConsent}
                  onChange={(e) => handleConsentChange('backgroundCheckConsent', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I consent to a comprehensive background check including criminal record, driving record, and employment verification.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.dataUsageConsent}
                  onChange={(e) => handleConsentChange('dataUsageConsent', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I consent to the use of my data for service delivery, safety, and regulatory compliance purposes.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.electronicCommunicationConsent}
                  onChange={(e) => handleConsentChange('electronicCommunicationConsent', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I consent to receive electronic communications including emails, SMS, and app notifications.
                </span>
              </label>
            </div>

            {/* Driver Declarations */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-orange-400">Driver Declarations</h4>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.driverDeclaration}
                  onChange={(e) => handleConsentChange('driverDeclaration', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I declare that I hold a valid driver's license and am legally authorized to operate a motor vehicle.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.vehicleDeclaration}
                  onChange={(e) => handleConsentChange('vehicleDeclaration', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I declare that my vehicle is properly registered, insured, and meets all safety requirements.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.insuranceDeclaration}
                  onChange={(e) => handleConsentChange('insuranceDeclaration', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I declare that I maintain valid auto insurance coverage as required by law.
                </span>
              </label>
            </div>

            {/* Legal Declarations */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-orange-400">Legal Declarations</h4>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.criminalRecordDeclaration}
                  onChange={(e) => handleConsentChange('criminalRecordDeclaration', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I declare that I have disclosed all relevant criminal history and understand that failure to disclose may result in immediate termination.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.consentAndDeclarations.employmentEligibilityDeclaration}
                  onChange={(e) => handleConsentChange('employmentEligibilityDeclaration', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                />
                <span className="text-white text-sm">
                  I declare that I am legally eligible to work in Canada and have provided valid work authorization documents.
                </span>
              </label>
            </div>
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
            {!isBankingValid && <div>Please fill in all banking information.</div>}
            {!isConsentValid && <div>Please agree to the terms and consent to background check.</div>}
            {!isAllConsentValid && <div>Please agree to all consent and declarations.</div>}
          </div>
        )}
      </form>
    </div>
  );
};

export default Stage4BackgroundCheck;
