'use client';

import React, { useState, CSSProperties, useEffect } from 'react';
import { UploadCloud, Plus, Trash2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useTranslation } from '@/utils/i18n';
import { getDrivingAbstractDateValidation, getDrivingAbstractDateConstraints } from '@/utils/validation';

// Type definitions
interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  min?: string;
  max?: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

interface FormFileUploadProps {
  label: string;
  onChange: (file: File) => void;
  error?: string;
  required?: boolean;
  fileName?: string;
}

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

interface GoogleMapsPickerProps {
  label: string;
  onAddressSelect: (address: AddressData) => void;
  error?: string;
  required?: boolean;
}

interface AddressData {
  streetNameNumber: string;
  appUniteNumber?: string;
  city: string;
  province: string;
  postalCode: string;
}

interface PaymentSectionProps {
  driverData: any;
  onSuccess: () => void;
  onError: (error: { message: string }) => void;
}

interface DriverData {
  email: string;
  password: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  cellNumber: string;
  streetNameNumber: string;
  appUniteNumber: string;
  city: string;
  province: string;
  postalCode: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  yearOfManufacture: string;
  vehicleColor: string;
  vehicleLicensePlate: string;
  driversLicenseClass: string;
  drivingAbstractDate: string;
  workEligibilityType: string;
  sinNumber: string;
  bankingInfo: {
    transitNumber: string;
    institutionNumber: string;
    accountNumber: string;
  };
  consentAndDeclarations: {
    termsAndConditions: boolean;
    backgroundScreening: boolean;
    privacyPolicy: boolean;
    electronicCommunication: boolean;
  };
  files: {
    profilePhoto: File | null;
    driversLicenseFront: File | null;
    driversLicenseBack: File | null;
    vehicleRegistration: File | null;
    vehicleInsurance: File | null;
    drivingAbstract: File | null;
    workEligibility: File | null;
    sinCard: File | null;
  };
}

interface DriverRegistrationProps {
  onSubmit: (data: DriverData) => void;
  prefilledData?: { email: string; password: string } | null;
}

interface ValidationErrors {
  [key: string]: string;
}

const stripePromise = loadStripe("pk_test_51RUev403dkXaIukYE6J4hDctlSuyJ6FMUJ4LLWL2CQ5h9Lo1wqunqmln2XkQtbnEo1Hs3jShSG0wE6qUQGN1UrTc009ewWKZfR");

const provinceOptions = [
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
  { value: 'YT', label: 'Yukon' },
];

const vehicleTypeOptions = [
  { value: 'Walk', label: 'Walk' },
  { value: 'Scooter', label: 'Scooter' },
  { value: 'Bike', label: 'Bike' },
  { value: 'Car', label: 'Car' },
  { value: 'Van', label: 'Van' },
  { value: 'Other', label: 'Other' },
];

const workEligibilityOptions = [
  { value: 'passport', label: 'Passport' },
  { value: 'pr_card', label: 'PR Card' },
  { value: 'work_permit', label: 'Work Permit' },
  { value: 'study_permit', label: 'Study Permit' },
];

// Form Input Component
const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, error, type = 'text', placeholder, maxLength, required = false, min, max }) => {
  const { t } = useTranslation();
  return (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}{required && ' *'}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          ...inputStyle,
          borderColor: error ? '#e74c3c' : '#bdc3c7'
        }}
        min={min}
        max={max}
      />
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
};

// Form Select Component
const FormSelect: React.FC<FormSelectProps> = ({ label, value, options, onChange, error, required = false }) => {
  const { t } = useTranslation();
  return (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}{required && ' *'}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle,
          borderColor: error ? '#e74c3c' : '#bdc3c7'
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
};

// Form File Upload Component
const FormFileUpload: React.FC<FormFileUploadProps> = ({ label, onChange, error, required = false, fileName }) => {
  const { t } = useTranslation();
  return (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}{required && ' *'}</label>
      <div style={uploadWrapperStyle}>
        <UploadCloud size={20} />
        <span style={uploadTextStyle}>{fileName || t('driverRegistration.common.clickToUpload')}</span>
        <input
          type="file"
          onChange={(e) => e.target.files && onChange(e.target.files[0])}
          accept="application/pdf,image/*"
          style={fileInputStyle}
        />
      </div>
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
};

// Google Maps Picker Placeholder
const GoogleMapsPicker: React.FC<GoogleMapsPickerProps> = ({ label, onAddressSelect, error, required }) => (
  <div style={formGroupStyle}>
    <label style={labelStyle}>{label}</label>
    <input
      type="text"
      placeholder="Search for your address..."
      onChange={(e) => {
        // Simulate address selection for demo
        onAddressSelect({
          streetNameNumber: '123 Main St',
          appUniteNumber: '',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M1M 1M1'
        });
      }}
      style={inputStyle}
    />
    {error && <p style={errorTextStyle}>{error}</p>}
  </div>
);

