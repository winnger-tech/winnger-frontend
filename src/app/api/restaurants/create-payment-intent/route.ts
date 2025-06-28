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
      const profileResponse = await fetch(`${process.env.API_BASE_URL}/restaurants/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        return NextResponse.json(
          { success: false, message: 'Restaurant not found' },
          { status: 404 }
        );
      }

      const profile = await profileResponse.json();
      
      // Check if previous steps are completed
      if (!profile.data?.restaurant?.currentStep || profile.data.restaurant.currentStep < 4) {
        return NextResponse.json(
          { success: false, message: 'Please complete all previous steps before payment' },
          { status: 400 }
        );
      }

      // Check if payment has already been completed
      if (profile.data?.restaurant?.paymentStatus === 'completed') {
        return NextResponse.json(
          { success: false, message: 'Payment has already been completed' },
          { status: 400 }
        );
      }

    } catch (error) {
      console.error('Profile verification failed:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to verify restaurant profile' },
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