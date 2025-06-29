"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../../utils/i18n';
import { useDashboard } from '../../../context/DashboardContext';
import { FileUploadWithLoader } from '../../common/FileUploadWithLoader';
import { uploadFileToS3 } from '../../../utils/s3Upload';

interface Stage3RestaurantDocumentsProps {
  data: any;
  onChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}

interface FormData {
  drivingLicenseUrl: string;
  voidChequeUrl: string;
  HSTdocumentUrl: string;
  foodHandlingCertificateUrl: string;
  articleofIncorporation: string;
  articleofIncorporationExpiryDate: string;
  foodSafetyCertificateExpiryDate: string;
}

export default function Stage3RestaurantDocuments({ 
  data, 
  onChange, 
  onSave, 
  isReadOnly = false 
}: Stage3RestaurantDocumentsProps) {
  const { t } = useTranslation();
  const { state } = useDashboard();
  
  const [formData, setFormData] = useState<FormData>({
    drivingLicenseUrl: data?.drivingLicenseUrl || '',
    voidChequeUrl: data?.voidChequeUrl || '',
    HSTdocumentUrl: data?.HSTdocumentUrl || '',
    foodHandlingCertificateUrl: data?.foodHandlingCertificateUrl || '',
    articleofIncorporation: data?.articleofIncorporation || '',
    articleofIncorporationExpiryDate: data?.articleofIncorporationExpiryDate || '',
    foodSafetyCertificateExpiryDate: data?.foodSafetyCertificateExpiryDate || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (data) {
      setFormData({
        drivingLicenseUrl: data.drivingLicenseUrl || '',
        voidChequeUrl: data.voidChequeUrl || '',
        HSTdocumentUrl: data.HSTdocumentUrl || '',
        foodHandlingCertificateUrl: data.foodHandlingCertificateUrl || '',
        articleofIncorporation: data.articleofIncorporation || '',
        articleofIncorporationExpiryDate: data.articleofIncorporationExpiryDate || '',
        foodSafetyCertificateExpiryDate: data.foodSafetyCertificateExpiryDate || '',
      });
    }
  }, [data]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'drivingLicenseUrl':
        return !value ? 'Driving license is required' : '';
      case 'voidChequeUrl':
        return !value ? 'Void cheque is required' : '';
      case 'HSTdocumentUrl':
        return !value ? 'HST document is required' : '';
      case 'foodHandlingCertificateUrl':
        return !value ? 'Food handling certificate is required' : '';
      case 'articleofIncorporation':
        return !value ? 'Article of incorporation is required' : '';
      case 'articleofIncorporationExpiryDate':
        if (!value) {
          return 'Article of incorporation expiry date is required';
        }
        
        const articleDate = new Date(value);
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() + 50); // Max 50 years in future
        
        // Reset time to compare only dates
        today.setHours(0, 0, 0, 0);
        articleDate.setHours(0, 0, 0, 0);
        
        if (isNaN(articleDate.getTime())) {
          return 'Please enter a valid date';
        }
        
        if (articleDate <= today) {
          return 'Article of incorporation expiry date must be in the future';
        }
        
        if (articleDate > maxDate) {
          return 'Expiry date cannot be more than 50 years in the future';
        }
        
        // Warning for dates less than 30 days from today
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        if (articleDate <= thirtyDaysFromNow) {
          return 'Warning: Document expires within 30 days. Please ensure renewal is planned';
        }
        
        return '';
        
      case 'foodSafetyCertificateExpiryDate':
        if (!value) {
          return 'Food safety certificate expiry date is required';
        }
        
        const certDate = new Date(value);
        const currentDate = new Date();
        const maxCertDate = new Date();
        maxCertDate.setFullYear(currentDate.getFullYear() + 10); // Max 10 years in future for certificates
        
        // Reset time to compare only dates
        currentDate.setHours(0, 0, 0, 0);
        certDate.setHours(0, 0, 0, 0);
        
        if (isNaN(certDate.getTime())) {
          return 'Please enter a valid date';
        }
        
        if (certDate <= currentDate) {
          return 'Food safety certificate expiry date must be in the future';
        }
        
        if (certDate > maxCertDate) {
          return 'Certificate expiry date cannot be more than 10 years in the future';
        }
        
        // Warning for dates less than 60 days from today (certificates typically need more lead time)
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(currentDate.getDate() + 60);
        if (certDate <= sixtyDaysFromNow) {
          return 'Warning: Certificate expires within 60 days. Please renew to maintain compliance';
        }
        
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    onChange(newFormData);
  };

  const handleFileUpload = async (fieldName: string, file: File) => {
    setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));

    try {
      // Upload file to S3
      const result = await uploadFileToS3(file, 'restaurant-documents');
      
      const newFormData = { ...formData, [fieldName]: result.url };
      setFormData(newFormData);
      
      const error = validateField(fieldName, result.url);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
      
      onChange(newFormData);
    } catch (error) {
      console.error('File upload failed:', error);
      setErrors(prev => ({ ...prev, [fieldName]: 'File upload failed. Please try again.' }));
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleFileRemove = (fieldName: string) => {
    const newFormData = { ...formData, [fieldName]: '' };
    setFormData(newFormData);
    
    const error = validateField(fieldName, '');
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    
    onChange(newFormData);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key] = error;
      }
    });
    
    setErrors(newErrors);
    
    // Form is valid if there are no errors or only warning messages
    const hasOnlyWarnings = Object.values(newErrors).every(error => 
      !error || error.startsWith('Warning:')
    );
    
    return hasOnlyWarnings;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save stage 3 data:', error);
    }
  };

  const isFormValid = () => {
    // Check if all required fields have values and no validation errors exist
    const requiredFields = [
      'drivingLicenseUrl',
      'voidChequeUrl', 
      'HSTdocumentUrl',
      'foodHandlingCertificateUrl',
      'articleofIncorporation',
      'articleofIncorporationExpiryDate',
      'foodSafetyCertificateExpiryDate'
    ];
    
    // Check if all required fields are filled
    const allFieldsFilled = requiredFields.every(field => {
      const value = formData[field as keyof FormData];
      return value && value.trim() !== '';
    });
    
    // Check if there are no validation errors (or only warning messages)
    const hasOnlyWarnings = Object.values(errors).every(error => 
      !error || error.startsWith('Warning:')
    );
    
    return allFieldsFilled && hasOnlyWarnings;
  };

  return (
    <StageContainer>
      <StageHeader>
        <StageTitle>Business Documents</StageTitle>
        <StageDescription>
          Upload required business documents and set expiry dates for compliance
        </StageDescription>
      </StageHeader>

      <Form>
        <SectionTitle>Required Documents</SectionTitle>
        
        <FormRow>
          <FormGroup>
            <FileUploadWithLoader
              label="Driving License"
              onFileSelect={(file: File) => handleFileUpload('drivingLicenseUrl', file)}
              error={errors.drivingLicenseUrl}
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              isUploading={uploadingFiles.drivingLicenseUrl}
              uploadedUrl={formData.drivingLicenseUrl}
              onRemove={() => handleFileRemove('drivingLicenseUrl')}
            />
          </FormGroup>
          
          <FormGroup>
            <FileUploadWithLoader
              label="Void Cheque"
              onFileSelect={(file: File) => handleFileUpload('voidChequeUrl', file)}
              error={errors.voidChequeUrl}
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              isUploading={uploadingFiles.voidChequeUrl}
              uploadedUrl={formData.voidChequeUrl}
              onRemove={() => handleFileRemove('voidChequeUrl')}
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <FileUploadWithLoader
              label="HST Document"
              onFileSelect={(file: File) => handleFileUpload('HSTdocumentUrl', file)}
              error={errors.HSTdocumentUrl}
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              isUploading={uploadingFiles.HSTdocumentUrl}
              uploadedUrl={formData.HSTdocumentUrl}
              onRemove={() => handleFileRemove('HSTdocumentUrl')}
            />
          </FormGroup>

          <FormGroup>
            <FileUploadWithLoader
              label="Food Handling Certificate"
              onFileSelect={(file: File) => handleFileUpload('foodHandlingCertificateUrl', file)}
              error={errors.foodHandlingCertificateUrl}
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              isUploading={uploadingFiles.foodHandlingCertificateUrl}
              uploadedUrl={formData.foodHandlingCertificateUrl}
              onRemove={() => handleFileRemove('foodHandlingCertificateUrl')}
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <FileUploadWithLoader
            label="Article of Incorporation"
            onFileSelect={(file: File) => handleFileUpload('articleofIncorporation', file)}
            error={errors.articleofIncorporation}
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            isUploading={uploadingFiles.articleofIncorporation}
            uploadedUrl={formData.articleofIncorporation}
            onRemove={() => handleFileRemove('articleofIncorporation')}
          />
        </FormGroup>

        <SectionTitle>Document Expiry Dates</SectionTitle>
        
        <FormRow>
          <FormGroup>
            <Label htmlFor="articleofIncorporationExpiryDate">
              Article of Incorporation Expiry Date <Required>*</Required>
            </Label>
            <Input
              id="articleofIncorporationExpiryDate"
              name="articleofIncorporationExpiryDate"
              type="date"
              value={formData.articleofIncorporationExpiryDate}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.articleofIncorporationExpiryDate}
              min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Tomorrow
              max={new Date(new Date().setFullYear(new Date().getFullYear() + 50)).toISOString().split('T')[0]} // 50 years from now
            />
            {errors.articleofIncorporationExpiryDate && <ErrorMessage>{errors.articleofIncorporationExpiryDate}</ErrorMessage>}
            <HelpText>Please enter the expiry date as shown on your incorporation document</HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="foodSafetyCertificateExpiryDate">
              Food Safety Certificate Expiry Date <Required>*</Required>
            </Label>
            <Input
              id="foodSafetyCertificateExpiryDate"
              name="foodSafetyCertificateExpiryDate"
              type="date"
              value={formData.foodSafetyCertificateExpiryDate}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.foodSafetyCertificateExpiryDate}
              min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Tomorrow
              max={new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split('T')[0]} // 10 years from now
            />
            {errors.foodSafetyCertificateExpiryDate && <ErrorMessage>{errors.foodSafetyCertificateExpiryDate}</ErrorMessage>}
            <HelpText>Enter the expiry date from your food safety/handling certificate</HelpText>
          </FormGroup>
        </FormRow>

        {!isReadOnly && (
          <SaveButtonContainer>
            <SaveButton
              type="button"
              onClick={handleSave}
              disabled={state.loading || !isFormValid() || Object.values(uploadingFiles).some(Boolean)}
            >
              {state.loading ? t('Saving...') : t('Save & Continue')}
            </SaveButton>
          </SaveButtonContainer>
        )}
      </Form>

      {isReadOnly && (
        <ReadOnlyNote>
          <InfoIcon>ℹ️</InfoIcon>
          {t('This information was provided during signup and cannot be edited at this stage.')}
        </ReadOnlyNote>
      )}
    </StageContainer>
  );
}

const StageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const StageHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const StageTitle = styled.h2`
  font-size: 2rem;
  color: #403E2D;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const StageDescription = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: #403E2D;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #ffc32b;
  padding-bottom: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: #403E2D;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Required = styled.span`
  color: #e74c3c;
  font-weight: 600;
`;

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => !['hasError'].includes(prop),
})<{ hasError?: boolean; readOnly?: boolean }>`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.hasError ? '#e74c3c' : '#ddd'};
  border-radius: 8px;
  font-size: 1rem;
  background-color: ${props => props.readOnly ? '#f5f5f5' : '#fff'};
  color: #403E2D;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffc32b;
    box-shadow: 0 0 0 3px rgba(255, 195, 43, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const HelpText = styled.span`
  color: #666;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-style: italic;
`;

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
  color: #403E2D;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 195, 43, 0.3);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ReadOnlyNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
`;

const InfoIcon = styled.span`
  font-size: 1rem;
`;
