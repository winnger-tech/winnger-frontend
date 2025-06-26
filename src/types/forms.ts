export type Province = 
  'AB' | // Alberta
  'BC' | // British Columbia
  'MB' | // Manitoba
  'NB' | // New Brunswick
  'NL' | // Newfoundland and Labrador
  'NS' | // Nova Scotia
  'NT' | // Northwest Territories
  'NU' | // Nunavut
  'ON' | // Ontario
  'PE' | // Prince Edward Island
  'QC' | // Quebec
  'SK' | // Saskatchewan
  'YT';  // Yukon

export type VehicleType = 'Walk' | 'Scooter' | 'Bike' | 'Car' | 'Van' | 'Other';

export interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  cellNumber: string;
  streetNameNumber: string;
  appUniteNumber: string;
  city: string;
  province: Province;
  postalCode: string;
  profilePhoto: File | null;
}

export interface VehicleInfo {
  vehicleType: VehicleType;
  vehicleMake: string;
  vehicleModel: string;
  yearOfManufacture: number;
  vehicleColor: string;
  vehicleLicensePlate: string;
  vehicleInsurance: File | null;
  vehicleRegistration: File | null;
}

export interface DocumentInfo {
  driversLicenseFront: File | null;
  driversLicenseBack: File | null;
  vehicleRegistration: File | null;
  vehicleInsurance: File | null;
  drivingAbstract: File | null;
  workEligibility: File | null;
  sinCard?: File | null;
  workEligibilityType: string;
  sinNumber: string;
  drivingAbstractDate: string;
  criminalBackgroundCheckDate: string | null;
}

export interface PaymentInfo {
  transitNumber: string;
  institutionNumber: string;
  accountNumber: string;
}
interface FormData {
  // Owner Information
  ownerName: string;
  email: string;
  phone: string;
  ownerAddress: string; // NEW
  identificationType: string;

  // Business Information
  restaurantName: string;
  businessEmail: string; // NEW
  // businessPhone: string; // This was commented out in backend model, remove if not used.
  restaurantAddress: string; // RENAMED
  city: string;
  province: string;
  postalCode: string;
  businessType: 'Solo proprietor' | 'Corporate'; // NEW

  // Banking Information
  transitNumber: string;
  institutionNumber: string;
  accountNumber: string;

  // Tax Information
  gstNumber: string;
  hstNumber: string;
  pstNumber: string;
  qstNumber: string;

  // Documents
  businessDocument: File | null;
  // fssai: File | null; // Not currently used in backend upload.js or model.
  // gst: File | null;   // Not currently used in backend upload.js or model.
  // pan: File | null;   // Not currently used in backend upload.js or model.
  businessLicense: File | null;
  voidCheque: File | null;
  hstDocument: File | null; // NEW
  articleOfIncorporation: File | null; // NEW
  articleOfIncorporationExpiryDate: string; // NEW, sending as string
  foodHandlingCertificate: File | null; // NEW
  foodHandlingCertificateExpiryDate: string; // NEW, sending as string

  // Menu & Hours
  menuItems: MenuItem[];
  operatingHours: OperatingHours[];
}

// Update the RestaurantInfo interface in your forms.ts file
export interface RestaurantInfo {
  // Owner Information
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  ownerAddress?: string; // NEW
  identificationType: 'driving licence' | 'pr_card' | 'passport' | 'medical_card' | 'provincial_id'; // NEW
  
  // Business Information
  restaurantName: string;
  businessEmail?: string; // NEW
  restaurantAddress: string; // RENAMED from address
  city: string;
  province: Province;
  postalCode: string;
  businessType: 'Solo proprietor' | 'Corporate'; // NEW
  
  // Banking Info
  bankingInfo: {
    transitNumber: string;
    institutionNumber: string;
    accountNumber: string;
  };
  
  // Tax Info (dynamic based on province)
  taxInfo: {
    gstNumber?: string;
    hstNumber?: string;
    pstNumber?: string;
    qstNumber?: string;
  };
  
  // Documents
  businessDocument: File | null; // RENAMED from businessDocumentUrl
  businessLicense: File | null;
  voidCheque: File | null;
  hstDocument?: File | null; // NEW
  articleOfIncorporation?: File | null; // NEW
  articleOfIncorporationExpiryDate?: string; // NEW
  foodHandlingCertificate?: File | null; // NEW
  foodHandlingCertificateExpiryDate?: string; // NEW
  
  // Menu & Hours
  menuDetails: Array<{
    name: string;
    price: string; // Changed to string to match frontend
    description: string;
    image: File | null;
  }>;
  hoursOfOperation: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
  
  // Payment
  stripePaymentIntentId?: string;
  paymentStatus?: string;
  status?: string;
  emailVerified?: boolean;
}

export interface CustomerInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  cellNumber: string;
  streetNameNumber: string;
  appUniteNumber: string;
  city: string;
  province: Province;
  postalCode: string;
  profilePicture: File;
  gender: 'Male' | 'Female' | 'Other';
}

export interface CameraUploadProps {
  label: string;
  onChange: (file: File) => void;
  error?: string;
  required?: boolean;
  isLiveOnly?: boolean;
}

export interface InputFieldProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'password';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  required?: boolean;
}

export interface SelectProps<T> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  error?: string;
  required?: boolean;
}

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export interface DriverRegistrationState {
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  province: Province;
  postalCode: string;
  sin: string;

  // Vehicle Information
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  licensePlate: string;
  insurancePolicyNumber: string;
  driversLicenseNumber: string;
  driversLicenseClass: string;

  // Document Information
  driversLicense: File | null;
  vehicleInsurance: File | null;
  vehicleRegistration: File | null;
  backgroundCheck: File | null;
  driverAbstract: File | null;

  // Banking Information
  accountHolderName: string;
  accountNumber: string;
  transitNumber: string;
  institutionNumber: string;

  // Consents
  termsConsent: boolean;
  privacyConsent: boolean;
  backgroundCheckConsent: boolean;
  dataUsageConsent: boolean;
}

export interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  maxLength?: number;
}

export interface FormSelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export interface FormFileUploadProps {
  label: string;
  onChange: (file: File) => void;
  error?: string;
  required?: boolean;
  accept?: string;
}

export interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  error?: string;
  required?: boolean;
  accept?: string;
}

export interface MenuItem {
  name: string;
  image: File | null;
  price: number;
}

export interface OperatingHours {
  day: string;
  openTime: string;
  closeTime: string;
} 