'use client';

import React, { useState, CSSProperties } from 'react';
import { UploadCloud, Plus, Trash2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

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
    criminalBackgroundCheck: File | null;
    workEligibility: File | null;
    sinCard: File | null;
  };
}

interface DriverRegistrationProps {
  onSubmit: (data: DriverData) => void;
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
const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, error, type = 'text', placeholder, maxLength, required = false }) => (
  <div style={formGroupStyle}>
    <label style={labelStyle}>{label}</label>
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
    />
    {error && <p style={errorTextStyle}>{error}</p>}
  </div>
);

// Form Select Component
const FormSelect: React.FC<FormSelectProps> = ({ label, value, options, onChange, error, required = false }) => (
  <div style={formGroupStyle}>
    <label style={labelStyle}>{label}</label>
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

// Form File Upload Component
const FormFileUpload: React.FC<FormFileUploadProps> = ({ label, onChange, error, required = false, fileName }) => (
  <div style={formGroupStyle}>
    <label style={labelStyle}>{label}</label>
    <div style={uploadWrapperStyle}>
      <UploadCloud size={20} />
      <span style={uploadTextStyle}>{fileName || 'Click to upload'}</span>
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


// Main Driver Registration Component
const DriverRegistration: React.FC<DriverRegistrationProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [driverId, setDriverId] = useState(null);
  
  const [formData, setFormData] = useState<DriverData>({
    // Personal Information
    email: '',
    password: '',
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
      criminalBackgroundCheck: null,
      workEligibility: null,
      sinCard: null,
    }
  });

  const handleChange = (field: keyof DriverData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
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
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          newErrors.email = 'Invalid email format';
        if (!formData.password?.trim()) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.cellNumber?.trim()) newErrors.cellNumber = 'Cell number is required';
        else if (!/^\+1-\d{3}-\d{3}-\d{4}$/.test(formData.cellNumber)) 
          newErrors.cellNumber = 'Cell number must be in format +1-XXX-XXX-XXXX';
        if (!formData.dateOfBirth?.trim()) newErrors.dateOfBirth = 'Date of birth is required';
        else {
          const today = new Date();
          const birthDate = new Date(formData.dateOfBirth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 18) newErrors.dateOfBirth = 'Must be at least 18 years old';
        }
        if (!formData.streetNameNumber?.trim()) newErrors.streetNameNumber = 'Street address is required';
        if (!formData.city?.trim()) newErrors.city = 'City is required';
        if (!formData.province?.trim()) newErrors.province = 'Province is required';
        if (!formData.postalCode?.trim()) newErrors.postalCode = 'Postal code is required';
        else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postalCode))
          newErrors.postalCode = 'Postal code must be in format A1A 1A1';
        if (!formData.files.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
        break;

      case 2: // Vehicle Information
        if (!formData.vehicleType?.trim()) newErrors.vehicleType = 'Vehicle type is required';
        if (!formData.vehicleMake?.trim()) newErrors.vehicleMake = 'Vehicle make is required';
        if (!formData.vehicleModel?.trim()) newErrors.vehicleModel = 'Vehicle model is required';
        if (!formData.yearOfManufacture?.trim()) newErrors.yearOfManufacture = 'Year is required';
        else {
          const year = parseInt(formData.yearOfManufacture);
          const currentYear = new Date().getFullYear();
          if (year < 1990 || year > currentYear) {
            newErrors.yearOfManufacture = `Year must be between 1990 and ${currentYear}`;
          }
          // Check 25 year rule for meals delivery
          const vehicleAge = currentYear - year;
          if (vehicleAge > 25) {
            newErrors.yearOfManufacture = 'Vehicle must not be older than 25 years for delivery';
          }
        }
        if (!formData.vehicleColor?.trim()) newErrors.vehicleColor = 'Vehicle color is required';
        if (!formData.vehicleLicensePlate?.trim()) newErrors.vehicleLicensePlate = 'License plate is required';
        else if (!/^[A-Z0-9\s-]+$/i.test(formData.vehicleLicensePlate))
          newErrors.vehicleLicensePlate = 'Invalid license plate format';
        if (!formData.files.vehicleRegistration) newErrors.vehicleRegistration = 'Vehicle registration is required';
        if (!formData.files.vehicleInsurance) newErrors.vehicleInsurance = 'Vehicle insurance is required';
        break;

      case 3: // Documents & Licenses
        // Validate driver's license class based on province
        if (!formData.driversLicenseClass?.trim()) {
          newErrors.driversLicenseClass = 'License class is required';
        } else if (formData.province === 'ON') {
          // For Ontario, license must be 'G' or 'G2'
          if (!['G', 'G2'].includes(formData.driversLicenseClass.toUpperCase())) {
            newErrors.driversLicenseClass = 'Ontario drivers must have Class G or G2 license';
          }
        } else {
          // For all other provinces, license must be '5'
          if (formData.driversLicenseClass !== '5') {
            newErrors.driversLicenseClass = 'Drivers in this province must have a Class 5 license';
          }
        }
       
        if (!formData.drivingAbstractDate?.trim()) newErrors.drivingAbstractDate = 'Driving abstract date is required';
        else {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          if (new Date(formData.drivingAbstractDate) < threeMonthsAgo) {
            newErrors.drivingAbstractDate = 'Driving abstract must be from the last 3 months';
          }
        }
        if (!formData.workEligibilityType?.trim()) newErrors.workEligibilityType = 'Work eligibility type is required';
        if (!formData.sinNumber?.trim()) newErrors.sinNumber = 'SIN number is required';
        else if (!/^\d{9}$/.test(formData.sinNumber))
          newErrors.sinNumber = 'SIN number must be exactly 9 digits';
        if (!formData.files.driversLicenseFront) newErrors.driversLicenseFront = 'Driver license front is required';
        if (!formData.files.driversLicenseBack) newErrors.driversLicenseBack = 'Driver license back is required';
        if (!formData.files.drivingAbstract) newErrors.drivingAbstract = 'Driving abstract is required';
        if (!formData.files.criminalBackgroundCheck) newErrors.criminalBackgroundCheck = 'Background check is required';
        if (!formData.files.workEligibility) newErrors.workEligibility = 'Work eligibility document is required';
        break;

      case 4: // Banking & Consent
        if (!formData.bankingInfo.transitNumber?.trim()) newErrors.transitNumber = 'Transit number is required';
        else if (!/^\d{3}$/.test(formData.bankingInfo.transitNumber)) newErrors.transitNumber = 'Transit number must be exactly 3 digits';
        
        if (!formData.bankingInfo.institutionNumber?.trim()) newErrors.institutionNumber = 'Institution number is required';
        else if (!/^\d{5}$/.test(formData.bankingInfo.institutionNumber)) newErrors.institutionNumber = 'Institution number must be exactly 5 digits';
        
        if (!formData.bankingInfo.accountNumber?.trim()) newErrors.accountNumber = 'Account number is required';
        else if (!/^\d{7,12}$/.test(formData.bankingInfo.accountNumber)) newErrors.accountNumber = 'Account number must be 7-12 digits';
        
        const allConsentsAgreed = Object.values(formData.consentAndDeclarations).every(val => val === true);
        if (!allConsentsAgreed) newErrors.consents = 'You must agree to all terms and conditions';
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
      setErrors({ submit: 'Failed to submit registration. Please check if the backend server is running.' });
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
      {/*<h2 style={mainTitleStyle}>Driver Registration</h2>*/}
      
      {/* Progress Bar */}
     <div style={progressBarStyle as React.CSSProperties}>
  <div
    style={{
      position: 'absolute' as 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: '#e0dccc',
      transform: 'translateY(-50%)',
      zIndex: 1,
    }}
  ></div>
  {[1, 2, 3, 4].map((num) => (
    <div
      key={num}
      style={{
        ...progressStepStyle,
        backgroundColor: currentStep >= num ? '#d9a73e' : '#e0dccc',
        color: currentStep >= num ? '#ffffff' : '#888',
      } as React.CSSProperties}
    >
      {num}
    </div>
  ))}
</div>


      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div style={stepContentStyle}>
            <h3 style={sectionTitleStyle}>Personal Information</h3>
            
            <div style={formRowStyle}>
              <FormInput 
                label="First Name *" 
                value={formData.firstName} 
                onChange={(val) => handleChange('firstName', val)}
                error={errors.firstName}
                required
              />
              <FormInput 
                label="Middle Name" 
                value={formData.middleName} 
                onChange={(val) => handleChange('middleName', val)} 
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label="Last Name *" 
                value={formData.lastName} 
                onChange={(val) => handleChange('lastName', val)}
                error={errors.lastName}
                required
              />
              <FormInput 
                label="Date of Birth *" 
                type="date" 
                value={formData.dateOfBirth} 
                onChange={(val) => handleChange('dateOfBirth', val)}
                error={errors.dateOfBirth}
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label="Email Address *" 
                type="email" 
                value={formData.email} 
                onChange={(val) => handleChange('email', val)}
                error={errors.email}
                placeholder="driver@example.com"
                required
              />
              <FormInput 
                label="Password *" 
                type="password" 
                value={formData.password} 
                onChange={(val) => handleChange('password', val)}
                error={errors.password}
                required
              />
            </div>
            
              <FormInput 
                label="Cell Number * (+1-XXX-XXX-XXXX)" 
                value={formData.cellNumber} 
                onChange={(val) => handleChange('cellNumber', val)}
                error={errors.cellNumber}
                placeholder="+1-XXX-XXX-XXXX"
                required
              />
            
            {/* Address Section */}
            <h4 style={subSectionTitleStyle}>Address Information</h4>
            
            <GoogleMapsPicker 
              label="Address *"
              onAddressSelect={handleAddressSelect}
              error={errors.address}
              required
            />
            
            <div style={formRowStyle}>
              <FormInput 
                label="Street Name & Number *" 
                value={formData.streetNameNumber} 
                onChange={(val) => handleChange('streetNameNumber', val)}
                error={errors.streetNameNumber}
                required
              />
              <FormInput 
                label="App/Unit Number" 
                value={formData.appUniteNumber} 
                onChange={(val) => handleChange('appUniteNumber', val)} 
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label="City *" 
                value={formData.city} 
                onChange={(val) => handleChange('city', val)}
                error={errors.city}
                required
              />
              <FormSelect 
                label="Province *" 
                value={formData.province} 
                options={provinceOptions} 
                onChange={(val) => handleChange('province', val)}
                error={errors.province}
                required
              />
              <FormInput 
                label="Postal Code *" 
                value={formData.postalCode} 
                onChange={(val) => handleChange('postalCode', val)}
                error={errors.postalCode}
                placeholder="A1B 2C3"
                required
              />
            </div>
            
            <FormFileUpload 
              label="Profile Photo *" 
              onChange={(file) => handleFileChange('profilePhoto', file)}
              error={errors.profilePhoto}
              fileName={formData.files.profilePhoto?.name}
              required
            />
          </div>
        )}

        {/* Step 2: Vehicle Information */}
        {currentStep === 2 && (
          <div style={stepContentStyle}>
            <h3 style={sectionTitleStyle}>Vehicle Information</h3>
            
            <div style={formRowStyle}>
              <FormSelect 
                label="Vehicle Type *" 
                value={formData.vehicleType} 
                options={vehicleTypeOptions}
                onChange={(val) => handleChange('vehicleType', val)}
                error={errors.vehicleType}
                required
              />
              <FormInput 
                label="Vehicle Make *" 
                value={formData.vehicleMake} 
                onChange={(val) => handleChange('vehicleMake', val)}
                error={errors.vehicleMake}
                placeholder="e.g., Toyota"
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label="Vehicle Model *" 
                value={formData.vehicleModel} 
                onChange={(val) => handleChange('vehicleModel', val)}
                error={errors.vehicleModel}
                placeholder="e.g., Camry"
                required
              />
              <FormInput 
                label="Year of Manufacture *" 
                type="number" 
                value={formData.yearOfManufacture} 
                onChange={(val) => handleChange('yearOfManufacture', val)}
                error={errors.yearOfManufacture}
                placeholder="e.g., 2020"
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label="Vehicle Color *" 
                value={formData.vehicleColor} 
                onChange={(val) => handleChange('vehicleColor', val)}
                error={errors.vehicleColor}
                placeholder="e.g., Silver"
                required
              />
              <FormInput 
                label="Vehicle License Plate *" 
                value={formData.vehicleLicensePlate} 
                onChange={(val) => handleChange('vehicleLicensePlate', val)}
                error={errors.vehicleLicensePlate}
                placeholder="e.g., ABC-123"
                required
              />
            </div>

            <h4 style={subSectionTitleStyle}>Vehicle Documents</h4>
            
            <div style={formRowStyle}>
              <FormFileUpload 
                label="Vehicle Registration *" 
                onChange={(file) => handleFileChange('vehicleRegistration', file)}
                error={errors.vehicleRegistration}
                required
              />
              <FormFileUpload 
                label="Vehicle Insurance Certificate *" 
                onChange={(file) => handleFileChange('vehicleInsurance', file)}
                error={errors.vehicleInsurance}
                required
              />
            </div>
          </div>
        )}

        {/* Step 3: Documents & Licenses */}
        {currentStep === 3 && (
          <div style={stepContentStyle}>
            <h3 style={sectionTitleStyle}>Documents & Licenses</h3>
            
            <h4 style={subSectionTitleStyle}>Driver's License</h4>
            <div style={formRowStyle}>
              <FormFileUpload 
                label="Driver's License (Front) *" 
                onChange={(file) => handleFileChange('driversLicenseFront', file)}
                error={errors.driversLicenseFront}
                required
              />
              <FormFileUpload 
                label="Driver's License (Back) *" 
                onChange={(file) => handleFileChange('driversLicenseBack', file)}
                error={errors.driversLicenseBack}
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label="Driver's License Class *" 
                value={formData.driversLicenseClass} 
                onChange={(val) => handleChange('driversLicenseClass', val)}
                error={errors.driversLicenseClass}
                placeholder={formData.province === 'ON' ? 'G or G2' : '5'}
                required
              />
              <FormInput 
                label="Driving Abstract Date *" 
                type="date" 
                value={formData.drivingAbstractDate} 
                onChange={(val) => handleChange('drivingAbstractDate', val)}
                error={errors.drivingAbstractDate}
                required
              />
            </div>
            
            <FormFileUpload 
              label="Driving Abstract *" 
              onChange={(file) => handleFileChange('drivingAbstract', file)}
              error={errors.drivingAbstract}
              required
            />
            
            <h4 style={subSectionTitleStyle}>Background & Work Eligibility</h4>
            <FormFileUpload 
              label="Criminal Background Check *" 
              onChange={(file) => handleFileChange('criminalBackgroundCheck', file)}
              error={errors.criminalBackgroundCheck}
              required
            />
            
            <div style={formRowStyle}>
              <FormFileUpload 
                label="Proof of Work Eligibility *" 
                onChange={(file) => handleFileChange('workEligibility', file)}
                error={errors.workEligibility}
                required
              />
              <FormSelect 
                label="Work Eligibility Type *" 
                value={formData.workEligibilityType} 
                options={workEligibilityOptions}
                onChange={(val) => handleChange('workEligibilityType', val)}
                error={errors.workEligibilityType}
                required
              />
            </div>
            
            <div style={formRowStyle}>
              <FormInput 
                label="SIN Number *" 
                value={formData.sinNumber} 
                onChange={(val) => handleChange('sinNumber', val)}
                error={errors.sinNumber}
                placeholder="9 digits"
                maxLength={9}
                required
              />
              <FormFileUpload 
                label="SIN Card (Optional)" 
                onChange={(file) => handleFileChange('sinCard', file)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Banking & Consent */}
        {currentStep === 4 && (
          <div style={stepContentStyle}>
            <h3 style={sectionTitleStyle}>Banking Information & Consent</h3>
            
            <h4 style={subSectionTitleStyle}>Banking Information (To Get Paid)</h4>
            <div style={formRowStyle}>
              <FormInput 
                label="Transit Number * (3 digits)" 
                value={formData.bankingInfo.transitNumber} 
                onChange={(val) => handleBankingChange('transitNumber', val)}
                error={errors.transitNumber}
                maxLength={3}
                placeholder="123"
                required
              />
              <FormInput 
                label="Institution Number * (5 digits)" 
                value={formData.bankingInfo.institutionNumber} 
                onChange={(val) => handleBankingChange('institutionNumber', val)}
                error={errors.institutionNumber}
                maxLength={5}
                placeholder="12345"
                required
              />
            </div>
            
            <FormInput 
              label="Account Number * (7-12 digits)" 
              value={formData.bankingInfo.accountNumber} 
              onChange={(val) => handleBankingChange('accountNumber', val)}
              error={errors.accountNumber}
              maxLength={12}
              placeholder="1234567890"
              required
            />
            
            <div style={paymentInfoStyle}>
              <p style={paymentInfoTextStyle}><strong>Payment Information:</strong> CAD $65 one-time Background Check Fee</p>
              <p style={paymentInfoSubTextStyle}>Payment will be processed after form submission. Background check link will be provided after successful payment.</p>
            </div>
            
            <h4 style={subSectionTitleStyle}>Consent and Declarations</h4>
            <div style={consentSectionStyle}>
              {[
                { key: 'termsAndConditions', label: 'I agree to the Terms and Conditions *' },
                { key: 'backgroundScreening', label: 'I agree to Background Screening and Use of Uploaded Documents *' },
                { key: 'privacyPolicy', label: 'I agree to Privacy Policy (PIPEDA Compliant) *' },
                { key: 'electronicCommunication', label: 'I consent to Electronic Communication *' }
              ].map(({ key, label }) => (
                <label key={key} style={consentItemStyle}>
                  <input
                    type="checkbox"
                    checked={formData.consentAndDeclarations[key as keyof DriverData['consentAndDeclarations']]}
                    onChange={(e) => handleConsentChange(key as keyof DriverData['consentAndDeclarations'], e.target.checked)}
                    style={checkboxStyle}
                  />
                  <span style={consentLabelStyle}>{label}</span>
                </label>
              ))}
              
              {errors.consents && (
                <p style={errorTextStyle}>{errors.consents}</p>
              )}
            </div>
          </div>
        )}

        {/* Error display */}
        {errors.submit && (
          <div style={errorBannerStyle}>
            {errors.submit}
          </div>
        )}

        {/* Button Container */}
        <div style={buttonContainerStyle}>
          {currentStep > 1 ? (
            <button 
              type="button" 
              onClick={handleBack} 
              style={{...actionButtonStyle, backgroundColor: '#7f8c8d'}}
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          <button type="submit" style={actionButtonStyle}>
            {currentStep === 4 ? "Proceed to Payment (CAD $65)" : "Next Step"}
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

const mainTitleStyle = {
  textAlign: 'center',
  fontSize: '1.8rem',
  fontWeight: '600',
  marginBottom: '1.5rem',
  color: '#3b3a2e',
};

const progressBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2.5rem',
  position: 'relative',
};

const progressStepStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  transition: 'background-color 0.3s ease',
  position: 'relative',
  zIndex: 2,
};

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
  marginBottom: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle = {
  marginBottom: '0.5rem',
  fontWeight: '500',
  fontSize: '0.95rem',
  color: '#5c5945',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid #d2cdb6',
  borderRadius: '6px',
  fontSize: '1rem',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#fdfcf7',
};

const formRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginBottom: '1rem',
};

const errorTextStyle = {
  color: '#e74c3c',
  fontSize: '0.85rem',
  marginTop: '0.25rem',
};

const uploadWrapperStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1.5rem',
  border: '2px dashed #c8c2a4',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'border-color 0.3s ease',
  backgroundColor: '#fdfcf7',
  minHeight: '60px',
};

