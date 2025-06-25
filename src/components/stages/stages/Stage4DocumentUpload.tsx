"use client";

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../../context/DashboardContext';
import { FileUpload } from '../../common/FileUpload';

interface DocumentUploadData {
  driversLicense: File | null;
  insurance: File | null;
  registration: File | null;
  backgroundCheck: File | null;
}

const Stage4DocumentUpload: React.FC = () => {
  const { state, actions } = useDashboard();
  const [data, setData] = useState<DocumentUploadData>({
    driversLicense: null,
    insurance: null,
    registration: null,
    backgroundCheck: null
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing data
    const existingData = state.userData?.[`stage4`];
    if (existingData) {
      setData(existingData);
    }
  }, [state.userData]);

  const handleFileChange = (fieldName: keyof DocumentUploadData, file: File | null) => {
    const updatedData = { ...data, [fieldName]: file };
    setData(updatedData);
    
    // Auto-save when file is uploaded
    actions.autoSave(4, updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save current stage data
      await actions.updateStageData(4, data);
      
      // Move to next stage
      actions.navigateToStage(5);
    } catch (error) {
      console.error('Error saving Stage 4 data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = data.driversLicense && data.insurance && data.registration;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Document Upload</h2>
        <p className="text-gray-300">
          Upload the required documents to verify your eligibility as a driver.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Driver's License */}
        <div className="space-y-2">
          <FileUpload
            label="Driver's License"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileChange('driversLicense', file)}
            error={!data.driversLicense ? 'Driver\'s license is required' : undefined}
          />
        </div>

        {/* Insurance */}
        <div className="space-y-2">
          <FileUpload
            label="Vehicle Insurance"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileChange('insurance', file)}
            error={!data.insurance ? 'Vehicle insurance is required' : undefined}
          />
        </div>

        {/* Vehicle Registration */}
        <div className="space-y-2">
          <FileUpload
            label="Vehicle Registration"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileChange('registration', file)}
            error={!data.registration ? 'Vehicle registration is required' : undefined}
          />
        </div>

        {/* Background Check (Optional) */}
        <div className="space-y-2">
          <FileUpload
            label="Background Check (Optional)"
            required={false}
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileChange('backgroundCheck', file)}
          />
          <p className="text-sm text-gray-400">
            If you don't have a background check, we can help you obtain one in the next step.
          </p>
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
            Please upload all required documents to continue.
          </div>
        )}
      </form>
    </div>
  );
};

export default Stage4DocumentUpload;
