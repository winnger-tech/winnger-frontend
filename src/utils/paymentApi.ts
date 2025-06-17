import axios from 'axios';

export interface PaymentConfig {
  amount: number;
  currency: string;
  userType: 'driver' | 'restaurant';
  userId: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class PaymentAPI {
  private static instance: PaymentAPI;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = '/api/payments';
  }

  public static getInstance(): PaymentAPI {
    if (!PaymentAPI.instance) {
      PaymentAPI.instance = new PaymentAPI();
    }
    return PaymentAPI.instance;
  }

  async initiatePayment(config: PaymentConfig): Promise<{ clientSecret: string; paymentId: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/initiate`, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate payment');
    }
  }

  async verifyPayment(paymentId: string, userId: string, userType: 'driver' | 'restaurant'): Promise<PaymentResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/verify`, {
        paymentId,
        userId,
        userType
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }

  async getPaymentStatus(userId: string, userType: 'driver' | 'restaurant'): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/status/${userType}/${userId}`);
      return response.data.status;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment status');
    }
  }
}

export const paymentApi = PaymentAPI.getInstance(); 