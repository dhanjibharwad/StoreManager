# Custom Authentication System Setup

This document provides instructions for setting up the custom authentication system using Supabase.

## Prerequisites

1. Supabase project
2. Gmail account for sending emails
3. Twilio account for sending SMS

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Email (Gmail)
EMAIL_USER=your-gmail-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

## Database Setup

1. In your Supabase project, go to the SQL Editor
2. Run the SQL script from `src/lib/supabase-schema.sql` to create the necessary tables

## Email Setup (Gmail)

1. Go to your Google Account settings
2. Navigate to Security > App passwords
3. Create a new app password for your application
4. Use this password in the `EMAIL_APP_PASSWORD` environment variable

## Twilio Setup

1. Sign up for a Twilio account at [https://www.twilio.com/](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the Twilio dashboard
3. Get a Twilio phone number for sending SMS
4. Add these credentials to your environment variables

## Install Required Packages

```bash
npm install nodemailer twilio @supabase/supabase-js
```

## Usage

The authentication system provides:

1. **User Registration**: Collects name, email, phone, and password
2. **Two-step Verification**: Verifies both email and phone using OTP
3. **Login**: Authenticates users using email and password
4. **Session Management**: Maintains user sessions securely

## Security Considerations

1. **Password Storage**: Passwords are hashed using SHA-256
2. **OTP Expiry**: Verification codes expire after 30 minutes
3. **Session Management**: Sessions expire after 30 days by default

## Customization

You can modify the following aspects of the authentication system:

1. **OTP Length**: Change the `generateOTP` function in `auth.ts`
2. **Session Duration**: Modify the expiry period in `createSession` function
3. **Email Templates**: Customize the email content in `notifications.ts`
4. **Password Hashing**: Replace the hashing algorithm in `hashPassword` function if needed

## Troubleshooting

1. **Email Not Sending**: Check if "Less secure app access" is enabled in your Google account
2. **SMS Not Sending**: Verify your Twilio account is active and has sufficient credits
3. **Database Errors**: Check if your Supabase tables were created correctly 