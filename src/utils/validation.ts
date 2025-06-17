import { Province, VehicleType } from '../types/forms';
import { DriverRegistrationState } from '@/types/forms';
import { RestaurantInfo } from '@/types/forms';

// Personal Information Validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+1-\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const isValidName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50;
};

export const isOver18 = (dob: Date): boolean => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
};

export const isValidPostalCode = (code: string): boolean => {
  return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(code);
};

// Vehicle Information Validation
export const isValidVehicleYear = (year: number, vehicleType: VehicleType): boolean => {
  if (vehicleType === 'Walk' || vehicleType === 'Bike' || vehicleType === 'Scooter') {
    return true;
  }
  const currentYear = new Date().getFullYear();
  return currentYear - year <= 25;
};

export const isValidLicensePlate = (plate: string): boolean => {
  return /^[A-Z0-9]+$/i.test(plate);
};

export const isValidDriversLicenseClass = (licenseClass: string, province: Province): boolean => {
  if (province === 'ON') {
    return ['G', 'G2'].includes(licenseClass);
  }
  return licenseClass === '5';
};

// Document Validation
export const isValidDrivingAbstractDate = (date: string): boolean => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return new Date(date) >= threeMonthsAgo;
};

export const isValidBackgroundCheckDate = (date: string | null): boolean => {
  if (!date) return true; // Optional field
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(date) >= sixMonthsAgo;
};

export const isValidSINNumber = (sin: string): boolean => {
  return /^\d{9}$/.test(sin);
};

// Banking Information Validation
export const isValidTransitNumber = (number: string): boolean => {
  return /^\d{3}$/.test(number);
};

export const isValidInstitutionNumber = (number: string): boolean => {
  return /^\d{5}$/.test(number);
};

export const isValidAccountNumber = (number: string): boolean => {
  return /^\d{7,12}$/.test(number);
};

// Payment Validation
export const isValidPaymentAmount = (amount: number): boolean => {
  return amount === 65.00;
};

// Consent Validation
export const validateConsent = (consent: Record<string, boolean>): boolean => {
  const requiredConsents = [
    'termsAndConditions',
    'backgroundScreening',
    'privacyPolicy',
    'electronicCommunication'
  ];
  
  return requiredConsents.every(field => consent[field] === true);
};

