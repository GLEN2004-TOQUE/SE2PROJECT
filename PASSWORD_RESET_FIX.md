# Password Reset Feature - Fix & Setup Guide

## Issue
When clicking "Forgot password?" and trying to send a reset code, users see error:
> "That service or endpoint is not available. It may be missing or the address may be wrong."

## Root Causes
1. **Backend not running** - Most common cause
2. **Missing environment variables** - BREVO_API_KEY not set
3. **Wrong API URL** - Frontend pointing to wrong backend
4. **Outdated deployment** - Render version doesn't have latest code

## Quick Fix

### 1. Update Environment Variables (REQUIRED)

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_email@gmail.com
DATABASE_URL=postgresql://user:password@localhost:5432/quizdb
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
# For LOCAL development:
REACT_APP_API_URL=http://localhost:5000

# For PRODUCTION (Render):
# REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### 2. Start Backend Server

```bash
cd backend
npm install
node app.js
```

You should see:
```
Server running on port 5000
🤖 AI Model Status: {initialized}
📧 Email configured: your_email@gmail.com
```

### 3. Verify Routes are Working

```bash
# In another terminal, test the endpoint:
curl -X POST http://localhost:5000/otp/forgot-password/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected response:
- If email exists: `{ "message": "A verification code was sent to test@example.com..." }`
- If email not found: `{ "message": "No account found with this email address." }` (404)

### 4. Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend will now connect to `http://localhost:5000`

## Testing Password Reset Flow

1. **Register a test account**: Click "Create one now" and complete registration
2. **Go to Login page**: Click "Forgot password?"
3. **Enter test email**: The email you registered with
4. **Click "Send code"**: Should receive OTP email (check spam folder)
5. **Enter OTP**: From the email
6. **Set new password**: Create a new password
7. **Login**: Use new password to login

## Deployment to Render

If deploying to Render:

1. **Rebuild the dyno** - Forces fresh deployment with latest code
2. **Set Environment Variables** in Render dashboard:
   - JWT_SECRET
   - BREVO_API_KEY
   - DATABASE_URL
   - FRONTEND_URL
3. **Update Frontend .env** or set `REACT_APP_API_URL` to your Render backend URL

## Troubleshooting

| Error | Solution |
|-------|----------|
| "endpoint not available" (404) | Backend not running. Run `node app.js` in backend folder |
| "Email service not configured" (500) | Set `BREVO_API_KEY` in `.env` |
| "Could not verify account" | Database connection issue or database is empty |
| No email received | Check spam folder or verify BREVO_API_KEY is valid |
| "Reset token expired" | Wait too long between steps. Start over. |

## Required Environment Variables

### Backend (backend/.env)
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT tokens (required for password reset)
- `BREVO_API_KEY` - Email service API key (required to send reset codes)
- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - URL where frontend is hosted
- `GEMINI_API_KEY` - For AI features (optional)

### Frontend (frontend/.env)
- `REACT_APP_API_URL` - Backend API URL
  - Local: `http://localhost:5000`
  - Production: `https://your-backend.onrender.com`

## Password Reset Flow

```
User clicks "Forgot password?"
    ↓
Enters email → POST /otp/forgot-password/send
    ↓
Backend sends OTP email
    ↓
User enters OTP → POST /otp/forgot-password/verify  
    ↓
Backend validates OTP, generates reset token
    ↓
User enters new password → POST /otp/forgot-password/complete
    ↓
Password updated, user can login with new password
```

## All Routes Verified ✓

The following routes are properly configured and working:
- POST `/otp/forgot-password/send` - Send reset OTP
- POST `/otp/forgot-password/verify` - Verify OTP & get reset token
- POST `/otp/forgot-password/complete` - Save new password
- Also mounted on `/api/otp/` paths for compatibility

## Still Having Issues?

1. Check backend logs for errors - look for "❌" messages
2. Verify BREVO_API_KEY is set and valid
3. Check database connection: `node -e "require('./config/db').query('SELECT 1')"`
4. Check if user email exists in database
5. Verify frontend .env has correct `REACT_APP_API_URL`
