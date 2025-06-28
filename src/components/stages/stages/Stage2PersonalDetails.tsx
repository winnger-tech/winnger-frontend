'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/constants/ValidationConstants';
// import stageService from '@/services/stageService';
import { uploadFile } from '@/services/s3Service';



interface Stage2Props {
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

export default function Stage2PersonalDetails({
  data,
  onChange,
  onSubmit,
  loading,
  errors,
  userType
}: Stage2Props) {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  console.log("BUCKET NAME")
  console.log(process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME);

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

  const validateUploadedFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload a JPEG or PNG file.";
    } else if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds the maximum limit of ${MAX_FILE_SIZE / 1024}KB.`;
    }
  }

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
      case 'firstName':
        error = validateRequired(value, 'First name');
        break;
      case 'lastName':
        error = validateRequired(value, 'Last name');
        break;
      case 'middleName':
        // Middle name is optional, so no validation needed
        error = validateRequired(value, 'Middle name');
        break;
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
      case 'profilePhoto':
        // Optional field - only validate if value is provided
        // if (value && value.trim() !== '') {
        //   const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        //   if (!urlRegex.test(value)) {
        //     error = 'Please enter a valid URL';
        //   }
        // }
        error = handleFilesSelect(e.target.files || []);
        setSelectedFile(e.target.files ? e.target.files[0] : null);
        formattedValue = e.target.files[0].name;

        if (!error) {
          onChange({ profilePhotoUrl: "https://example.com/there" });
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

  const handleFilesSelect = (fileList) => {
    console.log("Handle files", fileList);
    // const file = files[0];

    for (const file of fileList) {
      validateUploadedFile(file);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields before submit
    const newErrors: ValidationErrors = {};

    if (userType === 'driver') {
      // Validate all required fields for drivers
      newErrors.firstName = validateRequired(data.firstName || '', 'First name');
      newErrors.lastName = validateRequired(data.lastName || '', 'Last name');
      newErrors.dateOfBirth = validateDate(data.dateOfBirth || '');
      newErrors.cellNumber = validatePhoneNumber(data.cellNumber || '');
      newErrors.streetNameNumber = validateRequired(data.streetNameNumber || '', 'Street address');
      newErrors.city = validateRequired(data.city || '', 'City');
      newErrors.province = validateProvince(data.province || '');
      newErrors.postalCode = validatePostalCode(data.postalCode || '');

      newErrors.middleName = validateRequired(data.middleName || '', 'Last name');
      newErrors.profilePhoto = validateUploadedFile(selectedFile) || '';

    } else if (userType === 'restaurant') {
      // Validate required fields for restaurants
      newErrors.ownerName = validateRequired(data.ownerName || '', 'Owner name');
    }

    setValidationErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');

    console.log('🚀 Stage2 submission:', {
      hasErrors,
      newErrors,
      data,
      userType
    });

    if (!hasErrors) {
      console.log('✅ Stage2 validation passed, calling onSubmit');


      const fileURL = await uploadFile(selectedFile);
      onSubmit({...data, profilePhotoUrl: fileURL.url});
    } else {
      console.log('❌ Stage2 validation failed:', newErrors);
    }
  };

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
                  />
                  {(validationErrors.firstName || errors?.firstName) && (
                    <ErrorText>{validationErrors.firstName || errors.firstName}</ErrorText>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label>Last Name *</Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={data.lastName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                  {(validationErrors.lastName || errors?.lastName) && (
                    <ErrorText>{validationErrors.lastName || errors.lastName}</ErrorText>
                  )}
                </InputGroup>
              </InputRow>

              <InputGroup>
                <Label>Middle Name *</Label>
                <Input
                  type="text"
                  name="middleName"
                  value={data.middleName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your middle name"
                />
                {(validationErrors.middleName || errors?.middleName) && (
                  <ErrorText>{validationErrors.middleName || errors.middleName}</ErrorText>
                )}
              </InputGroup>

              <InputGroup>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  name="email"
                  value={data.email || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  disabled
                />
                <HelperText>Email from registration</HelperText>
              </InputGroup>

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
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {(validationErrors.dateOfBirth || errors?.dateOfBirth) && (
                    <ErrorText>{validationErrors.dateOfBirth || errors.dateOfBirth}</ErrorText>
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
                  />
                  {(validationErrors.cellNumber || errors?.cellNumber) && (
                    <ErrorText>{validationErrors.cellNumber || errors.cellNumber}</ErrorText>
                  )}
                </InputGroup>
              </InputRow>

              {/* Address Information Section */}
              <SectionTitle>Address Information</SectionTitle>
              <InputGroup>
                <Label>Street Name & Number *</Label>
                <Input
                  type="text"
                  name="streetNameNumber"
                  value={data.streetNameNumber || ''}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                />
                {(validationErrors.streetNameNumber || errors?.streetNameNumber) && (
                  <ErrorText>{validationErrors.streetNameNumber || errors.streetNameNumber}</ErrorText>
                )}
              </InputGroup>

              <InputGroup>
                <Label>App/Unit Number</Label>
                <Input
                  type="text"
                  name="appUniteNumber"
                  value={data.appUniteNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Apt 4B (optional)"
                />
              </InputGroup>

              <InputRow>
                <InputGroup>
                  <Label>City *</Label>
                  <Input
                    type="text"
                    name="city"
                    value={data.city || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                  />
                  {(validationErrors.city || errors?.city) && (
                    <ErrorText>{validationErrors.city || errors.city}</ErrorText>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label>Province *</Label>
                  <Select
                    name="province"
                    value={data.province || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Province</option>
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NU">Nunavut</option>
                    <option value="ON">Ontario</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="YT">Yukon</option>
                  </Select>
                  {(validationErrors.province || errors?.province) && (
                    <ErrorText>{validationErrors.province || errors.province}</ErrorText>
                  )}
                </InputGroup>
              </InputRow>

              <InputGroup>
                <Label>Postal Code *</Label>
                <Input
                  type="text"
                  name="postalCode"
                  value={data.postalCode || ''}
                  onChange={handleInputChange}
                  placeholder="A1A 1A1"
                  maxLength={7}
                />
                {(validationErrors.postalCode || errors?.postalCode) && (
                  <ErrorText>{validationErrors.postalCode || errors.postalCode}</ErrorText>
                )}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="profilePhoto">Select Profile Photo *</Label>
                <UploadFileInput
                  type="file"
                  id="profilePhoto"
                  name="profilePhoto"
                  accept="image/*"
                  onChange={handleInputChange}
                />

                {/* {selectedFile && (
                  <ImagePreview>
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" />
                    <span>{selectedFile?.name}</span>
                  </ImagePreview>
                )} */}

                {(validationErrors.profilePhoto || errors?.profilePhoto) && (
                  <ErrorText>{validationErrors.profilePhoto || errors.profilePhoto}</ErrorText>
                )}
              </InputGroup>

              {/* <InputGroup>
                <Label>Profile Photo URL</Label>
                <Input
                  type="url"
                  name="profilePhotoUrl"
                  value={data.profilePhotoUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/photo.jpg (optional)"
                />
                {(validationErrors.profilePhotoUrl || errors?.profilePhotoUrl) && (
                  <ErrorText>{validationErrors.profilePhotoUrl || errors.profilePhotoUrl}</ErrorText>
                )}
              </InputGroup> */}
            </>
          )}

          {userType === 'restaurant' && (
            <InputGroup>
              <Label>Owner Name *</Label>
              <Input
                type="text"
                name="ownerName"
                value={data.ownerName || ''}
                onChange={handleInputChange}
                placeholder="Enter owner's full name"
              />
              {(validationErrors.ownerName || errors?.ownerName) && (
                <ErrorText>{validationErrors.ownerName || errors.ownerName}</ErrorText>
              )}
            </InputGroup>
          )}

          <SubmitButton
            type="submit"
            disabled={loading}
            $loading={loading}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
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
  padding: 2rem;
`;

const StageCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #e0e0e0;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #f0f0f0;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: #4CAF50;
    background: rgba(255, 255, 255, 0.15);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4CAF50;
    background: rgba(255, 255, 255, 0.15);
  }

  option {
    background: #2d2b1f;
    color: white;
  }
`;

const UploadFileInput = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &::file-selector-button {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    margin-right: 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  &:focus {
    outline: none;
    border-color: #4CAF50;
    background: rgba(255, 255, 255, 0.15);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
  }
`;


const ImagePreview = styled.div`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;

  img {
    height: 60px;
    width: 60px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  span {
    font-size: 0.9rem;
    max-width: 200px;
    word-break: break-word;
  }
`;


const HelperText = styled.small`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-style: italic;
`;

const ErrorText = styled.small`
  color: #ff6b6b;
  font-size: 0.85rem;
  font-weight: 500;
`;

const SubmitButton = styled.button<{ $loading: boolean }>`
  padding: 1rem 2rem;
  background: ${props => props.$loading ? '#666' : 'linear-gradient(135deg, #4CAF50, #45a049)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const InfoNote = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const InfoIcon = styled.span`
  margin-right: 0.5rem;
`;

const InfoText = styled.p`
  color: #e0e0e0;
  font-size: 0.9rem;
  line-height: 1.6;
`; 