
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function RestaurantRegistrationInner() {
  const [formData, setFormData] = useState<any>({});
  const [clientSecret, setClientSecret] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleCreateIntent = async () => {
    const res = await axios.post('/api/restaurants/create-payment-intent', {
      email: formData.email,
    });
    setClientSecret(res.data.clientSecret);
    return res.data.paymentIntentId;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const paymentIntentId = await handleCreateIntent();
    const { error, paymentIntent } = await stripe!.confirmPayment({
      elements: elements!,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (error) return alert(error.message);
    if (paymentIntent?.status !== 'succeeded') return alert('Payment incomplete');

    const payload = new FormData();
    payload.append('ownerName', formData.ownerName);
    payload.append('email', formData.email);
    payload.append('password', formData.password);
    payload.append('phone', formData.phone);
    payload.append('identificationType', formData.identificationType);
    payload.append('restaurantName', formData.restaurantName);
    payload.append('businessAddress', formData.businessAddress);
    payload.append('city', formData.city);
    payload.append('province', formData.province);
    payload.append('postalCode', formData.postalCode);

    payload.append('bankingInfo', JSON.stringify({
      transitNumber: formData.transitNumber,
      institutionNumber: formData.institutionNumber,
      accountNumber: formData.accountNumber,
    }));

    payload.append('taxInfo', JSON.stringify({
      hstNumber: formData.hstNumber,
      pstNumber: formData.pstNumber,
      gstNumber: formData.gstNumber,
      qstNumber: formData.qstNumber,
    }));

    payload.append('menuDetails', JSON.stringify([
      {
        name: formData.menuItemName,
        price: parseFloat(formData.menuItemPrice),
        description: formData.menuItemDescription,
      },
    ]));

    payload.append('hoursOfOperation', JSON.stringify([
      {
        day: 'Monday',
        openTime: formData.mondayOpen,
        closeTime: formData.mondayClose,
        isClosed: false,
      },
      {
        day: 'Tuesday',
        isClosed: true,
      },
    ]));

    payload.append('stripePaymentIntentId', paymentIntentId);

    if (formData.businessDocument) payload.append('businessDocument', formData.businessDocument);
    if (formData.businessLicense) payload.append('businessLicense', formData.businessLicense);
    if (formData.voidCheque) payload.append('voidCheque', formData.voidCheque);

    try {
      await axios.post('/api/restaurants', payload);
      alert('Registration Successful');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: '2rem auto' }}>
      <h1>Restaurant Partner Registration</h1>

      <input name="email" onChange={handleChange} placeholder="Email" required /><br />
      <input name="ownerName" onChange={handleChange} placeholder="Owner Name" required /><br />
      <input name="password" type="password" onChange={handleChange} placeholder="Password" required /><br />
      <input name="phone" onChange={handleChange} placeholder="Phone" required /><br />
      <input name="identificationType" onChange={handleChange} placeholder="Identification Type" required /><br />
      <input name="restaurantName" onChange={handleChange} placeholder="Restaurant Name" required /><br />
      <input name="businessAddress" onChange={handleChange} placeholder="Business Address" required /><br />
      <input name="city" onChange={handleChange} placeholder="City" required /><br />
      <input name="province" onChange={handleChange} placeholder="Province" required /><br />
      <input name="postalCode" onChange={handleChange} placeholder="Postal Code" required /><br />

      <h3>Banking Info</h3>
      <input name="transitNumber" onChange={handleChange} placeholder="Transit Number" required /><br />
      <input name="institutionNumber" onChange={handleChange} placeholder="Institution Number" required /><br />
      <input name="accountNumber" onChange={handleChange} placeholder="Account Number" required /><br />

      <h3>Tax Info</h3>
      <input name="hstNumber" onChange={handleChange} placeholder="HST Number" /><br />
      <input name="gstNumber" onChange={handleChange} placeholder="GST Number" /><br />
      <input name="pstNumber" onChange={handleChange} placeholder="PST Number" /><br />
      <input name="qstNumber" onChange={handleChange} placeholder="QST Number" /><br />

      <h3>Documents</h3>
      <input name="businessDocument" type="file" onChange={handleChange} /><br />
      <input name="businessLicense" type="file" onChange={handleChange} /><br />
      <input name="voidCheque" type="file" onChange={handleChange} /><br />

      <h3>Menu Item</h3>
      <input name="menuItemName" onChange={handleChange} placeholder="Menu Item Name" /><br />
      <input name="menuItemPrice" onChange={handleChange} placeholder="Menu Item Price" /><br />
      <input name="menuItemDescription" onChange={handleChange} placeholder="Menu Item Description" /><br />

      <h3>Hours</h3>
      <input name="mondayOpen" onChange={handleChange} placeholder="Monday Open Time" /><br />
      <input name="mondayClose" onChange={handleChange} placeholder="Monday Close Time" /><br />

      <h2>Payment</h2>
      <PaymentElement options={{ layout: 'tabs' }} />

      <button type="submit" style={{ padding: 12, marginTop: 20 }}>Submit & Pay</button>
    </form>
  );
}

export default function RestaurantRegistration() {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret: '' }}>
      <RestaurantRegistrationInner />
    </Elements>
  );
}
