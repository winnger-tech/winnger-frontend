import { NextApiRequest, NextApiResponse } from 'next';

// Verify Certn webhook signature
const verifyWebhookSignature = (signature: string, body: string, secret: string): boolean => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');
  return signature === digest;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-certn-signature'];
    const webhookSecret = process.env.CERTN_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      signature as string,
      JSON.stringify(req.body),
      webhookSecret
    );

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { type, data } = req.body;

    // Handle different webhook events
    switch (type) {
      case 'check.completed':
        // Update the background check status in your database
        // TODO: Implement database update
        console.log('Background check completed:', data);
        break;

      case 'check.failed':
        // Handle failed background check
        // TODO: Implement failure handling
        console.log('Background check failed:', data);
        break;

      case 'document.uploaded':
        // Handle document upload confirmation
        // TODO: Implement document handling
        console.log('Document uploaded:', data);
        break;

      default:
        console.log('Unhandled webhook type:', type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 