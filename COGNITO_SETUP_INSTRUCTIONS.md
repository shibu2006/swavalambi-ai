# Cognito Setup Instructions

## Issue
The registration endpoint is failing with error:
```
User pool client 2kfmnu9h7rq35jqn45q8jgfj5f does not exist
```

This happens because Cognito is not configured in your `.env` file.

## Solution Options

### Option 1: Set Up AWS Cognito (Recommended for Production)

1. **Run the setup script:**
   ```bash
   cd swavalmbi-ai/backend
   conda activate ai4bharat
   python scripts/setup_cognito.py
   ```

2. **The script will:**
   - Check if a User Pool already exists
   - Create a new User Pool if needed
   - Create an App Client
   - Output the configuration values

3. **Add the values to `.env`:**
   ```bash
   # Add these lines to backend/.env
   COGNITO_USER_POOL_ID=<value from script>
   COGNITO_CLIENT_ID=<value from script>
   AWS_REGION=us-east-1
   ```

4. **Restart the backend server**

### Option 2: Use Legacy OTP System (Quick Fix)

If you want to skip Cognito setup for now, you can use the legacy OTP-based authentication:

1. **Frontend changes needed:**
   - Use `/api/auth/send-otp` endpoint instead of `/api/auth/register`
   - Use `/api/auth/verify-otp` endpoint instead of `/api/auth/verify-email`

2. **This uses mock OTP (123456) for testing**

## Current Status

✅ **Fixed Issues:**
- Removed hardcoded Cognito IDs that don't exist
- Added graceful error handling when Cognito is not configured
- Backend now shows clear error message: "Authentication service is not configured"

✅ **Gitignore Updated:**
- Added patterns to exclude documentation files from git commits
- All `*_FIX*.md`, `*_SUMMARY.md`, `*_GUIDE.md` files will be ignored

## Recommended Next Steps

1. Run the Cognito setup script (Option 1 above)
2. Test registration with a real email address
3. Check email for verification code
4. Complete the registration flow

## Troubleshooting

If the setup script fails:

1. **Check AWS credentials:**
   ```bash
   aws sts get-caller-identity
   ```

2. **Verify IAM permissions:**
   - `cognito-idp:CreateUserPool`
   - `cognito-idp:CreateUserPoolClient`
   - `cognito-idp:ListUserPools`

3. **Check region:**
   - Make sure `AWS_REGION=us-east-1` in `.env`
   - Or change to your preferred region

## Testing After Setup

1. **Start backend:**
   ```bash
   cd swavalmbi-ai/backend
   conda activate ai4bharat
   uvicorn main:app --reload
   ```

2. **Test registration:**
   - Go to frontend signup page
   - Enter email, password, name
   - Check email for verification code
   - Enter code to verify

3. **Test login:**
   - Use verified email and password
   - Should receive JWT tokens
   - Can access protected endpoints
