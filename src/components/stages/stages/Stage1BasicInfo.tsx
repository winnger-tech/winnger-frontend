'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Stage1Props {
  data: any;
  onChange: (data: any) => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  errors: any;
  userType: 'driver' | 'restaurant';
}

interface ValidationErrors {
  [key: string]: string;
}

export default function Stage1BasicInfo({ 
  data, 
  onChange, 
  onSubmit, 
  loading, 
  errors,
  userType 
}: Stage1Props) {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Profile photo upload handler
  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setValidationErrors(prev => ({
        ...prev,
        profilePhotoUrl: 'Please upload a JPG or PNG image file.'
      }));
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setValidationErrors(prev => ({
        ...prev,
        profilePhotoUrl: 'File size too large. Maximum file size is 10MB.'
      }));
      return;
    }

    setUploadingPhoto(true);
    setValidationErrors(prev => ({ ...prev, profilePhotoUrl: '' }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/drivers/upload?type=profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Update the data with the S3 URL
      onChange({ 
        ...data, 
        profilePhotoUrl: result.url 
      });

      console.log('Profile photo uploaded successfully:', result);
    } catch (error) {
      console.error('Upload error:', error);
      setValidationErrors(prev => ({
        ...prev,
        profilePhotoUrl: error instanceof Error ? error.message : 'Upload failed. Please try again.'
      }));
    } finally {
      setUploadingPhoto(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Postal code formatting function
  const formatPostalCode = (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    const match = cleaned.match(/^([A-Z]\d[A-Z])(\d[A-Z]\d)$/);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    return value.toUpperCase();
  };

  // Real-time validation functions
  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (!phone) return 'Phone number is required';
    if (cleaned.length !== 10) return 'Phone number must be 10 digits';
    return '';
  };

  const validatePostalCode = (postal: string) => {
    const cleaned = postal.replace(/\s/g, '');
    if (!postal) return 'Postal code is required';
    const postalRegex = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;
    if (!postalRegex.test(cleaned)) return 'Valid postal code format required (A1A 1A1)';
    return '';
  };

  const validateProvince = (province: string) => {
    if (!province) return 'Province selection is required';
    return '';
  };

  const validateRequired = (value: string, fieldName: string) => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return '';
  };

  const validateDate = (date: string) => {
    if (!date) return 'Date of birth is required';
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) return 'Must be at least 18 years old';
    if (age > 80) return 'Please enter a valid date of birth';
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let error = '';

    // Apply formatting and validation based on field
    switch (name) {
      case 'cellNumber':
        formattedValue = formatPhoneNumber(value);
        error = validatePhoneNumber(formattedValue);
        break;
      case 'postalCode':
        formattedValue = formatPostalCode(value);
        error = validatePostalCode(formattedValue);
        break;
      case 'province':
        error = validateProvince(value);
        break;
      case 'dateOfBirth':
        error = validateDate(value);
        break;
      case 'streetNameNumber':
        error = validateRequired(value, 'Street address');
        break;
      case 'city':
        error = validateRequired(value, 'City');
        break;
      case 'profilePhotoUrl':
        // Optional field - only validate if value is provided
        if (value && value.trim() !== '') {
          const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          if (!urlRegex.test(value)) {
            error = 'Please enter a valid URL';
          }
        }
        break;
      case 'ownerName':
        error = validateRequired(value, 'Owner name');
        break;
    }

    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));

    onChange({ [name]: formattedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields before submit
    const newErrors: ValidationErrors = {};
    
    if (userType === 'driver') {
      // Validate all required fields for drivers
      newErrors.dateOfBirth = validateDate(data.dateOfBirth || '');
      newErrors.cellNumber = validatePhoneNumber(data.cellNumber || '');
      newErrors.streetNameNumber = validateRequired(data.streetNameNumber || '', 'Street address');
      newErrors.city = validateRequired(data.city || '', 'City');
      newErrors.province = validateProvince(data.province || '');
      newErrors.postalCode = validatePostalCode(data.postalCode || '');
    } else if (userType === 'restaurant') {
      // Validate required fields for restaurants
      newErrors.ownerName = validateRequired(data.ownerName || '', 'Owner name');
    }

    setValidationErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    console.log('🚀 Stage1 submission:', {
      hasErrors,
      newErrors,
      data,
      userType
    });
    
    if (!hasErrors) {
      console.log('✅ Stage1 validation passed, calling onSubmit');
      onSubmit(data);
    } else {
      console.log('❌ Stage1 validation failed:', newErrors);
    }
  };

  return (
    <Container
      as={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <StageCard>
        <CardHeader>
          <Title>Personal Information</Title>
          <Description>
            Complete your personal details and contact information
          </Description>
        </CardHeader>

        <Form onSubmit={handleSubmit}>
          {userType === 'driver' && (
            <>
              {/* Basic Information Section */}
              <SectionTitle>Basic Information</SectionTitle>
              <InputRow>
                <InputGroup>
                  <Label>First Name *</Label>
                  <Input
                    type="text"
                    name="firstName"
                    value={data.firstName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    readOnly
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Last Name *</Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={data.lastName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    readOnly
                  />
                </InputGroup>
              </InputRow>

              <InputRow>
                <InputGroup>
                  <Label>Middle Name</Label>
                  <Input
                    type="text"
                    name="middleName"
                    value={data.middleName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your middle name (optional)"
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    name="email"
                    value={data.email || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    readOnly
                  />
                </InputGroup>
              </InputRow>

              {/* Personal Details Section */}
              <SectionTitle>Personal Details</SectionTitle>
              <InputRow>
                <InputGroup>
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={data.dateOfBirth || ''}
                    onChange={handleInputChange}
                    style={{
                      borderColor: validationErrors.dateOfBirth ? '#ff4757' : '#e1e1e1'
                    }}
                  />
                  {validationErrors.dateOfBirth && (
                    <ErrorText>{validationErrors.dateOfBirth}</ErrorText>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label>Cell Number *</Label>
                  <Input
                    type="tel"
                    name="cellNumber"
                    value={data.cellNumber || ''}
                    onChange={handleInputChange}
                    placeholder="(123) 456-7890"
                    style={{
                      borderColor: validationErrors.cellNumber ? '#ff4757' : '#e1e1e1'
                    }}
                  />
                  {validationErrors.cellNumber && (
                    <ErrorText>{validationErrors.cellNumber}</ErrorText>
                  )}
                </InputGroup>
              </InputRow>

              {/* Address Information Section */}
              <SectionTitle>Address Information</SectionTitle>
              <InputRow>
                <InputGroup>
                  <Label>Street Name & Number *</Label>
                  <Input
                    type="text"
                    name="streetNameNumber"
                    value={data.streetNameNumber || ''}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    style={{
                      borderColor: validationErrors.streetNameNumber ? '#ff4757' : '#e1e1e1'
                    }}
                  />
                  {validationErrors.streetNameNumber && (
                    <ErrorText>{validationErrors.streetNameNumber}</ErrorText>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label>Apartment/Unit Number</Label>
                  <Input
                    type="text"
                    name="appUniteNumber"
                    value={data.appUniteNumber || ''}
                    onChange={handleInputChange}
                    placeholder="Apt 4B (optional)"
                  />
                </InputGroup>
              </InputRow>

              <InputRow>
                <InputGroup>
                  <Label>City *</Label>
                  <Input
                    type="text"
                    name="city"
                    value={data.city || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    style={{
                      borderColor: validationErrors.city ? '#ff4757' : '#e1e1e1'
                    }}
                  />
                  {validationErrors.city && (
                    <ErrorText>{validationErrors.city}</ErrorText>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label>Province *</Label>
                  <Select
                    name="province"
                    value={data.province || ''}
                    onChange={handleInputChange}
                    style={{
                      borderColor: validationErrors.province ? '#ff4757' : '#e1e1e1'
                    }}
                  >
                    <option value="">Select Province</option>
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="ON">Ontario</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NU">Nunavut</option>
                    <option value="YT">Yukon</option>
                  </Select>
                  {validationErrors.province && (
                    <ErrorText>{validationErrors.province}</ErrorText>
                  )}
                </InputGroup>
              </InputRow>

              <InputRow>
                <InputGroup>
                  <Label>Postal Code *</Label>
                  <Input
                    type="text"
                    name="postalCode"
                    value={data.postalCode || ''}
                    onChange={handleInputChange}
                    placeholder="A1A 1A1"
                    style={{
                      borderColor: validationErrors.postalCode ? '#ff4757' : '#e1e1e1'
                    }}
                  />
                  {validationErrors.postalCode && (
                    <ErrorText>{validationErrors.postalCode}</ErrorText>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label>Profile Photo</Label>
                  <ProfilePhotoUpload>
                    {data.profilePhotoUrl && (
                      <ProfilePhotoPreview>
                        <img src={data.profilePhotoUrl} alt="Profile Preview" />
                        <RemovePhotoButton
                          type="button"
                          onClick={() => {
                            onChange({ ...data, profilePhotoUrl: '' });
                          }}
                        >
                          ×
                        </RemovePhotoButton>
                      </ProfilePhotoPreview>
                    )}
                    <FileUploadContainer>
                      <FileInput
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleProfilePhotoUpload}
                        id="profilePhoto"
                      />
                      <FileUploadLabel htmlFor="profilePhoto">
                        {uploadingPhoto ? (
                          <UploadingText>
                            <span>Uploading...</span>
                            <LoadingSpinner />
                          </UploadingText>
                        ) : (
                          <>
                            <UploadIcon>📷</UploadIcon>
                            <span>{data.profilePhotoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                            <span style={{ fontSize: '12px', color: '#666' }}>(Optional)</span>
                          </>
                        )}
                      </FileUploadLabel>
                    </FileUploadContainer>
                  </ProfilePhotoUpload>
                  {validationErrors.profilePhotoUrl && (
                    <ErrorText>{validationErrors.profilePhotoUrl}</ErrorText>
                  )}
                </InputGroup>
              </InputRow>
            </>
          )}

          {userType === 'restaurant' && (
            <InputGroup>
              <Label>Restaurant Owner Name *</Label>
              <Input
                type="text"
                name="ownerName"
                value={data.ownerName || ''}
                onChange={handleInputChange}
                placeholder="Enter owner name"
                readOnly
                style={{
                  borderColor: validationErrors.ownerName ? '#ff4757' : '#e1e1e1'
                }}
              />
              {validationErrors.ownerName && (
                <ErrorText>{validationErrors.ownerName}</ErrorText>
              )}
            </InputGroup>
          )}

          <SubmitButton 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Continue to Next Step'}
          </SubmitButton>
        </Form>
      </StageCard>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding-top: 110px;
`;

const StageCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #403E2D;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #403E2D;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #e1e1e1;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
  background: ${props => props.readOnly ? '#f5f5f5' : 'white'};
  color: #111;

  &:focus {
    outline: none;
    border-color: #ffc32b;
    box-shadow: 0 0 0 3px rgba(255, 195, 43, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const InfoNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 195, 43, 0.1);
  border: 1px solid rgba(255, 195, 43, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
`;

const InfoIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const InfoText = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
  min-width: 200px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 195, 43, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #403E2D;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const Select = styled.select`
  padding: 1rem;
  border: 2px solid #e1e1e1;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
  background: white;
  color: #111;

  &:focus {
    outline: none;
    border-color: #ffc32b;
    box-shadow: 0 0 0 3px rgba(255, 195, 43, 0.1);
  }

  option {
    color: #111;
    background: white;
  }
`;

const ErrorText = styled.span`
  color: #ff4757;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
  font-weight: 500;
`;

// Profile Photo Upload Styled Components
const ProfilePhotoUpload = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProfilePhotoPreview = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #ffc32b;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemovePhotoButton = styled.button`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 30px;
  height: 30px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff3742;
    transform: scale(1.1);
  }
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 2px dashed #e1e1e1;
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 200px;
  
  &:hover {
    border-color: #ffc32b;
    background: rgba(255, 195, 43, 0.05);
  }
`;

const UploadIcon = styled.span`
  font-size: 2rem;
`;

const UploadingText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e1e1e1;
  border-top: 2px solid #ffc32b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
