import React, { useState } from 'react';
import {
  InputField,
  DatePicker,
  Select,
  CameraUpload,
  provinceOptions
} from '../common/FormComponents';
import { GoogleMapsPicker } from '../common/GoogleMapsPicker';
import { CustomerInfo } from '@/types/forms';
import * as validation from '@/utils/validation';

interface CustomerRegistrationProps {
  onSubmit: (data: CustomerInfo) => void;
}

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

export const CustomerRegistration: React.FC<CustomerRegistrationProps> = ({ onSubmit }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: new Date(),
    email: '',
    cellNumber: '',
    streetNameNumber: '',
    appUniteNumber: '',
    city: '',
    province: 'Ontario',
    postalCode: '',
    profilePicture: null as unknown as File,
    gender: 'Male'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};

    // Validation
    if (!validation.isValidName(customerInfo.firstName)) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    if (!validation.isValidName(customerInfo.lastName)) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    if (!validation.isOver18(customerInfo.dateOfBirth)) {
      newErrors.dateOfBirth = 'Must be at least 18 years old';
    }
    if (!validation.isValidEmail(customerInfo.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!validation.isValidPhoneNumber(customerInfo.cellNumber)) {
      newErrors.cellNumber = 'Invalid phone number format (+1-XXX-XXX-XXXX)';
    }
    if (!customerInfo.streetNameNumber) {
      newErrors.streetNameNumber = 'Street name and number is required';
    }
    if (!customerInfo.city) {
      newErrors.city = 'City is required';
    }
    if (!customerInfo.postalCode) {
      newErrors.postalCode = 'Postal code is required';
    }
    if (!customerInfo.profilePicture) {
      newErrors.profilePicture = 'Profile picture is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(customerInfo);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Customer Registration</h2>

      <div className="mb-8">
        <InputField
          label="First Name"
          type="text"
          value={customerInfo.firstName}
          onChange={(value) => setCustomerInfo({ ...customerInfo, firstName: value })}
          error={errors.firstName}
          required
        />
        <InputField
          label="Middle Name"
          type="text"
          value={customerInfo.middleName || ''}
          onChange={(value) => setCustomerInfo({ ...customerInfo, middleName: value })}
        />
        <InputField
          label="Last Name"
          type="text"
          value={customerInfo.lastName}
          onChange={(value) => setCustomerInfo({ ...customerInfo, lastName: value })}
          error={errors.lastName}
          required
        />
        <DatePicker
          label="Date of Birth"
          value={customerInfo.dateOfBirth}
          onChange={(date) => setCustomerInfo({ ...customerInfo, dateOfBirth: date })}
          error={errors.dateOfBirth}
          required
        />
        <InputField
          label="Email Address"
          type="email"
          value={customerInfo.email}
          onChange={(value) => setCustomerInfo({ ...customerInfo, email: value })}
          error={errors.email}
          required
        />
        <InputField
          label="Cell Number"
          type="tel"
          value={customerInfo.cellNumber}
          onChange={(value) => setCustomerInfo({ ...customerInfo, cellNumber: value })}
          placeholder="+1-XXX-XXX-XXXX"
          error={errors.cellNumber}
          required
        />
        <GoogleMapsPicker
          label="Address"
          onAddressSelect={(address) => {
            setCustomerInfo({
              ...customerInfo,
              streetNameNumber: address.streetNameNumber,
              appUniteNumber: address.appUniteNumber || '',
              city: address.city,
              province: address.province as any,
              postalCode: address.postalCode
            });
          }}
          error={errors.address}
          required
        />
        <CameraUpload
          label="Profile Picture"
          onCapture={(file) => setCustomerInfo({ ...customerInfo, profilePicture: file })}
          error={errors.profilePicture}
          accept="image/*"
          required
        />
        <Select
          label="Gender"
          options={genderOptions}
          value={customerInfo.gender}
          onChange={(value) => setCustomerInfo({ ...customerInfo, gender: value as 'Male' | 'Female' | 'Other' })}
          error={errors.gender}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit Registration
      </button>
    </form>
  );
}; 