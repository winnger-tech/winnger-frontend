import { Province, VehicleType } from '@/types/forms';

export const driverDummyData = {
  // Personal Information
  personalInfo: {
    firstName: "John",
    middleName: "Robert",
    lastName: "Smith",
    email: "john.smith@example.com",
    dateOfBirth: "1990-05-15", // Must be at least 21 years old
    cellNumber: "+1-416-555-0123", // Format: +1-XXX-XXX-XXXX
    streetNameNumber: "123 Main Street",
    appUniteNumber: "Unit 4B",
    city: "Toronto",
    province: "ON",
    postalCode: "M5V 2T6", // Format: A1A 1A1
    profilePhoto: null, // You'll need to provide an actual file
  },

  // Vehicle Information
  vehicleInfo: {
    vehicleType: "Car",
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    yearOfManufacture: "2020",
    vehicleColor: "Silver",
    vehicleLicensePlate: "ABCD 123",
  },

  // Document Information
  documentInfo: {
    driversLicenseFront: null, // You'll need to provide an actual file
    driversLicenseBack: null, // You'll need to provide an actual file
    vehicleRegistration: null, // You'll need to provide an actual file
    vehicleInsurance: null, // You'll need to provide an actual file
    drivingAbstract: null, // You'll need to provide an actual file
    workEligibility: null, // You'll need to provide an actual file
    sinCard: null, // You'll need to provide an actual file
    workEligibilityType: 'passport',
    sinNumber: '123456789',
    drivingAbstractDate: new Date().toISOString().split('T')[0],
    criminalBackgroundCheckDate: new Date().toISOString().split('T')[0]
  },

  // Payment Information
  paymentInfo: {
    transitNumber: "12345", // 5 digits
    institutionNumber: "001", // 3 digits
    accountNumber: "1234567", // 7-12 digits
  },

  // Consents
  consents: {
    termsAndConditions: true,
    backgroundScreening: true,
    privacyPolicy: true,
    electronicCommunication: true
  }
};

// Helper function to create a File object from base64 data
export const createFileFromBase64 = (base64Data: string, fileName: string, fileType: string): File => {
  const byteCharacters = atob(base64Data.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: fileType });
  
  return new File([blob], fileName, { type: fileType });
};

// Example usage for file uploads:
/*
const sampleImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'; // Your base64 image data
const driverLicenseFront = createFileFromBase64(sampleImage, 'license-front.jpg', 'image/jpeg');
documentInfo.driversLicenseFront = driverLicenseFront;
*/

// Helper function to fill the form with dummy data
export const fillDriverFormWithDummyData = (
  setPersonalInfo: Function,
  setVehicleInfo: Function,
  setDocumentInfo: Function,
  setPaymentInfo: Function,
  setConsents: Function
) => {
  setPersonalInfo(driverDummyData.personalInfo);
  setVehicleInfo(driverDummyData.vehicleInfo);
  setDocumentInfo(driverDummyData.documentInfo);
  setPaymentInfo(driverDummyData.paymentInfo);
  setConsents(driverDummyData.consents);
}; 