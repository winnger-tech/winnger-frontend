import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the user has completed previous steps
    try {
      console.log('🔍 Verifying restaurant profile...');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log('🌐 API Base URL:', apiBaseUrl);
      console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');
      
      const profileUrl = `${apiBaseUrl}/restaurants/profile`;
      console.log('📡 Fetching from:', profileUrl);
      
      const profileResponse = await fetch(profileUrl, {
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Profile response status:', profileResponse.status);
      console.log('📊 Profile response headers:', Object.fromEntries(profileResponse.headers.entries()));

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('❌ Profile API error response:', errorText);
        return NextResponse.json(
          { success: false, message: `Restaurant not found (${profileResponse.status}): ${errorText}` },
          { status: 404 }
        );
      }

      const profile = await profileResponse.json();
      console.log('✅ Profile data received:', JSON.stringify(profile, null, 2));
      
      // Check if previous steps are completed
      if (!profile.data?.restaurant?.currentStep || profile.data.restaurant.currentStep < 4) {
        console.log('⚠️ Steps not completed. Current step:', profile.data?.restaurant?.currentStep);
        return NextResponse.json(
          { success: false, message: 'Please complete all previous steps before payment' },
          { status: 400 }
        );
      }

      // Check if payment has already been completed
      if (profile.data?.restaurant?.paymentStatus === 'completed') {
        console.log('⚠️ Payment already completed');
        return NextResponse.json(
          { success: false, message: 'Payment has already been completed' },
          { status: 400 }
        );
      }

      console.log('✅ Profile verification successful');

    } catch (error) {
      console.error('💥 Profile verification failed:', error);
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return NextResponse.json(
        { success: false, message: `Failed to verify restaurant profile: ${error.message}` },
        { status: 500 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4500, // $45.00 in cents
      currency: 'usd',
      metadata: {
        type: 'restaurant_registration',
        restaurant_id: 'temp_id' // You might want to get this from the profile
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 