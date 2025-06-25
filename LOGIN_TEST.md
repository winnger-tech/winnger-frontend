# Testing Restaurant Login Without Owner Name

## Test Case: Restaurant Login

### Before Changes:
- Required fields: Owner Name, Email, Password
- API call included all three fields

### After Changes:
- Required fields: Email, Password only
- API call automatically uses email as ownerName for backend compatibility

### Test Steps:

1. **Navigate to Login Page**
   - Go to `http://localhost:3001/restaurantlogin`
   - Verify only 2 input fields are visible: Email and Password

2. **Test Form Validation**
   - Leave email empty and submit → Should show "Email is required"
   - Leave password empty and submit → Should show "Password is required"
   - Enter invalid email format → Should show "Please enter a valid email"

3. **Test Successful Login**
   - Email: `john@restaurant.com`
   - Password: `yourpassword123`
   - Should show success toast and redirect to dashboard/registration

4. **Verify API Call**
   - Check network tab in browser dev tools
   - Confirm POST request to `/api/restaurants-staged/login`
   - Verify request body contains:
     ```json
     {
       "ownerName": "john@restaurant.com",
       "email": "john@restaurant.com", 
       "password": "yourpassword123"
     }
     ```

5. **Test Authentication State**
   - After successful login, navbar should show user menu instead of login/signup buttons
   - User should stay logged in after page refresh
   - Dashboard should be accessible without login prompt

### Expected Behavior:
✅ Simpler login form with only essential fields
✅ Backend compatibility maintained by using email as ownerName
✅ Same authentication flow and state management
✅ Proper form validation and error handling
