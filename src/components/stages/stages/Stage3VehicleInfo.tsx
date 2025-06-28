'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDashboard } from '../../../context/DashboardContext';
import { FileUpload } from '@/components/common/FileUpload';

// import { uploadFile } from '@/services/s3Service';

interface Stage3Props {
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

export default function Stage3VehicleInfo({
  data,
  onChange,
  onSubmit,
  loading,
  errors,
  userType
}: Stage3Props) {
  const { state, actions } = useDashboard();
  const currentStageData = state.userData?.stage3 || {};

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    vehicleType: data.vehicleType || '',
    vehicleMake: data.vehicleMake || '',
    vehicleModel: data.vehicleModel || '',
    deliveryType: data.deliveryType || '',
    yearOfManufacture: data.yearOfManufacture || '',
    vehicleColor: data.vehicleColor || '',
    vehicleLicensePlate: data.vehicleLicensePlate || '',
    driversLicenseClass: data.driversLicenseClass || '',
    vehicleInsuranceUrl: data.vehicleInsuranceUrl || '',
    vehicleRegistrationUrl: data.vehicleRegistrationUrl || '',
    ...data
  });

  const [vehicleInsuranceFile, setVehicleInsuranceFile] = useState(null);
  const [vehicleRegistrationFile, setVehicleRegistrationFile] = useState(null);

  // Real-time validation function
  const validateField = (name: string, value: any) => {
    switch (name) {
      case 'yearOfManufacture':
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

      case 'vehicleLicensePlate':
        if (!value?.toString().trim()) {
          return 'License plate is required';
        }
        return '';

      case 'vehicleType':
        if (!value?.toString().trim()) {
          return 'Vehicle type is required';
        }
        return '';

      case 'deliveryType':
        if (!value?.toString().trim()) {
          return 'Delivery type is required';
        }
        return '';

      case 'driversLicenseClass':
        if (!value?.toString().trim()) {
          return 'Driver license class is required';
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
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    // Call the parent onChange function
    onChange({ [name]: inputValue });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate all required fields
    const requiredFields = ['vehicleType', 'vehicleMake', 'vehicleModel', 'deliveryType', 'yearOfManufacture', 'vehicleColor', 'vehicleLicensePlate', 'driversLicenseClass'];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('✅ Stage3 validation passed, calling onSubmit');


      const vehicleInsuranceFileDetails = await uploadFile(vehicleInsuranceFile);
      const vehicleRegistrationFileDetails = await uploadFile(vehicleRegistrationFile);

      onSubmit({
        ...formData,
        vehicleInsuranceUrl: vehicleInsuranceFileDetails.url || '',
        vehicleRegistrationUrl: vehicleRegistrationFileDetails.url || '',
      });
    } else {
      console.log('❌ Stage3 validation failed:', validationErrors);
    }
  };

  const handlePrevious = () => {
    actions.updateStageData(3, formData);
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
    <Container
      as={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <StageCard>
        <CardHeader>
          <Title>Vehicle Information</Title>
          <Description>
            Please provide details about your vehicle and delivery preferences
          </Description>
        </CardHeader>

        <Form onSubmit={handleSubmit}>
          {/* Vehicle Details Section */}
          <SectionTitle>Vehicle Details</SectionTitle>
          <InputRow>
            <InputGroup>
              <Label>Vehicle Type *</Label>
              <Select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
              >
                <option value="">Select Vehicle Type</option>
                <option value="Walk">Walk</option>
                <option value="Scooter">Scooter</option>
                <option value="Bike">Bike</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Other">Other</option>
              </Select>
              {(validationErrors.vehicleType || errors?.vehicleType) && (
                <ErrorText>{validationErrors.vehicleType || errors.vehicleType}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Delivery Type *</Label>
              <Select
                name="deliveryType"
                value={formData.deliveryType}
                onChange={handleInputChange}
              >
                <option value="">Select Delivery Type</option>
                <option value="Meals">Meals</option>
                <option value="Parcel">Parcel</option>
                <option value="Grocery">Grocery</option>
                <option value="Other">Other</option>
              </Select>
              {(validationErrors.deliveryType || errors?.deliveryType) && (
                <ErrorText>{validationErrors.deliveryType || errors.deliveryType}</ErrorText>
              )}
            </InputGroup>
          </InputRow>

          <InputRow>
            <InputGroup>
              <Label>Vehicle Make *</Label>
              <Input
                type="text"
                name="vehicleMake"
                value={formData.vehicleMake}
                onChange={handleInputChange}
                placeholder="e.g., Toyota, Honda, Ford"
              />
              {(validationErrors.vehicleMake || errors?.vehicleMake) && (
                <ErrorText>{validationErrors.vehicleMake || errors.vehicleMake}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Vehicle Model *</Label>
              <Input
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleInputChange}
                placeholder="e.g., Camry, Civic, F-150"
              />
              {(validationErrors.vehicleModel || errors?.vehicleModel) && (
                <ErrorText>{validationErrors.vehicleModel || errors.vehicleModel}</ErrorText>
              )}
            </InputGroup>
          </InputRow>

          <InputRow>
            <InputGroup>
              <Label>Year of Manufacture *</Label>
              <Select
                name="yearOfManufacture"
                value={formData.yearOfManufacture}
                onChange={handleInputChange}
              >
                <option value="">Select Year</option>
                {Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
              {(validationErrors.yearOfManufacture || errors?.yearOfManufacture) && (
                <ErrorText>{validationErrors.yearOfManufacture || errors.yearOfManufacture}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Vehicle Color *</Label>
              <Input
                type="text"
                name="vehicleColor"
                value={formData.vehicleColor}
                onChange={handleInputChange}
                placeholder="e.g., Red, Blue, Silver"
              />
              {(validationErrors.vehicleColor || errors?.vehicleColor) && (
                <ErrorText>{validationErrors.vehicleColor || errors.vehicleColor}</ErrorText>
              )}
            </InputGroup>
          </InputRow>

          <InputRow>
            <InputGroup>
              <Label>License Plate *</Label>
              <Input
                type="text"
                name="vehicleLicensePlate"
                value={formData.vehicleLicensePlate}
                onChange={handleInputChange}
                placeholder="ABC-123"
              />
              {(validationErrors.vehicleLicensePlate || errors?.vehicleLicensePlate) && (
                <ErrorText>{validationErrors.vehicleLicensePlate || errors.vehicleLicensePlate}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Driver License Class *</Label>
              <Select
                name="driversLicenseClass"
                value={formData.driversLicenseClass}
                onChange={handleInputChange}
              >
                <option value="">Select License Class</option>
                <option value="G">G (Car)</option>
                <option value="G1">G1 (Learner)</option>
                <option value="G2">G2 (Novice)</option>
                <option value="M">M (Motorcycle)</option>
                <option value="M1">M1 (Motorcycle Learner)</option>
                <option value="M2">M2 (Motorcycle Novice)</option>
                <option value="Other">Other</option>
              </Select>
              {(validationErrors.driversLicenseClass || errors?.driversLicenseClass) && (
                <ErrorText>{validationErrors.driversLicenseClass || errors.driversLicenseClass}</ErrorText>
              )}
            </InputGroup>
          </InputRow>

          {/* Document Upload Section */}
          <SectionTitle>Document Upload</SectionTitle>

          <InputRow>
            <InputGroup>
              <Label>Vehicle Insurance URL *</Label>
              <FileUpload
                // label="Vehicle Insurance URL"
                required={true}
                accept=".pdf,.jpg,.jpeg,.png"
                onFileSelect={(file) => setVehicleInsuranceFile(file)}
                error={!data.vehicleInsuranceUrl ? 'Vehicle Insurance is required' : undefined}
              />
              {vehicleInsuranceFile && (
                <ImagePreview>
                  <img src={URL.createObjectURL(vehicleInsuranceFile)} alt="Preview" />
                  <span>{vehicleInsuranceFile?.name}</span>
                </ImagePreview>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Vehicle Registration URL *</Label>
              <FileUpload
                // label="Vehicle Insurance URL"
                required={true}
                accept=".pdf,.jpg,.jpeg,.png"
                onFileSelect={(file) => setVehicleRegistrationFile(file)}
                error={!data.vehicleRegistrationUrl ? 'Vehicle Registration is required' : undefined}
              />
              {vehicleRegistrationFile && (
                <ImagePreview>
                  <img src={URL.createObjectURL(vehicleRegistrationFile)} alt="Preview" />
                  <span>{vehicleRegistrationFile?.name}</span>
                </ImagePreview>
              )}
            </InputGroup>
          </InputRow>
          {/* <InputRow>
            <InputGroup>
              <Label>Vehicle Insurance URL</Label>
              <Input
                type="url"
                name="vehicleInsuranceUrl"
                value={formData.vehicleInsuranceUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/insurance.pdf"
              />
              {(validationErrors.vehicleInsuranceUrl || errors?.vehicleInsuranceUrl) && (
                <ErrorText>{validationErrors.vehicleInsuranceUrl || errors.vehicleInsuranceUrl}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Vehicle Registration URL</Label>
              <Input
                type="url"
                name="vehicleRegistrationUrl"
                value={formData.vehicleRegistrationUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/registration.pdf"
              />
              {(validationErrors.vehicleRegistrationUrl || errors?.vehicleRegistrationUrl) && (
                <ErrorText>{validationErrors.vehicleRegistrationUrl || errors.vehicleRegistrationUrl}</ErrorText>
              )}
            </InputGroup>
          </InputRow> */}

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