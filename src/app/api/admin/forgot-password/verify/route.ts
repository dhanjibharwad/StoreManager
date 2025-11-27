import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);        // uday changes
    if (!otpData) {
      return NextResponse.json(
        { error: 'No OTP request found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiry) {
      otpStore.delete(email);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Get the admin credential record for this user
    const tableName = `${otpData.role.toLowerCase()}_credentials`;
    const { data: credentialData, error: credentialError } = await supabase
      .from(tableName)
      .select('id')
      .eq('user_id', otpData.userId);

    if (credentialError || !credentialData || credentialData.length === 0) {
      console.error('Error finding admin credentials:', credentialError);
      return NextResponse.json(
        { error: 'Admin credentials not found' },
        { status: 404 }
      );
    }

    // Update the admin password for this specific credential record
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ 
        admin_password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', otpData.userId);

    if (updateError) {
      console.error('Error updating admin password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Delete the OTP after successful password reset
    otpStore.delete(email);

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully reset'
    });

  } catch (error) {
    console.error('Error in verify OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 