// Form Validation
export const validateDriverForm = (data: {
  personalInfo: any,
  vehicleInfo: any,
  documentInfo: any,
  paymentInfo: any,
  consents: any
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Personal Info Validation
  if (!isValidName(data.personalInfo.firstName)) {
    errors.firstName = 'First name must be between 2 and 50 characters';
  }
  if (!isValidName(data.personalInfo.lastName)) {
    errors.lastName = 'Last name must be between 2 and 50 characters';
  }
  if (!isOver18(data.personalInfo.dateOfBirth)) {
    errors.dateOfBirth = 'Must be at least 18 years old';
  }
  if (!isValidEmail(data.personalInfo.email)) {
    errors.email = 'Invalid email format';
  }
  if (!isValidPhoneNumber(data.personalInfo.cellNumber)) {
    errors.cellNumber = 'Invalid phone number format (+1-XXX-XXX-XXXX)';
  }
  if (!isValidPostalCode(data.personalInfo.postalCode)) {
    errors.postalCode = 'Invalid postal code format';
  }

  // Vehicle Info Validation
  if (!data.vehicleInfo.vehicleMake) {
    errors.vehicleMake = 'Vehicle make is required';
  }
  if (!data.vehicleInfo.vehicleModel) {
    errors.vehicleModel = 'Vehicle model is required';
  }
  if (!isValidVehicleYear(data.vehicleInfo.yearOfManufacture, data.vehicleInfo.vehicleType)) {
    errors.yearOfManufacture = 'Vehicle must be at least 25 years old for meal delivery';
  }
  if (!isValidLicensePlate(data.vehicleInfo.vehicleLicencePlate)) {
    errors.vehicleLicencePlate = 'Invalid license plate format';
  }

  // Document Info Validation
  if (!isValidSINNumber(data.documentInfo.sinNumber)) {
    errors.sinNumber = 'Invalid SIN number format (9 digits)';
  }
  if (data.documentInfo.drivingAbstractDate && !isValidDrivingAbstractDate(data.documentInfo.drivingAbstractDate)) {
    errors.drivingAbstractDate = 'Driving abstract must be from the last 3 months';
  }
  if (data.documentInfo.criminalBackgroundCheckDate && !isValidBackgroundCheckDate(data.documentInfo.criminalBackgroundCheckDate)) {
    errors.criminalBackgroundCheckDate = 'Criminal background check must be from the last 6 months';
  }

  // Payment Info Validation
  if (!isValidTransitNumber(data.paymentInfo.transitNumber)) {
    errors.transitNumber = 'Transit number must be 3 digits';
  }
  if (!isValidInstitutionNumber(data.paymentInfo.institutionNumber)) {
    errors.institutionNumber = 'Institution number must be 5 digits';
  }
  if (!isValidAccountNumber(data.paymentInfo.accountNumber)) {
    errors.accountNumber = 'Account number must be 7-12 digits';
  }

  // Consent Validation
  if (!validateConsent(data.consents)) {
    errors.consents = 'All consents are required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

interface ValidationResult {
  [key: string]: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  sin: string;
}

interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  insurance: string;
  driversLicense: string;
  driversLicenseClass?: string;
}

interface DocumentInfo {
  driversLicenseFile: File | null;
  insuranceFile: File | null;
  vehicleRegistrationFile: File | null;
  backgroundCheckConsent: File | null;
}

interface BankingInfo {
  accountHolderName: string;
  accountNumber: string;
  transitNumber: string;
  institutionNumber: string;
  voidChequeFile: File | null;
}

interface Consents {
  termsAndConditions: boolean;
  privacyPolicy: boolean;
  backgroundCheck: boolean;
  dataCollection: boolean;
}

export const validatePersonalInfo = (info: PersonalInfo): ValidationResult => {
  const errors: ValidationResult = {};

  if (!info.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!info.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!info.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
    errors.email = 'Invalid email format';
  }

  if (!info.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\+?1?\d{10}$/.test(info.phone.replace(/\D/g, ''))) {
    errors.phone = 'Invalid phone number format';
  }

  if (!info.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const age = new Date().getFullYear() - info.dateOfBirth.getFullYear();
    if (age < 21) {
      errors.dateOfBirth = 'Must be at least 21 years old';
    }
  }

  if (!info.address.trim()) {
    errors.address = 'Address is required';
  }

  if (!info.city.trim()) {
    errors.city = 'City is required';
  }

  if (!info.province.trim()) {
    errors.province = 'Province is required';
  }

  if (!info.postalCode.trim()) {
    errors.postalCode = 'Postal code is required';
  } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(info.postalCode)) {
    errors.postalCode = 'Invalid postal code format';
  }

  if (!info.sin.trim()) {
    errors.sin = 'SIN is required';
  } else if (!/^\d{9}$/.test(info.sin.replace(/\D/g, ''))) {
    errors.sin = 'Invalid SIN format';
  }

  return errors;
};

export const validateVehicleInfo = (info: VehicleInfo): ValidationResult => {
  const errors: ValidationResult = {};

  if (!info.make.trim()) {
    errors.make = 'Vehicle make is required';
  }

  if (!info.model.trim()) {
    errors.model = 'Vehicle model is required';
  }

  if (!info.year.trim()) {
    errors.year = 'Vehicle year is required';
  } else {
    const year = parseInt(info.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < currentYear - 15 || year > currentYear + 1) {
      errors.year = 'Vehicle must be less than 15 years old';
    }
  }

  if (!info.color.trim()) {
    errors.color = 'Vehicle color is required';
  }

  if (!info.licensePlate.trim()) {
    errors.licensePlate = 'License plate is required';
  }

  if (!info.insurance.trim()) {
    errors.insurance = 'Insurance information is required';
  }

  if (!info.driversLicense.trim()) {
    errors.driversLicense = "Driver's license number is required";
  }

  return errors;
};

export const validateDocumentInfo = (info: DocumentInfo): ValidationResult => {
  const errors: ValidationResult = {};

  if (!info.driversLicenseFile) {
    errors.driversLicenseFile = "Driver's license file is required";
  }

  if (!info.insuranceFile) {
    errors.insuranceFile = 'Insurance file is required';
  }

  if (!info.vehicleRegistrationFile) {
    errors.vehicleRegistrationFile = 'Vehicle registration file is required';
  }

  if (!info.backgroundCheckConsent) {
    errors.backgroundCheckConsent = 'Background check consent form is required';
  }

  return errors;
};

export const validateBankingInfo = (info: BankingInfo): ValidationResult => {
  const errors: ValidationResult = {};

  if (!info.accountHolderName.trim()) {
    errors.accountHolderName = 'Account holder name is required';
  }

  if (!info.accountNumber.trim()) {
    errors.accountNumber = 'Account number is required';
  } else if (!/^\d{7,12}$/.test(info.accountNumber.replace(/\D/g, ''))) {
    errors.accountNumber = 'Invalid account number format';
  }

  if (!info.transitNumber.trim()) {
    errors.transitNumber = 'Transit number is required';
  } else if (!/^\d{5}$/.test(info.transitNumber.replace(/\D/g, ''))) {
    errors.transitNumber = 'Invalid transit number format';
  }

  if (!info.institutionNumber.trim()) {
    errors.institutionNumber = 'Institution number is required';
  } else if (!/^\d{3}$/.test(info.institutionNumber.replace(/\D/g, ''))) {
    errors.institutionNumber = 'Invalid institution number format';
  }

  if (!info.voidChequeFile) {
    errors.voidChequeFile = 'Void cheque file is required';
  }

  return errors;
};

export const validateConsents = (consents: Consents): ValidationResult => {
  const errors: ValidationResult = {};

  if (!consents.termsAndConditions) {
    errors.termsAndConditions = 'You must agree to the terms and conditions';
  }

  if (!consents.privacyPolicy) {
    errors.privacyPolicy = 'You must agree to the privacy policy';
  }

  if (!consents.backgroundCheck) {
    errors.backgroundCheck = 'You must consent to the background check';
  }

  if (!consents.dataCollection) {
    errors.dataCollection = 'You must agree to data collection';
  }

  return errors;
};

export const validateDriverRegistration = (data: DriverRegistrationState) => {
  const errors: { [key: string]: string } = {};

  // Personal Information Validation
  if (!data.firstName) errors.firstName = 'First name is required';
  if (!data.lastName) errors.lastName = 'Last name is required';
  if (!data.email) errors.email = 'Email is required';
  else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
    errors.email = 'Invalid email address';
  }
  if (!data.phone) errors.phone = 'Phone number is required';
  else if (!/^\+?1?\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.phone = 'Invalid phone number format (10 digits required)';
  }
  if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  else {
    const dob = new Date(data.dateOfBirth);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 21) errors.dateOfBirth = 'Must be at least 21 years old';
  }
  if (!data.address) errors.address = 'Address is required';
  if (!data.city) errors.city = 'City is required';
  if (!data.province) errors.province = 'Province is required';
  if (!data.postalCode) errors.postalCode = 'Postal code is required';
  else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(data.postalCode)) {
    errors.postalCode = 'Invalid postal code format';
  }
  if (!data.sin) errors.sin = 'SIN is required';
  else if (!/^\d{9}$/.test(data.sin)) {
    errors.sin = 'Invalid SIN format (9 digits required)';
  }

  // Vehicle Information Validation
  if (!data.vehicleMake) errors.vehicleMake = 'Vehicle make is required';
  if (!data.vehicleModel) errors.vehicleModel = 'Vehicle model is required';
  if (!data.vehicleYear) errors.vehicleYear = 'Vehicle year is required';
  else {
    const year = parseInt(data.vehicleYear);
    const currentYear = new Date().getFullYear();
    if (year < currentYear - 10 || year > currentYear + 1) {
      errors.vehicleYear = 'Vehicle must be less than 10 years old';
    }
  }
  if (!data.vehicleColor) errors.vehicleColor = 'Vehicle color is required';
  if (!data.licensePlate) errors.licensePlate = 'License plate is required';
  if (!data.insurancePolicyNumber) errors.insurancePolicyNumber = 'Insurance policy number is required';
  if (!data.driversLicenseNumber) errors.driversLicenseNumber = 'Driver\'s license number is required';
  if (!data.driversLicenseClass) errors.driversLicenseClass = 'Driver\'s license class is required';
  else if (!['G', 'G2'].includes(data.driversLicenseClass)) {
    errors.driversLicenseClass = 'Invalid driver\'s license class';
  }

  // Document Validation
  if (!data.driversLicense) errors.driversLicense = 'Driver\'s license document is required';
  if (!data.vehicleInsurance) errors.vehicleInsurance = 'Vehicle insurance document is required';
  if (!data.vehicleRegistration) errors.vehicleRegistration = 'Vehicle registration document is required';
  if (!data.backgroundCheck) errors.backgroundCheck = 'Background check document is required';
  if (!data.driverAbstract) errors.driverAbstract = 'Driver abstract document is required';

  // Banking Information Validation
  if (!data.accountHolderName) errors.accountHolderName = 'Account holder name is required';
  if (!data.accountNumber) errors.accountNumber = 'Account number is required';
  else if (!/^\d{7,12}$/.test(data.accountNumber)) {
    errors.accountNumber = 'Invalid account number format (7-12 digits)';
  }
  if (!data.transitNumber) errors.transitNumber = 'Transit number is required';
  else if (!/^\d{5}$/.test(data.transitNumber)) {
    errors.transitNumber = 'Invalid transit number format (5 digits)';
  }
  if (!data.institutionNumber) errors.institutionNumber = 'Institution number is required';
  else if (!/^\d{3}$/.test(data.institutionNumber)) {
    errors.institutionNumber = 'Invalid institution number format (3 digits)';
  }

  // Consent Validation
  if (!data.termsConsent) errors.termsConsent = 'You must agree to the Terms and Conditions';
  if (!data.privacyConsent) errors.privacyConsent = 'You must agree to the Privacy Policy';
  if (!data.backgroundCheckConsent) errors.backgroundCheckConsent = 'You must consent to a background check';
  if (!data.dataUsageConsent) errors.dataUsageConsent = 'You must consent to data collection and usage';

  return errors;
};

