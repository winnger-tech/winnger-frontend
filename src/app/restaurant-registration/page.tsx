"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Navbar from "../component/Navbar";
import { UploadCloud, Plus, Trash2, Check, Mail } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslation } from '../../utils/i18n';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Constants
const PROVINCES = [
  { value: "AB", label: "Alberta", taxes: ["GST"] },
  { value: "BC", label: "British Columbia", taxes: ["GST", "PST"] },
  { value: "MB", label: "Manitoba", taxes: ["GST", "PST"] },
  { value: "NB", label: "New Brunswick", taxes: ["HST"] },
  { value: "NL", label: "Newfoundland and Labrador", taxes: ["HST"] },
  { value: "NS", label: "Nova Scotia", taxes: ["HST"] },
  { value: "NT", label: "Northwest Territories", taxes: ["GST"] },
  { value: "NU", label: "Nunavut", taxes: ["GST"] },
  { value: "ON", label: "Ontario", taxes: ["HST"] },
  { value: "PE", label: "Prince Edward Island", taxes: ["HST"] },
  { value: "QC", label: "Quebec", taxes: ["GST", "QST"] },
  { value: "SK", label: "Saskatchewan", taxes: ["GST", "PST"] },
  { value: "YT", label: "Yukon", taxes: ["GST"] },
];

const IDENTIFICATION_TYPES = [
  { value: "licence", label: "Driver's Licence" },
  { value: "pr_card", label: "PR Card" },
  { value: "passport", label: "Passport" },
  { value: "medical_card", label: "Medical Card" },
  { value: "provincial_id", label: "Provincial ID" },
];

const BUSINESS_TYPES = [
  { value: "Solo proprietor", label: "Solo Proprietor" },
  { value: "Corporate", label: "Corporate" },
];

const WEEKDAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

interface MenuItem {
  name: string;
  price: string;
  description: string;
  image: File | null;
}

interface OperatingHours {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface FormData {
  // Email verification
  email: string;
  password: string;
  
  // Owner Information
  ownerName: string;
  phone: string;
  ownerAddress: string;
  identificationType: string;

  // Business Information
  restaurantName: string;
  businessEmail: string;
  restaurantAddress: string;
  city: string;
  province: string;
  postalCode: string;
  businessType: 'Solo proprietor' | 'Corporate';

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
  businessLicense: File | null;
  voidCheque: File | null;
  hstDocument: File | null;
  articleOfIncorporation: File | null;
  articleOfIncorporationExpiryDate: string;
  foodHandlingCertificate: File | null;
  foodHandlingCertificateExpiryDate: string;

