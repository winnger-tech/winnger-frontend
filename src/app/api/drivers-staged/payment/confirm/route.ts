import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentIntentId } = body;

    // Validate required fields
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required field: paymentIntentId' },
        { status: 400 }
      );
    }

    console.log('✅ Confirming payment:', { paymentIntentId });

    // Retrieve the PaymentIntent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (paymentIntent.status === 'succeeded') {
      console.log('✅ Payment confirmed successfully:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        type: paymentIntent.metadata.type
      });

      // Here you would typically:
      // 1. Update the user's registration status in your database
      // 2. Send confirmation emails
      // 3. Create any necessary records
      // 4. Trigger any post-payment workflows

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and registration completed.',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      });

    } else if (paymentIntent.status === 'requires_payment_method') {
      return NextResponse.json(
        { error: 'Payment requires a payment method' },
        { status: 400 }
      );
    } else if (paymentIntent.status === 'requires_confirmation') {
      return NextResponse.json(
        { error: 'Payment requires confirmation' },
        { status: 400 }
      );
    } else if (paymentIntent.status === 'canceled') {
      return NextResponse.json(
        { error: 'Payment was canceled' },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: `Payment status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
} 