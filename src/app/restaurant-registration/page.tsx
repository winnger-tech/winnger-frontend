"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
// CORRECTED IMPORT: Assumes Navbar is in src/components/common/Navbar.tsx. Please adjust if your path is different.
import Navbar from "../component/Navbar";
import { UploadCloud, Plus, Trash2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useTranslation } from '../../utils/i18n';

// Ensure the Stripe key is loaded from environment variables
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Canadian provinces with their tax requirements
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
  { value: "solo_proprietor", label: "Solo Proprietor" },
  { value: "corporate", label: "Corporate" },
];

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ========================================================================
// STYLED COMPONENTS (All necessary styles are defined below)
// ========================================================================
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

const MenuItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h4 {
    margin: 0;
    font-size: 1.1rem;
    color: #3b3a2e;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;

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

const PaymentContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const CardElementContainer = styled.div`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin: 2rem 0;
`;

const PayButton = styled(ActionButton)`
  width: 100%;
  margin-top: 1rem;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
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
`;

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
  // Owner Information
  ownerName: string;
  email: string;
  phone: string;
  identificationType: string;
  ownerAddress: string;

  // Business Information
  restaurantName: string;
  businessEmail: string;
  businessPhone: string;
  restaurantAddress: string;
  city: string;
  province: string;
  postalCode: string;
  businessType: string;

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
  fssai: File | null;
  gst: File | null;
  pan: File | null;
  businessLicense: File | null;
  voidCheque: File | null;
  hstDocument: File | null;
  articleOfIncorporation: File | null;
  foodHandlingCertificate: File | null;

  // Document URLs and Dates
  hstDocumentUrl: string;
  articleOfIncorporationUrl: string;
  articleOfIncorporationExpiryDate: string;
  foodHandlingCertificateUrl: string;
  foodHandlingCertificateExpiryDate: string;

  // Menu & Hours
  menuItems: MenuItem[];
  operatingHours: OperatingHours[];
}

// Payment Form Component
function PaymentForm({
  onSuccess,
}: {
  onSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on the server
      const response = await fetch("/api/restaurants/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5000 }), // $50.00 USD
      });

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
      } else {
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          onSuccess(result.paymentIntent.id);
        }
      }
    } catch (err) {
      setError("Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PaymentContainer>
      <SectionTitle>Complete Your Registration</SectionTitle>
      <p>A one-time registration fee is required to activate your partner account.</p>
      <h3>Registration Fee: $65.00 USD</h3>
      <form onSubmit={handleSubmit}>
        <CardElementContainer>
          <CardElement options={{style: {base: {fontSize: '16px'}}}}/>
        </CardElementContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <PayButton type="submit" disabled={!stripe || processing}>
          {processing ? "Processing..." : "Pay $50.00 and Submit"}
        </PayButton>
      </form>
    </PaymentContainer>
  );
}