// Stripe Checkout Integration
const PaymentSection: React.FC<PaymentSectionProps> = ({ driverData, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      console.log('Creating checkout session for driver:', driverData);

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverData: driverData,
          testMode: false
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { id } = await res.json();
      
      if (!id) {
        throw new Error('No session ID received');
      }

      console.log('Checkout session created:', id);
      await stripe.redirectToCheckout({ sessionId: id });
      
    } catch (error) {
      console.error('Checkout error:', error);
      onError({ message: (error as Error).message || 'Payment initialization failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={paymentContainerStyle}>
      <h2 style={sectionTitleStyle}>Complete Your Registration</h2>
      <p style={paymentDescStyle}>
        Registration completed successfully! Complete your driver registration with a one-time background check fee.
      </p>
      <h3 style={paymentAmountStyle}>Registration Fee: CAD $50.00</h3>
      
      <div style={paymentSuccessStyle}>
        <p style={paymentSuccessTextStyle}>
          ✅ Registration form submitted successfully
        </p>
        <p style={paymentInfoSubTextStyle}>
          Click below to proceed to secure payment and activate your driver account.
        </p>
      </div>
      
      <button 
        onClick={handleCheckout}
        disabled={loading}
        style={{
          ...payButtonStyle,
          backgroundColor: loading ? '#bdc3c7' : '#e4b549',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? "Redirecting to Payment..." : "Pay CAD $25 and Complete Registration"}
      </button>
    </div>
  );
};

// Validation function
const validateDriverForm = (data: DriverData) => {
  const errors: ValidationErrors = {};
  
  // Personal Info validation
  if (!data.firstName?.trim()) errors.firstName = 'First name is required';
  if (!data.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!data.email?.trim()) errors.email = 'Email is required';
  if (!data.cellNumber?.trim()) errors.cellNumber = 'Cell number is required';
  if (!data.dateOfBirth?.trim()) errors.dateOfBirth = 'Date of birth is required';
  if (!data.streetNameNumber?.trim()) errors.streetNameNumber = 'Street address is required';
  if (!data.city?.trim()) errors.city = 'City is required';
  if (!data.province?.trim()) errors.province = 'Province is required';
  if (!data.postalCode?.trim()) errors.postalCode = 'Postal code is required';
  
  // Vehicle Info validation
  if (!data.vehicleType?.trim()) errors.vehicleType = 'Vehicle type is required';
  if (!data.vehicleMake?.trim()) errors.vehicleMake = 'Vehicle make is required';
  if (!data.vehicleModel?.trim()) errors.vehicleModel = 'Vehicle model is required';
  if (!data.yearOfManufacture?.trim()) errors.yearOfManufacture = 'Year is required';
  if (!data.vehicleColor?.trim()) errors.vehicleColor = 'Vehicle color is required';
  if (!data.vehicleLicensePlate?.trim()) errors.vehicleLicensePlate = 'License plate is required';
  
  // Document Info validation
  if (!data.driversLicenseClass?.trim()) errors.driversLicenseClass = 'License class is required';
  if (!data.drivingAbstractDate?.trim()) errors.drivingAbstractDate = 'Driving abstract date is required';
  if (!data.workEligibilityType?.trim()) errors.workEligibilityType = 'Work eligibility type is required';
  if (!data.sinNumber?.trim()) errors.sinNumber = 'SIN number is required';
  
  // Banking validation
  if (!data.bankingInfo.transitNumber?.trim()) errors.transitNumber = 'Transit number is required';
  if (!data.bankingInfo.institutionNumber?.trim()) errors.institutionNumber = 'Institution number is required';
  if (!data.bankingInfo.accountNumber?.trim()) errors.accountNumber = 'Account number is required';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
const convertProvinceNameToCode = (name: string): string => {
  const map: Record<string, string> = {
    'Alberta': 'AB',
    'British Columbia': 'BC',
    'Manitoba': 'MB',
    'New Brunswick': 'NB',
    'Newfoundland and Labrador': 'NL',
    'Nova Scotia': 'NS',
    'Northwest Territories': 'NT',
    'Nunavut': 'NU',
    'Ontario': 'ON',
    'Prince Edward Island': 'PE',
    'Quebec': 'QC',
    'Saskatchewan': 'SK',
    'Yukon': 'YT'
  };
  return map[name] || name;
};

// Form Checkbox Component
const FormCheckbox: React.FC<FormCheckboxProps> = ({ label, checked, onChange, error }) => (
  <div style={formGroupStyle}>
    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginRight: '10px' }}
      />
      <span>{label}</span>
    </label>
    {error && <p style={errorTextStyle}>{error}</p>}
  </div>
);

// Main Driver Registration Component
const DriverRegistration: React.FC<DriverRegistrationProps> = ({ onSubmit, prefilledData }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [driverId, setDriverId] = useState(null);
  
  const [formData, setFormData] = useState<DriverData>({
    // Personal Information
    email: prefilledData?.email || '',
    password: prefilledData?.password || '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    cellNumber: '',
    streetNameNumber: '',
    appUniteNumber: '',
    city: '',
    province: 'ON',
    postalCode: '',
    
    // Vehicle Information
    vehicleType: 'Car',
    vehicleMake: '',
    vehicleModel: '',
    yearOfManufacture: '',
    vehicleColor: '',
    vehicleLicensePlate: '',
    
    // Document Information
    driversLicenseClass: '',
    drivingAbstractDate: '',
    workEligibilityType: 'passport',
    sinNumber: '',
    
    // Banking Information
    bankingInfo: {
      transitNumber: '',
      institutionNumber: '',
      accountNumber: '',
    },
    
    // Consent and Declarations
    consentAndDeclarations: {
      termsAndConditions: false,
      backgroundScreening: false,
      privacyPolicy: false,
      electronicCommunication: false,
    },
    
    // File uploads
    files: {
      profilePhoto: null,
      driversLicenseFront: null,
      driversLicenseBack: null,
      vehicleRegistration: null,
      vehicleInsurance: null,
      drivingAbstract: null,
      workEligibility: null,
      sinCard: null,
    }
  });

  // Update form data when prefilledData changes
  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        email: prefilledData.email || prev.email,
        password: prefilledData.password || prev.password,
      }));
    }
  }, [prefilledData]);

  const handleChange = (field: keyof DriverData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear previous error for this field
    setErrors((prev) => ({ ...prev, [field]: '' }));
    
    // Real-time validation for driving abstract date
    if (field === 'drivingAbstractDate' && value) {
      const validation = getDrivingAbstractDateValidation(value);
      if (!validation.isValid && validation.error) {
        setErrors((prev) => ({ ...prev, [field]: t(validation.error as string) }));
      }
    }
  };

  const handleBankingChange = (field: keyof DriverData['bankingInfo'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankingInfo: {
        ...prev.bankingInfo,
        [field]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleConsentChange = (field: keyof DriverData['consentAndDeclarations'], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      consentAndDeclarations: {
        ...prev.consentAndDeclarations,
        [field]: value,
      },
    }));
  };

  const handleFileChange = (field: keyof DriverData['files'], file: File) => {
    setFormData((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [field]: file,
      },
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAddressSelect = (address: AddressData) => {
    setFormData((prev) => ({
      ...prev,
      streetNameNumber: address.streetNameNumber,
      appUniteNumber: address.appUniteNumber || '',
      city: address.city,
      province: convertProvinceNameToCode(address.province),
      postalCode: address.postalCode,
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName?.trim()) newErrors.firstName = t('driverRegistration.errors.firstNameRequired');
        if (!formData.lastName?.trim()) newErrors.lastName = t('driverRegistration.errors.lastNameRequired');
        if (!formData.email?.trim()) newErrors.email = t('driverRegistration.errors.emailRequired');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          newErrors.email = t('driverRegistration.errors.invalidEmail');
        if (!formData.password?.trim()) newErrors.password = t('driverRegistration.errors.passwordRequired');
        else if (formData.password.length < 6) newErrors.password = t('driverRegistration.errors.passwordLength');
        if (!formData.cellNumber?.trim()) newErrors.cellNumber = t('driverRegistration.errors.cellNumberRequired');
        else if (!/^\+1-\d{3}-\d{3}-\d{4}$/.test(formData.cellNumber)) 
          newErrors.cellNumber = t('driverRegistration.errors.invalidCellNumber');
        if (!formData.dateOfBirth?.trim()) newErrors.dateOfBirth = t('driverRegistration.errors.dateOfBirthRequired');
        else {
          const today = new Date();
          const birthDate = new Date(formData.dateOfBirth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 18) newErrors.dateOfBirth = t('driverRegistration.errors.ageRestriction');
        }
        if (!formData.streetNameNumber?.trim()) newErrors.streetNameNumber = t('driverRegistration.errors.streetAddressRequired');
        if (!formData.city?.trim()) newErrors.city = t('driverRegistration.errors.cityRequired');
        if (!formData.province?.trim()) newErrors.province = t('driverRegistration.errors.provinceRequired');
        if (!formData.postalCode?.trim()) newErrors.postalCode = t('driverRegistration.errors.postalCodeRequired');
        else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postalCode))
          newErrors.postalCode = t('driverRegistration.errors.invalidPostalCode');
        if (!formData.files.profilePhoto) newErrors.profilePhoto = t('driverRegistration.errors.profilePhotoRequired');
        break;

      case 2: // Vehicle Information
        if (!formData.vehicleType?.trim()) newErrors.vehicleType = t('driverRegistration.errors.vehicleTypeRequired');
        if (!formData.vehicleMake?.trim()) newErrors.vehicleMake = t('driverRegistration.errors.vehicleMakeRequired');
        if (!formData.vehicleModel?.trim()) newErrors.vehicleModel = t('driverRegistration.errors.vehicleModelRequired');
        if (!formData.yearOfManufacture?.trim()) newErrors.yearOfManufacture = t('driverRegistration.errors.yearRequired');
        else {
          const year = parseInt(formData.yearOfManufacture);
          const currentYear = new Date().getFullYear();
          if (year < 1990) {
            newErrors.yearOfManufacture = t('driverRegistration.errors.yearTooOld');
          } else if (year > currentYear) {
            newErrors.yearOfManufacture = t('driverRegistration.errors.yearTooNew');
          }
          // Check 25 year rule for meals delivery
          const vehicleAge = currentYear - year;
          if (vehicleAge > 25) {
            newErrors.yearOfManufacture = t('driverRegistration.errors.vehicleAgeRestriction');
          }
        }
        if (!formData.vehicleColor?.trim()) newErrors.vehicleColor = t('driverRegistration.errors.vehicleColorRequired');
        if (!formData.vehicleLicensePlate?.trim()) newErrors.vehicleLicensePlate = t('driverRegistration.errors.licensePlateRequired');
        else if (!/^[A-Z0-9\s-]+$/i.test(formData.vehicleLicensePlate))
          newErrors.vehicleLicensePlate = t('driverRegistration.errors.invalidLicensePlate');
        if (!formData.files.vehicleRegistration) newErrors.vehicleRegistration = t('driverRegistration.errors.vehicleRegistrationRequired');
        if (!formData.files.vehicleInsurance) newErrors.vehicleInsurance = t('driverRegistration.errors.vehicleInsuranceRequired');
        break;

      case 3: // Documents & Licenses
        // Validate driver's license class based on province
        if (!formData.driversLicenseClass?.trim()) {
          newErrors.driversLicenseClass = t('driverRegistration.errors.licenseClassRequired');
        } else if (formData.province === 'ON') {
          // For Ontario, license must be 'G' or 'G2'
          if (!['G', 'G2'].includes(formData.driversLicenseClass.toUpperCase())) {
            newErrors.driversLicenseClass = t('driverRegistration.errors.ontarioLicenseClass');
          }
        } else {
          // For all other provinces, license must be '5'
          if (formData.driversLicenseClass !== '5') {
            newErrors.driversLicenseClass = t('driverRegistration.errors.otherProvinceLicenseClass');
          }
        }
       
        if (!formData.drivingAbstractDate?.trim()) newErrors.drivingAbstractDate = t('driverRegistration.errors.drivingAbstractDateRequired');
        else {
          const validation = getDrivingAbstractDateValidation(formData.drivingAbstractDate);
          if (!validation.isValid && validation.error) {
            newErrors.drivingAbstractDate = t(validation.error as string);
          }
        }
        if (!formData.workEligibilityType?.trim()) newErrors.workEligibilityType = t('driverRegistration.errors.workEligibilityTypeRequired');
        if (!formData.sinNumber?.trim()) newErrors.sinNumber = t('driverRegistration.errors.sinNumberRequired');
        else if (!/^\d{9}$/.test(formData.sinNumber))
          newErrors.sinNumber = t('driverRegistration.errors.invalidSinNumber');
        if (!formData.files.driversLicenseFront) newErrors.driversLicenseFront = t('driverRegistration.errors.driversLicenseFrontRequired');
        if (!formData.files.driversLicenseBack) newErrors.driversLicenseBack = t('driverRegistration.errors.driversLicenseBackRequired');
        if (!formData.files.drivingAbstract) newErrors.drivingAbstract = t('driverRegistration.errors.drivingAbstractRequired');
        if (!formData.files.workEligibility) newErrors.workEligibility = t('driverRegistration.errors.workEligibilityRequired');
        break;

      case 4: // Banking & Consent
        if (!formData.bankingInfo.transitNumber?.trim()) newErrors.transitNumber = t('driverRegistration.errors.transitNumberRequired');
        else if (!/^\d{3}$/.test(formData.bankingInfo.transitNumber)) newErrors.transitNumber = t('driverRegistration.errors.invalidTransitNumber');
        
        if (!formData.bankingInfo.institutionNumber?.trim()) newErrors.institutionNumber = t('driverRegistration.errors.institutionNumberRequired');
        else if (!/^\d{5}$/.test(formData.bankingInfo.institutionNumber)) newErrors.institutionNumber = t('driverRegistration.errors.invalidInstitutionNumber');
        
        if (!formData.bankingInfo.accountNumber?.trim()) newErrors.accountNumber = t('driverRegistration.errors.accountNumberRequired');
        else if (!/^\d{7,12}$/.test(formData.bankingInfo.accountNumber)) newErrors.accountNumber = t('driverRegistration.errors.invalidAccountNumber');
        
        const allConsentsAgreed = Object.values(formData.consentAndDeclarations).every(val => val === true);
        if (!allConsentsAgreed) newErrors.consents = t('driverRegistration.errors.consentRequired');
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    console.log('Current step:', currentStep);
    console.log('Form data:', formData);
    
    if (validateStep(currentStep)) {
      console.log('Validation passed, moving to next step');
      if (currentStep === 4) {
        console.log('Final step, submitting to backend');
        await handleSubmitToBackend();
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      console.log('Validation failed:', errors);
    }
  };

  const handleSubmitToBackend = async () => {
    try {
      // Create FormData for file upload (matching your backend structure)
      console.log("DEBUG province before submit:", formData.province);

      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'files' && key !== 'bankingInfo' && key !== 'consentAndDeclarations') {
          submitData.append(key, formData[key as keyof DriverData] as string);
        }
      });

      // Add complex objects as JSON (as your backend expects)
      submitData.append('bankingInfo', JSON.stringify(formData.bankingInfo));
      submitData.append('consentAndDeclarations', JSON.stringify(formData.consentAndDeclarations));

      // Add missing field that backend expects
      submitData.append('deliveryType', 'Meals'); // Default value as per backend

      // Add missing field that backend expects
      submitData.append('deliveryType', 'Meals'); // Default value as per backend

      // Add files with exact field names your backend expects
      Object.keys(formData.files).forEach(key => {
        const fileKey = key as keyof DriverData['files'];
        if (formData.files[fileKey]) {
          submitData.append(key, formData.files[fileKey] as File);
        }
      });

      console.log('Submitting to backend...');
      console.log('FormData contents:', Object.fromEntries(submitData));

      // Submit to your backend API endpoint (using relative URL like restaurant registration)
      const response = await fetch('/api/drivers/register', {
        method: 'POST',
        body: submitData,
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        setDriverId(result.data.driverId);
        setShowPayment(true);
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: t('driverRegistration.errors.submissionFailed') });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePaymentSuccess = () => {
    // Redirect to success page or show success message
    window.location.href = '/driver-registration/success';
  };

  const handlePaymentError = (error: { message: string }) => {
    setErrors({ payment: error.message });
  };

  const validateYearOfManufacture = (year: string) => {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 15;
    const yearNum = parseInt(year);
    
    if (yearNum < minYear) {
      return t('driverRegistration.errors.yearRange.tooOld');
    }
    if (yearNum > currentYear) {
      return t('driverRegistration.errors.yearRange.tooNew');
    }
    return '';
  };

  if (showPayment) {
    return (
      <div style={formContainerStyle}>
        <PaymentSection 
          driverData={formData}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
        {errors.payment && (
          <p style={errorMessageStyle}>{errors.payment}</p>
        )}
      </div>
    );
  }

  return (
    <div style={formContainerStyle}>
      <h2 style={mainTitleStyle}>{t('driverRegistration.title')}</h2>
      
<div style={progressBarStyle}>
      {/* Background line */}
      <div style={progressLineStyle}></div>

      {/* Steps */}
      {[1, 2, 3, 4].map((step) => (
        <div key={step} style={progressStepStyle(currentStep >= step)}>
          {step}
        </div>
      ))}
    </div>

      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        {currentStep === 1 && (
          <div style={stepContentStyle}>
            <h3 style={sectionTitleStyle}>{t('driverRegistration.sections.personalInfo')}</h3>
            
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.firstName')}
                value={formData.firstName} 
                onChange={(val) => handleChange('firstName', val)}
                error={errors.firstName}
                placeholder={t('driverRegistration.placeholders.firstName')}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.middleName')}
                value={formData.middleName} 
                onChange={(val) => handleChange('middleName', val)}
                placeholder={t('driverRegistration.placeholders.middleName')}
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.lastName')}
                value={formData.lastName} 
                onChange={(val) => handleChange('lastName', val)}
                error={errors.lastName}
                placeholder={t('driverRegistration.placeholders.lastName')}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.dateOfBirth')}
                type="date" 
                value={formData.dateOfBirth} 
                onChange={(val) => handleChange('dateOfBirth', val)}
                error={errors.dateOfBirth}
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.email')}
                type="email" 
                value={formData.email} 
                onChange={(val) => handleChange('email', val)}
                error={errors.email}
                placeholder={t('driverRegistration.placeholders.email')}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.password')}
                type="password" 
                value={formData.password} 
                onChange={(val) => handleChange('password', val)}
                error={errors.password}
                placeholder={t('driverRegistration.placeholders.password')}
                required
              />
            </div>
            
            <FormInput 
              label={t('driverRegistration.labels.cellNumber')}
              value={formData.cellNumber} 
              onChange={(val) => handleChange('cellNumber', val)}
              error={errors.cellNumber}
              placeholder={t('driverRegistration.placeholders.cellNumber')}
              required
            />
            
            <h4 style={subSectionTitleStyle}>{t('driverRegistration.sections.addressInfo')}</h4>
            
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.streetNameNumber')}
                value={formData.streetNameNumber} 
                onChange={(val) => handleChange('streetNameNumber', val)}
                error={errors.streetNameNumber}
                placeholder={t('driverRegistration.placeholders.streetNameNumber')}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.appUniteNumber')}
                value={formData.appUniteNumber} 
                onChange={(val) => handleChange('appUniteNumber', val)}
                placeholder={t('driverRegistration.placeholders.appUniteNumber')}
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.city')}
                value={formData.city} 
                onChange={(val) => handleChange('city', val)}
                error={errors.city}
                placeholder={t('driverRegistration.placeholders.city')}
                required
              />
              <FormSelect 
                label={t('driverRegistration.labels.province')}
                value={formData.province} 
                options={provinceOptions} 
                onChange={(val) => handleChange('province', val)}
                error={errors.province}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.postalCode')}
                value={formData.postalCode} 
                onChange={(val) => handleChange('postalCode', val)}
                error={errors.postalCode}
                placeholder={t('driverRegistration.placeholders.postalCode')}
                required
              />
            </div>
            
            <FormFileUpload 
              label={t('driverRegistration.labels.profilePhoto')}
              onChange={(file) => handleFileChange('profilePhoto', file)}
              error={errors.profilePhoto}
              fileName={formData.files.profilePhoto?.name}
              required
            />
          </div>
        )}

        {currentStep === 2 && (
          <div style={stepContentStyle}>
            <h3 style={sectionTitleStyle}>{t('driverRegistration.sections.vehicleInfo')}</h3>
            
            <div style={formRowStyle}>
              <FormSelect 
                label={t('driverRegistration.labels.vehicleType')}
                value={formData.vehicleType} 
                options={vehicleTypeOptions}
                onChange={(val) => handleChange('vehicleType', val)}
                error={errors.vehicleType}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.vehicleMake')}
                value={formData.vehicleMake} 
                onChange={(val) => handleChange('vehicleMake', val)}
                error={errors.vehicleMake}
                placeholder={t('driverRegistration.placeholders.vehicleMake')}
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.vehicleModel')}
                value={formData.vehicleModel} 
                onChange={(val) => handleChange('vehicleModel', val)}
                error={errors.vehicleModel}
                placeholder={t('driverRegistration.placeholders.vehicleModel')}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.yearOfManufacture')}
                type="number" 
                value={formData.yearOfManufacture} 
                onChange={(val) => handleChange('yearOfManufacture', val)}
                error={errors.yearOfManufacture}
                placeholder={t('driverRegistration.placeholders.yearOfManufacture')}
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.vehicleColor')}
                value={formData.vehicleColor} 
                onChange={(val) => handleChange('vehicleColor', val)}
                error={errors.vehicleColor}
                placeholder={t('driverRegistration.placeholders.vehicleColor')}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.vehicleLicensePlate')}
                value={formData.vehicleLicensePlate} 
                onChange={(val) => handleChange('vehicleLicensePlate', val)}
                error={errors.vehicleLicensePlate}
                placeholder={t('driverRegistration.placeholders.vehicleLicensePlate')}
                required
              />
            </div>

            <h4 style={subSectionTitleStyle}>{t('driverRegistration.sections.vehicleDocuments')}</h4>
            
            <div style={formRowStyle}>
              <FormFileUpload 
                label={t('driverRegistration.labels.vehicleRegistration')}
                onChange={(file) => handleFileChange('vehicleRegistration', file)}
                error={errors.vehicleRegistration}
                fileName={formData.files.vehicleRegistration?.name}
                required
              />
              <FormFileUpload 
                label={t('driverRegistration.labels.vehicleInsurance')}
                onChange={(file) => handleFileChange('vehicleInsurance', file)}
                error={errors.vehicleInsurance}
                fileName={formData.files.vehicleInsurance?.name}
                required
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={stepContentStyle}>
            <h3 style={sectionTitleStyle}>{t('driverRegistration.sections.documentsLicenses')}</h3>
            
            <h4 style={subSectionTitleStyle}>{t('driverRegistration.sections.driversLicense')}</h4>
            <div style={formRowStyle}>
              <FormFileUpload 
                label={t('driverRegistration.labels.driversLicenseFront')}
                onChange={(file) => handleFileChange('driversLicenseFront', file)}
                error={errors.driversLicenseFront}
                fileName={formData.files.driversLicenseFront?.name}
                required
              />
              <FormFileUpload 
                label={t('driverRegistration.labels.driversLicenseBack')}
                onChange={(file) => handleFileChange('driversLicenseBack', file)}
                error={errors.driversLicenseBack}
                fileName={formData.files.driversLicenseBack?.name}
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.driversLicenseClass')}
                value={formData.driversLicenseClass} 
                onChange={(val) => handleChange('driversLicenseClass', val)}
                error={errors.driversLicenseClass}
                placeholder={formData.province === 'ON' ? t('driverRegistration.placeholders.driversLicenseClassOntario') : t('driverRegistration.placeholders.driversLicenseClassOther')}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.drivingAbstractDate')}
                type="date" 
                value={formData.drivingAbstractDate} 
                onChange={(val) => handleChange('drivingAbstractDate', val)}
                error={errors.drivingAbstractDate}
                min={getDrivingAbstractDateConstraints().minDate}
                max={getDrivingAbstractDateConstraints().maxDate}
                required
              />
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem', fontStyle: 'italic' }}>
                Must be from the last 3 months and cannot be in the future
              </div>
            </div>
            
            <FormFileUpload 
              label={t('driverRegistration.labels.drivingAbstract')}
              onChange={(file) => handleFileChange('drivingAbstract', file)}
              error={errors.drivingAbstract}
              fileName={formData.files.drivingAbstract?.name}
              required
            />
            
            <h4 style={subSectionTitleStyle}>{t('driverRegistration.sections.backgroundWorkEligibility')}</h4>
            <div style={formRowStyle}>
              <FormFileUpload 
                label={t('driverRegistration.labels.workEligibility')}
                onChange={(file) => handleFileChange('workEligibility', file)}
                error={errors.workEligibility}
                fileName={formData.files.workEligibility?.name}
                required
              />
              <FormSelect 
                label={t('driverRegistration.labels.workEligibilityType')}
                value={formData.workEligibilityType} 
                options={workEligibilityOptions}
                onChange={(val) => handleChange('workEligibilityType', val)}
                error={errors.workEligibilityType}
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.sinNumber')}
                value={formData.sinNumber} 
                onChange={(val) => handleChange('sinNumber', val)}
                error={errors.sinNumber}
                placeholder={t('driverRegistration.placeholders.sinNumber')}
                maxLength={9}
                required
              />
              <FormFileUpload 
                label={t('driverRegistration.labels.sinCard')}
                onChange={(file) => handleFileChange('sinCard', file)}
                fileName={formData.files.sinCard?.name}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={stepContentStyle}>
            <h3 style={sectionTitleStyle}>{t('driverRegistration.sections.bankingConsent')}</h3>
            
            <h4 style={subSectionTitleStyle}>{t('driverRegistration.sections.bankingInfo')}</h4>
            <div style={formRowStyle}>
              <FormInput 
                label={t('driverRegistration.labels.transitNumber')}
                value={formData.bankingInfo.transitNumber} 
                onChange={(val) => handleBankingChange('transitNumber', val)}
                error={errors.transitNumber}
                maxLength={3}
                placeholder={t('driverRegistration.placeholders.transitNumber')}
                required
              />
              <FormInput 
                label={t('driverRegistration.labels.institutionNumber')}
                value={formData.bankingInfo.institutionNumber} 
                onChange={(val) => handleBankingChange('institutionNumber', val)}
                error={errors.institutionNumber}
                maxLength={5}
                placeholder={t('driverRegistration.placeholders.institutionNumber')}
                required
              />
            </div>
            
            <FormInput 
              label={t('driverRegistration.labels.accountNumber')}
              value={formData.bankingInfo.accountNumber} 
              onChange={(val) => handleBankingChange('accountNumber', val)}
              error={errors.accountNumber}
              maxLength={12}
              placeholder={t('driverRegistration.placeholders.accountNumber')}
              required
            />
            
            <div style={paymentInfoStyle}>
              <p style={paymentInfoTextStyle}><strong>{t('driverRegistration.paymentInfo.title')}:</strong> {t('driverRegistration.paymentInfo.amount')}</p>
              <p style={paymentInfoSubTextStyle}>{t('driverRegistration.paymentInfo.description')}</p>
            </div>
            
            <h4 style={subSectionTitleStyle}>{t('driverRegistration.sections.consentDeclarations')}</h4>
            <div style={consentSectionStyle}>
              {[
                { key: 'termsAndConditions', label: t('driverRegistration.consent.termsAndConditions') },
                { key: 'backgroundScreening', label: t('driverRegistration.consent.backgroundScreening') },
                { key: 'privacyPolicy', label: t('driverRegistration.consent.privacyPolicy') },
                { key: 'electronicCommunication', label: t('driverRegistration.consent.electronicCommunication') }
              ].map(({ key, label }) => (
                <FormCheckbox
                  key={key}
                  label={label}
                  checked={formData.consentAndDeclarations[key as keyof DriverData['consentAndDeclarations']]}
                  onChange={(checked) => handleConsentChange(key as keyof DriverData['consentAndDeclarations'], checked)}
                  error={errors.consents}
                />
              ))}
            </div>
          </div>
        )}

        {errors.submit && (
          <div style={errorBannerStyle}>
            {errors.submit}
          </div>
        )}

        <div style={buttonContainerStyle}>
          {currentStep > 1 ? (
            <button 
              type="button" 
              onClick={handleBack} 
              style={{...actionButtonStyle, backgroundColor: '#7f8c8d'}}
            >
              {t('driverRegistration.buttons.back')}
            </button>
          ) : (
            <div></div>
          )}
          
          <button type="submit" style={actionButtonStyle}>
            {currentStep === 4 ? t('driverRegistration.buttons.proceedToPayment') : t('driverRegistration.buttons.nextStep')}
          </button>
        </div>
      </form>
    </div>
  );
};

// Styles
const formContainerStyle = {
  maxWidth: '800px',
  margin: '2rem auto 2rem',
  padding: '2.5rem',
  backgroundColor: '#f4f2e9',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
  color: '#2c2a1f',
};

const mainTitleStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '30px',
  color: '#333333'
};

const progressBarStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '40px',
  position: 'relative',
};

const progressLineStyle: CSSProperties = {
  content: '""',
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: '2px',
  backgroundColor: '#cfcab0',
  transform: 'translateY(-50%)',
  zIndex: 1,
};

const progressStepStyle = (active: boolean): CSSProperties => ({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: active ? '#d9a73e' : '#e0dccc',
  color: active ? '#ffffff' : '#888',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  transition: 'background-color 0.3s ease',
  position: 'relative',
  zIndex: 2,
});

const sectionTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#d9a73e',
  marginBottom: '2rem',
  borderLeft: '4px solid #e4b549',
  paddingLeft: '1rem',
};

const subSectionTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: '600',
  color: '#3d3b30',
  marginTop: '2rem',
  marginBottom: '1.5rem',
};

const formGroupStyle: CSSProperties = {
  marginBottom: '20px',
  width: '100%'
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold',
  color: '#333333'
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid #bdc3c7',
  borderRadius: '4px',
  fontSize: '14px',
  transition: 'border-color 0.3s ease'
};

const formRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginBottom: '1rem',
};

const errorTextStyle: CSSProperties = {
  color: '#e74c3c',
  fontSize: '12px',
  marginTop: '4px'
};

const uploadWrapperStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  border: '1px dashed #bdc3c7',
  borderRadius: '4px',
  cursor: 'pointer',
  position: 'relative'
};

