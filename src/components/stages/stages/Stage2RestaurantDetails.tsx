"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../utils/i18n';
import { useDashboard } from '../../../context/DashboardContext';

interface Stage2RestaurantDetailsProps {
  data: any;
  onChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
  isReadOnly?: boolean;
}

export default function Stage2RestaurantDetails({ 
  data, 
  onChange, 
  onSave, 
  isReadOnly = false 
}: Stage2RestaurantDetailsProps) {
  const { t } = useTranslation();
  const { state } = useDashboard();
  
  const [formData, setFormData] = useState({
    cuisineType: data?.cuisineType || '',
    description: data?.description || '',
    website: data?.website || '',
    yearEstablished: data?.yearEstablished || '',
    priceRange: data?.priceRange || '',
    servingCapacity: data?.servingCapacity || '',
    specialDiets: data?.specialDiets || [],
    ...data
  });

  const [errors, setErrors] = useState<any>({});

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Thai', 'Japanese', 
    'French', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Middle Eastern', 'Other'
  ];

  const priceRangeOptions = [
    { value: '$', label: '$ - Budget Friendly' },
    { value: '$$', label: '$$ - Mid Range' },
    { value: '$$$', label: '$$$ - Upscale' },
    { value: '$$$$', label: '$$$$ - Fine Dining' }
  ];

  const dietOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Halal', 'Kosher', 'Low-Carb', 'Organic'
  ];

  useEffect(() => {
    setFormData({
      cuisineType: data?.cuisineType || '',
      description: data?.description || '',
      website: data?.website || '',
      yearEstablished: data?.yearEstablished || '',
      priceRange: data?.priceRange || '',
      servingCapacity: data?.servingCapacity || '',
      specialDiets: data?.specialDiets || [],
      ...data
    });
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    onChange(newData);
    
    // Clear validation error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (diet: string) => {
    const newDiets = formData.specialDiets.includes(diet)
      ? formData.specialDiets.filter((d: string) => d !== diet)
      : [...formData.specialDiets, diet];
    
    const newData = { ...formData, specialDiets: newDiets };
    setFormData(newData);
    onChange(newData);
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.cuisineType?.trim()) {
      newErrors.cuisineType = t('Cuisine type is required');
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = t('Restaurant description is required');
    } else if (formData.description.length < 50) {
      newErrors.description = t('Description must be at least 50 characters long');
    }
    
    if (!formData.priceRange?.trim()) {
      newErrors.priceRange = t('Price range is required');
    }
    
    if (!formData.servingCapacity?.trim()) {
      newErrors.servingCapacity = t('Serving capacity is required');
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = t('Please enter a valid website URL');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      await onSave(formData);
    }
  };

  return (
    <StageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StageHeader>
        <StageTitle>{t('Restaurant Details')}</StageTitle>
        <StageDescription>
          {t('Tell us more about your restaurant to help customers find you')}
        </StageDescription>
      </StageHeader>

      <Form>
        <FormRow>
          <FormGroup>
            <Label htmlFor="cuisineType">
              {t('Cuisine Type')} <Required>*</Required>
            </Label>
            <Select
              id="cuisineType"
              name="cuisineType"
              value={formData.cuisineType}
              onChange={handleInputChange}
              disabled={isReadOnly}
              hasError={!!errors.cuisineType}
            >
              <option value="">{t('Select cuisine type')}</option>
              {cuisineOptions.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </Select>
            {errors.cuisineType && <ErrorMessage>{errors.cuisineType}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="priceRange">
              {t('Price Range')} <Required>*</Required>
            </Label>
            <Select
              id="priceRange"
              name="priceRange"
              value={formData.priceRange}
              onChange={handleInputChange}
              disabled={isReadOnly}
              hasError={!!errors.priceRange}
            >
              <option value="">{t('Select price range')}</option>
              {priceRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            {errors.priceRange && <ErrorMessage>{errors.priceRange}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="description">
            {t('Restaurant Description')} <Required>*</Required>
          </Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            hasError={!!errors.description}
            placeholder={t('Describe your restaurant, specialties, atmosphere, etc. (minimum 50 characters)')}
            rows={4}
          />
          <CharacterCount>
            {formData.description?.length || 0}/500 characters
          </CharacterCount>
          {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label htmlFor="website">
              {t('Website URL')}
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              hasError={!!errors.website}
              placeholder={t('https://yourrestaurant.com')}
            />
            {errors.website && <ErrorMessage>{errors.website}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="yearEstablished">
              {t('Year Established')}
            </Label>
            <Input
              id="yearEstablished"
              name="yearEstablished"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.yearEstablished}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              placeholder={t('e.g., 2020')}
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="servingCapacity">
            {t('Serving Capacity')} <Required>*</Required>
          </Label>
          <Input
            id="servingCapacity"
            name="servingCapacity"
            type="number"
            min="1"
            value={formData.servingCapacity}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            hasError={!!errors.servingCapacity}
            placeholder={t('Number of customers you can serve simultaneously')}
          />
          {errors.servingCapacity && <ErrorMessage>{errors.servingCapacity}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>{t('Special Dietary Options')}</Label>
          <CheckboxGrid>
            {dietOptions.map(diet => (
              <CheckboxItem key={diet}>
                <Checkbox
                  type="checkbox"
                  id={diet}
                  checked={formData.specialDiets.includes(diet)}
                  onChange={() => handleCheckboxChange(diet)}
                  disabled={isReadOnly}
                />
                <CheckboxLabel htmlFor={diet}>{diet}</CheckboxLabel>
              </CheckboxItem>
            ))}
          </CheckboxGrid>
        </FormGroup>

        {!isReadOnly && (
          <SaveButtonContainer>
            <SaveButton
              type="button"
              onClick={handleSave}
              disabled={state.loading}
            >
              {state.loading ? t('Saving...') : t('Save & Continue')}
            </SaveButton>
          </SaveButtonContainer>
        )}
      </Form>
    </StageContainer>
  );
}

// Styled Components
const StageContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StageHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const StageTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StageDescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  font-weight: 600;
  color: #374151;
`;

const Required = styled.span`
  color: #ef4444;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }

  &:read-only {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }

  &:read-only {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const CharacterCount = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`;

const ErrorMessage = styled.span`
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.25rem;
`;

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
