// Helper function to extract error message from API response
export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.data?.message) return error.data.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.status === 401) return 'Authentication required. Please log in again.';
  if (error?.response?.status === 403) return 'Access denied. You do not have permission to perform this action.';
  if (error?.response?.status === 404) return 'Resource not found.';
  if (error?.response?.status === 422) return 'Invalid data provided. Please check your input.';
  if (error?.response?.status === 500) return 'Server error. Please try again later.';
  if (error?.response?.status >= 500) return 'Server error. Please try again later.';
  if (error?.response?.status >= 400) return 'Request failed. Please check your input and try again.';
  if (error?.code === 'NETWORK_ERROR') return 'Network error. Please check your connection and try again.';
  if (error?.code === 'TIMEOUT') return 'Request timeout. Please try again.';
  return 'An unexpected error occurred. Please try again.';
};

// Helper function to determine if error should be shown as toast
export const shouldShowErrorToast = (error: any): boolean => {
  // Don't show toast for validation errors that are handled by form validation
  if (error?.response?.status === 422) return false;
  // Don't show toast for authentication errors that redirect to login
  if (error?.response?.status === 401) return false;
  return true;
};

// Helper function to get appropriate toast duration based on error type
export const getErrorToastDuration = (error: any): number => {
  if (error?.response?.status === 500) return 8000; // Longer for server errors
  if (error?.code === 'NETWORK_ERROR') return 6000; // Longer for network errors
  return 5000; // Default duration
};

// Helper function to format error message for display
export const formatErrorMessage = (error: any): string => {
  const message = extractErrorMessage(error);
  
  // Capitalize first letter
  return message.charAt(0).toUpperCase() + message.slice(1);
};

// Helper function to handle API errors with toast notifications
export const handleApiError = (
  error: any, 
  showErrorToast: (message: string, duration?: number) => void,
  fallbackMessage?: string
): string => {
  const errorMessage = extractErrorMessage(error);
  const shouldShow = shouldShowErrorToast(error);
  const duration = getErrorToastDuration(error);
  
  if (shouldShow) {
    showErrorToast(errorMessage, duration);
  }
  
  return errorMessage || fallbackMessage || 'An error occurred';
};

// Helper function to handle API success with toast notifications
export const handleApiSuccess = (
  message: string,
  showSuccessToast: (message: string, duration?: number) => void,
  duration: number = 3000
): void => {
  showSuccessToast(message, duration);
}; 