const uploadTextStyle: CSSProperties = {
  marginLeft: '10px',
  color: '#666666'
};

const fileInputStyle: CSSProperties = {
  opacity: 0,
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  cursor: 'pointer'
};

const paymentInfoStyle: CSSProperties = {
  padding: '1rem',
  backgroundColor: '#fcf7e7',
  borderRadius: '6px',
  margin: '1.5rem 0',
  borderLeft: '4px solid #e4b549',
};

const paymentInfoTextStyle: CSSProperties = {
  margin: '0.5rem 0',
  color: '#b98f1f',
  fontWeight: '600',
};

const paymentInfoSubTextStyle: CSSProperties = {
  margin: '0.5rem 0',
  color: '#b98f1f',
};

const paymentSuccessStyle: CSSProperties = {
  padding: '1rem',
  backgroundColor: '#d4edda',
  borderRadius: '6px',
  margin: '1.5rem 0',
  borderLeft: '4px solid #28a745',
};

const paymentSuccessTextStyle: CSSProperties = {
  margin: '0.5rem 0',
  color: '#155724',
  fontWeight: '600',
};

const consentSectionStyle = {
  backgroundColor: '#fdfcf7',
  padding: '1.5rem',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
};

const consentItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  marginBottom: '1rem',
  cursor: 'pointer',
};

