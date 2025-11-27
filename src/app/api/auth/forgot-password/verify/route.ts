import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { userId, otp } = await request.json();
    
    if (!userId || !otp) {
      return NextResponse.json(
        { error: 'User ID and verification code are required' },
        { status: 400 }
      );
    }
    
    // Check OTP from in-memory store
    const storeKey = `reset_${userId}`;
    const storedData = otpStore.get(storeKey);
    
    if (!storedData || storedData.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }
    
    // Check if code is expired
    if (storedData.expiry < Date.now()) {
      // Remove expired OTP
      otpStore.delete(storeKey);
      
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }
    
    // Return success without changing anything
    return NextResponse.json({
      success: true,
      data: {
        verified: true
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying your code' },
      { status: 500 }
    );
  }
} 