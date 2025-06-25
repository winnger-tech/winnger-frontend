# Authentication Implementation with Redux Toolkit

This implementation provides a complete authentication system for the Winnger restaurant application using Redux Toolkit for state management.

## Features

### ✅ Redux Toolkit Integration
- **Centralized State Management**: All authentication state is managed in Redux store
- **Async Thunks**: Proper handling of API calls with loading states
- **Persistent Authentication**: User data persists across browser sessions

### ✅ Restaurant Authentication
- **Login**: `/restaurantlogin` - Restaurant owner login
- **Signup**: `/resturantsignup` - Restaurant owner registration
- **Dashboard**: `/restaurant-dashboard` - Protected dashboard for authenticated users

### ✅ State Management
- **User Data**: Stores user information (name, email, registration status)
- **Token Management**: JWT token storage and automatic inclusion in requests
- **Loading States**: Shows loading spinners during API calls
- **Error Handling**: Displays error messages for failed operations

### ✅ UI Components
- **Protected Routes**: AuthGuard component for route protection
- **Dynamic Navbar**: Shows different options for authenticated vs non-authenticated users
- **Success Messages**: Toast notifications for successful operations
- **Form Validation**: Client-side validation with error messages

## API Integration

The authentication system integrates with the backend API:

### Restaurant Login
```
POST http://localhost:5000/api/restaurants-staged/login
{
  "ownerName": "John Doe",
  "email": "john@restaurant.com",
  "password": "yourpassword123"
}
```

### Restaurant Registration
```
POST http://localhost:5000/api/restaurants-staged/register
{
  "ownerName": "John Doe",
  "email": "john@restaurant.com",
  "password": "yourpassword123"
}
```

## Redux Store Structure

```typescript
interface AuthState {
  user: User | null;           // User information
  token: string | null;        // JWT token
  isLoading: boolean;          // Loading state
  error: string | null;        // Error messages
  isAuthenticated: boolean;    // Authentication status
}
```

## File Structure

```
src/
├── store/
│   ├── index.ts                 # Redux store configuration
│   ├── hooks.ts                 # Typed Redux hooks
│   └── slices/
│       └── authSlice.ts         # Authentication slice
├── providers/
│   └── ReduxProvider.tsx        # Redux provider wrapper
├── components/
│   ├── AuthGuard.tsx            # Route protection component
│   └── Toast.tsx                # Success/error notifications
└── app/
    ├── restaurantlogin/
    │   └── page.tsx             # Login page
    ├── resturantsignup/
    │   └── page.tsx             # Signup page
    └── restaurant-dashboard/
        └── page.tsx             # Protected dashboard
```

## Usage

### 1. Login Flow
1. User enters credentials on `/restaurantlogin`
2. Redux action `loginRestaurant` is dispatched
3. API call is made to backend
4. On success, user data and token are stored
5. User is redirected to dashboard or registration completion

### 2. Signup Flow
1. User enters details on `/resturantsignup`
2. Redux action `registerRestaurant` is dispatched
3. API call is made to backend
4. On success, user data and token are stored
5. User is redirected to complete registration

### 3. Protected Routes
Use the `AuthGuard` component to protect routes:
```tsx
<AuthGuard>
  <YourProtectedContent />
</AuthGuard>
```

### 4. Accessing Auth State
Use the typed hooks to access auth state:
```tsx
const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);
const dispatch = useAppDispatch();
```

## Key Features

1. **Automatic Token Management**: JWT tokens are automatically stored and included in API requests
2. **Persistent Sessions**: User stays logged in across browser sessions
3. **Loading States**: Proper loading indicators during API calls
4. **Error Handling**: Comprehensive error handling with user-friendly messages
5. **Route Protection**: Automatic redirection for protected routes
6. **Dynamic UI**: Navbar changes based on authentication status
7. **Success Feedback**: Toast notifications for successful operations

## Next Steps

1. Add driver authentication (similar to restaurant auth)
2. Implement password reset functionality
3. Add refresh token handling
4. Implement role-based access control
5. Add profile management features
