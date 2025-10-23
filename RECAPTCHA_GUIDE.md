# reCAPTCHA Integration Guide

## Overview
The registration page now includes Google reCAPTCHA v2 to prevent bot registrations and spam.

## Setup Instructions

### 1. Get reCAPTCHA Keys
1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register your site
3. Select reCAPTCHA v2 (Checkbox)
4. Add your domains (localhost for development, your production domain)
5. Copy the **Site Key** and **Secret Key**

### 2. Configure Frontend
Update `/lisu-dict-frontend/.env`:
```env
REACT_APP_RECAPTCHA_SITE_KEY=your-actual-site-key-here
```

### 3. Configure Backend (Optional)
If you want to verify the reCAPTCHA token on the backend:

1. Add the secret key to `/lisu-dict-backend/.env`:
```env
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

2. Install the verification library:
```bash
cd lisu-dict-backend
npm install axios
```

3. Add verification in the register endpoint (`src/controllers/authController.js`):
```javascript
const axios = require('axios');

// In register function, before creating user:
if (req.body.recaptchaToken) {
  const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
  const response = await axios.post(verifyUrl, null, {
    params: {
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: req.body.recaptchaToken
    }
  });
  
  if (!response.data.success) {
    return res.status(400).json({
      success: false,
      error: { message: 'reCAPTCHA verification failed' }
    });
  }
}
```

## Testing
For development/testing, the following Google test keys are already configured:
- **Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` (always passes)
- **Secret Key**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` (for backend)

These keys will always pass verification and show the reCAPTCHA widget.

## Features Implemented

✅ **Frontend Validation**: Form cannot be submitted without completing reCAPTCHA
✅ **Auto-Expiry Handling**: Shows error message if reCAPTCHA expires (2 minutes)
✅ **Form Reset**: reCAPTCHA resets when user clears the form (Escape key)
✅ **Error Display**: Shows inline error message below reCAPTCHA if not completed
✅ **Responsive Design**: reCAPTCHA is centered and works on mobile devices

## User Experience

1. User fills out registration form
2. User checks "I'm not a robot" reCAPTCHA
3. If expired (after 2 minutes), user must re-verify
4. Form validates reCAPTCHA completion before submission
5. Error message appears if user tries to submit without verification

## Production Deployment

Before deploying to production:
1. Replace test keys with your actual reCAPTCHA keys
2. Add your production domain to reCAPTCHA admin console
3. (Optional) Implement backend verification for extra security
4. Test on staging environment first

## Troubleshooting

**reCAPTCHA not showing?**
- Check that `REACT_APP_RECAPTCHA_SITE_KEY` is set in `.env`
- Restart the development server after changing `.env` files
- Verify your domain is registered in reCAPTCHA admin

**"Invalid site key" error?**
- Make sure the site key matches your reCAPTCHA admin settings
- Check that the domain matches (localhost vs production domain)

**reCAPTCHA in wrong language?**
- reCAPTCHA auto-detects language from browser settings
- You can force a language by adding `hl` parameter to the script tag in `public/index.html`
