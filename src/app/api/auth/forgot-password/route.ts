import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOTP } from '@/lib/serverUtils';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    // Get user with matching email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 400 }
      );
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in memory instead of database
    const storeKey = `reset_${user.id}`;
    otpStore.set(storeKey, {
      otp,
      userId: user.id,
      expiry: Date.now() + 30 * 60 * 1000, // 30 minutes
      role: 'user'
    });
    
    // Return success with user info
    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        contactInfo: user.email,
        otp // Only for development, remove in production
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, otp, newPassword } = await request.json();
    
    if (!userId || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'User ID, verification code, and new password are required' },
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
    
    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }
    
    // Delete OTP from memory
    otpStore.delete(storeKey);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Password reset successfully'
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
} 