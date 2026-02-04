# Smart Shop Manager - User Guide

## 🎯 Quick Start

### First Time Users

#### Option 1: Create Your Own Account
1. Open the application in your browser
2. You'll see the login page
3. Click **"Sign up"** at the bottom
4. Fill in the registration form:
   - **Username**: Choose a unique username (minimum 3 characters)
   - **Email**: Enter your email address
   - **Password**: Create a secure password (minimum 6 characters)
   - **Confirm Password**: Re-enter your password
5. Click **"Create Account"**
6. You'll be automatically logged in and redirected to the dashboard

#### Option 2: Use Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`

This account is always available and doesn't require registration.

---

## 🔐 Authentication Features

### Sign Up Page
- **Username Validation**: Must be at least 3 characters and unique
- **Email Validation**: Must be a valid email format and not already registered
- **Password Requirements**: Minimum 6 characters
- **Password Confirmation**: Must match the password field
- **Show/Hide Password**: Click the eye icon to toggle password visibility
- **Back to Login**: Link to return to the login page

### Login Page
- **Username/Password**: Enter your registered credentials
- **Remember Session**: Your login persists across browser sessions
- **Show/Hide Password**: Toggle password visibility
- **Sign Up Link**: Quick access to create a new account
- **Admin Access**: Default admin credentials always work

### Dashboard Header
- **Username Display**: Your username appears in the header (desktop view)
- **Theme Toggle**: Switch between light and dark mode
- **Generate Report**: Create PDF reports of your shop data
- **Logout Button**: Sign out and return to login page

---

## 📱 User Interface

### Login/Signup Pages
- **Responsive Design**: Works on all devices (mobile, tablet, desktop)
- **Professional Look**: Modern gradient background with card-based forms
- **Clear Feedback**: Error messages display when validation fails
- **Loading States**: Visual feedback during authentication
- **Accessibility**: Keyboard navigation and screen reader support

### Dashboard
Once logged in, you have access to:
- **Dashboard Tab**: Overview of your shop performance
- **Products Tab**: Manage your inventory
- **Sales Tab**: Record and track sales
- **Analytics Tab**: View detailed reports and charts

---

## 🔒 Security Notes

### Current Implementation
- User data stored in `users-data.json`
- Session managed via localStorage
- Default admin account always available
- Passwords stored in plain text (development mode)

### For Production Use
⚠️ **Important**: This is a development setup. For production:
1. Implement password hashing (bcrypt, argon2)
2. Use secure session management (JWT, HTTP-only cookies)
3. Enable HTTPS
4. Add rate limiting for login attempts
5. Implement password reset functionality
6. Add email verification
7. Use environment variables for sensitive data

---

## 🆘 Troubleshooting

### Can't Login
- **Check Credentials**: Ensure username and password are correct
- **Try Admin Account**: Use `admin/admin123` to verify the system works
- **Clear Browser Data**: Clear localStorage and try again
- **Check Console**: Open browser developer tools for error messages

### Can't Sign Up
- **Username Taken**: Try a different username
- **Email Already Registered**: Use a different email or login instead
- **Password Too Short**: Use at least 6 characters
- **Passwords Don't Match**: Ensure both password fields are identical

### Logged Out Unexpectedly
- **Browser Data Cleared**: You'll need to login again
- **Session Expired**: Simply login again with your credentials

---

## 💡 Tips

1. **Remember Your Credentials**: Write them down securely
2. **Use Strong Passwords**: Even in development, practice good habits
3. **Test with Admin**: Use the admin account to test features
4. **Multiple Users**: You can create multiple accounts for testing
5. **Logout When Done**: Always logout when finished, especially on shared computers

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all files are properly saved
3. Restart the development server
4. Check that `users-data.json` has proper permissions

---

## 🎨 Customization

### Change Default Admin Credentials
Edit `app/api/auth/login/route.ts`:
```typescript
const DEFAULT_ADMIN = {
  username: 'your_username',
  password: 'your_password',
}
```

### Modify Validation Rules
Edit `app/signup/page.tsx` to change:
- Minimum username length
- Password requirements
- Email validation pattern

### Styling
Both login and signup pages use your app's theme system and will automatically match your color scheme.