// Main Registration Component - RENAMED FOR CLARITY
export default function RestaurantRegistrationPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    ownerName: "",
    email: "",
    phone: "",
    identificationType: "licence",
    ownerAddress: "",
    restaurantName: "",
    businessEmail: "",
    businessPhone: "",
    restaurantAddress: "",
    city: "",
    province: "ON",
    postalCode: "",
    businessType: "solo_proprietor",
    transitNumber: "",
    institutionNumber: "",
    accountNumber: "",
    gstNumber: "",
    hstNumber: "",
    pstNumber: "",
    qstNumber: "",
    businessDocument: null,
    fssai: null,
    gst: null,
    pan: null,
    businessLicense: null,
    voidCheque: null,
    hstDocument: null,
    articleOfIncorporation: null,
    foodHandlingCertificate: null,
    hstDocumentUrl: "",
    articleOfIncorporationUrl: "",
    articleOfIncorporationExpiryDate: "",
    foodHandlingCertificateUrl: "",
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

  const getRequiredTaxFields = (province: string) => {
    const provinceData = PROVINCES.find((p) => p.value === province);
    return provinceData?.taxes || [];
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

    switch (stepNumber) {
      case 1: // Owner & Business Info
        if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          newErrors.email = "Invalid email format";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        else if (!/^\+?1?\d{10,14}$/.test(formData.phone.replace(/[\s-()]/g, "")))
          newErrors.phone = "Invalid phone format";
        if (!formData.ownerAddress.trim()) newErrors.ownerAddress = "Owner address is required";
        if (!formData.businessType.trim()) newErrors.businessType = "Business type is required";
        if (!formData.businessEmail.trim()) newErrors.businessEmail = "Business email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail))
          newErrors.businessEmail = "Invalid business email format";
        if (!formData.businessPhone.trim()) newErrors.businessPhone = "Business phone is required";
        else if (!/^\+?1?\d{10,14}$/.test(formData.businessPhone.replace(/[\s-()]/g, "")))
          newErrors.businessPhone = "Invalid business phone format";
        if (!formData.restaurantName.trim()) newErrors.restaurantName = "Restaurant name is required";
        if (!formData.restaurantAddress.trim()) newErrors.restaurantAddress = "Restaurant address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
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
        if (!formData.fssai) newErrors.fssai = "FSSAI certificate is required";
        if (!formData.gst) newErrors.gst = "GST certificate is required";
        if (!formData.pan) newErrors.pan = "PAN card is required";
        if (!formData.businessLicense) newErrors.businessLicense = "Business license is required";
        if (!formData.voidCheque) newErrors.voidCheque = "Void cheque is required";
        if (!formData.hstDocument) newErrors.hstDocument = "HST document is required";
        if (!formData.articleOfIncorporation) newErrors.articleOfIncorporation = "Article of incorporation is required";
        if (!formData.foodHandlingCertificate) newErrors.foodHandlingCertificate = "Food handling certificate is required";
        if (!formData.articleOfIncorporationExpiryDate) newErrors.articleOfIncorporationExpiryDate = "Article of incorporation expiry date is required";
        if (!formData.foodHandlingCertificateExpiryDate) newErrors.foodHandlingCertificateExpiryDate = "Food handling certificate expiry date is required";
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
    console.log("Validation Errors Found:", newErrors);
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
      setStep(step - 1);
  };

  const handlePaymentSuccess = async (intentId: string) => {
    setPaymentIntentId(intentId);
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'menuItems' || key === 'operatingHours') {
        submitData.append(key, JSON.stringify(value));
      } else if (value instanceof File) {
        submitData.append(key, value);
      } else if (typeof value === 'string') {
        submitData.append(key, value);
      }
    });
    formData.menuItems.forEach((item, index) => {
        if (item.image) {
            submitData.append(`menuItemImage_${index}`, item.image);
        }
    });
    submitData.append("paymentIntentId", intentId);
    try {
      const response = await fetch("/api/restaurants/register", {
        method: "POST",
        body: submitData,
      });
      if (response.ok) {
        window.location.href = "/registration-success";
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || "Registration failed on the server." });
        setShowPayment(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "Registration failed. Please try again." });
      setShowPayment(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/restaurants/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 5000 }), // $50.00 in cents
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { id } = await res.json();
      
      if (!id) {
        throw new Error('No session ID received');
      }

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: id });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setErrors({ submit: 'Payment initialization failed. Please try again.' });
    }
  };

  if (showPayment) {
    return (
      <>
        <Navbar />
        <FormContainer as={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <PaymentSection>
            <SuccessMessage>
              Registration form completed successfully!
            </SuccessMessage>
            <PaymentDescription>
              Complete your registration with a one-time registration fee of $50.
            </PaymentDescription>
            <Button onClick={handleCheckout}>
              Proceed to Payment ($50)
            </Button>
            {errors.submit && <ErrorText style={{textAlign: 'center', marginTop: '20px'}}>{errors.submit}</ErrorText>}
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
        <ProgressBar>
          {[1, 2, 3, 4].map((num) => (
            <ProgressStep key={num} $active={step >= num}>
              {num}
            </ProgressStep>
          ))}
        </ProgressBar>

        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionTitle>{t('registration.restaurant.steps.ownerInfo')}</SectionTitle>
              <FormGroup>
                <label htmlFor="ownerName">{t('registration.restaurant.ownerInfo.ownerName')} *</label>
                <input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.ownerName')} />
                {errors.ownerName && <ErrorText>{t('registration.restaurant.errors.ownerNameRequired')}</ErrorText>}
              </FormGroup>
              <FormRow>
                <FormGroup>
                    <label htmlFor="email">{t('registration.restaurant.ownerInfo.email')} *</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.email')} />
                    {errors.email && <ErrorText>{t('registration.restaurant.errors.emailRequired')}</ErrorText>}
                </FormGroup>
                <FormGroup>
                    <label htmlFor="phone">{t('registration.restaurant.ownerInfo.phone')} *</label>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.phone')} />
                    {errors.phone && <ErrorText>{t('registration.restaurant.errors.phoneRequired')}</ErrorText>}
                </FormGroup>
              </FormRow>
               <FormGroup>
                <label htmlFor="identificationType">{t('registration.restaurant.ownerInfo.identificationType')} *</label>
                <select id="identificationType" name="identificationType" value={formData.identificationType} onChange={handleChange}>
                    {IDENTIFICATION_TYPES.map(type => <option key={type.value} value={type.value}>{t(`registration.restaurant.identificationTypes.${type.value}`)}</option>)}
                </select>
               </FormGroup>
               <FormGroup>
                <label htmlFor="ownerAddress">{t('registration.restaurant.ownerInfo.ownerAddress')} *</label>
                <textarea id="ownerAddress" name="ownerAddress" value={formData.ownerAddress} onChange={handleChange} placeholder="Enter owner's full address" />
                {errors.ownerAddress && <ErrorText>Owner address is required</ErrorText>}
               </FormGroup>
              <SectionTitle style={{marginTop: '3rem'}}>{t('registration.restaurant.businessInfo.title')}</SectionTitle>
               <FormGroup>
                <label htmlFor="businessType">{t('registration.restaurant.businessInfo.businessType')} *</label>
                <select id="businessType" name="businessType" value={formData.businessType} onChange={handleChange}>
                    {BUSINESS_TYPES.map(type => <option key={type.value} value={type.value}>{t(`registration.restaurant.businessTypes.${type.value}`)}</option>)}
                </select>
               </FormGroup>
               <FormGroup>
                <label htmlFor="restaurantName">{t('registration.restaurant.businessInfo.restaurantName')} *</label>
                <input id="restaurantName" name="restaurantName" value={formData.restaurantName} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.restaurantName')} />
                {errors.restaurantName && <ErrorText>{t('registration.restaurant.errors.restaurantNameRequired')}</ErrorText>}
              </FormGroup>
              <FormRow>
                <FormGroup>
                    <label htmlFor="businessEmail">{t('registration.restaurant.businessInfo.businessEmail')} *</label>
                    <input id="businessEmail" name="businessEmail" type="email" value={formData.businessEmail} onChange={handleChange} placeholder="Enter business email address" />
                    {errors.businessEmail && <ErrorText>Business email is required</ErrorText>}
                </FormGroup>
                <FormGroup>
                    <label htmlFor="businessPhone">{t('registration.restaurant.businessInfo.businessPhone')} *</label>
                    <input id="businessPhone" name="businessPhone" type="tel" value={formData.businessPhone} onChange={handleChange} placeholder="Enter business phone number" />
                    {errors.businessPhone && <ErrorText>Business phone is required</ErrorText>}
                </FormGroup>
              </FormRow>
               <FormGroup>
                <label htmlFor="restaurantAddress">{t('registration.restaurant.businessInfo.restaurantAddress')} *</label>
                <input id="restaurantAddress" name="restaurantAddress" value={formData.restaurantAddress} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.restaurantAddress')} />
                {errors.restaurantAddress && <ErrorText>{t('registration.restaurant.errors.restaurantAddressRequired')}</ErrorText>}
              </FormGroup>
              <FormRow>
                 <FormGroup>
                    <label htmlFor="city">{t('registration.restaurant.businessInfo.city')} *</label>
                    <input id="city" name="city" value={formData.city} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.city')} />
                    {errors.city && <ErrorText>{t('registration.restaurant.errors.cityRequired')}</ErrorText>}
                </FormGroup>
                 <FormGroup>
                    <label htmlFor="province">{t('registration.restaurant.businessInfo.province')} *</label>
                     <select id="province" name="province" value={formData.province} onChange={handleChange}>
                        {PROVINCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                     </select>
                </FormGroup>
                 <FormGroup>
                    <label htmlFor="postalCode">{t('registration.restaurant.businessInfo.postalCode')} *</label>
                    <input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder={t('registration.restaurant.placeholders.postalCode')} />
                    {errors.postalCode && <ErrorText>{t('registration.restaurant.errors.postalCodeRequired')}</ErrorText>}
                </FormGroup>
              </FormRow>
            </motion.div>
          )}

          {step === 2 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SectionTitle>{t('registration.restaurant.bankingInfo.title')}</SectionTitle>
                <FormRow>
                    <FormGroup>
                        <label htmlFor="transitNumber">{t('registration.restaurant.bankingInfo.transitNumber')} (5 {t('registration.restaurant.common.digits')}) *</label>
                        <input id="transitNumber" name="transitNumber" value={formData.transitNumber} onChange={handleChange} maxLength={5} />
                        {errors.transitNumber && <ErrorText>{t('registration.restaurant.errors.transitNumberRequired')}</ErrorText>}
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="institutionNumber">{t('registration.restaurant.bankingInfo.institutionNumber')} (3 {t('registration.restaurant.common.digits')}) *</label>
                        <input id="institutionNumber" name="institutionNumber" value={formData.institutionNumber} onChange={handleChange} maxLength={3}/>
                        {errors.institutionNumber && <ErrorText>{t('registration.restaurant.errors.institutionNumberRequired')}</ErrorText>}
                    </FormGroup>
                </FormRow>
                <FormGroup>
                    <label htmlFor="accountNumber">{t('registration.restaurant.bankingInfo.accountNumber')} (7-12 {t('registration.restaurant.common.digits')}) *</label>
                    <input id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} maxLength={12}/>
                    {errors.accountNumber && <ErrorText>{t('registration.restaurant.errors.accountNumberRequired')}</ErrorText>}
                </FormGroup>

                <SubSectionTitle>{t('registration.restaurant.taxInfo.title')}</SubSectionTitle>
                <TaxInfo>
                    <p>{t('registration.restaurant.taxInfo.requiredFor')} <strong>{PROVINCES.find(p => p.value === formData.province)?.label}</strong>:</p>
                    <ul>
                        {getRequiredTaxFields(formData.province).map(tax => <li key={tax}>{tax}</li>)}
                    </ul>
                </TaxInfo>
                {getRequiredTaxFields(formData.province).includes("GST") &&
                    <FormGroup>
                        <label htmlFor="gstNumber">{t('registration.restaurant.taxInfo.gstNumber')} *</label>
                        <input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleChange}/>
                        {errors.gstNumber && <ErrorText>{t('registration.restaurant.errors.gstNumberRequired')}</ErrorText>}
                    </FormGroup>
                }
                 {getRequiredTaxFields(formData.province).includes("PST") &&
                    <FormGroup>
                        <label htmlFor="pstNumber">{t('registration.restaurant.taxInfo.pstNumber')} *</label>
                        <input id="pstNumber" name="pstNumber" value={formData.pstNumber} onChange={handleChange}/>
                        {errors.pstNumber && <ErrorText>{t('registration.restaurant.errors.pstNumberRequired')}</ErrorText>}
                    </FormGroup>
                }
                 {getRequiredTaxFields(formData.province).includes("HST") &&
                    <FormGroup>
                        <label htmlFor="hstNumber">{t('registration.restaurant.taxInfo.hstNumber')} *</label>
                        <input id="hstNumber" name="hstNumber" value={formData.hstNumber} onChange={handleChange}/>
                        {errors.hstNumber && <ErrorText>{t('registration.restaurant.errors.hstNumberRequired')}</ErrorText>}
                    </FormGroup>
                }
                 {getRequiredTaxFields(formData.province).includes("QST") &&
                    <FormGroup>
                        <label htmlFor="qstNumber">{t('registration.restaurant.taxInfo.qstNumber')} *</label>
                        <input id="qstNumber" name="qstNumber" value={formData.qstNumber} onChange={handleChange}/>
                        {errors.qstNumber && <ErrorText>{t('registration.restaurant.errors.qstNumberRequired')}</ErrorText>}
                    </FormGroup>
                }
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionTitle>{t('registration.restaurant.documents.title')}</SectionTitle>
              <FormRow>
                <UploadGroup>
                  <label htmlFor="businessLicense">{t('registration.restaurant.documents.businessLicense')} *</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.businessLicense?.name || t('registration.restaurant.common.clickToUpload')}</span>
                    <input id="businessLicense" name="businessLicense" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.businessLicense && <ErrorText>{t('registration.restaurant.errors.businessLicenseRequired')}</ErrorText>}
                </UploadGroup>
                <UploadGroup>
                  <label htmlFor="voidCheque">{t('registration.restaurant.documents.voidCheque')} *</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.voidCheque?.name || t('registration.restaurant.common.clickToUpload')}</span>
                    <input id="voidCheque" name="voidCheque" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.voidCheque && <ErrorText>{t('registration.restaurant.errors.voidChequeRequired')}</ErrorText>}
                </UploadGroup>
              </FormRow>
              <FormRow>
                <UploadGroup>
                  <label htmlFor="hstDocument">{t('registration.restaurant.documents.hstDocument')} *</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.hstDocument?.name || t('registration.restaurant.common.clickToUpload')}</span>
                    <input id="hstDocument" name="hstDocument" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.hstDocument && <ErrorText>HST document is required</ErrorText>}
                </UploadGroup>
                <UploadGroup>
                  <label htmlFor="articleOfIncorporation">{t('registration.restaurant.documents.articleOfIncorporation')} *</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.articleOfIncorporation?.name || t('registration.restaurant.common.clickToUpload')}</span>
                    <input id="articleOfIncorporation" name="articleOfIncorporation" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.articleOfIncorporation && <ErrorText>Article of incorporation is required</ErrorText>}
                </UploadGroup>
              </FormRow>
              <FormRow>
                <UploadGroup>
                  <label htmlFor="foodHandlingCertificate">{t('registration.restaurant.documents.foodHandlingCertificate')} *</label>
                  <UploadWrapper>
                    <UploadCloud/>
                    <span>{formData.foodHandlingCertificate?.name || t('registration.restaurant.common.clickToUpload')}</span>
                    <input id="foodHandlingCertificate" name="foodHandlingCertificate" type="file" onChange={handleFileChange} accept="application/pdf,image/*"/>
                  </UploadWrapper>
                  {errors.foodHandlingCertificate && <ErrorText>Food handling certificate is required</ErrorText>}
                </UploadGroup>
                <UploadGroup>
                  <label htmlFor="articleOfIncorporationExpiryDate">{t('registration.restaurant.documents.articleOfIncorporationExpiryDate')} *</label>
                  <input 
                    id="articleOfIncorporationExpiryDate" 
                    name="articleOfIncorporationExpiryDate" 
                    type="date" 
                    value={formData.articleOfIncorporationExpiryDate} 
                    onChange={handleChange}
                  />
                  {errors.articleOfIncorporationExpiryDate && <ErrorText>Expiry date is required</ErrorText>}
                </UploadGroup>
              </FormRow>
              <FormRow>
                <UploadGroup>
                  <label htmlFor="foodHandlingCertificateExpiryDate">{t('registration.restaurant.documents.foodHandlingCertificateExpiryDate')} *</label>
                  <input 
                    id="foodHandlingCertificateExpiryDate" 
                    name="foodHandlingCertificateExpiryDate" 
                    type="date" 
                    value={formData.foodHandlingCertificateExpiryDate} 
                    onChange={handleChange}
                  />
                  {errors.foodHandlingCertificateExpiryDate && <ErrorText>Expiry date is required</ErrorText>}
                </UploadGroup>
                <div></div>
              </FormRow>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionTitle>{t('registration.restaurant.menu.title')}</SectionTitle>
              {formData.menuItems.map((item, index) => (
                <MenuItemCard key={index}>
                  <FormGroup>
                    <label htmlFor={`menuItem${index}Name`}>{t('registration.restaurant.menu.itemName')} *</label>
                    <input
                      id={`menuItem${index}Name`}
                      type="text"
                      value={item.name}
                      onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                      placeholder={t('registration.restaurant.placeholders.menuItemName')}
                    />
                    {errors[`menuItem${index}Name`] && <ErrorText>{t('registration.restaurant.errors.menuItemNameRequired')}</ErrorText>}
                  </FormGroup>
                  <FormRow>
                    <FormGroup>
                      <label htmlFor={`menuItem${index}Price`}>{t('registration.restaurant.menu.price')} ($) *</label>
                      <input
                        id={`menuItem${index}Price`}
                        type="text"
                        value={item.price}
                        onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                        placeholder={t('registration.restaurant.placeholders.menuItemPrice')}
                      />
                      {errors[`menuItem${index}Price`] && <ErrorText>{t('registration.restaurant.errors.menuItemPriceRequired')}</ErrorText>}
                    </FormGroup>
                    <FormGroup>
                      <label htmlFor={`menuItem${index}Image`}>{t('registration.restaurant.menu.itemImage')} *</label>
                      <UploadWrapper small>
                        <UploadCloud size={20} />
                        <span>{item.image?.name || t('registration.restaurant.common.uploadImage')}</span>
                        <input
                          type="file"
                          id={`menuItem${index}Image`}
                          accept="image/png, image/jpeg"
                          onChange={(e) => e.target.files && handleMenuItemChange(index, 'image', e.target.files[0])}
                        />
                      </UploadWrapper>
                      {errors[`menuItem${index}Image`] && <ErrorText>{t('registration.restaurant.errors.menuItemImageRequired')}</ErrorText>}
                    </FormGroup>
                  </FormRow>
                  <FormGroup>
                    <label htmlFor={`menuItem${index}Desc`}>{t('registration.restaurant.menu.description')}</label>
                    <textarea
                      id={`menuItem${index}Desc`}
                      value={item.description}
                      onChange={(e) => handleMenuItemChange(index, 'description', e.target.value)}
                      placeholder={t('registration.restaurant.placeholders.menuItemDescription')}
                    />
                  </FormGroup>
                </MenuItemCard>
              ))}

              <AddButton type="button" onClick={addMenuItem}>
                <Plus size={20} /> {t('registration.restaurant.menu.addItem')}
              </AddButton>

              <SubSectionTitle>{t('registration.restaurant.hours.title')}</SubSectionTitle>
              {formData.operatingHours.map((hour, index) => (
                <OperatingHoursRow key={index}>
                  <DayLabel>{t(`registration.restaurant.hours.days.${hour.day.toLowerCase()}`)}</DayLabel>
                  <FormGroup>
                    <input
                      type="time"
                      value={hour.openTime}
                      onChange={(e) => handleHoursChange(index, 'openTime', e.target.value)}
                      disabled={hour.isClosed}
                    />
                  </FormGroup>
                  <span>{t('registration.restaurant.hours.to')}</span>
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
                    <label htmlFor={`closed-${index}`}>{t('registration.restaurant.hours.closed')}</label>
                  </CheckboxWrapper>
                </OperatingHoursRow>
              ))}
            </motion.div>
          )}

          <ButtonContainer>
            {step > 1 ? (
              <ActionButton type="button" onClick={handleBack} secondary>
                {t('registration.restaurant.buttons.back')}
              </ActionButton>
            ) : ( <div></div>) }
            <ActionButton type="submit">
              {step === 4 ? t('registration.restaurant.buttons.proceedToPayment') : t('registration.restaurant.buttons.nextStep')}
            </ActionButton>
          </ButtonContainer>
        </form>
      </FormContainer>
    </>
  );
}