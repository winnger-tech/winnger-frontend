import axios from 'axios';

interface CertnConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
}

interface CertnApplicant {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: {
    streetAddress: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  documents: {
    driverLicense?: string;
    sinNumber?: string;
  };
}

interface CertnCheckRequest {
  type: 'criminal' | 'driving_abstract' | 'employment' | 'education';
  applicantId: string;
  callbackUrl?: string;
}

class CertnAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: CertnConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.certn.co/v1'
      : 'https://api.sandbox.certn.co/v1';
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Certn API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  // Create a new applicant
  async createApplicant(applicant: CertnApplicant) {
    return this.request<{ id: string }>('POST', '/applicants', {
      first_name: applicant.firstName,
      last_name: applicant.lastName,
      email: applicant.email,
      phone: applicant.phoneNumber,
      date_of_birth: applicant.dateOfBirth,
      address: {
        street_address: applicant.address.streetAddress,
        city: applicant.address.city,
        province: applicant.address.province,
        postal_code: applicant.address.postalCode,
        country: applicant.address.country,
      },
      documents: {
        driver_license: applicant.documents.driverLicense,
        sin: applicant.documents.sinNumber,
      },
    });
  }

  // Request a background check
  async requestBackgroundCheck(check: CertnCheckRequest) {
    return this.request<{ id: string; status: string }>('POST', '/checks', {
      type: check.type,
      applicant_id: check.applicantId,
      callback_url: check.callbackUrl,
    });
  }

  // Get background check status
  async getCheckStatus(checkId: string) {
    return this.request<{
      id: string;
      status: string;
      result: {
        passed: boolean;
        details: any;
      };
    }>('GET', `/checks/${checkId}`);
  }

  // Get driving abstract
  async getDrivingAbstract(checkId: string) {
    return this.request<{
      id: string;
      status: string;
      abstract: {
        licenseClass: string;
        expiryDate: string;
        violations: any[];
      };
    }>('GET', `/checks/${checkId}/driving-abstract`);
  }

  // Get criminal record check
  async getCriminalRecordCheck(checkId: string) {
    return this.request<{
      id: string;
      status: string;
      records: {
        hasRecords: boolean;
        details: any[];
      };
    }>('GET', `/checks/${checkId}/criminal-record`);
  }
}

// Create and export a singleton instance
export const certnApi = new CertnAPI({
  apiKey: process.env.NEXT_PUBLIC_CERTN_API_KEY || '',
  environment: (process.env.NEXT_PUBLIC_CERTN_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
});

// Export types
export type {
  CertnApplicant,
  CertnCheckRequest,
}; 