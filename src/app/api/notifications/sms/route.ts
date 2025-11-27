/* eslint-disable */

import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Configure Twilio client
const createTwilioClient = () => {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

// Phone number validation regex for international numbers
const isValidPhoneNumber = (phone: string): boolean => {
  // Validates E.164 format: +[country code][subscriber number]
  // Example: +919898312345
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export async function POST(request: Request) {
  try {
    const { phone, type, otp, name } = await request.json();
    
    // Validate phone number first
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use German format' },
        { status: 400 }
      );
    }
    
    if (!type) {
      return NextResponse.json(
        { error: 'SMS type is required' },
        { status: 400 }
      );
    }
    
    if (type === 'verification' && !otp) {
      return NextResponse.json(
        { error: 'OTP is required for verification SMS' },
        { status: 400 }
      );
    }
    
    if (type === 'welcome' && !name) {
      return NextResponse.json(
        { error: 'Name is required for welcome SMS' },
        { status: 400 }
      );
    }
    
    // Create Twilio client
    const twilioClient = createTwilioClient();
    
    let messageBody;
    
    // Create message based on type
    if (type === 'verification') {
      messageBody = `UNION ENTERPRIZE: Your verification code is ${otp}. This code expires in 30 minutes. Welcome to your comprehensive marketplace!`;
    } else if (type === 'welcome') {
      messageBody = `Welcome to UNION ENTERPRIZE, ${name}! 🎉 Your dream is just a search away. Explore rentals, buy & sell products, book events, and more. Start your journey now!`;
    } else {
      return NextResponse.json(
        { error: 'Invalid SMS type' },
        { status: 400 }
      );
    }
    
    // Send SMS
    try {
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } catch (twilioError: any) {
      console.error('Twilio SMS Error:', twilioError);
      return NextResponse.json(
        { 
          error: 'Failed to send SMS', 
          details: twilioError.message || 'Unknown Twilio error' 
        },
        { status: twilioError.status || 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error sending SMS:', error);
    return NextResponse.json(
      { error: 'Unexpected error occurred while sending SMS' },
      { status: 500 }
    );
  }
} 