const uploadTextStyle = {
  color: '#7f8c8d',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const fileInputStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  cursor: 'pointer',
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




// export default function DriverRegistrationPage() {
//   const handleSubmit = (data) => {
//     console.log('Form submitted:', data);
//     // Add any additional handling here
//   };

//   return (
//     <div style={pageContainerStyle}>
//       <div style={contentWrapperStyle}>
//         <h1 style={pageTitleStyle}>Driver Registration</h1>
//         <p style={pageDescriptionStyle}>
//           Join our network of professional drivers and start earning on your own schedule.
//           Fill out the form below to begin your registration process.
//         </p>
//         <DriverRegistration onSubmit={handleSubmit} />
//       </div>
//     </div>
//   );
// }

// Add page-level styles


// const formContainerStyle = { maxWidth: '800px', margin: '2rem auto', padding: '2.5rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', color: '#333' };
// const progressBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', position: 'relative' };
// const progressStepStyle = { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', transition: 'background-color 0.3s ease', position: 'relative', zIndex: 2 };
// const sectionTitleStyle = { fontSize: '1.5rem', fontWeight: '600', color: '#2980b9', marginBottom: '2rem', borderLeft: '4px solid #3498db', paddingLeft: '1rem' };
// const subSectionTitleStyle = { fontSize: '1.2rem', fontWeight: '600', color: '#34495e', marginTop: '2rem', marginBottom: '1.5rem' };
// const formGroupStyle = { marginBottom: '1.25rem', display: 'flex', flexDirection: 'column' };
// const labelStyle = { marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.95rem', color: '#555' };
// const inputStyle = { width: '100%', padding: '0.75rem 1rem', border: '1px solid #bdc3c7', borderRadius: '6px', fontSize: '1rem', transition: 'border-color 0.2s ease, box-shadow 0.2s ease', outline: 'none', boxSizing: 'border-box' };
// const formRowStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1rem' };
// const errorTextStyle = { color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.25rem' };
// const uploadWrapperStyle = { position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', border: '2px dashed #bdc3c7', borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.3s ease', backgroundColor: '#f8f9fa', minHeight: '60px' };
// const uploadTextStyle = { color: '#7f8c8d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
// const fileInputStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
// const paymentInfoStyle = { padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '6px', margin: '1.5rem 0', borderLeft: '4px solid #e74c3c' };
// const paymentInfoTextStyle = { margin: '0.5rem 0', color: '#721c24', fontWeight: '600' };
// const paymentInfoSubTextStyle = { margin: '0.5rem 0', color: '#1565c0' };
// const consentSectionStyle = { backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef' };
// const consentItemStyle = { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' };
// const checkboxStyle = { marginTop: '0.125rem', width: 'auto' };
// const consentLabelStyle = { color: '#495057', lineHeight: '1.5' };
// const errorBannerStyle = { backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', padding: '1rem', borderRadius: '6px', margin: '1.5rem 0' };
// const buttonContainerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', borderTop: '1px solid #ecf0f1', paddingTop: '2rem' };
// const actionButtonStyle = { padding: '0.8rem 2rem', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.3s ease, transform 0.2s ease', backgroundColor: '#3498db', color: 'white', minWidth: '140px' };
// const stepContentStyle = { minHeight: '400px', animation: 'fadeIn 0.3s ease-in-out' };
// const paymentContainerStyle = { textAlign: 'center', padding: '2rem' };
// const paymentDescStyle = { color: '#7f8c8d', marginBottom: '1rem' };
// const paymentAmountStyle = { color: '#27ae60', fontSize: '1.3rem', margin: '1.5rem 0' };
// const cardFormStyle = { backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef', margin: '1.5rem 0', textAlign: 'left' };
// const payButtonStyle = { width: '100%', marginTop: '1rem', padding: '1rem 2rem', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.3s ease', color: 'white' };
// const errorMessageStyle = { color: '#e74c3c', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fadbd8', borderRadius: '6px' };


//export default DriverRegistration;
export default DriverRegistration;