  // Menu & Hours
  menuItems: MenuItem[];
  operatingHours: OperatingHours[];
}

export default function RestaurantRegistrationPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // Start with email verification
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    ownerName: "",
    phone: "",
    ownerAddress: "",
    identificationType: "licence",
    restaurantName: "",
    businessEmail: "",
    restaurantAddress: "",
    city: "",
    province: "ON",
    postalCode: "",
    businessType: "Solo proprietor",
    transitNumber: "",
    institutionNumber: "",
    accountNumber: "",
    gstNumber: "",
    hstNumber: "",
    pstNumber: "",
    qstNumber: "",
    businessDocument: null,
    businessLicense: null,
    voidCheque: null,
    hstDocument: null,
    articleOfIncorporation: null,
    articleOfIncorporationExpiryDate: "",
    foodHandlingCertificate: null,
    foodHandlingCertificateExpiryDate: "",
    menuItems: [{ name: "", price: "", description: "", image: null }],
    operatingHours: WEEKDAYS.map((day) => ({
      day,
      openTime: "09:00",
      closeTime: "22:00",
      isClosed: false,
    })),
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Format postal code as user types
  const formatPostalCode = (value: string): string => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Format as X0X 0X0
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    }
    // Limit to 6 characters
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
  };

  // Email verification functions
  const sendVerificationEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurants/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setOtpSent(true);
        alert('Verification code sent to your email!');
      } else {
        setErrors({ email: data.message || 'Failed to send verification code' });
      }
    } catch (error) {
      setErrors({ email: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurants/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });

      const data = await response.json();
      
      if (response.ok) {
        setEmailVerified(true);
        setStep(1);
        alert('Email verified successfully!');
      } else {
        setErrors({ otp: data.message || 'Invalid verification code' });
      }
    } catch (error) {
      setErrors({ otp: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getRequiredTaxFields = (province: string) => {
    const provinceData = PROVINCES.find((p) => p.value === province);
    return provinceData?.taxes || [];
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Special handling for postal code
    if (name === 'postalCode') {
      const formattedValue = formatPostalCode(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleMenuItemChange = (
    index: number,
    field: keyof MenuItem,
    value: string | File
  ) => {
    const updatedMenuItems = [...formData.menuItems];
    (updatedMenuItems[index] as any)[field] = value;
    setFormData((prev) => ({ ...prev, menuItems: updatedMenuItems }));
  };

  const addMenuItem = () => {
    setFormData((prev) => ({
      ...prev,
      menuItems: [
        ...prev.menuItems,
        { name: "", price: "", description: "", image: null },
      ],
    }));
  };

  const removeMenuItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index),
    }));
  };

  const handleHoursChange = (
    index: number,
    field: keyof OperatingHours,
    value: string | boolean
  ) => {
    const updatedHours = [...formData.operatingHours];
    (updatedHours[index] as any)[field] = value;
    setFormData((prev) => ({ ...prev, operatingHours: updatedHours }));
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (stepNumber) {
      case 0: // Email verification
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          newErrors.email = "Invalid email format";
        if (!formData.password.trim()) newErrors.password = "Password is required";
        else if (formData.password.length < 6)
          newErrors.password = "Password must be at least 6 characters";
        break;

      case 1: // Owner & Business Info
        if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        else if (!/^\+?1?\d{10,14}$/.test(formData.phone.replace(/[\s-()]/g, "")))
          newErrors.phone = "Invalid phone format";
        if (!formData.restaurantName.trim()) newErrors.restaurantName = "Restaurant name is required";
        if (formData.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail))
          newErrors.businessEmail = "Invalid business email format";
        if (!formData.restaurantAddress.trim()) newErrors.restaurantAddress = "Restaurant address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";

        if (!formData.postalCode.trim()) {
          newErrors.postalCode = "Postal code is required";
        } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postalCode.trim())) {
          newErrors.postalCode = "Invalid Canadian postal code format (e.g., A1A 1A1 or A1A1A1)";
        }

        if (!formData.businessType) newErrors.businessType = "Business type is required";
        break;

      case 2: // Banking & Tax Info
        if (!formData.transitNumber.trim()) newErrors.transitNumber = "Transit number is required";
        else if (!/^\d{5}$/.test(formData.transitNumber))
          newErrors.transitNumber = "Transit number must be 5 digits";
        if (!formData.institutionNumber.trim()) newErrors.institutionNumber = "Institution number is required";
        else if (!/^\d{3}$/.test(formData.institutionNumber))
          newErrors.institutionNumber = "Institution number must be 3 digits";
        if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account number is required";
        else if (!/^\d{7,12}$/.test(formData.accountNumber))
          newErrors.accountNumber = "Account number must be 7-12 digits";

        const requiredTaxes = getRequiredTaxFields(formData.province);
        if (requiredTaxes.includes("GST") && !formData.gstNumber.trim())
          newErrors.gstNumber = "GST number is required for your province";
        if (requiredTaxes.includes("HST") && !formData.hstNumber.trim())
          newErrors.hstNumber = "HST number is required for your province";
        if (requiredTaxes.includes("PST") && !formData.pstNumber.trim())
          newErrors.pstNumber = "PST number is required for your province";
        if (requiredTaxes.includes("QST") && !formData.qstNumber.trim())
          newErrors.qstNumber = "QST number is required for your province";
        break;

      case 3: // Documents
        if (!formData.businessDocument) newErrors.businessDocument = "Business document is required";
        if (!formData.businessLicense) newErrors.businessLicense = "Business license is required";
        if (!formData.voidCheque) newErrors.voidCheque = "Void cheque is required";
        
        if (formData.articleOfIncorporationExpiryDate) {
          const expiryDate = new Date(formData.articleOfIncorporationExpiryDate);
          if (isNaN(expiryDate.getTime())) {
            newErrors.articleOfIncorporationExpiryDate = "Invalid date format";
          } else if (expiryDate < today) {
            newErrors.articleOfIncorporationExpiryDate = "Expiry date cannot be in the past";
          }
        }
        if (formData.articleOfIncorporation && !formData.articleOfIncorporationExpiryDate) {
          newErrors.articleOfIncorporationExpiryDate = "Expiry date required for Article of Incorporation";
        }
        if (!formData.articleOfIncorporation && formData.articleOfIncorporationExpiryDate) {
          newErrors.articleOfIncorporation = "Document required if expiry date is provided";
        }

        if (formData.foodHandlingCertificateExpiryDate) {
          const expiryDate = new Date(formData.foodHandlingCertificateExpiryDate);
          if (isNaN(expiryDate.getTime())) {
            newErrors.foodHandlingCertificateExpiryDate = "Invalid date format";
          } else if (expiryDate < today) {
            newErrors.foodHandlingCertificateExpiryDate = "Expiry date cannot be in the past";
          }
        }
        if (formData.foodHandlingCertificate && !formData.foodHandlingCertificateExpiryDate) {
          newErrors.foodHandlingCertificateExpiryDate = "Expiry date required for Food Handling Certificate";
        }
        if (!formData.foodHandlingCertificate && formData.foodHandlingCertificateExpiryDate) {
          newErrors.foodHandlingCertificate = "Document required if expiry date is provided";
        }
        break;

      case 4: // Menu & Hours
        if (formData.menuItems.length === 0) {
          newErrors.menuItems = "At least one menu item is required";
        } else {
          formData.menuItems.forEach((item, index) => {
            if (!item.name.trim()) newErrors[`menuItem${index}Name`] = "Item name is required";
            if (!item.price.trim()) newErrors[`menuItem${index}Price`] = "Price is required";
            else if (isNaN(parseFloat(item.price))) newErrors[`menuItem${index}Price`] = "Price must be a number";
            if (!item.image) newErrors[`menuItem${index}Image`] = "Image is required";
          });
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 4) {
        setShowPayment(true);
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurants/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setPaymentIntentId(data.paymentIntentId);
        // Here you would integrate Stripe Elements or redirect to payment
        handlePaymentSuccess(data.paymentIntentId);
      } else {
        setErrors({ payment: data.message || 'Failed to create payment intent' });
      }
    } catch (error) {
      setErrors({ payment: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (intentId: string) => {
    const submitData = new FormData();

    // Prepare banking and tax info
    const bankingInfo = {
      transitNumber: formData.transitNumber,
      institutionNumber: formData.institutionNumber,
      accountNumber: formData.accountNumber
    };

    const taxInfo: any = {};
    const requiredTaxes = getRequiredTaxFields(formData.province);
    if (requiredTaxes.includes("GST")) taxInfo.gstNumber = formData.gstNumber;
    if (requiredTaxes.includes("HST")) taxInfo.hstNumber = formData.hstNumber;
    if (requiredTaxes.includes("PST")) taxInfo.pstNumber = formData.pstNumber;
    if (requiredTaxes.includes("QST")) taxInfo.qstNumber = formData.qstNumber;

    // Append all form fields
    submitData.append('ownerName', formData.ownerName);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    submitData.append('phone', formData.phone);
    submitData.append('ownerAddress', formData.ownerAddress);
    submitData.append('identificationType', formData.identificationType);
    submitData.append('restaurantName', formData.restaurantName);
    submitData.append('businessEmail', formData.businessEmail);
    submitData.append('restaurantAddress', formData.restaurantAddress);
    submitData.append('city', formData.city);
    submitData.append('province', formData.province);
    submitData.append('postalCode', formData.postalCode);
    submitData.append('businessType', formData.businessType);
    submitData.append('bankingInfo', JSON.stringify(bankingInfo));
    submitData.append('taxInfo', JSON.stringify(taxInfo));
    submitData.append('menuDetails', JSON.stringify(formData.menuItems));
    submitData.append('hoursOfOperation', JSON.stringify(formData.operatingHours));
    submitData.append('stripePaymentIntentId', intentId);

    // Append files
    if (formData.businessDocument) submitData.append('businessDocument', formData.businessDocument);
    if (formData.businessLicense) submitData.append('businessLicense', formData.businessLicense);
    if (formData.voidCheque) submitData.append('voidCheque', formData.voidCheque);
    if (formData.hstDocument) submitData.append('hstDocument', formData.hstDocument);
    if (formData.articleOfIncorporation) submitData.append('articleOfIncorporation', formData.articleOfIncorporation);
    if (formData.foodHandlingCertificate) submitData.append('foodHandlingCertificate', formData.foodHandlingCertificate);

    // Append expiry dates
    if (formData.articleOfIncorporationExpiryDate) {
      submitData.append('articleOfIncorporationExpiryDate', formData.articleOfIncorporationExpiryDate);
    }
    if (formData.foodHandlingCertificateExpiryDate) {
      submitData.append('foodHandlingCertificateExpiryDate', formData.foodHandlingCertificateExpiryDate);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurants`, {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        window.location.href = "/registration-success";
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || "Registration failed" });
        setShowPayment(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "Registration failed. Please try again." });
      setShowPayment(false);
    }
  };

  if (showPayment) {
    return (
      <>
        <Navbar />
        <FormContainer>
          <PaymentSection>
            <SuccessMessage>
              Registration form completed successfully!
            </SuccessMessage>
            <PaymentDescription>
              Complete your registration with a one-time registration fee of $50.
            </PaymentDescription>
            <Button onClick={createPaymentIntent} disabled={loading}>
              {loading ? 'Processing...' : 'Proceed to Payment ($50)'}
            </Button>
            {errors.payment && <ErrorText>{errors.payment}</ErrorText>}
          </PaymentSection>
        </FormContainer>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <FormContainer as={motion.section} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <h2>{t('registration.restaurant.title')}</h2>
        
        {step > 0 && (
          <ProgressBar>
            {[1, 2, 3, 4].map((num) => (
              <ProgressStep key={num} $active={step >= num}>
                {num}
              </ProgressStep>
            ))}
          </ProgressBar>
        )}

        <form onSubmit={(e) => { e.preventDefault(); }}>
          {step === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionTitle>Email Verification</SectionTitle>
              {!otpSent ? (
                <>
                  <FormGroup>
                    <label htmlFor="email">Email Address *</label>
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="your@email.com" 
                    />
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="password">Password *</label>
                    <input 
                      id="password" 
                      name="password" 
                      type="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="Minimum 6 characters" 
                    />
                    {errors.password && <ErrorText>{errors.password}</ErrorText>}
                  </FormGroup>
                  <ActionButton 
                    type="button" 
                    onClick={sendVerificationEmail}
                    disabled={loading || !formData.email || !formData.password}
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </ActionButton>
                </>
              ) : (
                <>
                  <InfoBox>
                    <Mail size={20} />
                    Verification code sent to {formData.email}
                  </InfoBox>
                  <FormGroup>
                    <label htmlFor="otp">Verification Code *</label>
                    <input 
                      id="otp" 
                      type="text" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      placeholder="Enter 6-digit code" 
                      maxLength={6}
                    />
                    {errors.otp && <ErrorText>{errors.otp}</ErrorText>}
                  </FormGroup>
                  <ButtonContainer>
                    <ActionButton 
                      type="button" 
                      onClick={() => { setOtpSent(false); setOtp(''); }}
                      secondary
                    >
                      Change Email
                    </ActionButton>
                    <ActionButton 
                      type="button" 
                      onClick={verifyOTP}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </ActionButton>
                  </ButtonContainer>
                </>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionTitle>{t('registration.restaurant.steps.ownerInfo')}</SectionTitle>
              <FormGroup>
                <label htmlFor="ownerName">{t('registration.restaurant.ownerInfo.ownerName')} *</label>
                <input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.ownerName')} />
                {errors.ownerName && <ErrorText>{errors.ownerName}</ErrorText>}
              </FormGroup>
              <FormRow>
                

              <FormGroup>
  <label htmlFor="phone">{t('registration.restaurant.ownerInfo.phone')} *</label>
  <input
    id="phone"
    name="phone"
    type="tel"
    value={formData.phone.startsWith('+1-') ? formData.phone : '+1-' + formData.phone}
    onChange={handleChange}
    placeholder={t('registration.restaurant.placeholders.phone')}
  />
  {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
</FormGroup>

                <FormGroup>
                  <label htmlFor="identificationType">{t('registration.restaurant.ownerInfo.identificationType')} *</label>
                  <select id="identificationType" name="identificationType" value={formData.identificationType} onChange={handleChange}>
                    {IDENTIFICATION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </FormGroup>
              </FormRow>
              <FormGroup>
                <label htmlFor="ownerAddress">Owner Address (Optional)</label>
                <input id="ownerAddress" name="ownerAddress" value={formData.ownerAddress} onChange={handleChange} placeholder="Enter owner's address" />
              </FormGroup>

              <SectionTitle style={{marginTop: '3rem'}}>{t('registration.restaurant.businessInfo.title')}</SectionTitle>
              <FormGroup>
                <label htmlFor="restaurantName">{t('registration.restaurant.businessInfo.restaurantName')} *</label>
                <input id="restaurantName" name="restaurantName" value={formData.restaurantName} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.restaurantName')} />
                {errors.restaurantName && <ErrorText>{errors.restaurantName}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <label htmlFor="businessEmail">Business Email (Optional)</label>
                <input id="businessEmail" name="businessEmail" type="email" value={formData.businessEmail} onChange={handleChange} placeholder="business@example.com" />
                {errors.businessEmail && <ErrorText>{errors.businessEmail}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <label htmlFor="restaurantAddress">Restaurant Address *</label>
                <input id="restaurantAddress" name="restaurantAddress" value={formData.restaurantAddress} onChange={handleChange} placeholder="123 Main St" />
                {errors.restaurantAddress && <ErrorText>{errors.restaurantAddress}</ErrorText>}
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <label htmlFor="city">{t('registration.restaurant.businessInfo.city')} *</label>
                  <input id="city" name="city" value={formData.city} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.city')} />
                  {errors.city && <ErrorText>{errors.city}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <label htmlFor="province">{t('registration.restaurant.businessInfo.province')} *</label>
                  <select id="province" name="province" value={formData.province} onChange={handleChange}>
                    {PROVINCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </FormGroup>
                <FormGroup>
                  <label htmlFor="postalCode">{t('registration.restaurant.businessInfo.postalCode')} *</label>
                  <input 
                    id="postalCode" 
                    name="postalCode" 
                    value={formData.postalCode} 
                    onChange={handleChange} 
                    placeholder="K1A 0B1"
                    maxLength={7}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.postalCode && <ErrorText>{errors.postalCode}</ErrorText>}
                </FormGroup>
              </FormRow>
              <FormGroup>
                <label htmlFor="businessType">Business Type *</label>
                <select id="businessType" name="businessType" value={formData.businessType} onChange={handleChange}>
                  {BUSINESS_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                {errors.businessType && <ErrorText>{errors.businessType}</ErrorText>}
              </FormGroup>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionTitle>{t('registration.restaurant.bankingInfo.title')}</SectionTitle>
              <FormRow>
                <FormGroup>
                  <label htmlFor="transitNumber">Transit Number (5 digits) *</label>
                  <input id="transitNumber" name="transitNumber" value={formData.transitNumber} onChange={handleChange} maxLength={5} />
                  {errors.transitNumber && <ErrorText>{errors.transitNumber}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <label htmlFor="institutionNumber">Institution Number (3 digits) *</label>
                  <input id="institutionNumber" name="institutionNumber" value={formData.institutionNumber} onChange={handleChange} maxLength={3}/>
                  {errors.institutionNumber && <ErrorText>{errors.institutionNumber}</ErrorText>}
                </FormGroup>
              </FormRow>
              <FormGroup>
                <label htmlFor="accountNumber">Account Number (7-12 digits) *</label>
                <input id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} maxLength={12}/>
                {errors.accountNumber && <ErrorText>{errors.accountNumber}</ErrorText>}
              </FormGroup>

              <SubSectionTitle>Tax Information</SubSectionTitle>
              <TaxInfo>
                <p>Required for <strong>{PROVINCES.find(p => p.value === formData.province)?.label}</strong>:</p>
                <ul>
                  {getRequiredTaxFields(formData.province).map(tax => <li key={tax}>{tax}</li>)}
                </ul>
              </TaxInfo>
              {getRequiredTaxFields(formData.province).includes("GST") && (
                <FormGroup>
                  <label htmlFor="gstNumber">GST Number *</label>
                  <input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleChange}/>
                  {errors.gstNumber && <ErrorText>{errors.gstNumber}</ErrorText>}
                </FormGroup>
              )}
              {getRequiredTaxFields(formData.province).includes("PST") && (
                <FormGroup>
                  <label htmlFor="pstNumber">PST Number *</label>
                  <input id="pstNumber" name="pstNumber" value={formData.pstNumber} onChange={handleChange}/>
                  {errors.pstNumber && <ErrorText>{errors.pstNumber}</ErrorText>}
                </FormGroup>
              )}
              {getRequiredTaxFields(formData.province).includes("HST") && (
                <FormGroup>
                  <label htmlFor="hstNumber">HST Number *</label>
                  <input id="hstNumber" name="hstNumber" value={formData.hstNumber} onChange={handleChange}/>
                  {errors.hstNumber && <ErrorText>{errors.hstNumber}</ErrorText>}
                </FormGroup>
              )}
              {getRequiredTaxFields(formData.province).includes("QST") && (
                <FormGroup>
                  <label htmlFor="qstNumber">QST Number *</label>
                  <input id="qstNumber" name="qstNumber" value={formData.qstNumber} onChange={handleChange}/>
                  {errors.qstNumber && <ErrorText>{errors.qstNumber}</ErrorText>}
                </FormGroup>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionTitle>{t('registration.restaurant.documents.title')}</SectionTitle>
              <FormRow>
                <UploadGroup>
                  <label htmlFor="businessDocument">Business Document (Bank Statement/Card) *</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.businessDocument?.name || 'Click to upload'}</span>
                    <input id="businessDocument" name="businessDocument" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.businessDocument && <ErrorText>{errors.businessDocument}</ErrorText>}
                </UploadGroup>
                <UploadGroup>
                  <label htmlFor="voidCheque">Void Cheque *</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.voidCheque?.name || 'Click to upload'}</span>
                    <input id="voidCheque" name="voidCheque" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.voidCheque && <ErrorText>{errors.voidCheque}</ErrorText>}
                </UploadGroup>
              </FormRow>
              <FormRow>
                <UploadGroup>
                  <label htmlFor="businessLicense">Business License *</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.businessLicense?.name || 'Click to upload'}</span>
                    <input id="businessLicense" name="businessLicense" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.businessLicense && <ErrorText>{errors.businessLicense}</ErrorText>}
                </UploadGroup>
                <UploadGroup>
                  <label htmlFor="hstDocument">HST Document (Optional)</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.hstDocument?.name || 'Click to upload'}</span>
                    <input id="hstDocument" name="hstDocument" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.hstDocument && <ErrorText>{errors.hstDocument}</ErrorText>}
                </UploadGroup>
              </FormRow>
              <FormRow>
                <UploadGroup>
                  <label htmlFor="articleOfIncorporation">Article of Incorporation (Optional)</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.articleOfIncorporation?.name || 'Click to upload'}</span>
                    <input id="articleOfIncorporation" name="articleOfIncorporation" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.articleOfIncorporation && <ErrorText>{errors.articleOfIncorporation}</ErrorText>}
                </UploadGroup>
                <FormGroup>
                  <label htmlFor="articleOfIncorporationExpiryDate">Article Expiry Date</label>
                  <input id="articleOfIncorporationExpiryDate" name="articleOfIncorporationExpiryDate" type="date" value={formData.articleOfIncorporationExpiryDate} onChange={handleChange} />
                  {errors.articleOfIncorporationExpiryDate && <ErrorText>{errors.articleOfIncorporationExpiryDate}</ErrorText>}
                </FormGroup>
              </FormRow>
              <FormRow>
                <UploadGroup>
                  <label htmlFor="foodHandlingCertificate">Food Handling Certificate (Optional)</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.foodHandlingCertificate?.name || 'Click to upload'}</span>
                    <input id="foodHandlingCertificate" name="foodHandlingCertificate" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.foodHandlingCertificate && <ErrorText>{errors.foodHandlingCertificate}</ErrorText>}
                </UploadGroup>
                <FormGroup>
                  <label htmlFor="foodHandlingCertificateExpiryDate">Certificate Expiry Date</label>
                  <input id="foodHandlingCertificateExpiryDate" name="foodHandlingCertificateExpiryDate" type="date" value={formData.foodHandlingCertificateExpiryDate} onChange={handleChange} />
                  {errors.foodHandlingCertificateExpiryDate && <ErrorText>{errors.foodHandlingCertificateExpiryDate}</ErrorText>}
                </FormGroup>
              </FormRow>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionTitle>{t('registration.restaurant.menu.title')}</SectionTitle>
              {formData.menuItems.map((item, index) => (
                <MenuItemCard key={index}>
                  <FormGroup>
                    <label htmlFor={`menuItem${index}Name`}>Item Name *</label>
                    <input
                      id={`menuItem${index}Name`}
                      type="text"
                      value={item.name}
                      onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                      placeholder="e.g., Cheeseburger"
                    />
                    {errors[`menuItem${index}Name`] && <ErrorText>{errors[`menuItem${index}Name`]}</ErrorText>}
                  </FormGroup>
                  <FormRow>
                    <FormGroup>
                      <label htmlFor={`menuItem${index}Price`}>Price ($) *</label>
                      <input
                        id={`menuItem${index}Price`}
                        type="text"
                        value={item.price}
                        onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                      />
                      {errors[`menuItem${index}Price`] && <ErrorText>{errors[`menuItem${index}Price`]}</ErrorText>}
                    </FormGroup>
                    <FormGroup>
                      <label htmlFor={`menuItem${index}Image`}>Item Image *</label>
                      <UploadWrapper small>
                        <UploadCloud size={20} />
                        <span>{item.image?.name || 'Upload Image'}</span>
                        <input
                          type="file"
                          id={`menuItem${index}Image`}
                          accept="image/png, image/jpeg"
                          onChange={(e) => e.target.files && handleMenuItemChange(index, 'image', e.target.files[0])}
                        />
                      </UploadWrapper>
                      {errors[`menuItem${index}Image`] && <ErrorText>{errors[`menuItem${index}Image`]}</ErrorText>}
                    </FormGroup>
                  </FormRow>
                  <FormGroup>
                    <label htmlFor={`menuItem${index}Desc`}>Description</label>
                    <textarea
                      id={`menuItem${index}Desc`}
                      value={item.description}
                      onChange={(e) => handleMenuItemChange(index, 'description', e.target.value)}
                      placeholder="Brief description of the item"
                    />
                  </FormGroup>
                  {formData.menuItems.length > 1 && (
                    <RemoveButton type="button" onClick={() => removeMenuItem(index)}>
                      <Trash2 size={20} /> Remove Item
                    </RemoveButton>
                  )}
                </MenuItemCard>
              ))}

              <AddButton type="button" onClick={addMenuItem}>
                <Plus size={20} /> Add Menu Item
              </AddButton>

              <SubSectionTitle>Hours of Operation</SubSectionTitle>
              {formData.operatingHours.map((hour, index) => (
                <OperatingHoursRow key={index}>
                  <DayLabel>{hour.day}</DayLabel>
                  <FormGroup>
                    <input
                      type="time"
                      value={hour.openTime}
                      onChange={(e) => handleHoursChange(index, 'openTime', e.target.value)}
                      disabled={hour.isClosed}
                    />
                  </FormGroup>
                  <span>to</span>
                  <FormGroup>
                    <input
                      type="time"
                      value={hour.closeTime}
                      onChange={(e) => handleHoursChange(index, 'closeTime', e.target.value)}
                      disabled={hour.isClosed}
                    />
                  </FormGroup>
                  <CheckboxWrapper>
                    <input
                      type="checkbox"
                      id={`closed-${index}`}
                      checked={hour.isClosed}
                      onChange={(e) => handleHoursChange(index, 'isClosed', e.target.checked)}
                    />
                    <label htmlFor={`closed-${index}`}>Closed</label>
                  </CheckboxWrapper>
                </OperatingHoursRow>
              ))}
            </motion.div>
          )}

          <ButtonContainer>
            {step > 0 && (
              <ActionButton type="button" onClick={handleBack} secondary>
                Back
              </ActionButton>
            )}
            {step < 4 && (
              <ActionButton type="button" onClick={handleNext}>
                {step === 0 && !emailVerified ? 'Verify Email First' : 'Next Step'}
              </ActionButton>
            )}
            {step === 4 && (
              <ActionButton type="button" onClick={handleNext}>
                Proceed to Payment
              </ActionButton>
            )}
          </ButtonContainer>
        </form>
      </FormContainer>
    </>
  );
}

// Styled Components
const FormContainer = styled.section`
  max-width: 800px;
  margin: 2rem auto;
  margin-top: 5rem;
  padding: 2.5rem;
  background-color: #f4f2e9;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  color: #2c2a1f;

  h2 {
    text-align: center;
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #3b3a2e;
  }
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #cfcab0;
    transform: translateY(-50%);
    z-index: 1;
  }
`;

const ProgressStep = styled.div<{ $active: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ $active }) => ($active ? "#d9a73e" : "#e0dccc")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#888")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: background-color 0.3s ease;
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #d9a73e;
  margin-bottom: 2rem;
  border-left: 4px solid #e4b549;
  padding-left: 1rem;
`;

const SubSectionTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: #3d3b30;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;

  label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.95rem;
    color: #5c5945;
  }

  input, select, textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d2cdb6;
    border-radius: 6px;
    font-size: 1rem;
    background-color: #fdfcf7;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: #d9a73e;
      box-shadow: 0 0 0 3px rgba(217, 167, 62, 0.2);
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const ErrorText = styled.p`
  color: #c0392b;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const UploadGroup = styled(FormGroup)``;

const UploadWrapper = styled.div<{ small?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${({ small }) => small ? '0.6rem 1rem' : '1.5rem'};
  border: 2px dashed #c8c2a4;
  border-radius: 8px;
  background-color: #fdfcf7;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #d9a73e;
  }

  span {
    color: #7f8c8d;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const TaxInfo = styled.div`
  padding: 1rem;
  background-color: #fbf9f0;
  border-radius: 6px;
  margin-bottom: 1.5rem;

  ul {
    display: flex;
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin-top: 0.5rem;
  }

  li {
    background-color: #d9a73e;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 500;
    font-size: 0.9rem;
  }
`;

const MenuItemCard = styled.div`
  background: #fcfbf5;
  border: 1px solid #e0dccc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #c0392b;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #2ecc71;
  color: #2ecc71;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #2ecc71;
    color: white;
  }
`;

const OperatingHoursRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto 1fr 100px;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  span {
    text-align: center;
  }
`;

const DayLabel = styled.p`
  font-weight: 500;
  margin: 0;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;

  label {
    margin: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  border-top: 1px solid #ecf0f1;
  padding-top: 2rem;
`;

const ActionButton = styled.button<{ secondary?: boolean }>`
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  background-color: ${({ secondary }) => (secondary ? '#7f8c8d' : '#d9a73e')};
  color: white;

  &:hover {
    background-color: ${({ secondary }) => (secondary ? '#95a5a6' : '#c69535')};
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const PaymentSection = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const SuccessMessage = styled.h3`
  color: #4CAF50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const PaymentDescription = styled.p`
  color: #2c2a1f;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const Button = styled.button`
  background-color: #d9a73e;
  color: white;
  padding: 14px 24px;
  border: none;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c69535;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  color: #1976d2;
`;