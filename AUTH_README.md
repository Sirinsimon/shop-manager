# Authentication Setup

## Overview
The Smart Shop Manager has an owner-only authentication system. Only the shop owner can register and access the system.

## Getting Started

### First Time Setup (Owner Registration)
1. When you first access the app, you'll be redirected to the registration page
2. Fill in your details:
   - **Username**: Your unique username (min 3 characters)
   - **Email**: Your email address
   - **Password**: Secure password (min 6 characters)
3. Click "Register as Owner"
4. You'll be automatically logged in

### Subsequent Access
1. Enter your username and password
2. Click "Sign In"
3. Access your dashboard

## Important Notes

⚠️ **Single Owner Policy**
- Only ONE owner account can be registered
- Once registered, the signup page will be closed
- No additional users can register
- This ensures exclusive owner access to your shop data

## Features
- **Owner-Only Access**: Exclusive registration for shop owner
- **Secure Login**: Authentication for the registered owner
- **Session Management**: Persistent login state
- **User Display**: Shows owner username in header
- **Professional UI**: Modern, responsive design
- **Form Validation**: 
  - Username: minimum 3 characters
  - Email: valid email format required
  - Password: minimum 6 characters
  - Password confirmation matching
- **Auto-Redirect**: Automatically redirects to signup if no owner exists

## User Data Storage
- Owner account stored in `users-data.json` (automatically created)
- File is excluded from git via `.gitignore`
- Owner has: ID, username, email, password, role ('owner'), creation date

## Security Notes

### For Production Use:
1. **Change Default Credentials**: Update the credentials in `app/api/auth/login/route.ts`
2. **Use Environment Variables**: Store credentials in `.env.local` file
3. **Hash Passwords**: Implement proper password hashing (bcrypt, argon2)
4. **Use JWT or Sessions**: Replace localStorage with secure session management
5. **Add HTTPS**: Ensure all authentication happens over HTTPS
6. **Rate Limiting**: Add rate limiting to prevent brute force attacks

### Recommended Improvements:
- Implement JWT tokens for stateless authentication
- Add refresh token mechanism
- Use HTTP-only cookies instead of localStorage
- Add multi-factor authentication (MFA)
- Implement password reset functionality
- Add user roles and permissions
- Log authentication attempts

## File Structure
```
app/
├── login/
│   └── page.tsx              # Login page component
├── signup/
│   └── page.tsx              # Signup/registration page
├── api/
│   └── auth/
│       ├── login/
│       │   └── route.ts      # Login API endpoint
│       ├── signup/
│       │   └── route.ts      # User registration API
│       └── logout/
│           └── route.ts      # Logout API endpoint
components/
└── auth-guard.tsx            # Protected route wrapper
users-data.json               # User accounts storage (auto-created)
```

## Usage

### Creating a New Account
1. Navigate to the app URL
2. Click "Sign up" on the login page
3. Enter your username (min 3 characters)
4. Enter a valid email address
5. Create a password (min 6 characters)
6. Confirm your password
7. Click "Create Account"
8. You'll be automatically logged in

### Logging In
1. Navigate to the app URL
2. Enter your username and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

### Logging Out
Click the "Logout" button in the header to sign out and return to the login page.

## Customization

### Changing Credentials
Edit `app/api/auth/login/route.ts`:
```typescript
const VALID_CREDENTIALS = {
  username: 'your_username',
  password: 'your_password',
}
```

### Styling
The login page uses the same theme system as the rest of the app and will automatically adapt to light/dark mode.