const checkboxStyle = {
  marginTop: '0.125rem',
  width: 'auto',
};

const consentLabelStyle = {
  color: '#495057',
  lineHeight: '1.5',
};

const errorBannerStyle = {
  backgroundColor: '#f8d7da',
  border: '1px solid #f5c6cb',
  color: '#721c24',
  padding: '1rem',
  borderRadius: '6px',
  margin: '1.5rem 0',
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '3rem',
  borderTop: '1px solid #ecf0f1',
  paddingTop: '2rem',
};

const actionButtonStyle = {
  padding: '0.8rem 2rem',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease, transform 0.2s ease',
  backgroundColor: '#e4b549',
  color: '#fff',
  minWidth: '140px',
};

const stepContentStyle = {
  minHeight: '400px',
  animation: 'fadeIn 0.3s ease-in-out',
};

const paymentContainerStyle: CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
};

const paymentDescStyle = {
  color: '#7f8c8d',
  marginBottom: '1rem',
};

const paymentAmountStyle = {
  color: '#27ae60',
  fontSize: '1.3rem',
  margin: '1.5rem 0',
};

const cardFormStyle = {
  backgroundColor: '#fdfcf7',
  padding: '1.5rem',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
  margin: '1.5rem 0',
  textAlign: 'left',
};

const payButtonStyle = {
  width: '100%',
  marginTop: '1rem',
  padding: '1rem 2rem',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1.1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  color: 'white',
  backgroundColor: '#e4b549',
};

const errorMessageStyle: CSSProperties = {
  color: '#e74c3c',
  fontSize: '0.9rem',
  textAlign: 'center',
  marginTop: '1rem',
  padding: '0.75rem',
  backgroundColor: '#fadbd8',
  borderRadius: '6px',
};

const pageContainerStyle = {
  minHeight: '100vh',
  padding: '120px 20px 40px',
  backgroundColor: '#403E2D',
};

const contentWrapperStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  textAlign: 'center',
};

const pageTitleStyle = {
  fontSize: '2.5rem',
  color: 'white',
  marginBottom: '1rem',
  fontWeight: '600',
};

const pageDescriptionStyle = {
  fontSize: '1.125rem',
  color: '#e0e0e0',
  marginBottom: '3rem',
  lineHeight: '1.6',
};

export default DriverRegistration;