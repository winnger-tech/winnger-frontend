'use client';

import React, { useState } from 'react';
import { useDashboard } from '../../../context/DashboardContext';

interface Stage2DriverDetailsProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function Stage2DriverDetails({ onNext, onPrevious }: Stage2DriverDetailsProps) {
  const { state, actions } = useDashboard();
  const currentStageData = state.userData?.stage2 || {};
  
  const [formData, setFormData] = useState({
    phoneNumber: currentStageData.phoneNumber || '',
    dateOfBirth: currentStageData.dateOfBirth || '',
    address: currentStageData.address || '',
    city: currentStageData.city || '',
    province: currentStageData.province || '',
    postalCode: currentStageData.postalCode || '',
    emergencyContactName: currentStageData.emergencyContactName || '',
    emergencyContactPhone: currentStageData.emergencyContactPhone || '',
    ...currentStageData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation function
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'phoneNumber':
        if (!value?.trim()) {
          return 'Phone number is required';
        } else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(value)) {
          return 'Please enter a valid phone number (xxx) xxx-xxxx';
        }
        return '';
      
      case 'dateOfBirth':
        if (!value?.trim()) {
          return 'Date of birth is required';
        }
        return '';
      
      case 'address':
        if (!value?.trim()) {
          return 'Address is required';
        }
        return '';
      
      case 'city':
        if (!value?.trim()) {
          return 'City is required';
        }
        return '';
      
      case 'province':
        if (!value?.trim()) {
          return 'Province is required';
        }
        return '';
      
      case 'postalCode':
        if (!value?.trim()) {
          return 'Postal code is required';
        } else if (!/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(value.toUpperCase())) {
          return 'Please enter a valid postal code (A1A 1A1)';
        }
        return '';
      
      case 'emergencyContactName':
        if (!value?.trim()) {
          return 'Emergency contact name is required';
        }
        return '';
      
      case 'emergencyContactPhone':
        if (!value?.trim()) {
          return 'Emergency contact phone is required';
        } else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(value)) {
          return 'Please enter a valid phone number (xxx) xxx-xxxx';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const fieldError = validateField(name, value);
    setErrors(prev => ({ 
      ...prev, 
      [name]: fieldError 
    }));

    // Auto-save after a short delay
    setTimeout(() => {
      actions.autoSave(2, { ...formData, [name]: value });
    }, 1000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate all fields
    Object.keys(formData).forEach(field => {
      if (['phoneNumber', 'dateOfBirth', 'address', 'city', 'province', 'postalCode', 'emergencyContactName', 'emergencyContactPhone'].includes(field)) {
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
      actions.updateStageData(2, formData);
      onNext();
    }
  };

  const handlePrevious = () => {
    actions.updateStageData(2, formData);
    onPrevious();
  };

  const provinces = [
    { value: '', label: 'Select Province' },
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Details</h2>
        <p className="text-gray-600">Please provide your personal information and emergency contact details.</p>
      </div>

      <div className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="(xxx) xxx-xxxx"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Address Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Toronto"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  Province *
                </label>
                <select
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.province ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {provinces.map(province => (
                    <option key={province.value} value={province.value}>
                      {province.label}
                    </option>
                  ))}
                </select>
                {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="A1A 1A1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.emergencyContactName && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>}
            </div>

            <div>
              <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                placeholder="(xxx) xxx-xxxx"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.emergencyContactPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>}
            </div>
          </div>
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