export const validateRestaurantRegistration = (info: RestaurantInfo): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  // Owner Information
  if (!info.ownerName) {
    errors.ownerName = 'Owner name is required';
  }
  if (!info.ownerPhone) {
    errors.ownerPhone = 'Owner phone is required';
  } else if (!/^\+1-\d{3}-\d{3}-\d{4}$/.test(info.ownerPhone)) {
    errors.ownerPhone = 'Phone number must be in format: +1-XXX-XXX-XXXX';
  }

  // Business Information
  if (!info.identificationType) {
    errors.identificationType = 'Identification type is required';
  }
  if (!info.businessName) {
    errors.businessName = 'Business name is required';
  }
  if (!info.businessLicenseUrl) {
    errors.businessLicenseUrl = 'Business license is required';
  }
  if (!info.businessAddress) {
    errors.businessAddress = 'Business address is required';
  }
  if (!info.businessPhone) {
    errors.businessPhone = 'Business phone is required';
  } else if (!/^\+1-\d{3}-\d{3}-\d{4}$/.test(info.businessPhone)) {
    errors.businessPhone = 'Phone number must be in format: +1-XXX-XXX-XXXX';
  }
  if (!info.businessEmail) {
    errors.businessEmail = 'Business email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.businessEmail)) {
    errors.businessEmail = 'Invalid email format';
  }

  // Required Documents
  if (!info.fssaiCertificateUrl) {
    errors.fssaiCertificateUrl = 'FSSAI certificate is required';
  }
  if (!info.gstCertificateUrl) {
    errors.gstCertificateUrl = 'GST certificate is required';
  }
  if (!info.panCardUrl) {
    errors.panCardUrl = 'PAN card is required';
  }

  // Banking Information
  if (!info.bankingInfo.transitNumber) {
    errors.transitNumber = 'Transit number is required';
  } else if (!/^\d{3}$/.test(info.bankingInfo.transitNumber)) {
    errors.transitNumber = 'Transit number must be exactly 3 digits';
  }
  if (!info.bankingInfo.institutionNumber) {
    errors.institutionNumber = 'Institution number is required';
  } else if (!/^\d{5}$/.test(info.bankingInfo.institutionNumber)) {
    errors.institutionNumber = 'Institution number must be exactly 5 digits';
  }
  if (!info.bankingInfo.accountNumber) {
    errors.accountNumber = 'Account number is required';
  } else if (!/^\d{7,12}$/.test(info.bankingInfo.accountNumber)) {
    errors.accountNumber = 'Account number must be 7-12 digits';
  }
  if (!info.bankingInfo.voidChequeUrl) {
    errors.voidCheque = 'Void cheque is required';
  }

  // Tax Information based on province
  const province = info.businessAddress.split(', ')[2]?.trim().substring(0, 2);
  
  if (province) {
    // GST Provinces
    if (['AB', 'BC', 'MB', 'QC', 'SK', 'NT', 'YT', 'NU'].includes(province)) {
      if (!info.taxInfo.gstNumber) {
        errors.gstNumber = 'GST number is required for your province';
      } else if (!/^\d{9}RT\d{4}$/.test(info.taxInfo.gstNumber)) {
        errors.gstNumber = 'Invalid GST number format';
      }
    }

    // HST Provinces
    if (['NB', 'NL', 'NS', 'ON', 'PE'].includes(province)) {
      if (!info.taxInfo.hstNumber) {
        errors.hstNumber = 'HST number is required for your province';
      } else if (!/^\d{9}RT\d{4}$/.test(info.taxInfo.hstNumber)) {
        errors.hstNumber = 'Invalid HST number format';
      }
    }

    // QST for Quebec
    if (province === 'QC') {
      if (!info.taxInfo.qstNumber) {
        errors.qstNumber = 'QST number is required for Quebec';
      } else if (!/^\d{10}TQ\d{4}$/.test(info.taxInfo.qstNumber)) {
        errors.qstNumber = 'Invalid QST number format';
      }
    }

    // PST Provinces
    if (['BC', 'MB', 'SK'].includes(province)) {
      if (!info.taxInfo.pstNumber) {
        errors.pstNumber = 'PST number is required for your province';
      } else if (!/^\d{7}$/.test(info.taxInfo.pstNumber)) {
        errors.pstNumber = 'Invalid PST number format';
      }
    }
  }

  // Menu Details
  info.menuDetails.forEach((item, index) => {
    if (!item.name) {
      errors[`menuItem${index}Name`] = 'Menu item name is required';
    }
    if (!item.image) {
      errors[`menuItem${index}Image`] = 'Menu item image is required';
    }
    if (item.price <= 0) {
      errors[`menuItem${index}Price`] = 'Price must be greater than 0';
    }
  });

  // Hours of Operation
  info.hoursOfOperation.forEach((hours) => {
    if (!hours.openTime) {
      errors[`${hours.day}Open`] = 'Opening time is required';
    }
    if (!hours.closeTime) {
      errors[`${hours.day}Close`] = 'Closing time is required';
    }
  });

  return errors;
}; 