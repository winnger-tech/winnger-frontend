'use client';

import React, { useState } from 'react';
import { FormInput } from '../../components/common/FormInput';

export default function ValidationTestPage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: ''
  });

  const [errors, setErrors] = useState<any>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        if (!value?.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
        return '';
      case 'phone':
        if (!value?.trim()) return 'Phone number is required';
        if (!/^\+?1?\d{10,14}$/.test(value.replace(/[\s-()]/g, ''))) return 'Please enter a valid phone number';
        return '';
      case 'name':
        if (!value?.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Real-time Validation Test
        </h1>
        
        <div className="space-y-6">
          <FormInput
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            error={errors.name}
            required
            placeholder="Enter your full name"
          />
          
          <FormInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            error={errors.email}
            required
            placeholder="Enter your email"
          />
          
          <FormInput
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            required
            placeholder="+1-XXX-XXX-XXXX"
          />
        </div>
      </div>
    </div>
  );
} 