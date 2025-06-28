import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, amount, currency = 'usd' } = body;

    // Validate required fields
    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: type and amount' },
        { status: 400 }
      );
    }

    // Validate amount (must be positive integer in cents)
    if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: 'Amount must be a positive integer in cents' },
        { status: 400 }
      );
    }

    console.log('💰 Creating PaymentIntent:', {
      type,
      amount,
      currency
    });

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        type, // 'driver' or 'restaurant'
        registrationType: type,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ PaymentIntent created:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

  } catch (error) {
    console.error('❌ Error creating PaymentIntent:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 