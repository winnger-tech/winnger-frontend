'use client';

import React, { useState } from 'react';
import { useDashboard } from '../../../context/DashboardContext';

interface Stage3VehicleInfoProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function Stage3VehicleInfo({ onNext, onPrevious }: Stage3VehicleInfoProps) {
  const { state, actions } = useDashboard();
  const currentStageData = state.userData?.stage3 || {};
  
  const [formData, setFormData] = useState({
    vehicleYear: currentStageData.vehicleYear || '',
    vehicleMake: currentStageData.vehicleMake || '',
    vehicleModel: currentStageData.vehicleModel || '',
    vehicleColor: currentStageData.vehicleColor || '',
    licensePlate: currentStageData.licensePlate || '',
    vehicleType: currentStageData.vehicleType || '',
    insuranceProvider: currentStageData.insuranceProvider || '',
    insurancePolicyNumber: currentStageData.insurancePolicyNumber || '',
    insuranceExpiryDate: currentStageData.insuranceExpiryDate || '',
    hasValidLicense: currentStageData.hasValidLicense || false,
    licenseNumber: currentStageData.licenseNumber || '',
    licenseExpiryDate: currentStageData.licenseExpiryDate || '',
    ...currentStageData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation function
  const validateField = (name: string, value: any) => {
    switch (name) {
      case 'vehicleYear':
        if (!value?.toString().trim()) {
          return 'Vehicle year is required';
        } else {
          const year = parseInt(value.toString());
          const currentYear = new Date().getFullYear();
          if (year < 1990 || year > currentYear + 1) {
            return `Vehicle year must be between 1990 and ${currentYear + 1}`;
          }
        }
        return '';
      
      case 'vehicleMake':
        if (!value?.toString().trim()) {
          return 'Vehicle make is required';
        }
        return '';
      
      case 'vehicleModel':
        if (!value?.toString().trim()) {
          return 'Vehicle model is required';
        }
        return '';
      
      case 'vehicleColor':
        if (!value?.toString().trim()) {
          return 'Vehicle color is required';
        }
        return '';
      
      case 'licensePlate':
        if (!value?.toString().trim()) {
          return 'License plate is required';
        }
        return '';
      
      case 'vehicleType':
        if (!value?.toString().trim()) {
          return 'Vehicle type is required';
        }
        return '';
      
      case 'insuranceProvider':
        if (!value?.toString().trim()) {
          return 'Insurance provider is required';
        }
        return '';
      
      case 'insurancePolicyNumber':
        if (!value?.toString().trim()) {
          return 'Insurance policy number is required';
        }
        return '';
      
      case 'insuranceExpiryDate':
        if (!value?.toString().trim()) {
          return 'Insurance expiry date is required';
        }
        return '';
      
      case 'licenseNumber':
        if (formData.hasValidLicense && !value?.toString().trim()) {
          return 'License number is required';
        }
        return '';
      
      case 'licenseExpiryDate':
        if (formData.hasValidLicense && !value?.toString().trim()) {
          return 'License expiry date is required';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev: any) => ({ ...prev, [name]: inputValue }));
    
    // Real-time validation
    const fieldError = validateField(name, inputValue);
    setErrors(prev => ({ 
      ...prev, 
      [name]: fieldError 
    }));

    // Auto-save after a short delay
    setTimeout(() => {
      actions.autoSave(3, { ...formData, [name]: inputValue });
    }, 1000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate all fields
    Object.keys(formData).forEach(field => {
      if (['vehicleYear', 'vehicleMake', 'vehicleModel', 'vehicleColor', 'licensePlate', 'vehicleType', 'insuranceProvider', 'insurancePolicyNumber', 'insuranceExpiryDate', 'licenseNumber', 'licenseExpiryDate'].includes(field)) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      actions.updateStageData(3, formData);
      onNext();
    }
  };

  const handlePrevious = () => {
    actions.updateStageData(3, formData);
    onPrevious();
  };

  const vehicleTypes = [
    { value: '', label: 'Select Vehicle Type' },
    { value: 'car', label: 'Car' },
    { value: 'suv', label: 'SUV' },
    { value: 'truck', label: 'Truck' },
    { value: 'van', label: 'Van' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'scooter', label: 'Scooter' },
    { value: 'bicycle', label: 'Bicycle' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg pt-28">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Information</h2>
        <p className="text-gray-600">Please provide details about your vehicle and insurance.</p>
      </div>

      <div className="space-y-6">
        {/* Vehicle Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <select
                id="vehicleYear"
                name="vehicleYear"
                value={formData.vehicleYear}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleYear ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.vehicleYear && <p className="text-red-500 text-sm mt-1">{errors.vehicleYear}</p>}
            </div>

            <div>
              <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 mb-1">
                Make *
              </label>
              <input
                type="text"
                id="vehicleMake"
                name="vehicleMake"
                value={formData.vehicleMake}
                onChange={handleInputChange}
                placeholder="e.g., Toyota, Honda, Ford"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleMake ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.vehicleMake && <p className="text-red-500 text-sm mt-1">{errors.vehicleMake}</p>}
            </div>

            <div>
              <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                type="text"
                id="vehicleModel"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleInputChange}
                placeholder="e.g., Camry, Civic, F-150"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleModel ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.vehicleModel && <p className="text-red-500 text-sm mt-1">{errors.vehicleModel}</p>}
            </div>

            <div>
              <label htmlFor="vehicleColor" className="block text-sm font-medium text-gray-700 mb-1">
                Color *
              </label>
              <input
                type="text"
                id="vehicleColor"
                name="vehicleColor"
                value={formData.vehicleColor}
                onChange={handleInputChange}
                placeholder="e.g., Red, Blue, Silver"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleColor ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.vehicleColor && <p className="text-red-500 text-sm mt-1">{errors.vehicleColor}</p>}
            </div>

            <div>
              <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
                License Plate *
              </label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                placeholder="ABC-123"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.licensePlate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.licensePlate && <p className="text-red-500 text-sm mt-1">{errors.licensePlate}</p>}
            </div>

            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type *
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {vehicleTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Provider *
              </label>
              <input
                type="text"
                id="insuranceProvider"
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleInputChange}
                placeholder="e.g., State Farm, Allstate"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.insuranceProvider ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.insuranceProvider && <p className="text-red-500 text-sm mt-1">{errors.insuranceProvider}</p>}
            </div>

            <div>
              <label htmlFor="insurancePolicyNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Policy Number *
              </label>
              <input
                type="text"
                id="insurancePolicyNumber"
                name="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={handleInputChange}
                placeholder="Policy number"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.insurancePolicyNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.insurancePolicyNumber && <p className="text-red-500 text-sm mt-1">{errors.insurancePolicyNumber}</p>}
            </div>

            <div>
              <label htmlFor="insuranceExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Expiry Date *
              </label>
              <input
                type="date"
                id="insuranceExpiryDate"
                name="insuranceExpiryDate"
                value={formData.insuranceExpiryDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.insuranceExpiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.insuranceExpiryDate && <p className="text-red-500 text-sm mt-1">{errors.insuranceExpiryDate}</p>}
            </div>
          </div>
        </div>

        {/* Driver's License */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Driver's License</h3>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="hasValidLicense"
                checked={formData.hasValidLicense}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">I have a valid driver's license</span>
            </label>
          </div>

          {formData.hasValidLicense && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  License Number *
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="License number"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>

              <div>
                <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  License Expiry Date *
                </label>
                <input
                  type="date"
                  id="licenseExpiryDate"
                  name="licenseExpiryDate"
                  value={formData.licenseExpiryDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.licenseExpiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.licenseExpiryDate && <p className="text-red-500 text-sm mt-1">{errors.licenseExpiryDate}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={handlePrevious}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
