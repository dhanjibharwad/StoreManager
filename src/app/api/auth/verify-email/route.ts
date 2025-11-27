import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSessionToken, generateOTP } from '@/lib/serverUtils';

export async function POST(request: Request) {
  try {
    const { userId, otp } = await request.json();
    
    if (!userId || !otp) {
      return NextResponse.json(
        { error: 'User ID and OTP are required' },
        { status: 400 }
      );
    }
    
    // Get the verification code
    const { data: verification, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !verification) {
      return NextResponse.json(
        { error: 'Verification code not found' },
        { status: 400 }
      );
    }
    
    // Check if OTP is expired
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Verification code expired' },
        { status: 400 }
      );
    }
    
    // Verify OTP
    if (verification.email_otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }
    
    // Update user verification status
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ is_email_verified: true })
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }
    
    // Email is now verified, create session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: userId,
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
        }
      ]);
    
    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user,
        session: {
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        },
        fullyVerified: true
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during email verification' },
      { status: 500 }
    );
  }
}

// Resend email OTP
export async function PUT(request: Request) {
  try {
    const { userId, email, name } = await request.json();
    
    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'User ID, email, and name are required' },
        { status: 400 }
      );
    }
    
    // Generate a new OTP
    const otp = generateOTP();
    
    // Update the OTP in the database
    const { error } = await supabase
      .from('verification_codes')
      .update({
        email_otp: otp,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating OTP:', error);
      return NextResponse.json(
        { error: 'Failed to generate new verification code' },
        { status: 500 }
      );
    }
    
    // The actual email sending will be done through the /api/notifications/email endpoint
    return NextResponse.json({ 
      success: true,
      otp // Return the OTP so it can be sent via the separate email API
    });
  } catch (error) {
    console.error('Resend email OTP error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resending the verification code' },
      { status: 500 }
    );
  }
} 