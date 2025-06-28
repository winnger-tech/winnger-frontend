# Driver Registration Status API Implementation

This implementation provides functionality to check driver registration status and automatically populate email and password fields in the registration form.

## Features

1. **API Endpoint**: `/api/drivers/registration-status/[id]` - Checks registration status for a specific driver
2. **Automatic Field Population**: Email and password fields are automatically populated when registration status is checked
3. **React Hook**: `useDriverRegistrationStatus` - Custom hook for checking registration status
4. **Test Page**: `/test-registration-status` - Page to test the functionality

## API Endpoint

### GET `/api/drivers/registration-status/[id]`

Checks the registration status for a driver with the specified ID.

**URL Parameters:**
- `id` (string): The driver ID to check

**Response:**
```json
{
  "success": true,
  "data": {
    "isComplete": false,
    "email": "driver@example.com",
    "password": "password123",
    "currentStage": 1,
    "message": "Registration in progress"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Driver not found"
}
```

## Usage

### 1. Direct API Call

```javascript
const checkStatus = async (driverId) => {
  try {
    const response = await fetch(`/api/drivers/registration-status/${driverId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Registration status:', data.data);
      // Use data.data.email and data.data.password to populate fields
    }
  } catch (error) {
    console.error('Error checking status:', error);
  }
};
```

### 2. Using React Hook

```javascript
import { useDriverRegistrationStatus } from '@/hooks/useApi';

function MyComponent() {
  const { data, isLoading, error } = useDriverRegistrationStatus('driver-id-here');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <p>Email: {data?.email}</p>
      <p>Password: {data?.password}</p>
      <p>Complete: {data?.isComplete ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### 3. Registration Form with Prefilled Data

The registration form automatically populates email and password fields when accessed with a driver ID:

```
/driver-registration?driverId=e36c2dfd-8e21-4fcf-89e2-7d5334167715
```

## Components

### DriverRegistrationWithStatus

A wrapper component that:
- Checks registration status for a driver
- Populates email and password fields automatically
- Shows loading and error states
- Passes prefilled data to the registration form

### DriverRegistration

Updated to accept `prefilledData` prop:
```typescript
interface DriverRegistrationProps {
  onSubmit: (data: DriverData) => void;
  prefilledData?: { email: string; password: string } | null;
}
```

## Test Page

Visit `/test-registration-status` to:
- Test the API endpoint directly
- See the response data
- Navigate to registration form with prefilled data
- Test with different driver IDs

## Example Driver ID

Use this driver ID for testing:
```
e36c2dfd-8e21-4fcf-89e2-7d5334167715
```

## Backend Integration

The API route forwards requests to your backend at:
```
${process.env.NEXT_PUBLIC_API_URL}/drivers/registration-status/${driverId}
```

Make sure your backend endpoint returns the expected format:
```json
{
  "success": true,
  "data": {
    "isComplete": boolean,
    "email": "string",
    "password": "string",
    "currentStage": number,
    "message": "string"
  }
}
```

## Environment Variables

Ensure you have the following environment variable set:
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Error Handling

The implementation includes comprehensive error handling:
- Network errors
- Invalid driver IDs
- Backend errors
- Loading states
- Retry functionality

## Security Considerations

- The API endpoint validates the driver ID parameter
- Error messages don't expose sensitive information
- Authentication can be added to the API route if needed
- Consider encrypting sensitive data in responses

## Future Enhancements

1. Add authentication to the API endpoint
2. Implement caching for registration status
3. Add real-time status updates
4. Include more registration details in the response
5. Add validation for email/password format 